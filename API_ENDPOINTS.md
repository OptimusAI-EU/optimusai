# 🔌 VPN & LOCATION API ENDPOINTS

---

## 📡 Endpoints Overview

### Authentication Required
All endpoints require admin authentication. Headers:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## GET `/api/admin/users/:id`

**Get User Profile with Location Info**

### Request
```bash
GET /api/admin/users/123
Authorization: Bearer eyJhbGc...
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2025-11-20T10:00:00Z",
    "updatedAt": "2025-11-23T14:45:30Z",
    
    "lastIPAddress": "185.220.103.4",
    "lastISP": "ExpressVPN",
    "isVPNCurrentlyDetected": true,
    
    "lastVPNLocation": {
      "country": "Netherlands",
      "city": "Amsterdam",
      "latitude": 52.3676,
      "longitude": 4.9041,
      "isp": "ExpressVPN B.V.",
      "detectedAt": "2025-11-23T14:45:30Z",
      "provider": "ExpressVPN"
    },
    
    "lastActualLocation": {
      "country": "United States",
      "city": "San Francisco",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "isp": "Comcast Cable",
      "confirmedAt": "2025-11-22T10:15:00Z"
    },
    
    "locationInfo": {
      "lastVPNLocation": { ... },
      "lastActualLocation": { ... },
      "lastIPAddress": "185.220.103.4",
      "lastISP": "ExpressVPN",
      "isVPNCurrentlyDetected": true,
      "locationHistoryCount": 24
    },
    
    "recentSessions": [
      {
        "id": 1001,
        "ipAddress": "185.220.103.4",
        "isVPNDetected": true,
        "vpnProvider": "ExpressVPN",
        "vpnDetectionScore": 92,
        "location": { "country": "Netherlands", "city": "Amsterdam", ... },
        "loginTime": "2025-11-23T14:45:30Z",
        "isActive": true
      }
    ]
  }
}
```

---

## GET `/api/admin/users/:id/location`

**Get Detailed Location Information**

### Request
```bash
GET /api/admin/users/123/location
Authorization: Bearer eyJhbGc...
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    
    "currentStatus": {
      "isVPNActive": true,
      "lastIPAddress": "185.220.103.4",
      "lastISP": "ExpressVPN",
      "vpnDetectionEnabled": true
    },
    
    "vpnLocation": {
      "country": "Netherlands",
      "city": "Amsterdam",
      "latitude": 52.3676,
      "longitude": 4.9041,
      "isp": "ExpressVPN B.V.",
      "detectedAt": "2025-11-23T14:45:30Z",
      "provider": "ExpressVPN",
      "ip": "185.220.103.4"
    },
    
    "actualLocation": {
      "country": "United States",
      "city": "San Francisco",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "isp": "Comcast Cable",
      "confirmedAt": "2025-11-22T10:15:00Z",
      "ip": "73.45.23.12"
    },
    
    "locationHistory": {
      "total": 24,
      "vpnCount": 8,
      "actualCount": 16,
      "lastUpdated": "2025-11-23T14:45:30Z",
      
      "recent": [
        {
          "type": "vpn",
          "location": { "country": "Netherlands", "city": "Amsterdam", ... },
          "ip": "185.220.103.4",
          "isp": "ExpressVPN",
          "timestamp": "2025-11-23T14:45:30Z",
          "provider": "ExpressVPN"
        },
        {
          "type": "actual",
          "location": { "country": "United States", "city": "San Francisco", ... },
          "ip": "73.45.23.12",
          "isp": "Comcast Cable",
          "timestamp": "2025-11-22T10:15:00Z",
          "provider": null
        }
        // ... last 20 entries
      ]
    }
  }
}
```

---

## GET `/api/admin/users/:id/sessions`

**Get User's Login Sessions**

### Request
```bash
GET /api/admin/users/123/sessions
Authorization: Bearer eyJhbGc...
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    
    "sessions": [
      {
        "id": 1001,
        "userId": 123,
        "ipAddress": "185.220.103.4",
        
        "isVPNDetected": true,
        "vpnProvider": "ExpressVPN",
        "vpnDetectionScore": 92,
        
        "vpnLocation": {
          "country": "Netherlands",
          "city": "Amsterdam",
          "latitude": 52.3676,
          "longitude": 4.9041,
          "isp": "ExpressVPN B.V.",
          "timezone": "Europe/Amsterdam"
        },
        
        "location": {
          "country": "Netherlands",
          "city": "Amsterdam",
          "latitude": 52.3676,
          "longitude": 4.9041,
          "isp": "ExpressVPN B.V.",
          "timezone": "Europe/Amsterdam"
        },
        
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "loginTime": "2025-11-23T14:45:30Z",
        "logoutTime": null,
        "isActive": true,
        
        "vpnDetectionHistory": [
          {
            "timestamp": "2025-11-23T14:45:30Z",
            "ip": "185.220.103.4",
            "isVPN": true,
            "provider": "ExpressVPN",
            "method": "login",
            "fraudScore": 92
          }
        ]
      },
      {
        "id": 1000,
        "userId": 123,
        "ipAddress": "73.45.23.12",
        
        "isVPNDetected": false,
        "vpnProvider": null,
        "vpnDetectionScore": 15,
        
        "realLocation": {
          "country": "United States",
          "city": "San Francisco",
          "latitude": 37.7749,
          "longitude": -122.4194,
          "isp": "Comcast Cable",
          "timezone": "America/Los_Angeles"
        },
        
        "location": {
          "country": "United States",
          "city": "San Francisco",
          "latitude": 37.7749,
          "longitude": -122.4194,
          "isp": "Comcast Cable",
          "timezone": "America/Los_Angeles"
        },
        
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
        "loginTime": "2025-11-22T10:15:00Z",
        "logoutTime": "2025-11-22T18:30:00Z",
        "isActive": false,
        
        "realIPConfirmedAt": "2025-11-22T10:15:00Z",
        "vpnDetectionHistory": [
          {
            "timestamp": "2025-11-22T10:15:00Z",
            "ip": "73.45.23.12",
            "isVPN": false,
            "provider": null,
            "method": "login",
            "fraudScore": 15
          }
        ]
      }
    ]
  }
}
```

---

## POST `/api/auth/report-ip-change`

**Report IP Address Change (For VPN Disconnect Detection)**

### Request
```bash
POST /api/auth/report-ip-change
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "newIP": "73.45.23.12",
  "timestamp": "2025-11-23T16:30:00Z",
  "browserFingerprint": {
    "userAgent": "Mozilla/5.0...",
    "language": "en-US",
    "timezone": "America/Los_Angeles",
    "platform": "MacIntel"
  },
  "vpnStatus": {
    "isVPN": false,
    "isProxy": false,
    "score": 15
  }
}
```

### Response - VPN Disabled (Real Location Confirmed)
```json
{
  "success": true,
  "message": "Real location confirmed. VPN is now disabled.",
  "realLocationConfirmed": true,
  "location": {
    "country": "United States",
    "city": "San Francisco",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "isp": "Comcast Cable",
    "timezone": "America/Los_Angeles"
  }
}
```

### Response - Still Using VPN
```json
{
  "success": true,
  "message": "IP changed but VPN is still active",
  "realLocationConfirmed": false,
  "vpnStatus": "STILL_ACTIVE",
  "vpnProvider": "NordVPN"
}
```

---

## Data Models

### Location Object
```typescript
interface Location {
  country: string;        // e.g., "United States"
  city: string;          // e.g., "San Francisco"
  latitude: number;      // e.g., 37.7749
  longitude: number;     // e.g., -122.4194
  isp: string;           // e.g., "Comcast Cable"
  timezone?: string;     // e.g., "America/Los_Angeles"
}
```

### VPN Location Object
```typescript
interface VPNLocation extends Location {
  detectedAt: string;    // ISO timestamp
  provider: string;      // e.g., "ExpressVPN"
  ip: string;           // e.g., "185.220.103.4"
}
```

### Actual Location Object
```typescript
interface ActualLocation extends Location {
  confirmedAt: string;   // ISO timestamp
  ip: string;           // e.g., "73.45.23.12"
}
```

### Session Object
```typescript
interface UserSession {
  id: number;
  userId: number;
  ipAddress: string;
  isVPNDetected: boolean;
  vpnProvider?: string;
  vpnDetectionScore?: number;
  vpnLocation?: VPNLocation;
  realLocation?: ActualLocation;
  location?: Location;
  userAgent: string;
  loginTime: string;     // ISO timestamp
  logoutTime?: string;   // ISO timestamp
  isActive: boolean;
  vpnDetectionHistory?: Array<{
    timestamp: string;
    ip: string;
    isVPN: boolean;
    provider?: string;
    method: string;
    fraudScore?: number;
  }>;
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have admin privileges"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get user with location info
async function getUserLocation(userId: number, token: string) {
  const response = await fetch(
    `http://localhost:5000/api/admin/users/${userId}/location`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();
  
  if (data.success) {
    console.log('VPN Active:', data.data.currentStatus.isVPNActive);
    console.log('Location History:', data.data.locationHistory.total);
    console.log('Recent Changes:', data.data.locationHistory.recent);
  }
}

// Report IP change (from frontend)
async function reportIPChange(newIP: string, token: string) {
  const response = await fetch(
    'http://localhost:5000/api/auth/report-ip-change',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newIP,
        timestamp: new Date().toISOString(),
        browserFingerprint: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    }
  );
  const data = await response.json();
  
  if (data.realLocationConfirmed) {
    console.log('Real location confirmed:', data.location);
  }
}
```

### cURL

```bash
# Get user location details
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/users/123/location

# Get user sessions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/users/123/sessions

# Report IP change
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newIP": "73.45.23.12",
    "timestamp": "2025-11-23T16:30:00Z"
  }' \
  http://localhost:5000/api/auth/report-ip-change
```

---

## Rate Limiting

- **General Limit:** 100 requests per 15 minutes per IP
- **Login Limit:** 5 attempts per 15 minutes per IP
- **VPN Detection:** Cached for 24 hours per IP

---

## Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 98
X-RateLimit-Reset: 1700768400
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Coordinates are in decimal degrees
- Location history is limited to 50 most recent changes
- Session history shows last 20 sessions per request
- VPN detection requires valid `IPQS_API_KEY` in environment
