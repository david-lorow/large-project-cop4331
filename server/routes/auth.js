//Login and registration handling, JWT born

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../config/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');

const router = express.Router();


router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }] });
    if (existing) {
      const field = existing.email === email;
      return res.status(409).json({ message: `That ${field} is already in use.` });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    //Generate a verification token and store its hash so the raw token
    //is never persisted (same pattern as password reset tokens).
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: tokenExpiry,
    });

    //Attempt to send the verification email. If the email service is not
    //yet configured (EMAIL_ENABLED=false), this logs to console and
    //continues so registration still succeeds.
    try {
      await sendVerificationEmail({ email: user.email, firstName: user.firstName, token: rawToken });
    } catch (emailErr) {
      console.error('Verification email failed to send:', emailErr.message);
      //Non-fatal — user is still created; resend can be added later.
    }

    return res.status(201).json({
      message: 'Account created. Check your email to verify before logging in.',
      userId: user._id,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});


//POST /api/auth/login
//Validates credentials, checks email verification, and returns a JWT.

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    //Use a constant-time-safe message to avoid leaking whether the email exists.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email address before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

//GET /api/auth/verify-email?token=<rawToken>
//Marks the user's email as verified.

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
});

//POST /api/auth/forgot-password
//Sends a password reset email. Always returns 200 to avoid leaking whether an email is registered.

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpires = tokenExpiry;
      await user.save();

      try {
        await sendPasswordResetEmail({ email: user.email, firstName: user.firstName, token: rawToken });
      } catch (emailErr) {
        console.error('Password reset email failed to send:', emailErr.message);
      }
    }

    return res.json({ message: 'If that email is registered, you will receive a password reset link shortly.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});


//POST /api/auth/reset-password
//Validates the reset token and updates the user's password.

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
