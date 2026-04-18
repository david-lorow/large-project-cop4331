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

// Simple keyword extraction: strip stop words, return top 30 unique words by frequency
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'i','me','my','we','our','you','your','he','his','she','her','they',
  'their','it','its','this','that','these','those','as','if','so','not',
  'no','nor','yet','both','either','neither','each','few','more','most',
  'other','some','such','than','then','too','very','just','can','also',
]);

function extractKeywords(text) {
  const freq = {};
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
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

    // 2. Run Textract (synchronous — fine for single-page resumes)
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

    // 3. Persist metadata to MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      versionName: versionName || undefined,
      notes: notes || undefined,
      s3Key,
      originalFileName: req.file.originalname,
      extractedText,
      keywords,
    });

    return res.status(201).json({ resume });
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
    return res.json({ resumes });
  } catch (err) {
    console.error('Resume list error:', err);
    return res.status(500).json({ message: 'Failed to fetch resumes.' });
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

// DELETE /api/resumes/:id
// Remove from S3 and MongoDB.
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: resume.s3Key }));
    await resume.deleteOne();

    return res.json({ message: 'Resume deleted.' });
  } catch (err) {
    console.error('Resume delete error:', err);
    return res.status(500).json({ message: 'Failed to delete resume.' });
  }
});

module.exports = router;
