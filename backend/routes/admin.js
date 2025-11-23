const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(verifyToken, isAdmin);

// ============ DASHBOARD STATS ============
router.get('/dashboard/stats', adminController.getDashboardStats);

// ============ USER MANAGEMENT ============
router.get('/users/stats', adminController.getUserStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/users/:id/sessions', adminController.getUserSessions);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// ============ ORDER MANAGEMENT ============
router.get('/orders/stats', adminController.getOrderStats);
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// ============ SUBSCRIPTION MANAGEMENT ============
router.get('/subscriptions/stats', adminController.getSubscriptionStats);
router.get('/subscriptions', adminController.getAllSubscriptions);
router.put('/subscriptions/:id/status', adminController.updateSubscriptionStatus);

// ============ AUDIT LOG ============
router.get('/audit-log', adminController.getAuditLog);

module.exports = router;
