const express = require('express');
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getUserOrders);
router.get('/:id', verifyToken, orderController.getOrderDetails);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

// Admin routes
router.get('/', isAdmin, verifyToken, orderController.getAllOrders);
router.put('/:id/status', isAdmin, verifyToken, orderController.updateOrderStatus);

module.exports = router;
