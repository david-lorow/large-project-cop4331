const request = require('supertest');
const express = require('express');

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user123' };
    next();
  },
}));

jest.mock('../models/Resume', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../models/ResumeVersion', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../config/s3', () => ({
  s3: { send: jest.fn() },
  textract: { send: jest.fn() },
}));

jest.mock('../services/thumbnail', () => ({
  generateThumbnail: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const resumeRouter = require('../routes/resume');

const app = express();
app.use(express.json());
app.use('/api/resumes', resumeRouter);

describe('Resume routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/resumes/search returns empty list when q is blank', async () => {
    const res = await request(app).get('/api/resumes/search?q=');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resumes: [] });
  });

  test('POST /api/resumes/:id/versions returns 400 when commitMessage is missing', async () => {
    const res = await request(app)
      .post('/api/resumes/resume123/versions')
      .send({
        extractedText: 'Updated resume text',
        source: 'manual_edit',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('commitMessage is required.');
  });

  test('POST /api/resumes/:id/versions returns 400 when source is invalid', async () => {
    const res = await request(app)
      .post('/api/resumes/resume123/versions')
      .send({
        commitMessage: 'Updated wording',
        extractedText: 'Updated resume text',
        source: 'bad_source',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('source must be "ai_edit" or "manual_edit".');
  });

  test('PATCH /api/resumes/:id/versions/:versionId/activate returns 404 when resume is not found', async () => {
    Resume.findOne.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/resumes/resume123/versions/version456/activate');

    expect(Resume.findOne).toHaveBeenCalledWith({
      _id: 'resume123',
      userId: 'user123',
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resume not found.');
  });

  test('POST /api/resumes/:id/versions creates a new version', async () => {
    const mockResume = {
      _id: 'resume123',
      headVersionId: 'version1',
      save: jest.fn().mockResolvedValue(true),
    };

    const currentHead = {
      _id: 'version1',
      versionNumber: 1,
      s3Key: 'old.pdf',
      originalFileName: 'resume.pdf',
      thumbnailS3Key: 'thumb.jpg',
      extractedText: 'Old text',
      keywords: ['javascript'],
    };

    const createdVersion = {
      _id: 'version2',
      versionNumber: 2,
    };

    Resume.findOne.mockResolvedValue(mockResume);
    ResumeVersion.findById.mockResolvedValue(currentHead);
    ResumeVersion.create.mockResolvedValue(createdVersion);

    const res = await request(app)
      .post('/api/resumes/resume123/versions')
      .send({
        commitMessage: 'Improved summary',
        extractedText: 'New edited resume text',
        source: 'manual_edit',
      });

    expect(ResumeVersion.create).toHaveBeenCalled();
    expect(mockResume.save).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.version).toEqual(createdVersion);
  });
});