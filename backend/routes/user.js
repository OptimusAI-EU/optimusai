const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/subscriptions', userController.getSubscriptions);
router.get('/billing-history', userController.getBillingHistory);
router.delete('/account', userController.deleteAccount);

module.exports = router;
