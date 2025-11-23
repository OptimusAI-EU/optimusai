import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminOrders from './admin/AdminOrders';
import AdminAudit from './admin/AdminAudit';
import AdminSubscriptions from './admin/AdminSubscriptions';
import { seedTestData, clearTestData } from '../utils/seedData';

const Dashboard: React.FC = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'subscriptions' | 'audit'>('overview');

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {!isLoggedIn 
                ? 'You need to sign in to access the dashboard.'
                : 'You do not have admin privileges to access this dashboard.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your system, users, orders, and more</p>
          </div>

          {/* Seed Data Buttons */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
            <button
              onClick={() => {
                seedTestData();
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🌱 Seed Test Data
            </button>
            <button
              onClick={() => {
                clearTestData();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              🗑️ Clear Test Data
            </button>
            <p className="text-sm text-blue-700 flex items-center ml-4">
              Click "Seed Test Data" to populate sample subscriptions and orders
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 Users
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📦 Orders
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'subscriptions'
                    ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💳 Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Audit Log
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'subscriptions' && <AdminSubscriptions />}
            {activeTab === 'audit' && <AdminAudit />}
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default Dashboard;

