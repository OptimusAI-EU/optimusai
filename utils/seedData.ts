/**
 * Seed data for testing admin dashboard
 * Populates localStorage with test subscriptions and orders
 */

export const seedTestData = () => {
  // Get existing users for linking subscriptions and orders
  const usersJson = localStorage.getItem('allUsers');
  const users = usersJson ? JSON.parse(usersJson) : [];

  if (users.length === 0) {
    console.warn('No users found. Please create users first.');
    return;
  }

  // Create test subscriptions
  const testSubscriptions = [
    {
      id: 'sub_001',
      userId: users[0]?.id || 'user_001',
      userEmail: users[0]?.email || 'john@example.com',
      userName: users[0]?.name || 'John Doe',
      plan: 'professional' as const,
      status: 'active' as const,
      billingCycle: 'monthly' as const,
      monthlyPrice: 99,
      startDate: '2024-09-15',
      renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: true,
    },
    {
      id: 'sub_002',
      userId: users[1]?.id || 'user_002',
      userEmail: users[1]?.email || 'jane@example.com',
      userName: users[1]?.name || 'Jane Smith',
      plan: 'enterprise' as const,
      status: 'active' as const,
      billingCycle: 'annual' as const,
      monthlyPrice: 299,
      startDate: '2024-08-20',
      renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: true,
    },
    {
      id: 'sub_003',
      userId: users[0]?.id || 'user_001',
      userEmail: users[0]?.email || 'john@example.com',
      userName: users[0]?.name || 'John Doe',
      plan: 'starter' as const,
      status: 'paused' as const,
      billingCycle: 'monthly' as const,
      monthlyPrice: 29,
      startDate: '2024-10-01',
      renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: false,
    },
    {
      id: 'sub_004',
      userId: users[2]?.id || 'user_003',
      userEmail: users[2]?.email || 'mike@example.com',
      userName: users[2]?.name || 'Mike Johnson',
      plan: 'professional' as const,
      status: 'active' as const,
      billingCycle: 'monthly' as const,
      monthlyPrice: 99,
      startDate: '2024-09-01',
      renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: true,
    },
    {
      id: 'sub_005',
      userId: users[1]?.id || 'user_002',
      userEmail: users[1]?.email || 'jane@example.com',
      userName: users[1]?.name || 'Jane Smith',
      plan: 'starter' as const,
      status: 'cancelled' as const,
      billingCycle: 'monthly' as const,
      monthlyPrice: 29,
      startDate: '2024-07-15',
      renewalDate: '2024-11-15',
      autoRenew: false,
    },
  ];

  // Create test orders
  const testOrders = [
    {
      id: 'order_001',
      userId: users[0]?.id || 'user_001',
      userEmail: users[0]?.email || 'john@example.com',
      userName: users[0]?.name || 'John Doe',
      items: [
        { id: 'item_1', name: 'Product A', quantity: 2, price: 49.99 },
        { id: 'item_2', name: 'Product B', quantity: 1, price: 99.99 },
      ],
      subtotal: 199.97,
      tax: 20,
      total: 219.97,
      status: 'delivered' as const,
      paymentStatus: 'completed' as const,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderDate: '2024-11-15',
    },
    {
      id: 'order_002',
      userId: users[1]?.id || 'user_002',
      userEmail: users[1]?.email || 'jane@example.com',
      userName: users[1]?.name || 'Jane Smith',
      items: [
        { id: 'item_3', name: 'Product C', quantity: 1, price: 299.99 },
      ],
      subtotal: 299.99,
      tax: 30,
      total: 329.99,
      status: 'shipped' as const,
      paymentStatus: 'completed' as const,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
      },
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderDate: '2024-11-18',
    },
    {
      id: 'order_003',
      userId: users[2]?.id || 'user_003',
      userEmail: users[2]?.email || 'mike@example.com',
      userName: users[2]?.name || 'Mike Johnson',
      items: [
        { id: 'item_4', name: 'Product D', quantity: 3, price: 39.99 },
        { id: 'item_5', name: 'Product E', quantity: 2, price: 59.99 },
      ],
      subtotal: 239.95,
      tax: 24,
      total: 263.95,
      status: 'processing' as const,
      paymentStatus: 'completed' as const,
      shippingAddress: {
        street: '789 Elm St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA',
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderDate: '2024-11-19',
    },
    {
      id: 'order_004',
      userId: users[0]?.id || 'user_001',
      userEmail: users[0]?.email || 'john@example.com',
      userName: users[0]?.name || 'John Doe',
      items: [
        { id: 'item_6', name: 'Product F', quantity: 1, price: 149.99 },
      ],
      subtotal: 149.99,
      tax: 15,
      total: 164.99,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderDate: '2024-11-22',
    },
    {
      id: 'order_005',
      userId: users[1]?.id || 'user_002',
      userEmail: users[1]?.email || 'jane@example.com',
      userName: users[1]?.name || 'Jane Smith',
      items: [
        { id: 'item_7', name: 'Product G', quantity: 2, price: 199.99 },
      ],
      subtotal: 399.98,
      tax: 40,
      total: 439.98,
      status: 'delivered' as const,
      paymentStatus: 'completed' as const,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
      },
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderDate: '2024-11-10',
    },
  ];

  // Save to localStorage
  localStorage.setItem('subscriptions', JSON.stringify(testSubscriptions));
  localStorage.setItem('adminOrders', JSON.stringify(testOrders));

  console.log('✅ Test data seeded successfully!');
  console.log(`📊 Created ${testSubscriptions.length} test subscriptions`);
  console.log(`📦 Created ${testOrders.length} test orders`);
  console.log('🔄 Refresh the dashboard to see the data');
};

/**
 * Clear all test data from localStorage
 */
export const clearTestData = () => {
  localStorage.removeItem('subscriptions');
  localStorage.removeItem('adminOrders');
  console.log('🗑️ Test data cleared');
};

/**
 * Log current test data to console
 */
export const logTestData = () => {
  const subscriptions = localStorage.getItem('subscriptions');
  const orders = localStorage.getItem('adminOrders');
  
  console.log('📋 Current Subscriptions:', subscriptions ? JSON.parse(subscriptions) : 'None');
  console.log('📋 Current Orders:', orders ? JSON.parse(orders) : 'None');
};
