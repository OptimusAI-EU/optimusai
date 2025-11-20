const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post('/', subscriptionController.createSubscription);
router.put('/:id/upgrade', subscriptionController.upgradeSubscription);
router.put('/:id/cancel', subscriptionController.cancelSubscription);
router.get('/details', subscriptionController.getSubscriptionDetails);

module.exports = router;
