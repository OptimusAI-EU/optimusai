/**
 * User Storage Utilities
 * Centralized user data management for localStorage
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  provider: 'email' | 'google' | 'github';
  createdAt: string;
  lastLogin: string;
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  activeToday: number;
}

const USERS_STORAGE_KEY = 'allUsers';
const CURRENT_USER_KEY = 'user';

/**
 * Get all registered users from localStorage
 */
export const getAllUsers = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error retrieving all users:', error);
    return [];
  }
};

/**
 * Get a specific user by ID
 */
export const getUserById = (userId: string): StoredUser | null => {
  const users = getAllUsers();
  return users.find((u) => u.id === userId) || null;
};

/**
 * Get a specific user by email
 */
export const getUserByEmail = (email: string): StoredUser | null => {
  const users = getAllUsers();
  return users.find((u) => u.email === email) || null;
};

/**
 * Save a new user to the users list
 */
export const saveUser = (user: StoredUser): void => {
  try {
    const users = getAllUsers();
    // Check if user already exists
    const existingIndex = users.findIndex((u) => u.id === user.id);

    if (existingIndex >= 0) {
      // Update existing user
      users[existingIndex] = user;
    } else {
      // Add new user
      users.push(user);
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log(`User ${user.email} saved successfully`);
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

/**
 * Update a user's admin status
 */
export const updateUserRole = (userId: string, isAdmin: boolean): boolean => {
  try {
    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return false;
    }

    user.isAdmin = isAdmin;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    console.log(`User ${user.email} role updated to ${isAdmin ? 'admin' : 'regular'}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

/**
 * Delete a user from the users list
 */
export const deleteUser = (userId: string): boolean => {
  try {
    const users = getAllUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);

    if (filteredUsers.length === users.length) {
      console.error(`User with ID ${userId} not found`);
      return false;
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
    console.log(`User ${userId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

/**
 * Get statistics about users
 */
export const getUserStats = (): UserStats => {
  const users = getAllUsers();
  const adminUsers = users.filter((u) => u.isAdmin);

  return {
    totalUsers: users.length,
    adminUsers: adminUsers.length,
    regularUsers: users.length - adminUsers.length,
    activeToday: users.filter(
      (u) =>
        new Date(u.lastLogin).toDateString() ===
        new Date().toDateString()
    ).length,
  };
};

/**
 * Get all admin users
 */
export const getAdminUsers = (): StoredUser[] => {
  const users = getAllUsers();
  return users.filter((u) => u.isAdmin);
};

/**
 * Get all regular users (non-admin)
 */
export const getRegularUsers = (): StoredUser[] => {
  const users = getAllUsers();
  return users.filter((u) => !u.isAdmin);
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = (userId: string): void => {
  try {
    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);

    if (user) {
      user.lastLogin = new Date().toISOString();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = (query: string): StoredUser[] => {
  const users = getAllUsers();
  const lowerQuery = query.toLowerCase();

  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get users sorted by field
 */
export const getUsersSorted = (
  field: 'name' | 'email' | 'createdAt' | 'lastLogin',
  ascending = true
): StoredUser[] => {
  const users = getAllUsers();

  return [...users].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
};
