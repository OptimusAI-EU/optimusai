const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('subscriptionPlan');

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
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, company, billingAddress, shippingAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName,
        lastName,
        phone,
        company,
        billingAddress,
        shippingAddress,
      },
      { new: true, runValidators: true }
    ).populate('subscriptionPlan');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select('+password');

    if (!await user.comparePassword(oldPassword)) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user subscriptions
exports.getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.userId });

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// Get user billing history
exports.getBillingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('subscriptionPlan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get billing data from subscriptions
    const subscriptions = await Subscription.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      billingHistory: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.userId).select('+password');

    if (!await user.comparePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
