//Gateway between front and back end

const { verifyToken } = require('../config/jwt');
const User = require('../models/User');


//Protects routes by requiring a valid JWT in the Authorization header.
//Attaches the full user document to req.user on success.
 
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

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { protect };
