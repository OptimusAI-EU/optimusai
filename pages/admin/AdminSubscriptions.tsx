import React, { useState, useEffect } from 'react';
import { getAllSubscriptions, updateSubscriptionStatus } from '../../utils/adminApi';
import { useAuth } from '../../context/AuthContext';

interface Subscription {
  id: number;
  userId: number;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  planName: string;
  type: string;
  billingCycle: 'monthly' | 'annual';
  price: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  features?: string[];
  usageStats?: any;
  createdAt: string;
}

interface ConfirmModal {
  isOpen: boolean;
  action: 'cancel' | 'pause' | 'resume' | null;
  subscription: Subscription | null;
}

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [expandedSubscription, setExpandedSubscription] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    action: null,
    subscription: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, filterStatus, filterPlan]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptions();
      setSubscriptions(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.user?.email.toLowerCase().includes(query) ||
          (s.user?.firstName + ' ' + s.user?.lastName).toLowerCase().includes(query) ||
          s.planName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter((s) => s.planName.toLowerCase() === filterPlan.toLowerCase());
    }

    setFilteredSubscriptions(filtered);
  };

  const handleStatusAction = (subscription: Subscription, action: 'cancel' | 'pause' | 'resume') => {
    setConfirmModal({
      isOpen: true,
      action,
      subscription,
    });
  };

  const confirmAction = async () => {
    if (!confirmModal.subscription || !confirmModal.action) return;

    try {
      let newStatus = confirmModal.subscription.status;
      if (confirmModal.action === 'cancel') {
        newStatus = 'cancelled';
      } else if (confirmModal.action === 'pause') {
        newStatus = 'paused';
      } else if (confirmModal.action === 'resume') {
        newStatus = 'active';
      }

      await updateSubscriptionStatus(confirmModal.subscription.id, { status: newStatus });
      await loadSubscriptions();
      setConfirmModal({ isOpen: false, action: null, subscription: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'free':
        return 'bg-blue-100 text-blue-700';
      case 'starter':
        return 'bg-purple-100 text-purple-700';
      case 'professional':
        return 'bg-indigo-100 text-indigo-700';
      case 'enterprise':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUniquePlans = () => {
    const plans = new Set(subscriptions.map((s) => s.planName.toLowerCase()));
    return Array.from(plans);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions Management</h2>
        <p className="text-gray-600 mt-1">Manage customer subscriptions and plans</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Subscriptions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{subscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Paused</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {subscriptions.filter((s) => s.status === 'paused').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {subscriptions.filter((s) => s.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by email, name, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Plans</option>
            {getUniquePlans().map((plan) => (
              <option key={plan} value={plan}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center justify-end">
            {filteredSubscriptions.length} subscriptions found
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Billing Cycle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Renewal Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Auto Renew</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <React.Fragment key={subscription.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {subscription.user?.firstName} {subscription.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{subscription.user?.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(subscription.planName)}`}>
                          {subscription.planName.charAt(0).toUpperCase() + subscription.planName.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{subscription.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{subscription.billingCycle}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${subscription.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(subscription.renewalDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={subscription.autoRenew ? 'text-green-700 font-medium' : 'text-gray-700'}>
                          {subscription.autoRenew ? '✓ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setExpandedSubscription(expandedSubscription === subscription.id ? null : subscription.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedSubscription === subscription.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedSubscription === subscription.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={10} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Subscription Details */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4">Subscription Details</h4>
                              <div className="bg-white rounded p-4 border border-gray-200 space-y-3 text-sm">
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">Plan Name</label>
                                  <p className="text-gray-900 font-medium">{subscription.planName}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">Subscription Type</label>
                                  <p className="text-gray-900 font-medium">{subscription.type}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">Price</label>
                                  <p className="text-gray-900 font-medium">${subscription.price.toFixed(2)} per {subscription.billingCycle}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date</label>
                                  <p className="text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">End Date</label>
                                  <p className="text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">Auto Renew</label>
                                  <p className="text-gray-900 font-medium">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Customer & Actions */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-2 text-sm">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600">Name</label>
                                    <p className="text-gray-900 font-medium">{subscription.user?.firstName} {subscription.user?.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600">Email</label>
                                    <p className="text-gray-900">{subscription.user?.email}</p>
                                  </div>
                                  {subscription.user?.phone && (
                                    <div>
                                      <label className="text-xs font-semibold text-gray-600">Phone</label>
                                      <p className="text-gray-900">{subscription.user.phone}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Management</h4>
                                <div className="flex flex-col gap-2">
                                  {subscription.status === 'active' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusAction(subscription, 'pause')}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium text-sm"
                                      >
                                        Pause Subscription
                                      </button>
                                      <button
                                        onClick={() => handleStatusAction(subscription, 'cancel')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                                      >
                                        Cancel Subscription
                                      </button>
                                    </>
                                  )}
                                  {subscription.status === 'paused' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusAction(subscription, 'resume')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                      >
                                        Resume Subscription
                                      </button>
                                      <button
                                        onClick={() => handleStatusAction(subscription, 'cancel')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                                      >
                                        Cancel Subscription
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-600">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.subscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{' '}
              <span className="font-semibold">
                {confirmModal.action === 'cancel' && 'cancel'}
                {confirmModal.action === 'pause' && 'pause'}
                {confirmModal.action === 'resume' && 'resume'}
              </span>{' '}
              the subscription for <span className="font-semibold">{confirmModal.subscription.user?.email}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, subscription: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
