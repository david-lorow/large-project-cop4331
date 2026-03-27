const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    //Connects to users
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    //We'll store URL's since it's more storage efficient
    title: { type: String, required: true },

    fileUrl: { type: String, required: true },

    versionName: { type: String },

    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);