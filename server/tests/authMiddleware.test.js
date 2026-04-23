const { protect } = require('../middleware/authMiddleware');
const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

jest.mock('../config/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  updateOne: jest.fn(),
}));

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('authMiddleware protect()', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = mockRes();
    next = jest.fn();
  });

  test('returns 401 when no authorization header is provided', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when authorization header is not Bearer', async () => {
    req.headers.authorization = 'Basic abc123';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is invalid', async () => {
    req.headers.authorization = 'Bearer badtoken';
    verifyToken.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await protect(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('badtoken');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when user does not exist', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    verifyToken.mockReturnValue({ sub: 'user123' });

    const selectMock = jest.fn().mockResolvedValue(null);
    User.findById.mockReturnValue({ select: selectMock });

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(selectMock).toHaveBeenCalledWith('-passwordHash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User no longer exists.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when session expired due to inactivity', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    verifyToken.mockReturnValue({ sub: 'user123' });

    const oldDate = new Date(Date.now() - 21 * 60 * 1000); // 21 minutes ago

    const user = {
      _id: 'user123',
      email: 'test@example.com',
      lastActiveAt: oldDate,
    };

    const selectMock = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ select: selectMock });
    User.updateOne.mockResolvedValue({});

    await protect(req, res, next);

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user123' },
      { $unset: { lastActiveAt: '' } }
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Session expired due to inactivity.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('updates lastActiveAt and calls next for a valid active user', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    verifyToken.mockReturnValue({ sub: 'user123' });

    const recentDate = new Date(Date.now() - 2 * 60 * 1000); // 2 min ago

    const user = {
      _id: 'user123',
      email: 'test@example.com',
      lastActiveAt: recentDate,
    };

    const selectMock = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ select: selectMock });
    User.updateOne.mockResolvedValue({});

    await protect(req, res, next);

    expect(req.user).toEqual(user);
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user123' },
      expect.objectContaining({ lastActiveAt: expect.any(Date) })
    );
    expect(next).toHaveBeenCalled();
  });

  test('does not update lastActiveAt if within throttle window and still calls next', async () => {
    req.headers.authorization = 'Bearer goodtoken';
    verifyToken.mockReturnValue({ sub: 'user123' });

    const veryRecentDate = new Date(Date.now() - 10 * 1000); // 10 sec ago

    const user = {
      _id: 'user123',
      email: 'test@example.com',
      lastActiveAt: veryRecentDate,
    };

    const selectMock = jest.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ select: selectMock });

    await protect(req, res, next);

    expect(User.updateOne).not.toHaveBeenCalled();
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});