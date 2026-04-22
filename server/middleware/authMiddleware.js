const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const INACTIVITY_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
const UPDATE_THROTTLE_MS  = 60 * 1000;       // write at most once per minute

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    const now = new Date();

    if (user.lastActiveAt) {
      const inactive = now - new Date(user.lastActiveAt);
      if (inactive > INACTIVITY_LIMIT_MS) {
        await User.updateOne({ _id: user._id }, { $unset: { lastActiveAt: '' } });
        return res.status(401).json({ message: 'Session expired due to inactivity.' });
      }
    }

    if (!user.lastActiveAt || (now - new Date(user.lastActiveAt)) > UPDATE_THROTTLE_MS) {
      await User.updateOne({ _id: user._id }, { lastActiveAt: now });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { protect };
