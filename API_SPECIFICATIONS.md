# API Specifications Document

Complete API reference for Optimus AI Backend

## Base URL

```
Development: http://localhost:5000
Production: https://api.optimusai.com
```

## Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": null
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- 400: Missing required fields / Invalid email
- 409: User already exists

---

### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid credentials
- 403: Account deactivated

---

### GET /api/auth/google

Initiate Google OAuth flow.

**Query Parameters:** None

**Redirects to:** Google login page

---

### GET /api/auth/google/callback

Google OAuth callback handler.

**Query Parameters:**
- `code`: Authorization code from Google

**Redirects to:**
```
http://localhost:5173/auth/callback?accessToken=...&refreshToken=...
```

---

### GET /api/auth/github

Initiate GitHub OAuth flow.

**Query Parameters:** None

**Redirects to:** GitHub login page

---

### GET /api/auth/github/callback

GitHub OAuth callback handler.

**Query Parameters:**
- `code`: Authorization code from GitHub

**Redirects to:**
```
http://localhost:5173/auth/callback?accessToken=...&refreshToken=...
```

---

### POST /api/auth/refresh-token

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- 400: Refresh token required
- 401: Invalid refresh token

---

### POST /api/auth/logout

Logout user (token invalidation).

**Headers:** 
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### GET /api/users/profile

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "company": "Tech Corp",
    "role": "user",
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2025-01-01T00:00:00.000Z",
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "shippingAddress": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 404: User not found

---

### PUT /api/users/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Tech Company",
  "billingAddress": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  },
  "shippingAddress": {
    "street": "789 Pine Rd",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### POST /api/users/change-password

Change user password.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- 401: Current password incorrect
- 400: Password requirements not met

---

### GET /api/users/subscriptions

Get all user subscriptions.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "subscriptions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "professional",
      "type": "RAAS",
      "billingCycle": "monthly",
      "price": 299,
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z",
      "renewalDate": "2024-02-01T00:00:00.000Z",
      "features": ["Up to 20 robots", "Priority support"],
      "usageStats": {
        "requestsUsed": 150,
        "requestsLimit": 1000,
        "storageUsed": 45,
        "storageLimit": 500
      }
    }
  ]
}
```

---

### GET /api/users/billing-history

Get user billing history.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "billingHistory": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "planName": "professional",
      "price": 299,
      "billingCycle": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z",
      "status": "active"
    }
  ]
}
```

---

### DELETE /api/users/account

Delete user account (soft delete).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "UserPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Subscription Endpoints

### POST /api/subscriptions

Create new subscription.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planName": "professional",
  "type": "RAAS",
  "billingCycle": "monthly"
}
```

**Available Plans:**

RAAS:
- `starter`: $99/month or $990/year
- `professional`: $299/month or $2990/year
- `enterprise`: $999/month or $9990/year

SAAS:
- `starter`: $79/month or $790/year
- `professional`: $199/month or $1990/year
- `enterprise`: $799/month or $7990/year

**Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "planName": "professional",
    "type": "RAAS",
    "billingCycle": "monthly",
    "price": 299,
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "renewalDate": "2024-02-01T00:00:00.000Z",
    "autoRenew": true,
    "features": ["Up to 20 robots", "Priority support", "1000 requests/day"],
    "usageStats": {
      "requestsUsed": 0,
      "requestsLimit": 1000,
      "storageUsed": 0,
      "storageLimit": 500
    }
  },
  "user": { ... }
}
```

---

### PUT /api/subscriptions/:id/upgrade

Upgrade subscription to higher plan.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Subscription ID

**Request Body:**
```json
{
  "newPlanName": "enterprise"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "subscription": { ... },
  "proratedAmount": 700
}
```

---

### PUT /api/subscriptions/:id/cancel

Cancel subscription.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Subscription ID

**Request Body:**
```json
{
  "reason": "Switching to competitor"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {
    "status": "cancelled",
    "cancelledAt": "2024-01-15T00:00:00.000Z",
    "cancelReason": "Switching to competitor"
  }
}
```

---

### GET /api/subscriptions/details

Get current active subscription details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "subscription": { ... }
}
```

---

## Order Endpoints

### POST /api/orders

Create new order.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439014",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "credit_card",
  "notes": "Please handle with care"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439015",
    "orderNumber": "ORD-1704067200000-1",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439013",
        "productName": "Advanced Robot Arm",
        "quantity": 2,
        "unitPrice": 5000,
        "totalPrice": 10000
      }
    ],
    "subtotal": 10000,
    "shipping": 50,
    "tax": 1005,
    "total": 11055,
    "shippingAddress": { ... },
    "billingAddress": { ... },
    "paymentMethod": "credit_card",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid items / Missing address
- 404: Product not found
- 400: Insufficient stock

---

### GET /api/orders/my-orders

Get user's orders.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` (optional): Filter by order status (pending, processing, shipped, delivered, cancelled)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response (200):**
```json
{
  "success": true,
  "orders": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### GET /api/orders/:id

Get specific order details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**URL Parameters:**
- `id`: Order ID

**Response (200):**
```json
{
  "success": true,
  "order": { ... }
}
```

**Errors:**
- 403: Unauthorized
- 404: Order not found

---

### PUT /api/orders/:id/cancel

Cancel order.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "orderStatus": "cancelled",
    "paymentStatus": "refunded",
    "cancelledAt": "2024-01-15T00:00:00.000Z",
    "cancelReason": "Changed my mind"
  }
}
```

---

### GET /api/orders (Admin)

Get all orders (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "orders": [ ... ],
  "pagination": { ... }
}
```

---

### PUT /api/orders/:id/status (Admin)

Update order status (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "orderStatus": "shipped",
  "paymentStatus": "completed",
  "trackingNumber": "TRACK123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": { ... }
}
```

---

## Contact Form Endpoints

### POST /api/contact

Submit contact form (public).

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Question about pricing",
  "message": "I would like to know more about your enterprise plans.",
  "category": "sales"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "formId": "507f1f77bcf86cd799439016"
}
```

---

### GET /api/contact (Admin)

Get all contact forms (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Query Parameters:**
- `status` (optional): new, in_progress, resolved, closed
- `category` (optional): general, support, sales, partnership, bug_report
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "contactForms": [ ... ],
  "pagination": { ... }
}
```

---

### GET /api/contact/:id

Get contact form details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**URL Parameters:**
- `id`: Contact form ID

**Response (200):**
```json
{
  "success": true,
  "contactForm": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Question about pricing",
    "message": "...",
    "category": "sales",
    "status": "in_progress",
    "priority": "high",
    "isRead": true,
    "responses": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/contact/:id (Admin)

Update contact form status (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Contact form ID

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact form updated",
  "contactForm": { ... }
}
```

---

### POST /api/contact/:id/response (Admin)

Add response to contact form (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Contact form ID

**Request Body:**
```json
{
  "message": "Thank you for your inquiry. We would be happy to discuss enterprise plans with you..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Response added successfully",
  "contactForm": { ... }
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request format or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for resource |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

**API Version:** 1.0.0  
**Last Updated:** January 2024
