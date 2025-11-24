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
  isVPNDetected: boolean;
  vpnProvider?: string;
  isActive: boolean;
  location: Location | null;
  timestamp: string;
  loginTime: string;
  logoutTime: string | null;
  sessionDuration: number | null;
  status: string;
}

const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'login' | 'logout'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLogs();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLog();
      console.log('Audit logs loaded:', response.data);
      setLogs(response.data || []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(errorMsg);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Audit Log</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            <span className="text-xs text-gray-500">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Login Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Logout Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">VPN Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ISP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(log.loginTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {log.isActive ? (
                          <span className="text-yellow-600 font-medium">Active</span>
                        ) : (
                          log.logoutTime ? formatDate(log.logoutTime) : <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {log.sessionDuration ? `${log.sessionDuration}m` : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{log.email}</p>
                          <p className="text-xs text-gray-600">{log.userName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {log.isVPNDetected ? (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            🔒 {log.vpnProvider || 'VPN'}
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">✓ Direct</span>
                        )}
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
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
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
