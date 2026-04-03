//Login and registration handling, JWT born

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../services/email');

const router = express.Router();


//POST /api/auth/register
//No email veritifcation yet, and no JWT here, just the endpoint

router.post('/register', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return res.status(409).json({ message: `That ${field} is already in use.` });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    //Generate a verification token and store its hash so the raw token
    // s never persisted (same pattern as password reset tokens).
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const user = await User.create({
      firstName,
      lastName,
      username,
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
        username: user.username,
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

module.exports = router;
