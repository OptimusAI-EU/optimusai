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
  planName: 'free' | 'starter' | 'professional' | 'enterprise';
  type: 'RAAS' | 'SAAS';
  billingCycle: 'monthly' | 'annual';
  price: number;
  startDate: string;
  subscriptionDate: string;
  renewalDate: string;
  autoRenew: boolean;
  status: 'cart' | 'active' | 'awaiting_renewal' | 'cancelled';
  features: any[];
  usageStats: any;
  createdAt: string;
}

interface ConfirmModal {
  isOpen: boolean;
  subscriptionId: number | null;
  action: 'pause' | 'resume' | 'cancel' | null;
}

interface SummaryStats {
  planTypes: { [key: string]: number };
  subscriptionStatuses: { [key: string]: number };
  total: number;
}

const AdminSubscriptions: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlanType, setFilterPlanType] = useState<string>('all');
  const [expandedSubscription, setExpandedSubscription] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    subscriptionId: null,
    action: null,
  });
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    planTypes: {},
    subscriptionStatuses: {},
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
    calculateStats();
  }, [subscriptions, searchTerm, filterStatus, filterPlanType]);

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

  const calculateStats = () => {
    const planTypeCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};

    subscriptions.forEach((sub) => {
      // Count by plan type (e.g., "Starter (Monthly)", "Professional (Annual)")
      const planLabel = `${sub.planName.charAt(0).toUpperCase() + sub.planName.slice(1)} (${sub.billingCycle === 'monthly' ? 'Monthly' : 'Annual'})`;
      planTypeCounts[planLabel] = (planTypeCounts[planLabel] || 0) + 1;

      // Count by status
      const statusLabel = sub.status.replace(/_/g, ' ').toUpperCase();
      statusCounts[statusLabel] = (statusCounts[statusLabel] || 0) + 1;
    });

    setSummaryStats({
      planTypes: planTypeCounts,
      subscriptionStatuses: statusCounts,
      total: subscriptions.length,
    });
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.user?.email.toLowerCase().includes(query) ||
          (sub.user?.firstName + ' ' + sub.user?.lastName).toLowerCase().includes(query) ||
          sub.user?.phone?.toLowerCase().includes(query) ||
          sub.planName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((sub) => sub.status === filterStatus);
    }

    // Plan type filter
    if (filterPlanType !== 'all') {
      const [planName, billingCycle] = filterPlanType.split('_');
      filtered = filtered.filter(
        (sub) =>
          sub.planName === planName && sub.billingCycle === billingCycle
      );
    }

    setFilteredSubscriptions(filtered);
  };

  const handleStatusAction = (subscriptionId: number, action: 'pause' | 'resume' | 'cancel') => {
    setConfirmModal({
      isOpen: true,
      subscriptionId,
      action,
    });
  };

  const confirmAction = async () => {
    if (!confirmModal.subscriptionId || !confirmModal.action) return;

    try {
      let newStatus: 'active' | 'cart' | 'awaiting_renewal' | 'cancelled' = 'active';

      switch (confirmModal.action) {
        case 'cancel':
          newStatus = 'cancelled';
          break;
        case 'pause':
          // In your system, pause might map to a different status. Using current status for now
          newStatus = 'active';
          break;
        case 'resume':
          newStatus = 'active';
          break;
      }

      await updateSubscriptionStatus(confirmModal.subscriptionId, {
        status: newStatus,
      });

      await loadSubscriptions();
      setConfirmModal({ isOpen: false, subscriptionId: null, action: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    }
  };

  const handleSummaryCardClick = (type: 'plan' | 'status', value: string) => {
    if (type === 'plan') {
      const [planName, billingCycle] = value.split('_');
      setFilterPlanType(filterPlanType === `${planName}_${billingCycle}` ? 'all' : `${planName}_${billingCycle}`);
    } else {
      const status = value.toLowerCase().replace(/ /g, '_');
      setFilterStatus(filterStatus === status ? 'all' : status);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cart':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'awaiting_renewal':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanTypeColor = (planName: string) => {
    const colors: { [key: string]: string } = {
      'free': 'bg-gray-100 text-gray-700',
      'starter': 'bg-blue-100 text-blue-700',
      'professional': 'bg-purple-100 text-purple-700',
      'enterprise': 'bg-red-100 text-red-700',
    };
    return colors[planName] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const canPause = (status: string) => status === 'active';
  const canResume = (status: string) => status === 'active'; // Your logic might differ
  const canCancel = (status: string) => status === 'active' || status === 'awaiting_renewal';

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
        <p className="text-gray-600 mt-1">Manage RAAS and SAAS subscriptions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Statistics - Plan Types */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {Object.entries(summaryStats.planTypes).map(([planType, count]) => (
            <button
              key={planType}
              onClick={() => {
                const [plan, cycle] = planType.split(' (');
                const billingCycle = cycle.slice(0, -1).toLowerCase();
                const planName = plan.toLowerCase();
                handleSummaryCardClick('plan', `${planName}_${billingCycle === 'monthly' ? 'monthly' : 'annual'}`);
              }}
              className={`p-6 rounded-lg border-2 transition cursor-pointer text-left ${
                filterPlanType === `${planType.split(' ')[0].toLowerCase()}_${planType.includes('Annual') ? 'annual' : 'monthly'}`
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-600">{planType}</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{count}</div>
              <div className="text-xs text-gray-500 mt-1">Click to filter</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Statistics - Subscription Statuses */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscription Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(summaryStats.subscriptionStatuses).map(([status, count]) => (
            <button
              key={status}
              onClick={() => handleSummaryCardClick('status', status)}
              className={`p-6 rounded-lg border-2 transition cursor-pointer ${
                filterStatus === status.toLowerCase().replace(/ /g, '_')
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-600">{status}</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{count}</div>
              <div className="text-xs text-gray-500 mt-1">Click to filter</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by email, name, phone, or plan..."
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
            <option value="cart">Cart</option>
            <option value="active">Active</option>
            <option value="awaiting_renewal">Awaiting Renewal</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterPlanType}
            onChange={(e) => setFilterPlanType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Plans</option>
            {Object.keys(summaryStats.planTypes).map((planType) => (
              <option
                key={planType}
                value={`${planType.split(' ')[0].toLowerCase()}_${planType.includes('Annual') ? 'annual' : 'monthly'}`}
              >
                {planType}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
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
                filteredSubscriptions.map((sub) => (
                  <React.Fragment key={sub.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {sub.user?.firstName} {sub.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{sub.user?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{sub.user?.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {sub.planName.charAt(0).toUpperCase() + sub.planName.slice(1)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {sub.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {sub.billingCycle}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">${sub.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                          {formatStatusDisplay(sub.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(sub.renewalDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${sub.autoRenew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {sub.autoRenew ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setExpandedSubscription(expandedSubscription === sub.id ? null : sub.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedSubscription === sub.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedSubscription === sub.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={11} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Subscription Details */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Subscription Details</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-3 text-sm">
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Plan</p>
                                    <p className="text-gray-900 font-medium capitalize">{sub.planName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Type</p>
                                    <p className="text-gray-900 font-medium">{sub.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Billing Cycle</p>
                                    <p className="text-gray-900 font-medium capitalize">{sub.billingCycle}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Price</p>
                                    <p className="text-gray-900 font-medium text-lg text-red-600">${sub.price.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Subscription Dates</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-3 text-sm">
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Subscription Date</p>
                                    <p className="text-gray-900">{formatDate(sub.subscriptionDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Renewal Date</p>
                                    <p className="text-gray-900">{formatDate(sub.renewalDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Auto Renew</p>
                                    <p className={`font-medium ${sub.autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                                      {sub.autoRenew ? 'Enabled' : 'Disabled'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Customer & Features */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Customer Info</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-2 text-sm">
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Name</p>
                                    <p className="text-gray-900 font-medium">{sub.user?.firstName} {sub.user?.lastName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Email</p>
                                    <p className="text-gray-900">{sub.user?.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">Phone</p>
                                    <p className="text-gray-900">{sub.user?.phone || 'Not provided'}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Management</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-2">
                                  <p className="text-xs font-medium text-gray-600 mb-3">Current Status: <span className="text-gray-900 font-medium">{formatStatusDisplay(sub.status)}</span></p>
                                  <div className="space-y-2">
                                    {canCancel(sub.status) && (
                                      <button
                                        onClick={() => handleStatusAction(sub.id, 'cancel')}
                                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                                      >
                                        Cancel Subscription
                                      </button>
                                    )}
                                  </div>
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
                  <td colSpan={11} className="px-6 py-8 text-center text-gray-600">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to <strong>{confirmModal.action}</strong> this subscription?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, subscriptionId: null, action: null })}
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
