const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      items: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shipping: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingAddress: {
        type: DataTypes.JSON,
      },
      billingAddress: {
        type: DataTypes.JSON,
      },
      paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
        comment: 'pending: In cart or awaiting payment, completed: Payment successful, order moves to awaiting_shipping',
      },
      orderStatus: {
        type: DataTypes.ENUM('cart', 'awaiting_shipping', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'cart',
      },
      productType: {
        type: DataTypes.ENUM('robot', 'odin_subscription'),
        defaultValue: 'robot',
      },
      stripePaymentIntentId: {
        type: DataTypes.STRING,
      },
      trackingNumber: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.TEXT,
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
      modelName: 'Order',
      timestamps: true,
    }
  );

  // Auto-generate order number
  Order.beforeCreate(async (order) => {
    if (!order.orderNumber) {
      order.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  });

  return Order;
};
