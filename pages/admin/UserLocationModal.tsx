import React from 'react';

interface UserLocationModalProps {
  isOpen: boolean;
  user: any;
  loading: boolean;
  locationData?: any;
  onClose: () => void;
}

const UserLocationModal: React.FC<UserLocationModalProps> = ({
  isOpen,
  user,
  loading,
  locationData,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📍 Location Details - {user.email}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-600">Loading location data...</div>
          </div>
        ) : locationData ? (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 font-semibold">VPN Status</p>
                  <p className="text-lg font-bold text-blue-900">
                    {locationData.currentStatus?.isVPNActive ? '🔒 VPN Active' : '✓ Direct Connection'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-semibold">Last IP Address</p>
                  <p className="text-lg font-mono font-bold text-blue-900">
                    {locationData.currentStatus?.lastIPAddress || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-semibold">ISP</p>
                  <p className="text-lg font-bold text-blue-900">
                    {locationData.currentStatus?.lastISP || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-semibold">VPN Detection</p>
                  <p className="text-lg font-bold text-blue-900">
                    {locationData.currentStatus?.vpnDetectionEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* VPN Location */}
            {locationData.vpnLocation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-4">🔒 VPN Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">Country</p>
                    <p className="text-base font-bold text-yellow-900">{locationData.vpnLocation.country || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">City</p>
                    <p className="text-base font-bold text-yellow-900">{locationData.vpnLocation.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">ISP</p>
                    <p className="text-base font-bold text-yellow-900">{locationData.vpnLocation.isp || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">Detected At</p>
                    <p className="text-base font-bold text-yellow-900">
                      {locationData.vpnLocation.detectedAt
                        ? new Date(locationData.vpnLocation.detectedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold">Provider</p>
                    <p className="text-base font-bold text-yellow-900">{locationData.vpnLocation.provider || 'Unknown'}</p>
                  </div>
                  {locationData.vpnLocation.latitude && (
                    <div>
                      <p className="text-sm text-yellow-700 font-semibold">Coordinates</p>
                      <p className="text-base font-mono text-yellow-900">
                        {locationData.vpnLocation.latitude.toFixed(4)}, {locationData.vpnLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actual Location */}
            {locationData.actualLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">✓ Actual Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Country</p>
                    <p className="text-base font-bold text-green-900">{locationData.actualLocation.country || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">City</p>
                    <p className="text-base font-bold text-green-900">{locationData.actualLocation.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">ISP</p>
                    <p className="text-base font-bold text-green-900">{locationData.actualLocation.isp || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">Confirmed At</p>
                    <p className="text-base font-bold text-green-900">
                      {locationData.actualLocation.confirmedAt
                        ? new Date(locationData.actualLocation.confirmedAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  {locationData.actualLocation.latitude && (
                    <div>
                      <p className="text-sm text-green-700 font-semibold">Coordinates</p>
                      <p className="text-base font-mono text-green-900">
                        {locationData.actualLocation.latitude.toFixed(4)}, {locationData.actualLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location History */}
            {locationData.locationHistory && locationData.locationHistory.total > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-4">
                  📊 Location History ({locationData.locationHistory.total})
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-xs text-purple-700 font-semibold">Total Changes</p>
                    <p className="text-2xl font-bold text-purple-900">{locationData.locationHistory.total}</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-xs text-purple-700 font-semibold">VPN Sessions</p>
                    <p className="text-2xl font-bold text-yellow-600">{locationData.locationHistory.vpnCount}</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-xs text-purple-700 font-semibold">Direct Sessions</p>
                    <p className="text-2xl font-bold text-green-600">{locationData.locationHistory.actualCount}</p>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {locationData.locationHistory.recent &&
                    locationData.locationHistory.recent.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded border border-purple-200 text-sm">
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              item.type === 'vpn' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {item.type === 'vpn' ? '🔒 VPN' : '✓ Direct'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {item.location?.city}, {item.location?.country}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">{item.ip}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No location data available</p>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLocationModal;
