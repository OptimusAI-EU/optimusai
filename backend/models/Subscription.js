const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planName: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      required: true,
    },
    type: {
      type: String,
      enum: ['RAAS', 'SAAS', 'education', 'health', 'custom'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'paused'],
      default: 'active',
    },
    features: [String],
    usageStats: {
      requestsUsed: {
        type: Number,
        default: 0,
      },
      requestsLimit: {
        type: Number,
        required: true,
      },
      storageUsed: {
        type: Number,
        default: 0,
      },
      storageLimit: {
        type: Number,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal'],
    },
    stripeSubscriptionId: String,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
