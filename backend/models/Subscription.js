const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Subscription extends Model {}

  Subscription.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      planName: {
        type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('RAAS', 'SAAS', 'education', 'health', 'custom'),
        allowNull: false,
      },
      billingCycle: {
        type: DataTypes.ENUM('monthly', 'annual'),
        defaultValue: 'monthly',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      renewalDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      autoRenew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'cancelled', 'expired', 'paused'),
        defaultValue: 'active',
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      usageStats: {
        type: DataTypes.JSON,
        defaultValue: {
          requestsUsed: 0,
          requestsLimit: 0,
          storageUsed: 0,
          storageLimit: 0,
        },
      },
      paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'bank_transfer', 'paypal'),
      },
      stripeSubscriptionId: {
        type: DataTypes.STRING,
      },
      cancelledAt: {
        type: DataTypes.DATE,
      },
      cancelReason: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Subscription',
      timestamps: true,
    }
  );

  return Subscription;
};
