# Optimus AI & Robotics - Full Stack Setup Guide

Complete setup instructions for the full-stack MERN application with OAuth2 authentication, MongoDB, and admin panel.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [OAuth2 Configuration](#oauth2-configuration)
5. [MongoDB Setup](#mongodb-setup)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org)
- **MongoDB** (local or Atlas cloud) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com)
- **Code Editor** - VS Code recommended

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/optimus-ai

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Session
SESSION_SECRET=your_session_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Admin
ADMIN_EMAIL=admin@optimusai.com

# Stripe (optional)
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### 4. Start Backend Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Project Root

```bash
cd ../
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start Frontend Development Server

```bash
npm run dev:frontend
```

Frontend will run on `http://localhost:5173`

## OAuth2 Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5000`
   - `http://localhost:5173`
7. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
8. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to GitHub Settings > [Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - **Application name:** Optimus AI
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5000/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Windows (with MongoDB installed)
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Add IP address to allowlist (0.0.0.0/0 for development)
5. Get connection string
6. Update `MONGODB_URI` in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/optimus-ai?retryWrites=true&w=majority
```

## Running the Application

### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### Option 2: Run Both Concurrently

```bash
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Google OAuth
```
GET /api/auth/google
# Redirects to Google login
```

#### GitHub OAuth
```
GET /api/auth/github
# Redirects to GitHub login
```

### User Endpoints

```
GET /api/users/profile
Authorization: Bearer <accessToken>

PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Tech Company",
  "billingAddress": { ... },
  "shippingAddress": { ... }
}

GET /api/users/subscriptions
Authorization: Bearer <accessToken>

GET /api/users/billing-history
Authorization: Bearer <accessToken>
```

### Subscription Endpoints

```
POST /api/subscriptions
Authorization: Bearer <accessToken>
{
  "planName": "professional",
  "type": "RAAS",
  "billingCycle": "monthly"
}

PUT /api/subscriptions/:id/upgrade
Authorization: Bearer <accessToken>
{
  "newPlanName": "enterprise"
}

PUT /api/subscriptions/:id/cancel
Authorization: Bearer <accessToken>
{
  "reason": "Switching to competitor"
}
```

### Order Endpoints

```
POST /api/orders
Authorization: Bearer <accessToken>
{
  "items": [
    {
      "productId": "63d5e...",
      "quantity": 2
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
  "paymentMethod": "credit_card"
}

GET /api/orders/my-orders
Authorization: Bearer <accessToken>

GET /api/orders/:id
Authorization: Bearer <accessToken>
```

### Contact Form Endpoints

```
POST /api/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Question about pricing",
  "message": "I would like to know more about...",
  "category": "sales"
}

# Admin endpoints
GET /api/contact
Authorization: Bearer <adminAccessToken>

PUT /api/contact/:id
Authorization: Bearer <adminAccessToken>
{
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "admin_user_id"
}
```

## Database Structure

### User Collection
- Email, password (hashed)
- Profile information
- OAuth credentials
- Subscription details
- Addresses
- Role (user/admin)

### Subscription Collection
- User reference
- Plan details
- Billing cycle
- Usage statistics
- Status tracking

### Order Collection
- User reference
- Items list
- Pricing breakdown
- Addresses
- Payment info
- Status tracking

### ContactForm Collection
- Submitter details
- Message content
- Category
- Status & priority
- Admin assignment
- Response history

## Troubleshooting

### "MongoDB Connection Error"
- Check MongoDB is running locally or Atlas connection string is correct
- Verify `MONGODB_URI` in `.env`
- Check network firewall settings

### "OAuth callback failed"
- Verify redirect URIs match in OAuth provider settings
- Check `FRONTEND_URL` in `.env` matches your local setup
- Clear browser cookies and cache

### "Port 5000 already in use"
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### "Email sending not working"
- Enable "Less secure app access" for Gmail
- Generate app-specific password for Gmail
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

## Production Deployment

### Environment Variables
Update all `.env` values for production:
- Strong JWT secrets (32+ characters)
- Production MongoDB URI
- Valid OAuth credentials
- Production email service
- Production frontend URL

### Database Backups
- Enable automated backups in MongoDB Atlas
- Set up regular backup schedule

### SSL/HTTPS
- Use reverse proxy (Nginx)
- Configure SSL certificate (Let's Encrypt)

### Process Management
Install PM2 for auto-restart:
```bash
npm install -g pm2
pm2 start backend/server.js --name "optimus-api"
pm2 save
pm2 startup
```

## Support & Documentation

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Passport.js Documentation](https://www.passportjs.org)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Developed with ❤️ by Optimus AI Team**
