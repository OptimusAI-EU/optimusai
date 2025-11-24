import React, { useState, useEffect } from 'react';

interface InventoryItem {
  id: number;
  type: 'Robot' | 'Software' | 'Service';
  productNumber: string;
  productName: string;
  quantity: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'In Store' | 'Sold' | 'Hired';
  price?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryStats {
  totalProducts: number;
  totalQty: number;
  byType: Array<{ type: string; count: number; totalQty: number }>;
  byStatus: Array<{ status: string; count: number; totalQty: number }>;
  recentItems: Array<InventoryItem>;
}

const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'Robot' as 'Robot' | 'Software' | 'Service',
    productNumber: '',
    productName: '',
    quantity: 0,
    latitude: 0,
    longitude: 0,
    status: 'In Store' as 'In Store' | 'Sold' | 'Hired',
    price: '',
    description: '',
  });

  // Helper function to get auth headers
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      // Load inventory items
      const itemsRes = await fetch('/api/admin/inventory', {
        credentials: 'include',
        headers,
      });
      console.log('Inventory response status:', itemsRes.status, 'ok:', itemsRes.ok);
      if (!itemsRes.ok) {
        const errorText = await itemsRes.text();
        console.error('Inventory error response:', errorText);
        throw new Error(`Failed to load inventory: ${itemsRes.status} - ${errorText.substring(0, 100)}`);
      }
      const itemsData = await itemsRes.json();
      setItems(itemsData);

      // Load stats
      const statsRes = await fetch('/api/admin/inventory/stats', {
        credentials: 'include',
        headers,
      });
      console.log('Stats response status:', statsRes.status, 'ok:', statsRes.ok);
      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        console.error('Stats error response:', errorText);
        throw new Error(`Failed to load inventory stats: ${statsRes.status}`);
      }
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      console.error('Inventory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseInt(String(formData.quantity)),
        price: formData.price ? parseFloat(formData.price) : undefined,
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/inventory/${editingId}` : '/api/admin/inventory';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save inventory item');
      }

      // Reset form and reload data
      setFormData({
        type: 'Robot',
        productNumber: '',
        productName: '',
        quantity: 0,
        latitude: 0,
        longitude: 0,
        status: 'In Store',
        price: '',
        description: '',
      });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save item';
      setError(errorMsg);
      console.error('Add item error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete item');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleIncrementQty = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${id}/increment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ amount: 1 }),
      });
      if (!res.ok) throw new Error('Failed to increment quantity');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increment');
    }
  };

  const handleDecrementQty = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${id}/decrement`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ amount: 1 }),
      });
      if (!res.ok) throw new Error('Failed to decrement quantity');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrement');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      type: item.type,
      productNumber: item.productNumber,
      productName: item.productName,
      quantity: item.quantity,
      latitude: item.location?.latitude || 0,
      longitude: item.location?.longitude || 0,
      status: item.status,
      price: item.price ? String(item.price) : '',
      description: item.description || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesType = !filterType || item.type === filterType;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading inventory...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Product Definition</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setFormData({
                  type: 'Robot',
                  productNumber: '',
                  productName: '',
                  quantity: 0,
                  latitude: 0,
                  longitude: 0,
                  status: 'In Store',
                  price: '',
                  description: '',
                });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Robot">Robot</option>
                <option value="Software">Software</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Number</label>
              <input
                type="text"
                value={formData.productNumber}
                onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
                placeholder="e.g., SA-101"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Robot Arm"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="In Store">In Store</option>
                <option value="Sold">Sold</option>
                <option value="Hired">Hired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Optional"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional product description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory Summary</h3>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm font-medium">Total Quantity</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalQty}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm font-medium">Product Types</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.byType.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm font-medium">Status Categories</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.byStatus.length}</p>
            </div>
          </div>

          {/* Breakdown by Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📦</span> Breakdown by Type
              </h4>
              <div className="space-y-3">
                {stats.byType.length === 0 ? (
                  <p className="text-gray-500 text-sm">No data available</p>
                ) : (
                  stats.byType.map((t: any) => (
                    <div key={t.type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{t.type}</p>
                        <p className="text-xs text-gray-600">{t.totalQty} units</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{t.count} products</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Breakdown by Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">✅</span> Breakdown by Status
              </h4>
              <div className="space-y-3">
                {stats.byStatus.length === 0 ? (
                  <p className="text-gray-500 text-sm">No data available</p>
                ) : (
                  stats.byStatus.map((s: any) => (
                    <div key={s.status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{s.status}</p>
                        <p className="text-xs text-gray-600">{s.totalQty} units</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          s.status === 'In Store'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'Sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {s.count} products
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Items */}
          {stats.recentItems && stats.recentItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">⏱️</span> Recently Added
              </h4>
              <div className="space-y-2">
                {stats.recentItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'In Store'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Sold'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Robot">Robot</option>
              <option value="Software">Software</option>
              <option value="Service">Service</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="In Store">In Store</option>
              <option value="Sold">Sold</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Inventory Items ({filteredItems.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qty</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No inventory items found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{item.productNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrementQty(item.id)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrementQty(item.id)}
                          className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.location ? (
                        <div className="font-mono text-xs">
                          {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'In Store'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.price ? `$${item.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
