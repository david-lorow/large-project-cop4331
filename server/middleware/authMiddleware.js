//Gateway between front and back end

const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const INACTIVITY_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
const UPDATE_THROTTLE_MS = 60 * 1000;        // write at most once per minute

//Protects routes by requiring a valid JWT in the Authorization header.
//Attaches the full user document to req.user on success.
//Enforces a 20-minute inactivity timeout via lastActiveAt.

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

    if (user.lastActiveAt && now - user.lastActiveAt > INACTIVITY_LIMIT_MS) {
      return res.status(401).json({ message: 'Session expired due to inactivity.' });
    }

    if (!user.lastActiveAt || now - user.lastActiveAt > UPDATE_THROTTLE_MS) {
      await User.updateOne({ _id: user._id }, { lastActiveAt: now });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { protect };
