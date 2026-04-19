const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: { type: String, required: true },

    versionName: { type: String },

    notes: { type: String },

    // S3 storage metadata
    s3Key: { type: String, required: true },         // S3 object key (path within bucket)
    originalFileName: { type: String, required: true }, // original uploaded filename

    // Thumbnail
    thumbnailS3Key: { type: String, default: null },  // S3 key for the page-1 JPEG thumbnail

    // Textract output
    extractedText: { type: String, default: '' },    // full text from Textract
    keywords: [{ type: String }],                    // top keywords parsed from extracted text
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);