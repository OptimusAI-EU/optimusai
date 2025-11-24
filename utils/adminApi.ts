/**
 * Admin API Client
 * Handles all API calls to backend admin endpoints
 */

declare const __API_URL__: string;

const API_BASE_URL = typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return token;
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } else {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        errorMessage = text.substring(0, 200); // Get first 200 chars
      }
    } catch (parseError) {
      // If we can't parse the response, just use the status
      console.error('Failed to parse error response:', parseError);
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};

// ============ DASHBOARD ============

export const getDashboardStats = async () => {
  return makeRequest('/admin/dashboard/stats');
};

// ============ USERS ============

export const getAllUsers = async (
  search?: string,
  sortBy: string = 'createdAt',
  order: string = 'DESC',
  limit: number = 50,
  offset: number = 0
) => {
  const params = new URLSearchParams({
    sortBy,
    order,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  return makeRequest(`/admin/users?${params.toString()}`);
};

export const getUserById = async (userId: number) => {
  return makeRequest(`/admin/users/${userId}`);
};

export const updateUserRole = async (userId: number, role: 'user' | 'admin' | 'moderator') => {
  return makeRequest(`/admin/users/${userId}/role`, 'PUT', { role });
};

export const deleteUser = async (userId: number) => {
  return makeRequest(`/admin/users/${userId}`, 'DELETE');
};

export const getUserStats = async () => {
  return makeRequest('/admin/users/stats');
};

// ============ ORDERS ============

export const getAllOrders = async (
  search?: string,
  status?: string,
  paymentStatus?: string,
  sortBy: string = 'createdAt',
  order: string = 'DESC',
  limit: number = 50,
  offset: number = 0
) => {
  const params = new URLSearchParams({
    sortBy,
    order,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (paymentStatus) params.append('paymentStatus', paymentStatus);

  return makeRequest(`/admin/orders?${params.toString()}`);
};

export const getOrderById = async (orderId: number) => {
  return makeRequest(`/admin/orders/${orderId}`);
};

export const updateOrderStatus = async (
  orderId: number,
  orderStatus?: string,
  paymentStatus?: string
) => {
  return makeRequest(`/admin/orders/${orderId}/status`, 'PUT', {
    orderStatus,
    paymentStatus,
  });
};

export const getOrderStats = async () => {
  return makeRequest('/admin/orders/stats');
};

// ============ SUBSCRIPTIONS ============

export const getAllSubscriptions = async (
  search?: string,
  status?: string,
  planName?: string,
  sortBy: string = 'renewalDate',
  order: string = 'DESC',
  limit: number = 50,
  offset: number = 0
) => {
  const params = new URLSearchParams({
    sortBy,
    order,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (planName) params.append('planName', planName);

  return makeRequest(`/admin/subscriptions?${params.toString()}`);
};

export const updateSubscriptionStatus = async (subscriptionId: number, status: string) => {
  return makeRequest(`/admin/subscriptions/${subscriptionId}/status`, 'PUT', { status });
};

export const getSubscriptionStats = async () => {
  return makeRequest('/admin/subscriptions/stats');
};

// ============ AUDIT LOG ============

export const getAuditLog = async () => {
  return makeRequest('/admin/audit-log');
};

// ============ VPN DETECTION ============

export const detectVPNChange = async () => {
  return makeRequest('/auth/detect-vpn-change', 'POST');
};
