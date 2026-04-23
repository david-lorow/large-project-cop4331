const request = require('supertest');
const express = require('express');

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user123' };
    next();
  },
}));

jest.mock('../models/Resume', () => ({
  findOne: jest.fn(),
}));

const Resume = require('../models/Resume');
const aiRouter = require('../routes/ai');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

function makeFindOneReturn(resolvedValue) {
  const populate = jest.fn().mockResolvedValue(resolvedValue);
  Resume.findOne.mockReturnValue({ populate });
  return populate;
}

describe('AI Route (/api/ai/review)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('should return 400 if resumeId is missing', async () => {
    const res = await request(app)
      .post('/api/ai/review')
      .send({ mode: 'review' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('resumeId is required.');
  });

  test('should return 400 if mode is invalid', async () => {
    const res = await request(app)
      .post('/api/ai/review')
      .send({ resumeId: '123', mode: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('mode must be "tailoring" or "review".');
  });

  test('should return 404 if resume not found', async () => {
    const populate = makeFindOneReturn(null);

    const res = await request(app)
      .post('/api/ai/review')
      .send({ resumeId: '123', mode: 'review' });

    expect(Resume.findOne).toHaveBeenCalledWith({
      _id: '123',
      userId: 'user123',
    });
    expect(populate).toHaveBeenCalledWith('headVersionId');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resume not found.');
  });

  test('should return 400 for tailoring mode if required fields are missing', async () => {
    makeFindOneReturn({
      headVersionId: { extractedText: 'Sample resume text' },
    });

    const res = await request(app)
      .post('/api/ai/review')
      .send({
        resumeId: '123',
        mode: 'tailoring',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      'company, position, and jobDescription are required for tailoring mode.'
    );
  });

  test('should call AI and stream response (review mode)', async () => {
    makeFindOneReturn({
      headVersionId: { extractedText: 'Sample resume text' },
    });

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'data: {"choices":[{"delta":{"content":"Hello "}}]}\n'
          ),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            'data: {"choices":[{"delta":{"content":"World"}}]}\n'
          ),
        })
        .mockResolvedValueOnce({
          done: true,
          value: undefined,
        }),
    };

    global.fetch.mockResolvedValue({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    });

    const res = await request(app)
      .post('/api/ai/review')
      .send({
        resumeId: '123',
        mode: 'review',
      });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello');
    expect(res.text).toContain('World');
  });

  test('should return 502 if OpenAI response is not ok', async () => {
    makeFindOneReturn({
      headVersionId: { extractedText: 'Sample resume text' },
    });

    global.fetch.mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('OpenAI error'),
    });

    const res = await request(app)
      .post('/api/ai/review')
      .send({
        resumeId: '123',
        mode: 'review',
      });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(502);
  });
});