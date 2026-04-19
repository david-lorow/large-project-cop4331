const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

const { s3, textract } = require('../config/s3');
const { protect } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const { generateThumbnail } = require('../services/thumbnail');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are accepted.'));
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

// Extract plain text from Textract LINE blocks
function parseTextractBlocks(blocks) {
  return blocks
    .filter((b) => b.BlockType === 'LINE' && b.Text)
    .map((b) => b.Text)
    .join('\n');
}

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'i','me','my','we','our','you','your','he','his','she','her','they',
  'their','it','its','this','that','these','those','as','if','so','not',
  'no','nor','yet','both','either','neither','each','few','more','most',
  'other','some','such','than','then','too','very','just','can','also',
]);

const JOB_TITLES = new Set([
  // Leadership
  'ceo','cto','cfo','coo','cpo','vp','svp','evp','president','founder',
  'cofounder','partner','principal','director','head',
  // Management
  'manager','supervisor','coordinator','administrator','lead',
  'superintendent','controller','operator',
  // Engineering & Tech
  'engineer','developer','architect','programmer','analyst',
  'devops','sre','qa','tester','designer','researcher','scientist',
  'technician','specialist','consultant','integrator',
  // Software specific
  'frontend','backend','fullstack','mobile','embedded','cloud',
  'security','data','ml','ai','systems','network','database',
  // Business & Sales
  'sales','account','executive','representative','associate',
  'advisor','strategist','recruiter','hr','marketing','brand',
  'product','project','operations','finance','legal','compliance',
  // Seniority qualifiers (caught as adjacent words)
  'senior','junior','staff','principal','mid','entry','intern',
  'apprentice','contractor','freelance',
  // Common role nouns
  'officer','agent','broker','trader','underwriter','auditor',
  'attorney','counsel','paralegal','nurse','doctor','physician',
]);

function extractKeywords(text) {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = lower.split(/\s+/).filter((w) => w.length > 2);

  // Pass 1: frequency-based general keywords (existing behavior)
  const freq = {};
  words
    .filter((w) => !STOP_WORDS.has(w))
    .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  const frequencyKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  // Pass 2: explicit job title matches (preserves original casing from source text)
  const titleKeywords = [];
  const sourceWords = text.split(/\s+/);
  for (let i = 0; i < sourceWords.length; i++) {
    const clean = sourceWords[i].toLowerCase().replace(/[^a-z]/g, '');
    if (JOB_TITLES.has(clean) && !titleKeywords.includes(sourceWords[i])) {
      // Also grab the preceding word if it's a seniority qualifier
      const prev = i > 0 ? sourceWords[i - 1].toLowerCase().replace(/[^a-z]/g, '') : '';
      if (prev && JOB_TITLES.has(prev)) {
        const combined = `${sourceWords[i - 1]} ${sourceWords[i]}`;
        if (!titleKeywords.includes(combined)) titleKeywords.push(combined);
      } else {
        titleKeywords.push(sourceWords[i]);
      }
    }
  }

  // Merge: title keywords first (higher signal), then frequency keywords, deduped
  const seen = new Set();
  const merged = [...titleKeywords, ...frequencyKeywords].filter((w) => {
    const key = w.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged.slice(0, 30);
}

// POST /api/resumes/upload
// Accepts a PDF, stores in S3, runs Textract, saves metadata to MongoDB.
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file provided.' });
  }

  const { title, versionName, notes } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'title is required.' });
  }

  const ext = '.pdf';
  const s3Key = `resumes/${req.user._id}/${uuidv4()}${ext}`;

  try {
    // 1. Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: 'application/pdf',
      })
    );

    // 2. Generate thumbnail (non-fatal)
    let thumbnailS3Key = null;
    try {
      const thumbnailBuffer = await generateThumbnail(req.file.buffer);
      thumbnailS3Key = `thumbnails/${req.user._id}/${uuidv4()}.jpg`;
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: thumbnailS3Key,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
        })
      );
    } catch (thumbErr) {
      console.error('Thumbnail generation error:', thumbErr.message);
    }

    // 3. Run Textract (synchronous — fine for single-page resumes)
    let extractedText = '';
    let keywords = [];
    try {
      const textractRes = await textract.send(
        new DetectDocumentTextCommand({
          Document: { S3Object: { Bucket: BUCKET, Name: s3Key } },
        })
      );
      extractedText = parseTextractBlocks(textractRes.Blocks || []);
      keywords = extractKeywords(extractedText);
    } catch (textractErr) {
      // Non-fatal: store the resume without text extraction
      console.error('Textract error:', textractErr.message);
    }

    // 4. Persist metadata to MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      versionName: versionName || undefined,
      notes: notes || undefined,
      s3Key,
      originalFileName: req.file.originalname,
      extractedText,
      keywords,
      thumbnailS3Key,
    });

    let thumbnailUrl = null;
    if (thumbnailS3Key) {
      thumbnailUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: thumbnailS3Key }),
        { expiresIn: 60 * 15 }
      );
    }

    return res.status(201).json({ resume: { ...resume.toObject(), thumbnailUrl } });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ message: 'Upload failed.' });
  }
});

// GET /api/resumes
// List all resumes for the authenticated user (no extracted text in list response).
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    const resumesWithThumbnails = await Promise.all(
      resumes.map(async (r) => {
        const obj = r.toObject();
        if (r.thumbnailS3Key) {
          obj.thumbnailUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: BUCKET, Key: r.thumbnailS3Key }),
            { expiresIn: 60 * 15 }
          );
        }
        return obj;
      })
    );

    return res.json({ resumes: resumesWithThumbnails });
  } catch (err) {
    console.error('Resume list error:', err);
    return res.status(500).json({ message: 'Failed to fetch resumes.' });
  }
});

// GET /api/resumes/search?q=<query>
// Keyword search across the authenticated user's resumes, ranked by match score.
router.get('/search', protect, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ resumes: [] });

  const queryWords = [...new Set(
    q.toLowerCase().split(/\s+/).filter((w) => w.length > 1),
  )];

  // Prefix-match regexes so "pr" matches "president", "programming", etc.
  const keywordRegexes = queryWords.map((w) => new RegExp(`^${w}`, 'i'));

  try {
    const resumes = await Resume.find({
      userId: req.user._id,
      $or: [
        { keywords: { $in: keywordRegexes } },
        { title: { $regex: queryWords.join('|'), $options: 'i' } },
      ],
    })
      .select('-extractedText')
      .lean();

    // Score by number of query words that prefix-match any keyword
    const scored = resumes
      .map((r) => {
        const kws = (r.keywords || []).map((k) => k.toLowerCase());
        const score = queryWords.reduce(
          (acc, w) => acc + (kws.some((k) => k.startsWith(w)) ? 1 : 0),
          0,
        );
        return { r, score };
      })
      .sort((a, b) => b.score - a.score);

    const resumesWithThumbnails = await Promise.all(
      scored.map(async ({ r }) => {
        if (r.thumbnailS3Key) {
          r.thumbnailUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: BUCKET, Key: r.thumbnailS3Key }),
            { expiresIn: 60 * 15 },
          );
        }
        return r;
      }),
    );

    return res.json({ resumes: resumesWithThumbnails });
  } catch (err) {
    console.error('Resume search error:', err);
    return res.status(500).json({ message: 'Search failed.' });
  }
});

// GET /api/resumes/:id
// Get a single resume with a short-lived presigned S3 download URL.
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: resume.s3Key }),
      { expiresIn: 60 * 15 } // 15-minute window
    );

    return res.json({ resume, downloadUrl });
  } catch (err) {
    console.error('Resume fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch resume.' });
  }
});

// GET /api/resumes/:id/pdf
// Proxy the PDF through the server so the browser avoids S3 CORS restrictions.
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const s3Response = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: resume.s3Key })
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resume.originalFileName}"`);
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error('PDF proxy error:', err);
    return res.status(500).json({ message: 'Failed to fetch PDF.' });
  }
});

// DELETE /api/resumes/:id
// Remove from S3 and MongoDB.
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: resume.s3Key }));
    if (resume.thumbnailS3Key) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: resume.thumbnailS3Key }));
    }
    await resume.deleteOne();

    return res.json({ message: 'Resume deleted.' });
  } catch (err) {
    console.error('Resume delete error:', err);
    return res.status(500).json({ message: 'Failed to delete resume.' });
  }
});

module.exports = router;
