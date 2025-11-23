const { sequelize, connectDB } = require('../config/database');
const models = require('../models');

const seedTestData = async () => {
  try {
    await connectDB();
    const { Order, Subscription, User } = models;

    console.log('Seeding test data...');

    // Get the admin user
    const adminUser = await User.findOne({ where: { email: 'optimusrobots@proton.me' } });
    if (!adminUser) {
      console.error('Admin user not found. Please seed admin user first.');
      process.exit(1);
    }

    console.log(`Using user: ${adminUser.email}`);

    // Create sample orders
    const orders = [
      {
        userId: adminUser.id,
        orderNumber: `ORD-${Date.now()}-001`,
        items: [
          { name: 'Professional Plan - 1 Month', productName: 'Professional Plan', quantity: 1, unitPrice: 99.99, price: 99.99 },
        ],
        subtotal: 99.99,
        shipping: 10.00,
        tax: 8.80,
        total: 118.79,
        paymentMethod: 'credit_card',
        orderStatus: 'delivered',
        paymentStatus: 'completed',
        shippingAddress: {
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'United States',
        },
      },
      {
        userId: adminUser.id,
        orderNumber: `ORD-${Date.now()}-002`,
        items: [
          { name: 'Enterprise Plan - Annual', productName: 'Enterprise Plan', quantity: 1, unitPrice: 999.99, price: 999.99 },
          { name: 'Premium Support', productName: 'Premium Support', quantity: 1, unitPrice: 100.00, price: 100.00 },
        ],
        subtotal: 1099.99,
        shipping: 0.00,
        tax: 110.00,
        total: 1209.99,
        paymentMethod: 'bank_transfer',
        orderStatus: 'processing',
        paymentStatus: 'pending',
        shippingAddress: {
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          street: '456 Innovation Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'United States',
        },
      },
      {
        userId: adminUser.id,
        orderNumber: `ORD-${Date.now()}-003`,
        items: [
          { name: 'Starter Plan - 3 Months', productName: 'Starter Plan', quantity: 3, unitPrice: 29.99, price: 29.99 },
        ],
        subtotal: 89.97,
        shipping: 5.00,
        tax: 7.60,
        total: 102.57,
        paymentMethod: 'paypal',
        orderStatus: 'shipped',
        paymentStatus: 'completed',
        shippingAddress: {
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          street: '789 Tech Boulevard',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'United States',
        },
      },
    ];

    for (const order of orders) {
      try {
        await Order.create(order);
        console.log(`✓ Created order: ${order.orderNumber}`);
      } catch (err) {
        console.error(`Failed to create order: ${err.message}`);
      }
    }

    // Create sample subscriptions
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const subscriptions = [
      {
        userId: adminUser.id,
        planName: 'professional',
        type: 'SAAS',
        billingCycle: 'monthly',
        price: 99.99,
        startDate: now,
        endDate: oneMonthFromNow,
        renewalDate: oneMonthFromNow,
        autoRenew: true,
        status: 'active',
        features: ['API Access', 'Custom Domain', 'Priority Support', '5GB Storage'],
        usageStats: {
          requestsUsed: 15000,
          requestsLimit: 100000,
          storageUsed: 2.5,
          storageLimit: 5,
        },
      },
      {
        userId: adminUser.id,
        planName: 'enterprise',
        type: 'RAAS',
        billingCycle: 'annual',
        price: 999.99,
        startDate: now,
        endDate: oneYearFromNow,
        renewalDate: oneYearFromNow,
        autoRenew: true,
        status: 'active',
        features: ['Unlimited API', 'Custom Domain', 'Dedicated Support', 'Unlimited Storage', 'Advanced Analytics'],
        usageStats: {
          requestsUsed: 850000,
          requestsLimit: 1000000,
          storageUsed: 45.2,
          storageLimit: 100,
        },
      },
      {
        userId: adminUser.id,
        planName: 'starter',
        type: 'SAAS',
        billingCycle: 'monthly',
        price: 29.99,
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        endDate: threeMonthsFromNow,
        renewalDate: threeMonthsFromNow,
        autoRenew: false,
        status: 'paused',
        features: ['Basic API Access', 'Shared Domain', 'Email Support', '500MB Storage'],
        usageStats: {
          requestsUsed: 5000,
          requestsLimit: 10000,
          storageUsed: 0.4,
          storageLimit: 0.5,
        },
      },
      {
        userId: adminUser.id,
        planName: 'professional',
        type: 'SAAS',
        billingCycle: 'annual',
        price: 899.99,
        startDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        autoRenew: false,
        status: 'cancelled',
        features: ['API Access', 'Custom Domain', 'Priority Support', '5GB Storage'],
        usageStats: {
          requestsUsed: 120000,
          requestsLimit: 500000,
          storageUsed: 4.8,
          storageLimit: 5,
        },
      },
    ];

    for (const subscription of subscriptions) {
      try {
        await Subscription.create(subscription);
        console.log(`✓ Created subscription: ${subscription.planName} (${subscription.billingCycle})`);
      } catch (err) {
        console.error(`Failed to create subscription: ${err.message}`);
      }
    }

    console.log('\n✓ Test data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();
