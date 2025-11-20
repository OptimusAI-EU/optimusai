const Subscription = require('../models/Subscription');
const User = require('../models/User');

const SUBSCRIPTION_PLANS = {
  RAAS: {
    starter: {
      name: 'Starter',
      monthlyPrice: 99,
      annualPrice: 990,
      features: ['Up to 5 robots', 'Basic support', '100 requests/day'],
      requestsLimit: 100,
      storageLimit: 100, // GB
    },
    professional: {
      name: 'Professional',
      monthlyPrice: 299,
      annualPrice: 2990,
      features: ['Up to 20 robots', 'Priority support', '1000 requests/day'],
      requestsLimit: 1000,
      storageLimit: 500,
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 999,
      annualPrice: 9990,
      features: ['Unlimited robots', '24/7 support', 'Unlimited requests'],
      requestsLimit: Infinity,
      storageLimit: Infinity,
    },
  },
  SAAS: {
    starter: {
      name: 'Starter',
      monthlyPrice: 79,
      annualPrice: 790,
      features: ['Basic simulations', 'Community support', '10 simulations/month'],
      requestsLimit: 100,
      storageLimit: 50,
    },
    professional: {
      name: 'Professional',
      monthlyPrice: 199,
      annualPrice: 1990,
      features: ['Advanced simulations', 'Email support', '100 simulations/month'],
      requestsLimit: 1000,
      storageLimit: 500,
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 799,
      annualPrice: 7990,
      features: ['Unlimited simulations', '24/7 support', 'Unlimited storage'],
      requestsLimit: Infinity,
      storageLimit: Infinity,
    },
  },
};

// Create subscription
exports.createSubscription = async (req, res, next) => {
  try {
    const { planName, type, billingCycle } = req.body;

    if (!SUBSCRIPTION_PLANS[type]?.[planName]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan',
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[type][planName];
    const price =
      billingCycle === 'annual' ? planDetails.annualPrice : planDetails.monthlyPrice;

    // End existing subscription
    const existingSubscription = await Subscription.findOne({
      userId: req.user.userId,
      status: 'active',
    });

    if (existingSubscription) {
      existingSubscription.status = 'cancelled';
      existingSubscription.cancelledAt = new Date();
      await existingSubscription.save();
    }

    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = new Subscription({
      userId: req.user.userId,
      planName,
      type,
      billingCycle,
      price,
      startDate,
      endDate,
      renewalDate: new Date(endDate),
      features: planDetails.features,
      usageStats: {
        requestsLimit: planDetails.requestsLimit,
        storageLimit: planDetails.storageLimit,
      },
      status: 'active',
    });

    await subscription.save();

    // Update user subscription
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        subscriptionPlan: subscription._id,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      },
      { new: true }
    ).populate('subscriptionPlan');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// Upgrade subscription
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const { newPlanName } = req.body;

    const currentSubscription = await Subscription.findOne({
      userId: req.user.userId,
      status: 'active',
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[currentSubscription.type]?.[newPlanName];

    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upgrade plan',
      });
    }

    const newPrice = planDetails.monthlyPrice;
    const proratedAmount = newPrice - currentSubscription.price;

    currentSubscription.planName = newPlanName;
    currentSubscription.price = newPrice;
    currentSubscription.features = planDetails.features;
    currentSubscription.usageStats = {
      requestsUsed: 0,
      requestsLimit: planDetails.requestsLimit,
      storageUsed: 0,
      storageLimit: planDetails.storageLimit,
    };

    await currentSubscription.save();

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      subscription: currentSubscription,
      proratedAmount,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      { new: true }
    );

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      subscriptionStatus: 'cancelled',
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription details
exports.getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.userId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found',
      });
    }

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
