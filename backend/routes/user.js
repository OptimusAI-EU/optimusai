const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public endpoint - get current user info (no auth required for /me in callback)
router.get('/me', async (req, res, next) => {
  try {
    // Try to get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const jwt = require('jsonwebtoken');
    const config = require('../config/config');
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const User = require('../models').User;
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        user: user.getPublicProfile(),
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    next(error);
  }
});

// All routes below require authentication
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/subscriptions', userController.getSubscriptions);
router.get('/billing-history', userController.getBillingHistory);
router.delete('/account', userController.deleteAccount);

module.exports = router;

