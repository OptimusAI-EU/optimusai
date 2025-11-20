# Optimus AI Backend

Full-stack Node.js backend for the Optimus AI and Robotics platform with OAuth2 authentication, MongoDB database, and comprehensive API endpoints.

## Features

- ✅ **OAuth2 Authentication** - Sign in with Google, GitHub, or email/password
- ✅ **User Management** - Profile management, subscriptions, billing
- ✅ **Subscription Management** - Multiple plans (Starter, Professional, Enterprise)
- ✅ **Order Management** - Product purchasing with shipping and billing addresses
- ✅ **Contact Forms** - User inquiries with admin response system
- ✅ **Admin Dashboard** - Manage users, orders, subscriptions, and contact forms
- ✅ **JWT Authentication** - Secure token-based API access
- ✅ **Email Notifications** - Automated emails for contact forms and orders
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **MongoDB Integration** - Scalable NoSQL database

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Required environment variables:**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - From GitHub OAuth Apps
- `EMAIL_USER` & `EMAIL_PASSWORD` - Gmail credentials for sending emails
- `STRIPE_PUBLIC_KEY` & `STRIPE_SECRET_KEY` - For payment processing (optional)

### 3. MongoDB Setup

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

### 4. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/subscriptions` - Get user subscriptions
- `GET /api/users/billing-history` - Get billing history
- `DELETE /api/users/account` - Delete account

### Subscriptions

- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id/upgrade` - Upgrade plan
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `GET /api/subscriptions/details` - Get subscription details

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Contact Forms

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact forms (admin)
- `GET /api/contact/:id` - Get contact form details
- `PUT /api/contact/:id` - Update contact form status (admin)
- `POST /api/contact/:id/response` - Add response (admin)

## Database Models

### User
- Profile information
- OAuth credentials
- Subscription data
- Billing addresses
- Login history
- Role-based access

### Subscription
- Plan details (Starter, Professional, Enterprise)
- Usage statistics
- Billing cycle (monthly/annual)
- Auto-renewal settings
- Stripe integration

### Order
- Items and pricing
- Shipping & billing addresses
- Payment information
- Order status tracking
- Refund handling

### ContactForm
- Message details
- Status and priority
- Admin assignment
- Response history
- Attachment support

### Product
- Product catalog
- Stock management
- Pricing
- Ratings & reviews

## Authentication Flow

### Email/Password
1. User registers with email, password, name
2. Backend hashes password with bcrypt
3. User logs in with credentials
4. Server generates JWT access & refresh tokens
5. Tokens used for subsequent API requests

### OAuth2 (Google/GitHub)
1. User clicks "Sign in with Google/GitHub"
2. Redirected to OAuth provider
3. After approval, redirected to callback URL
4. Backend creates/updates user record
5. Tokens sent to frontend
6. Frontend stores tokens for API access

## Database Schema

See individual model files in `/models` directory for detailed schemas.

## Error Handling

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": null
}
```

## Testing

```bash
npm test
```

## Deployment

### Heroku
```bash
git push heroku main
```

### AWS/Digital Ocean/VPS
1. Install Node.js and MongoDB
2. Clone repository
3. Set environment variables
4. Run `npm install && npm start`
5. Use process manager (PM2) for auto-restart
6. Set up reverse proxy (Nginx)
7. Configure SSL certificate

## Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Password hashing with bcrypt
- ✅ JWT for stateless authentication
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet.js for security headers
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)

## Support

For issues or questions, please contact the development team.
