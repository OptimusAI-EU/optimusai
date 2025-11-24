const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Verify JWT Token or custom headers (for now)
const verifyToken = (req, res, next) => {
  console.log('🔐 Auth middleware - Checking token');
  console.log('Headers:', Object.keys(req.headers));
  console.log('Cookies:', req.cookies);
  
  // First try JWT token from Authorization header
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no Bearer token, try to get from cookies (accessToken)
  if (!token && req.cookies) {
    token = req.cookies.accessToken || req.cookies.token;
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      req.user.id = decoded.userId || decoded.id;
      console.log('✅ Token verified for user:', req.user.id);
      return next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  
  // Fallback: Accept custom headers for development/backward compatibility
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  
  if (userId && userEmail) {
    // For now, create a mock user object from headers
    // In production, you should validate these against the database
    req.user = {
      id: userId,
      email: userEmail,
      role: 'admin', // Assume admin for now, should be fetched from DB
    };
    console.log('✅ Using custom headers for user:', userId);
    return next();
  }
  
  console.error('❌ No token or headers found');
  return res.status(401).json({ message: 'No token provided' });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isAuthenticated,
};
