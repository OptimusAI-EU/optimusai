import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../utils/adminApi';

interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  revenue: number;
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: number;
  }> = ({ title, value, subtitle, icon, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      ) : stats ? (
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>

        {/* User Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.users?.total || 0}
              icon="👥"
              subtitle={`${stats.users?.admins || 0} admins`}
            />
            <StatCard
              title="Admin Users"
              value={stats.users?.admins || 0}
              icon="🔐"
              subtitle="System administrators"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers || 0}
              icon="🟢"
              subtitle="Currently active"
            />
            <StatCard
              title="Regular Users"
              value={(stats.users?.total || 0) - (stats.users?.admins || 0)}
              icon="👤"
              subtitle="Standard accounts"
            />
          </div>
        </div>

        {/* Order Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Orders"
              value={stats.orders?.total || 0}
              icon="📦"
              subtitle="All time orders"
            />
            <StatCard
              title="Completed"
              value={stats.orders?.completed || 0}
              icon="✅"
              subtitle="Successfully shipped"
            />
            <StatCard
              title="Pending"
              value={stats.orders?.pending || 0}
              icon="⏳"
              subtitle="Awaiting processing"
            />
            <StatCard
              title="Total Revenue"
              value={`$${(stats.orders?.revenue || 0).toFixed(2)}`}
              icon="💰"
              subtitle="From completed orders"
            />
          </div>
        </div>

        {/* Subscription Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Subscriptions"
              value={stats.subscriptions?.total || 0}
              icon="📊"
              subtitle="All subscriptions"
            />
            <StatCard
              title="Active Subscriptions"
              value={stats.subscriptions?.active || 0}
              icon="🔄"
              subtitle="Currently active"
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${(stats.subscriptions?.mrr || 0).toFixed(2)}`}
              icon="📈"
              subtitle="MRR"
            />
            <StatCard
              title="Annual Revenue"
              value={`$${(stats.subscriptions?.arr || 0).toFixed(2)}`}
              icon="📊"
              subtitle="ARR"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="text-3xl mb-2">👥</div>
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600 mt-1">Edit roles & permissions</p>
            </button>
            <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="text-3xl mb-2">📦</div>
              <p className="font-semibold text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600 mt-1">Track shipments</p>
            </button>
            <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-semibold text-gray-900">Subscriptions</p>
              <p className="text-sm text-gray-600 mt-1">Monitor renewals</p>
            </button>
            <button className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center cursor-pointer">
              <div className="text-3xl mb-2">📋</div>
              <p className="font-semibold text-gray-900">Audit Log</p>
              <p className="text-sm text-gray-600 mt-1">View all actions</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Status</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Storage</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Good</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminOverview;
