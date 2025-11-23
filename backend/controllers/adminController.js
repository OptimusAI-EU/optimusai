const { sequelize } = require('../config/database');

// Lazy load models to avoid circular dependencies
let models;
const getModels = () => {
  if (!models) {
    models = require('../models');
  }
  return models;
};

// ============ USER MANAGEMENT ============

// Get all users with filtering and sorting
exports.getAllUsers = async (req, res, next) => {
  try {
    const { User } = getModels();
    const { search, sortBy = 'createdAt', order = 'DESC', limit = 50, offset = 0 } = req.query;

    let whereClause = {};
    if (search) {
      whereClause = {
        [sequelize.Op.or]: [
          { email: { [sequelize.Op.like]: `%${search}%` } },
          { firstName: { [sequelize.Op.like]: `%${search}%` } },
          { lastName: { [sequelize.Op.like]: `%${search}%` } },
        ],
      };
    }

    const users = await User.findAll({
      where: whereClause,
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password', 'oauth'] },
    });

    const total = await User.count({ where: whereClause });

    res.json({
      success: true,
      data: users,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { User, Subscription, Order } = getModels();
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'oauth'] },
      include: [
        { model: Subscription, as: 'subscriptions' },
        { model: Order, as: 'orders' },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Get user sessions with location data
exports.getUserSessions = async (req, res, next) => {
  try {
    const { User, UserSession } = getModels();
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sessions = await UserSession.findAll({
      where: { userId: id },
      order: [['loginTime', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { User } = getModels();
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    await user.update({ role });

    res.json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { User } = getModels();
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const email = user.email;
    await user.destroy();

    res.json({
      success: true,
      message: `User ${email} has been deleted`,
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const { User } = getModels();
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const moderatorUsers = await User.count({ where: { role: 'moderator' } });
    const regularUsers = totalUsers - adminUsers - moderatorUsers;

    // Check for users active in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await User.count({
      where: { updatedAt: { [sequelize.Op.gte]: oneDayAgo } },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        adminUsers,
        moderatorUsers,
        regularUsers,
        activeToday,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============ ORDER MANAGEMENT ============

// Get all orders (admin view)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { Order, User } = getModels();
    const { search, status, paymentStatus, sortBy = 'createdAt', order = 'DESC', limit = 50, offset = 0 } = req.query;

    let whereClause = {};

    if (search) {
      whereClause = {
        [sequelize.Op.or]: [
          { orderNumber: { [sequelize.Op.like]: `%${search}%` } },
        ],
      };
    }

    if (status) whereClause.orderStatus = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const orders = await Order.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Order.count({ where: whereClause });

    res.json({
      success: true,
      data: orders,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { Order, User } = getModels();
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { Order } = getModels();
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus };

    if (orderStatus) await order.update({ orderStatus });
    if (paymentStatus) await order.update({ paymentStatus });

    res.json({
      success: true,
      message: 'Order status updated',
      data: { old: oldStatus, new: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus } },
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics
exports.getOrderStats = async (req, res, next) => {
  try {
    const { Order } = getModels();
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { orderStatus: 'pending' } });
    const processingOrders = await Order.count({ where: { orderStatus: 'processing' } });
    const shippedOrders = await Order.count({ where: { orderStatus: 'shipped' } });
    const deliveredOrders = await Order.count({ where: { orderStatus: 'delivered' } });

    const totalRevenue = await Order.sum('total', {
      where: { orderStatus: 'delivered', paymentStatus: 'completed' },
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============ SUBSCRIPTION MANAGEMENT ============

// Get all subscriptions (admin view)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { Subscription, User } = getModels();
    const { search, status, planName, sortBy = 'renewalDate', order = 'DESC', limit = 50, offset = 0 } = req.query;

    let whereClause = {};

    if (search) {
      whereClause = sequelize.where(
        sequelize.col('user.email'),
        sequelize.Op.like,
        `%${search}%`
      );
    }

    if (status) whereClause.status = status;
    if (planName) whereClause.planName = planName;

    const subscriptions = await Subscription.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Subscription.count({ where: whereClause });

    res.json({
      success: true,
      data: subscriptions,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    next(error);
  }
};

// Update subscription status
exports.updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { Subscription } = getModels();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'cancelled', 'expired', 'paused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const oldStatus = subscription.status;
    await subscription.update({ status });

    res.json({
      success: true,
      message: `Subscription status updated from ${oldStatus} to ${status}`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription statistics
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const { Subscription } = getModels();
    const totalSubscriptions = await Subscription.count();
    const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
    const pausedSubscriptions = await Subscription.count({ where: { status: 'paused' } });
    const cancelledSubscriptions = await Subscription.count({ where: { status: 'cancelled' } });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrrData = await Subscription.findAll({
      where: { status: 'active', billingCycle: 'monthly' },
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
    });
    const mrr = mrrData[0]?.dataValues?.total || 0;

    // Calculate ARR (Annual Recurring Revenue)
    const arrData = await Subscription.findAll({
      where: { status: 'active', billingCycle: 'annual' },
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
    });
    const arr = (arrData[0]?.dataValues?.total || 0) + mrr * 12;

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        mrr: parseFloat(mrr),
        arr: parseFloat(arr),
        churnRate: ((cancelledSubscriptions / totalSubscriptions) * 100).toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============ AUDIT LOG ============

// Get audit log (for now, we'll log actions server-side)
exports.getAuditLog = async (req, res, next) => {
  try {
    const { UserSession } = getModels();
    const { limit = 100, offset = 0 } = req.query;

    // Get session logs with location data
    const sessions = await UserSession.findAll({
      order: [['loginTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          association: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    const total = await UserSession.count();

    // Format the data for display
    const logs = sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      email: session.user?.email || 'Unknown',
      userName: `${session.user?.firstName || ''} ${session.user?.lastName || ''}`.trim(),
      action: session.logoutTime ? 'logout' : 'login',
      ipAddress: session.ipAddress,
      location: session.location ? {
        country: session.location.country || 'Unknown',
        city: session.location.city || 'Unknown',
        latitude: session.location.latitude,
        longitude: session.location.longitude,
        isp: session.location.isp || 'Unknown',
      } : null,
      timestamp: session.logoutTime || session.loginTime,
      loginTime: session.loginTime,
      logoutTime: session.logoutTime,
      status: 'success',
    }));

    res.json({
      success: true,
      data: logs,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    next(error);
  }
};

// ============ DASHBOARD STATS ============

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { User, Order, Subscription } = getModels();
    // User stats
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });

    // Order stats
    const totalOrders = await Order.count();
    const completedOrders = await Order.count({
      where: { orderStatus: 'delivered', paymentStatus: 'completed' },
    });
    const pendingOrders = await Order.count({ where: { orderStatus: 'pending' } });

    const totalRevenue = await Order.sum('total', {
      where: { orderStatus: 'delivered', paymentStatus: 'completed' },
    });

    // Subscription stats
    const totalSubscriptions = await Subscription.count();
    const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrrData = await Subscription.findAll({
      where: { status: 'active', billingCycle: 'monthly' },
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
    });
    const mrr = mrrData[0]?.dataValues?.total || 0;

    // Calculate ARR (Annual Recurring Revenue) - yearly subscriptions + (monthly * 12)
    const arrYearlyData = await Subscription.findAll({
      where: { status: 'active', billingCycle: 'yearly' },
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
    });
    const arrYearly = arrYearlyData[0]?.dataValues?.total || 0;
    const arr = parseFloat(mrr) * 12 + parseFloat(arrYearly);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, admins: adminUsers },
        orders: { total: totalOrders, completed: completedOrders, pending: pendingOrders, revenue: parseFloat(totalRevenue) || 0 },
        subscriptions: { total: totalSubscriptions, active: activeSubscriptions, mrr: parseFloat(mrr), arr: parseFloat(arr) },
      },
    });
  } catch (error) {
    next(error);
  }
};
