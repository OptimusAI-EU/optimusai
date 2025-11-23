import React, { useState, useEffect } from 'react';
import { getAuditLog } from '../../utils/adminApi';

interface Location {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
}

interface AuditLogEntry {
  id: number;
  userId: number;
  email: string;
  userName: string;
  action: 'login' | 'logout';
  ipAddress: string;
  location: Location | null;
  timestamp: string;
  loginTime: string;
  logoutTime: string | null;
  status: string;
}

const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'login' | 'logout'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLog();
      setLogs(response.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (log) =>
          log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.ipAddress?.includes(searchQuery)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionLabel = (action: 'login' | 'logout') => {
    const labels: Record<'login' | 'logout', string> = {
      login: 'Login',
      logout: 'Logout',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: 'login' | 'logout') => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-700';
      case 'logout':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({
    title,
    value,
    icon,
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Audit Log</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by user, email, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ISP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{log.email}</p>
                          <p className="text-xs text-gray-600">{log.userName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.location ? (
                          <div>
                            <p className="font-medium">{log.location.city}, {log.location.country}</p>
                            <p className="text-xs text-gray-500">
                              {log.location.latitude?.toFixed(2)}, {log.location.longitude?.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <span>Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.location?.isp || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Showing {filteredLogs.length} of {logs.length} total entries
        </p>
      </div>
    </div>
  );
};

export default AdminAudit;
