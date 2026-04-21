const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

const { s3, textract } = require('../config/s3');
const { protect } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
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

  // Pass 1: frequency-based general keywords
  const freq = {};
  words
    .filter((w) => !STOP_WORDS.has(w))
    .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  const frequencyKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  // Pass 2: explicit job title matches
  const titleKeywords = [];
  const sourceWords = text.split(/\s+/);
  for (let i = 0; i < sourceWords.length; i++) {
    const clean = sourceWords[i].toLowerCase().replace(/[^a-z]/g, '');
    if (JOB_TITLES.has(clean) && !titleKeywords.includes(sourceWords[i])) {
      const prev = i > 0 ? sourceWords[i - 1].toLowerCase().replace(/[^a-z]/g, '') : '';
      if (prev && JOB_TITLES.has(prev)) {
        const combined = `${sourceWords[i - 1]} ${sourceWords[i]}`;
        if (!titleKeywords.includes(combined)) titleKeywords.push(combined);
      } else {
        titleKeywords.push(sourceWords[i]);
      }
    }
  }

  const seen = new Set();
  const merged = [...titleKeywords, ...frequencyKeywords].filter((w) => {
    const key = w.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged.slice(0, 30);
}

async function presignThumbnail(thumbnailS3Key) {
  if (!thumbnailS3Key) return null;
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: thumbnailS3Key }),
    { expiresIn: 60 * 15 }
  );
}

// POST /api/resumes/upload
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No PDF file provided.' });

  const { title, commitMessage } = req.body;
  if (!title) return res.status(400).json({ message: 'title is required.' });

  const s3Key = `resumes/${req.user._id}/${uuidv4()}.pdf`;

  try {
    // 1. Upload PDF to S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
    }));

    // 2. Generate thumbnail (non-fatal)
    let thumbnailS3Key = null;
    try {
      const thumbnailBuffer = await generateThumbnail(req.file.buffer);
      thumbnailS3Key = `thumbnails/${req.user._id}/${uuidv4()}.jpg`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbnailS3Key,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      }));
    } catch (thumbErr) {
      console.error('Thumbnail generation error:', thumbErr.message);
    }

    // 3. Run Textract (non-fatal)
    let extractedText = '';
    let keywords = [];
    try {
      const textractRes = await textract.send(new DetectDocumentTextCommand({
        Document: { S3Object: { Bucket: BUCKET, Name: s3Key } },
      }));
      extractedText = parseTextractBlocks(textractRes.Blocks || []);
      keywords = extractKeywords(extractedText);
    } catch (textractErr) {
      console.error('Textract error:', textractErr.message);
    }

    // 4. Create the Resume repo
    const resume = await Resume.create({ userId: req.user._id, title });

    // 5. Create ResumeVersion v1 — the first commit
    const version = await ResumeVersion.create({
      resumeId: resume._id,
      userId: req.user._id,
      versionNumber: 1,
      commitMessage: commitMessage || 'Initial upload',
      s3Key,
      originalFileName: req.file.originalname,
      thumbnailS3Key,
      extractedText,
      keywords,
      parentVersionId: null,
      source: 'upload',
    });

    // 6. Point headVersionId at the new version
    resume.headVersionId = version._id;
    await resume.save();

    const thumbnailUrl = await presignThumbnail(thumbnailS3Key);

    return res.status(201).json({
      resume: {
        ...resume.toObject(),
        headVersion: { ...version.toObject(), thumbnailUrl },
        thumbnailUrl,
      },
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ message: 'Upload failed.' });
  }
});

// GET /api/resumes
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .populate({ path: 'headVersionId', select: '-extractedText' })
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      resumes.map(async (r) => {
        const hv = r.headVersionId;
        const thumbnailUrl = hv ? await presignThumbnail(hv.thumbnailS3Key) : null;
        return {
          ...r,
          headVersion: hv ? { ...hv, thumbnailUrl } : null,
          thumbnailUrl,
        };
      })
    );

    return res.json({ resumes: result });
  } catch (err) {
    console.error('Resume list error:', err);
    return res.status(500).json({ message: 'Failed to fetch resumes.' });
  }
});

// GET /api/resumes/search?q=<query>
router.get('/search', protect, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ resumes: [] });

  const queryWords = [...new Set(q.toLowerCase().split(/\s+/).filter((w) => w.length > 1))];

  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .populate({ path: 'headVersionId', select: '-extractedText' })
      .lean();

    const scored = resumes
      .map((r) => {
        const hv = r.headVersionId;
        const kws = (hv?.keywords || []).map((k) => k.toLowerCase());
        const titleMatch = queryWords.some((w) => r.title.toLowerCase().includes(w));
        const kwScore = queryWords.reduce(
          (acc, w) => acc + (kws.some((k) => k.startsWith(w)) ? 1 : 0),
          0
        );
        return { r, score: kwScore + (titleMatch ? 1 : 0) };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    const result = await Promise.all(
      scored.map(async ({ r }) => {
        const hv = r.headVersionId;
        const thumbnailUrl = hv ? await presignThumbnail(hv.thumbnailS3Key) : null;
        return {
          ...r,
          headVersion: hv ? { ...hv, thumbnailUrl } : null,
          thumbnailUrl,
        };
      })
    );

    return res.json({ resumes: result });
  } catch (err) {
    console.error('Resume search error:', err);
    return res.status(500).json({ message: 'Search failed.' });
  }
});

// GET /api/resumes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('headVersionId')
      .lean();
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const hv = resume.headVersionId;
    if (!hv?.s3Key) return res.status(404).json({ message: 'No PDF available for this resume.' });

    const [downloadUrl, thumbnailUrl, versions] = await Promise.all([
      getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: hv.s3Key }), { expiresIn: 60 * 15 }),
      presignThumbnail(hv.thumbnailS3Key),
      ResumeVersion.find({ resumeId: resume._id })
        .select('-extractedText')
        .sort({ versionNumber: 1 })
        .lean(),
    ]);

    return res.json({
      resume: { ...resume, headVersion: { ...hv, thumbnailUrl }, thumbnailUrl },
      versions,
      downloadUrl,
    });
  } catch (err) {
    console.error('Resume fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch resume.' });
  }
});

// GET /api/resumes/:id/pdf
// Proxy the PDF through the server (CORS workaround).
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('headVersionId');
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const hv = resume.headVersionId;
    if (!hv?.s3Key) return res.status(404).json({ message: 'No PDF available.' });

    const s3Response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: hv.s3Key }));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${hv.originalFileName || 'resume.pdf'}"`);
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error('PDF proxy error:', err);
    return res.status(500).json({ message: 'Failed to fetch PDF.' });
  }
});

// GET /api/resumes/:id/versions/:versionId/download
// Returns a presigned S3 URL for a specific resume version's PDF.
router.get('/:id/versions/:versionId/download', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const version = await ResumeVersion.findOne({ _id: req.params.versionId, resumeId: resume._id });
    if (!version) return res.status(404).json({ message: 'Version not found.' });
    if (!version.s3Key) return res.status(404).json({ message: 'No PDF for this version.' });

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: version.s3Key }),
      { expiresIn: 60 * 15 }
    );

    return res.json({ downloadUrl });
  } catch (err) {
    console.error('Version download error:', err);
    return res.status(500).json({ message: 'Failed to get download URL.' });
  }
});

// GET /api/resumes/:id/versions
router.get('/:id/versions', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const versions = await ResumeVersion.find({ resumeId: resume._id })
      .select('-extractedText')
      .sort({ versionNumber: 1 })
      .lean();

    return res.json({ versions });
  } catch (err) {
    console.error('Versions fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch versions.' });
  }
});

// POST /api/resumes/:id/versions/upload
// Upload a new PDF as the next version of an existing resume.
router.post('/:id/versions/upload', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No PDF file provided.' });

  const { commitMessage } = req.body;
  if (!commitMessage) return res.status(400).json({ message: 'commitMessage is required.' });

  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const currentHead = resume.headVersionId
      ? await ResumeVersion.findById(resume.headVersionId)
      : null;

    const versionNumber = currentHead ? currentHead.versionNumber + 1 : 1;
    const s3Key = `resumes/${req.user._id}/${uuidv4()}.pdf`;

    // 1. Upload PDF to S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
    }));

    // 2. Generate thumbnail (non-fatal)
    let thumbnailS3Key = null;
    try {
      const thumbnailBuffer = await generateThumbnail(req.file.buffer);
      thumbnailS3Key = `thumbnails/${req.user._id}/${uuidv4()}.jpg`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbnailS3Key,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      }));
    } catch (thumbErr) {
      console.error('Thumbnail generation error:', thumbErr.message);
    }

    // 3. Run Textract (non-fatal)
    let extractedText = '';
    let keywords = [];
    try {
      const textractRes = await textract.send(new DetectDocumentTextCommand({
        Document: { S3Object: { Bucket: BUCKET, Name: s3Key } },
      }));
      extractedText = parseTextractBlocks(textractRes.Blocks || []);
      keywords = extractKeywords(extractedText);
    } catch (textractErr) {
      console.error('Textract error:', textractErr.message);
    }

    // 4. Create the new version
    const version = await ResumeVersion.create({
      resumeId: resume._id,
      userId: req.user._id,
      versionNumber,
      commitMessage,
      s3Key,
      originalFileName: req.file.originalname,
      thumbnailS3Key,
      extractedText,
      keywords,
      parentVersionId: currentHead?._id ?? null,
      source: 'upload',
    });

    resume.headVersionId = version._id;
    await resume.save();

    const thumbnailUrl = await presignThumbnail(thumbnailS3Key);

    return res.status(201).json({ version: { ...version.toObject(), thumbnailUrl } });
  } catch (err) {
    console.error('Version upload error:', err);
    return res.status(500).json({ message: 'Upload failed.' });
  }
});

// POST /api/resumes/:id/versions
// Commit a new version from edited text (ai_edit or manual_edit).
router.post('/:id/versions', protect, async (req, res) => {
  const { commitMessage, extractedText, source } = req.body;
  if (!commitMessage) return res.status(400).json({ message: 'commitMessage is required.' });
  if (!['ai_edit', 'manual_edit'].includes(source)) {
    return res.status(400).json({ message: 'source must be "ai_edit" or "manual_edit".' });
  }

  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    const currentHead = resume.headVersionId
      ? await ResumeVersion.findById(resume.headVersionId)
      : null;

    const versionNumber = currentHead ? currentHead.versionNumber + 1 : 1;
    const newKeywords = extractedText
      ? extractKeywords(extractedText)
      : (currentHead?.keywords || []);

    const version = await ResumeVersion.create({
      resumeId: resume._id,
      userId: req.user._id,
      versionNumber,
      commitMessage,
      // Inherit the parent's PDF and thumbnail — only the text changed
      s3Key: currentHead?.s3Key,
      originalFileName: currentHead?.originalFileName,
      thumbnailS3Key: currentHead?.thumbnailS3Key,
      extractedText: extractedText ?? currentHead?.extractedText ?? '',
      keywords: newKeywords,
      parentVersionId: currentHead?._id ?? null,
      source,
    });

    resume.headVersionId = version._id;
    await resume.save();

    return res.status(201).json({ version });
  } catch (err) {
    console.error('Version create error:', err);
    return res.status(500).json({ message: 'Failed to create version.' });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    // Collect all unique S3 keys across all versions
    const versions = await ResumeVersion.find({ resumeId: resume._id });
    const s3Keys = new Set();
    for (const v of versions) {
      if (v.s3Key) s3Keys.add(v.s3Key);
      if (v.thumbnailS3Key) s3Keys.add(v.thumbnailS3Key);
    }

    await Promise.all(
      [...s3Keys].map((key) =>
        s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {})
      )
    );

    await ResumeVersion.deleteMany({ resumeId: resume._id });
    await resume.deleteOne();

    return res.json({ message: 'Resume deleted.' });
  } catch (err) {
    console.error('Resume delete error:', err);
    return res.status(500).json({ message: 'Failed to delete resume.' });
  }
});

module.exports = router;
