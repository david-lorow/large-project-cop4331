const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    //Connects back to other collections
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },

    //Application Details
    companyName: {
      type: String,
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected', 'ghosted'],
      default: 'applied',
    },

    dateApplied: {
      type: Date,
    },

    jobLink: {
      type: String,
    },

    location: {
      type: String,
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);