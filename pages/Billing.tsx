import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import PageSection from '../components/PageSection';

interface Subscription {
  id: string;
  service: 'RAAS' | 'SAAS';
  plan: 'Starter' | 'Professional' | 'Enterprise' | 'Basic' | 'Advanced' | 'Research';
  billingCycle: 'monthly' | 'annual';
  price: number;
  startDate: string;
  renewalDate: string;
  status: 'active' | 'cancelled' | 'paused';
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

interface OrderItem {
  id: string;
  name: string;
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  shippingAddress?: any;
}

const Billing: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load user's orders from localStorage
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <>
        <PageSection title="Billing & Subscriptions" subtitle="Sign in to manage your subscriptions and invoices">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">
              You need to sign in to access your billing information and manage subscriptions.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Sign In to Continue
            </button>
          </div>
        </PageSection>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'sub_1',
      service: 'RAAS',
      plan: 'Professional',
      billingCycle: 'monthly',
      price: 799,
      startDate: '2024-11-18',
      renewalDate: '2024-12-18',
      status: 'active',
    },
    {
      id: 'sub_2',
      service: 'SAAS',
      plan: 'Advanced',
      billingCycle: 'annual',
      price: 5990,
      startDate: '2024-11-01',
      renewalDate: '2025-11-01',
      status: 'active',
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv_1',
      date: '2024-11-18',
      amount: 799,
      status: 'paid',
      description: 'RAAS Professional - Monthly Subscription',
    },
    {
      id: 'inv_2',
      date: '2024-11-01',
      amount: 5990,
      status: 'paid',
      description: 'SAAS Advanced - Annual Subscription',
    },
    {
      id: 'inv_3',
      date: '2024-10-18',
      amount: 799,
      status: 'paid',
      description: 'RAAS Professional - Monthly Subscription',
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState({
    cardHolder: 'John Doe',
    cardNumber: '•••• •••• •••• 4242',
    expiryDate: '12/26',
    isDefault: true,
  });

  const handleCancelSubscription = (subId: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === subId ? { ...sub, status: 'cancelled' } : sub
      )
    );
  };

  const handlePauseSubscription = (subId: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === subId ? { ...sub, status: sub.status === 'paused' ? 'active' : 'paused' } : sub
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-12">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Billing &amp; <span className="text-red-600">Subscriptions</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Manage your subscriptions, invoices, and payment methods.
        </p>
      </section>

      {/* Active Subscriptions */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Active Subscriptions</h2>
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {subscription.service} - {subscription.plan}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {subscription.service === 'RAAS'
                      ? 'Robots as a Service'
                      : 'Simulation as a Service'}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Billing:</span> {subscription.billingCycle}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Start Date:</span> {formatDate(subscription.startDate)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Next Renewal:</span> {formatDate(subscription.renewalDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Price</p>
                    <p className="text-3xl font-bold text-red-600 mb-4">
                      ${subscription.price}
                      <span className="text-lg text-gray-600">/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : subscription.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                      Upgrade/Downgrade
                    </button>
                    <button
                      onClick={() => handlePauseSubscription(subscription.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
                    >
                      {subscription.status === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Payment Method</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-lg mb-6 w-full">
            <p className="text-sm opacity-75 mb-4">Card Holder</p>
            <p className="text-xl font-bold mb-8">{paymentMethod.cardHolder}</p>
            <div className="flex justify-between items-end">
              <p className="text-lg tracking-widest font-mono">{paymentMethod.cardNumber}</p>
              <div className="text-right">
                <p className="text-xs opacity-75">Expires</p>
                <p className="font-mono">{paymentMethod.expiryDate}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Update Card
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              Add New Card
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Billing History</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(invoice.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${invoice.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-red-600 hover:text-red-700 font-semibold">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h2>
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order {order.id}</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Date:</span>{' '}
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Items:</span> {order.items.length}
                      </p>
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Items ordered:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {order.items.map((item) => (
                            <li key={item.id}>• {item.name} (Qty: {item.quantity})</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Order Total</p>
                      <p className="text-3xl font-bold text-red-600 mb-2">${order.total.toFixed(2)}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {order.status === 'completed' && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-700 mb-2">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {order.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</p>
                    {order.shippingAddress ? (
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Shipping address not available</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Section */}
      <PageSection title="Need Help?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Have questions about your subscription or billing?
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Contact Support
            </button>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Check our documentation and FAQs
            </p>
            <button className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
              View Documentation
            </button>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default Billing;
