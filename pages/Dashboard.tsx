import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageSection from '../components/PageSection';

interface DashboardStats {
  totalRobots: number;
  activeRobots: number;
  totalSimulations: number;
  runningSimulations: number;
  activeUsers: number;
  totalRevenue: number;
}

interface Robot {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  location: string;
  lastUpdate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
}

const Dashboard: React.FC = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn || !isAdmin) {
    return (
      <PageSection title="Access Denied" subtitle="Admin access required">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            {!isLoggedIn 
              ? 'You need to sign in to access the dashboard.'
              : 'You do not have admin privileges to access this dashboard. Contact support if you believe this is a mistake.'}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Back to Home
            </a>
            <a
              href="/contact"
              className="border-2 border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 rounded-lg font-medium transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </PageSection>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'robots' | 'users' | 'simulations'>('overview');

  const stats: DashboardStats = {
    totalRobots: 127,
    activeRobots: 98,
    totalSimulations: 542,
    runningSimulations: 12,
    activeUsers: 342,
    totalRevenue: 125640,
  };

  const robots: Robot[] = [
    {
      id: 'robot_001',
      name: 'Manipulation Bot Alpha',
      status: 'online',
      battery: 95,
      location: 'Warehouse A',
      lastUpdate: '2024-11-18 10:30:00',
    },
    {
      id: 'robot_002',
      name: 'Mobile Bot Beta',
      status: 'online',
      battery: 78,
      location: 'Warehouse B',
      lastUpdate: '2024-11-18 10:28:00',
    },
    {
      id: 'robot_003',
      name: 'Humanoid Gamma',
      status: 'maintenance',
      battery: 0,
      location: 'Service Center',
      lastUpdate: '2024-11-18 09:15:00',
    },
    {
      id: 'robot_004',
      name: 'Locomotion Bot Delta',
      status: 'offline',
      battery: 12,
      location: 'Warehouse C',
      lastUpdate: '2024-11-18 06:45:00',
    },
  ];

  const users: User[] = [
    {
      id: 'user_001',
      name: 'John Smith',
      email: 'john@company.com',
      plan: 'Professional RAAS',
      status: 'active',
      joinDate: '2024-09-15',
    },
    {
      id: 'user_002',
      name: 'Jane Doe',
      email: 'jane@research.edu',
      plan: 'Research SAAS',
      status: 'active',
      joinDate: '2024-10-01',
    },
    {
      id: 'user_003',
      name: 'Mike Johnson',
      email: 'mike@factory.com',
      plan: 'Enterprise RAAS',
      status: 'active',
      joinDate: '2024-08-20',
    },
    {
      id: 'user_004',
      name: 'Sarah Williams',
      email: 'sarah@startup.io',
      plan: 'Basic SAAS',
      status: 'inactive',
      joinDate: '2024-09-01',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'offline':
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'maintenance':
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System Overview and Management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'robots'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Robots Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users & Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('simulations')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'simulations'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Simulations
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">Total Robots</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRobots}</p>
                <p className="text-sm text-green-600 mt-2">{stats.activeRobots} active</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">Total Simulations</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSimulations}</p>
                <p className="text-sm text-red-600 mt-2">{stats.runningSimulations} running</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-sm text-purple-600 mt-2">This month</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-2">+12.5% vs last month</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">System Health</h3>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
                <p className="text-sm text-gray-600 mt-2">Uptime this month</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-semibold mb-2">Support Tickets</h3>
                <p className="text-3xl font-bold text-gray-900">23</p>
                <p className="text-sm text-yellow-600 mt-2">5 pending</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                  Add Robot
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                  View Logs
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  System Settings
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Robots Management Tab */}
        {activeTab === 'robots' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Robot Fleet Management</h2>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                + Add New Robot
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Robot ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Battery</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Update</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {robots.map((robot) => (
                    <tr key={robot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{robot.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{robot.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(robot.status)}`}>
                          {robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                robot.battery > 50
                                  ? 'bg-green-600'
                                  : robot.battery > 20
                                    ? 'bg-yellow-600'
                                    : 'bg-red-600'
                              }`}
                              style={{ width: `${robot.battery}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{robot.battery}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{robot.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{robot.lastUpdate}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-red-600 hover:text-red-700 font-semibold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Users & Subscriptions</h2>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                + Invite User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Join Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.plan}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-red-600 hover:text-red-700 font-semibold">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'simulations' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Simulations Management</h2>
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <p className="text-red-900 font-semibold mb-2">Running Simulations: {stats.runningSimulations}</p>
              <div className="space-y-2">
                {[1, 2, 3].map((sim) => (
                  <div key={sim} className="bg-white border border-gray-200 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Simulation {sim}</p>
                      <p className="text-sm text-gray-600">Progress: {70 + sim * 5}%</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-semibold">Stop</button>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
              + Start New Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
