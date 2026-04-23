const request = require('supertest');
const express = require('express');

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user123' };
    next();
  },
}));

// Mock models
jest.mock('../models/Application', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../models/Resume', () => ({
  findOne: jest.fn(),
}));

jest.mock('../models/ResumeVersion', () => ({
  findOne: jest.fn(),
}));

const Application = require('../models/Application');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const applicationRouter = require('../routes/application');

const app = express();
app.use(express.json());
app.use('/api/applications', applicationRouter);

function makeFindChain(result) {
  const lean = jest.fn().mockResolvedValue(result);
  const sort = jest.fn().mockReturnValue({ lean });
  const populate = jest.fn().mockReturnValue({ sort });
  Application.find.mockReturnValue({ populate });
  return { populate, sort, lean };
}

describe('Application routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/applications returns applications list', async () => {
    const mockApps = [
      {
        _id: 'app1',
        companyName: 'OpenAI',
        jobTitle: 'Engineer',
        status: 'applied',
      },
    ];

    const chain = makeFindChain(mockApps);

    const res = await request(app).get('/api/applications');

    expect(Application.find).toHaveBeenCalledWith({ userId: 'user123' });
    expect(chain.populate).toHaveBeenCalledWith(
      'resumeVersionId',
      'versionNumber commitMessage'
    );
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ applications: mockApps });
  });

  test('GET /api/applications filters by resumeId', async () => {
    makeFindChain([]);

    const res = await request(app).get('/api/applications?resumeId=resume123');

    expect(Application.find).toHaveBeenCalledWith({
      userId: 'user123',
      resumeId: 'resume123',
    });
    expect(res.status).toBe(200);
  });

  test('POST /api/applications returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'resumeId, companyName, and jobTitle are required.'
    );
  });

  test('POST /api/applications returns 404 when resume is not found', async () => {
    Resume.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/applications')
      .send({
        resumeId: 'resume123',
        companyName: 'OpenAI',
        jobTitle: 'Engineer',
      });

    expect(Resume.findOne).toHaveBeenCalledWith({
      _id: 'resume123',
      userId: 'user123',
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resume not found.');
  });

  test('POST /api/applications returns 404 when resume version is not found', async () => {
    Resume.findOne.mockResolvedValue({
      _id: 'resume123',
      headVersionId: 'headVersion1',
    });
    ResumeVersion.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/applications')
      .send({
        resumeId: 'resume123',
        resumeVersionId: 'version999',
        companyName: 'OpenAI',
        jobTitle: 'Engineer',
      });

    expect(ResumeVersion.findOne).toHaveBeenCalledWith({
      _id: 'version999',
      resumeId: 'resume123',
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resume version not found.');
  });

  test('POST /api/applications creates application using head version by default', async () => {
    Resume.findOne.mockResolvedValue({
      _id: 'resume123',
      headVersionId: 'headVersion1',
    });

    const createdApplication = {
      _id: 'app1',
      companyName: 'OpenAI',
      jobTitle: 'Engineer',
      status: 'applied',
      resumeVersionId: 'headVersion1',
    };

    Application.create.mockResolvedValue(createdApplication);

    const res = await request(app)
      .post('/api/applications')
      .send({
        resumeId: 'resume123',
        companyName: 'OpenAI',
        jobTitle: 'Engineer',
      });

    expect(Application.create).toHaveBeenCalledWith({
      userId: 'user123',
      resumeId: 'resume123',
      resumeVersionId: 'headVersion1',
      companyName: 'OpenAI',
      jobTitle: 'Engineer',
      status: 'applied',
      jobLink: undefined,
      location: undefined,
      notes: undefined,
      dateApplied: undefined,
    });

    expect(res.status).toBe(201);
    expect(res.body.application).toEqual(createdApplication);
  });

  test('PATCH /api/applications/:id returns 404 when application is not found', async () => {
    Application.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/applications/app123')
      .send({ status: 'interviewing' });

    expect(Application.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'app123', userId: 'user123' },
      { status: 'interviewing' },
      { new: true }
    );
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Application not found.');
  });

  test('PATCH /api/applications/:id updates allowed fields only', async () => {
    const updatedApplication = {
      _id: 'app123',
      status: 'interviewing',
      companyName: 'OpenAI',
    };

    Application.findOneAndUpdate.mockResolvedValue(updatedApplication);

    const res = await request(app)
      .patch('/api/applications/app123')
      .send({
        status: 'interviewing',
        companyName: 'OpenAI',
        hackerField: 'should not be saved',
      });

    expect(Application.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'app123', userId: 'user123' },
      { status: 'interviewing', companyName: 'OpenAI' },
      { new: true }
    );
    expect(res.status).toBe(200);
    expect(res.body.application).toEqual(updatedApplication);
  });

  test('DELETE /api/applications/:id returns 404 when application is not found', async () => {
    Application.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/api/applications/app123');

    expect(Application.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'app123',
      userId: 'user123',
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Application not found.');
  });

  test('DELETE /api/applications/:id deletes application', async () => {
    Application.findOneAndDelete.mockResolvedValue({ _id: 'app123' });

    const res = await request(app).delete('/api/applications/app123');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Application deleted.');
  });
});