import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../utils/adminApi';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
  id: number;
  sessionToken: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
  };
  userAgent: string;
  loginTime: string;
  logoutTime: string | null;
  isActive: boolean;
}

interface ConfirmModal {
  isOpen: boolean;
  action: 'promote' | 'demote' | 'delete' | null;
  user: User | null;
}

interface SessionsModal {
  isOpen: boolean;
  user: User | null;
  sessions: UserSession[];
  loading: boolean;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'firstName' | 'email' | 'createdAt' | 'role'>('firstName');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    action: null,
    user: null,
  });
  const [sessionsModal, setSessionsModal] = useState<SessionsModal>({
    isOpen: false,
    user: null,
    sessions: [],
    loading: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, sortBy]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal);
      }
      return aVal > bVal ? 1 : -1;
    });

    setFilteredUsers(filtered);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handlePromoteUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      action: user.role === 'admin' ? 'demote' : 'promote',
      user,
    });
  };

  const handleDeleteUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      user,
    });
  };

  const handleViewSessions = async (user: User) => {
    setSessionsModal({ isOpen: true, user, sessions: [], loading: true });
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessionsModal({ isOpen: true, user, sessions: data.data.sessions, loading: false });
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setSessionsModal({ isOpen: true, user, sessions: [], loading: false });
    }
  };

  const confirmAction = async () => {
    if (!confirmModal.user || !confirmModal.action) return;

    try {
      const user = confirmModal.user;

      switch (confirmModal.action) {
        case 'promote':
          await updateUserRole(user.id, 'admin');
          break;
        case 'demote':
          await updateUserRole(user.id, 'user');
          break;
        case 'delete':
          await deleteUser(user.id);
          break;
      }

      // Reload users after action
      await loadUsers();
      setConfirmModal({ isOpen: false, action: null, user: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
      console.error('Action failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search and Sort */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filters & Search</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="firstName">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="createdAt">Sort by Created Date</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center justify-end">
            {filteredUsers.length} users found
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                  <span onClick={() => setSortBy('firstName')}>Name</span>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                  <span onClick={() => setSortBy('email')}>Email</span>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : user.role === 'moderator'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewSessions(user)}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View Sessions
                        </button>
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handlePromoteUser(user)}
                            className="text-green-600 hover:text-green-700 font-semibold"
                          >
                            Promote
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteUser(user)}
                            className="text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            Demote
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{' '}
              <span className="font-semibold">
                {confirmModal.action === 'delete' && 'delete'}
                {confirmModal.action === 'promote' && 'promote to admin'}
                {confirmModal.action === 'demote' && 'demote from admin'}
              </span>{' '}
              <span className="font-semibold">{confirmModal.user.email}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, user: null })}
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

      {/* Sessions Modal */}
      {sessionsModal.isOpen && sessionsModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Login Sessions - {sessionsModal.user.email}
            </h2>
            
            {sessionsModal.loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-600">Loading sessions...</div>
              </div>
            ) : sessionsModal.sessions.length > 0 ? (
              <div className="space-y-4">
                {sessionsModal.sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">IP Address</p>
                        <p className="text-sm text-gray-900">{session.ipAddress || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Status</p>
                        <p className="text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      {session.location && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">Location</p>
                            <p className="text-sm text-gray-900">
                              {session.location.city}, {session.location.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold">ISP</p>
                            <p className="text-sm text-gray-900">{session.location.isp || 'N/A'}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Login Time</p>
                        <p className="text-sm text-gray-900">
                          {new Date(session.loginTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Logout Time</p>
                        <p className="text-sm text-gray-900">
                          {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : 'Still logged in'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No sessions found</p>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setSessionsModal({ isOpen: false, user: null, sessions: [], loading: false })}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

