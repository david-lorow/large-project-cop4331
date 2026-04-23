const request = require('supertest');
const express = require('express');
const crypto = require('crypto');

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../config/jwt', () => ({
  signToken: jest.fn(),
}));

jest.mock('../services/email', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { signToken } = require('../config/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('All fields are required.');
    });

    test('returns 400 when password is shorter than 8 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password must be at least 8 characters.');
    });

    test('returns 409 when user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'longenoughpassword',
      });

      expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'test@example.com' }] });
      expect(res.status).toBe(409);
    });

    test('creates user and returns 201 on success', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
      });
      sendVerificationEmail.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'longenoughpassword',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('longenoughpassword', 12);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          isEmailVerified: false,
          emailVerificationTokenHash: expect.any(String),
          emailVerificationExpires: expect.any(Date),
        })
      );
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          token: expect.any(String),
        })
      );
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/Account created/i);
      expect(res.body.userId).toBe('user123');
    });

    test('still returns 201 if verification email fails', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
      });
      sendVerificationEmail.mockRejectedValue(new Error('mail failed'));

      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'longenoughpassword',
      });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe('user123');
    });
  });

  describe('POST /api/auth/login', () => {
    test('returns 400 when email or password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email and password are required.');
    });

    test('returns 401 when user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'bad@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    test('returns 401 when password is wrong', async () => {
      User.findOne.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    test('returns 403 when email is not verified', async () => {
      User.findOne.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashedPassword',
        isEmailVerified: false,
      });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
    });

    test('returns token and user on successful login', async () => {
      User.findOne.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashedPassword',
        isEmailVerified: true,
      });
      bcrypt.compare.mockResolvedValue(true);
      User.updateOne.mockResolvedValue({});
      signToken.mockReturnValue('fake-jwt-token');

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: 'user123' },
        { lastActiveAt: expect.any(Date) }
      );
      expect(signToken).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fake-jwt-token');
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('GET /api/auth/verify-email', () => {
    test('returns 400 when token is missing', async () => {
      const res = await request(app).get('/api/auth/verify-email');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Verification token is required.');
    });

    test('returns 400 when token is invalid or expired', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/auth/verify-email?token=badtoken');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Token is invalid or has expired.');
    });

    test('verifies email successfully', async () => {
      const save = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        isEmailVerified: false,
        emailVerificationTokenHash: 'hash',
        emailVerificationExpires: new Date(),
        save,
      });

      const res = await request(app).get('/api/auth/verify-email?token=validtoken');

      expect(save).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email verified. You can now log in.');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('returns 400 when email is missing', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email is required.');
    });

    test('returns 200 even if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'missing@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/If that email is registered/i);
    });

    test('saves reset token and sends password reset email when user exists', async () => {
      const save = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        firstName: 'Test',
        save,
      });
      sendPasswordResetEmail.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'test@example.com',
      });

      expect(save).toHaveBeenCalled();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          token: expect.any(String),
        })
      );
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('returns 400 when token or password is missing', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Token and new password are required.');
    });

    test('returns 400 when password is too short', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'sometoken',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password must be at least 8 characters.');
    });

    test('returns 400 when reset token is invalid or expired', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'badtoken',
        password: 'longenoughpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Reset link is invalid or has expired.');
    });

    test('updates password successfully', async () => {
      const save = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        passwordHash: 'oldHash',
        passwordResetTokenHash: 'hash',
        passwordResetExpires: new Date(),
        save,
      });
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      const res = await request(app).post('/api/auth/reset-password').send({
        token: 'validtoken',
        password: 'longenoughpassword',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('longenoughpassword', 12);
      expect(save).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password updated. You can now log in.');
    });
  });
});