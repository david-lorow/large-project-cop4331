const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    passwordHash: { type: String, required: true },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);