const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');

const router = express.Router();

// GET /api/applications?resumeId=<id>
router.get('/', protect, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.resumeId) filter.resumeId = req.query.resumeId;
    if (req.query.resumeVersionId) filter.resumeVersionId = req.query.resumeVersionId;

    const applications = await Application.find(filter)
      .populate('resumeVersionId', 'versionNumber commitMessage')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ applications });
  } catch (err) {
    console.error('Applications list error:', err);
    return res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// POST /api/applications
router.post('/', protect, async (req, res) => {
  const { resumeId, resumeVersionId, companyName, jobTitle, status, jobLink, location, notes, dateApplied } = req.body;
  if (!resumeId || !companyName || !jobTitle) {
    return res.status(400).json({ message: 'resumeId, companyName, and jobTitle are required.' });
  }

  try {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });

    // Use caller-specified version if provided and valid, otherwise fall back to head.
    let versionId = resume.headVersionId || undefined;
    if (resumeVersionId) {
      const version = await ResumeVersion.findOne({ _id: resumeVersionId, resumeId });
      if (!version) return res.status(404).json({ message: 'Resume version not found.' });
      versionId = version._id;
    }

    const application = await Application.create({
      userId: req.user._id,
      resumeId,
      resumeVersionId: versionId,
      companyName,
      jobTitle,
      status: status || 'applied',
      jobLink: jobLink || undefined,
      location: location || undefined,
      notes: notes || undefined,
      dateApplied: dateApplied ? new Date(dateApplied) : undefined,
    });

    return res.status(201).json({ application });
  } catch (err) {
    console.error('Application create error:', err);
    return res.status(500).json({ message: 'Failed to create application.' });
  }
});

// PATCH /api/applications/:id
router.patch('/:id', protect, async (req, res) => {
  const allowed = ['companyName', 'jobTitle', 'status', 'jobLink', 'location', 'notes', 'dateApplied'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    return res.json({ application });
  } catch (err) {
    console.error('Application update error:', err);
    return res.status(500).json({ message: 'Failed to update application.' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    return res.json({ message: 'Application deleted.' });
  } catch (err) {
    console.error('Application delete error:', err);
    return res.status(500).json({ message: 'Failed to delete application.' });
  }
});

module.exports = router;
