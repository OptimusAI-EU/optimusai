import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../utils/adminApi';
import { useAuth } from '../../context/AuthContext';

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress?: any;
  billingAddress?: any;
  createdAt: string;
}

interface ConfirmModal {
  isOpen: boolean;
  orderId: number | null;
  newOrderStatus: string | null;
  newPaymentStatus: string | null;
}

const AdminOrders: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    orderId: null,
    newOrderStatus: null,
    newPaymentStatus: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, orderStatusFilter, paymentStatusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.user?.email.toLowerCase().includes(query) ||
          (o.user?.firstName + ' ' + o.user?.lastName).toLowerCase().includes(query)
      );
    }

    // Status filters
    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter((o) => o.orderStatus === orderStatusFilter);
    }
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = (orderId: number, newOrderStatus?: string, newPaymentStatus?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setConfirmModal({
      isOpen: true,
      orderId,
      newOrderStatus: newOrderStatus || order.orderStatus,
      newPaymentStatus: newPaymentStatus || order.paymentStatus,
    });
  };

  const confirmStatusChange = async () => {
    if (!confirmModal.orderId || (!confirmModal.newOrderStatus && !confirmModal.newPaymentStatus)) return;

    try {
      await updateOrderStatus(confirmModal.orderId, {
        orderStatus: confirmModal.newOrderStatus,
        paymentStatus: confirmModal.newPaymentStatus,
      });

      // Reload orders
      await loadOrders();
      setConfirmModal({ isOpen: false, orderId: null, newOrderStatus: null, newPaymentStatus: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getItemsDescription = (items: any[]) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => item.productName || item.name || 'Item').join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <p className="text-gray-600 mt-1">Manage customer orders and shipments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by order ID, email, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Order Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center justify-end">
            {filteredOrders.length} orders found
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.user?.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {getItemsDescription(order.items)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {order.paymentMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedOrder === order.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedOrder === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={10} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                              <div className="space-y-2 bg-white rounded p-4 border border-gray-200">
                                {order.items && order.items.length > 0 ? (
                                  <>
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm pb-2 border-b border-gray-100">
                                        <span className="text-gray-700 font-medium">{item.productName || item.name || 'Item'}</span>
                                        <span className="text-gray-900">
                                          x{item.quantity || 1} @ ${(item.unitPrice || item.price || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Subtotal:</span>
                                        <span className="text-gray-900 font-medium">${order.subtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Shipping:</span>
                                        <span className="text-gray-900 font-medium">${order.shipping.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Tax:</span>
                                        <span className="text-gray-900 font-medium">${order.tax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-bold border-t border-gray-300 pt-2">
                                        <span className="text-gray-900">Total:</span>
                                        <span className="text-red-600">${order.total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-gray-600 text-sm py-4">No items in this order</p>
                                )}
                              </div>
                            </div>

                            {/* Shipping & Payment Details */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                                {order.shippingAddress ? (
                                  <div className="bg-white rounded p-4 border border-gray-200 space-y-1 text-sm">
                                    <p className="font-medium text-gray-900">{order.shippingAddress.name || order.user?.firstName + ' ' + order.user?.lastName}</p>
                                    {order.shippingAddress.street && <p className="text-gray-700">{order.shippingAddress.street}</p>}
                                    {order.shippingAddress.city && (
                                      <p className="text-gray-700">
                                        {order.shippingAddress.city}
                                        {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                                        {order.shippingAddress.zip && ` ${order.shippingAddress.zip}`}
                                      </p>
                                    )}
                                    {order.shippingAddress.country && <p className="text-gray-700">{order.shippingAddress.country}</p>}
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-sm bg-white rounded p-4 border border-gray-200">No shipping address provided</p>
                                )}
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Payment & Status</h4>
                                <div className="bg-white rounded p-4 border border-gray-200 space-y-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Payment Method</label>
                                    <p className="text-sm text-gray-900 capitalize font-medium">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                    <select
                                      value={order.orderStatus}
                                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent w-full text-sm"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                    <select
                                      value={order.paymentStatus}
                                      onChange={(e) => handleStatusChange(order.id, undefined, e.target.value)}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent w-full text-sm"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="completed">Completed</option>
                                      <option value="failed">Failed</option>
                                      <option value="refunded">Refunded</option>
                                    </select>
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
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-600">
                    No orders found
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Status Change</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to update the order status?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, orderId: null, newOrderStatus: null, newPaymentStatus: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
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

export default AdminOrders;
