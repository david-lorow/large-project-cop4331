const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    commitMessage: {
      type: String,
      default: 'Initial upload',
    },
    s3Key: { type: String },
    originalFileName: { type: String },
    thumbnailS3Key: { type: String, default: null },
    extractedText: { type: String, default: '' },
    keywords: [{ type: String }],
    parentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeVersion',
      default: null,
    },
    source: {
      type: String,
      enum: ['upload', 'ai_edit', 'manual_edit'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
