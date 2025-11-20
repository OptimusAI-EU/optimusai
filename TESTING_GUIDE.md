# Backend Testing Guide

Complete step-by-step guide to test the Optimus AI backend.

## Prerequisites

- Node.js 16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Google OAuth App credentials (optional for testing)
- GitHub OAuth App credentials (optional for testing)

---

## Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

Expected output:
```
added XXX packages in X.XXs
```

---

## Step 2: Configure Environment Variables

Copy the example env file and fill in your credentials:

```powershell
Copy-Item .env.example -Destination .env
```

Open `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/optimus-ai
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/optimus-ai

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars

# OAuth2 - Google (Optional for testing - local auth works fine)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth2 - GitHub (Optional for testing)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Stripe (Optional - for payment testing)
STRIPE_SECRET_KEY=sk_test_...

# Admin Email
ADMIN_EMAIL=admin@optimusai.com
```

### Quick Setup for Testing (Local Only)

Minimal `.env` for local testing without OAuth:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/optimus-ai
JWT_SECRET=test_secret_key_longer_than_32_characters_for_testing
JWT_REFRESH_SECRET=test_refresh_secret_key_longer_than_32_characters
EMAIL_SERVICE=gmail
EMAIL_USER=test@gmail.com
EMAIL_PASS=test_password
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@test.com
```

---

## Step 3: Start MongoDB

### Option A: Local MongoDB

```powershell
# Windows - if MongoDB installed
mongod

# Or use MongoDB Compass (GUI)
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Verify Connection

```powershell
mongo
# or
mongosh
```

---

## Step 4: Start Backend Server

From the `backend` directory:

```powershell
npm run dev
```

Expected output:
```
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
Server running on port 5000
MongoDB connected successfully
```

---

## Step 5: Test Endpoints

Use **Postman**, **Thunder Client** (VS Code), or **curl** for testing.

### 5.1: Health Check (Public - No Auth)

```
GET http://localhost:5000/api/health
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### 5.2: Register New User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+1234567890"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the `accessToken`** for the next tests.

---

### 5.3: Login User

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

---

### 5.4: Get User Profile (Protected)

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <your_accessToken>
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    ...
  }
}
```

---

### 5.5: Update User Profile (Protected)

```
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <your_accessToken>
Content-Type: application/json

{
  "company": "Tech Corp",
  "phone": "+9876543210",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 5.6: Create Subscription (Protected)

```
POST http://localhost:5000/api/subscriptions
Authorization: Bearer <your_accessToken>
Content-Type: application/json

{
  "planName": "professional",
  "type": "RAAS",
  "billingCycle": "monthly"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "_id": "507f1f77bcf86cd799439012",
    "planName": "professional",
    "type": "RAAS",
    "price": 299,
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    ...
  }
}
```

---

### 5.7: Get Subscriptions (Protected)

```
GET http://localhost:5000/api/subscriptions
Authorization: Bearer <your_accessToken>
```

**Expected Response (200):**
```json
{
  "success": true,
  "subscriptions": [ ... ]
}
```

---

### 5.8: Submit Contact Form (Public - No Auth)

```
POST http://localhost:5000/api/contact
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Question about pricing",
  "message": "I would like to know more about your enterprise plans.",
  "category": "sales"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "formId": "507f1f77bcf86cd799439013"
}
```

---

### 5.9: Refresh Access Token (Public)

```
POST http://localhost:5000/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<your_refreshToken>"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## Step 6: Test Error Handling

### 6.1: Missing Token

```
GET http://localhost:5000/api/users/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "No token provided"
}
```

---

### 6.2: Invalid Token

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

---

### 6.3: Invalid Credentials

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 6.4: Duplicate Email

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "AnotherPass123!",
  "firstName": "Another",
  "lastName": "User"
}
```

**Expected Response (409):**
```json
{
  "success": false,
  "error": "User already exists"
}
```

---

## Step 7: Database Verification

### Check MongoDB Collections

```powershell
mongosh

# Switch to database
use optimus-ai

# View collections
show collections

# View users
db.users.find().pretty()

# View subscriptions
db.subscriptions.find().pretty()

# View contact forms
db.contactforms.find().pretty()
```

---

## Troubleshooting

### Issue: "MongoDB connection failed"

**Solution:**
- Ensure MongoDB is running (`mongod` command)
- Check `MONGODB_URI` in `.env`
- For Atlas: verify IP whitelist and credentials

### Issue: "Port 5000 already in use"

**Solution:**
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
```

### Issue: "JWT_SECRET must be at least 32 characters"

**Solution:**
- Generate a long string: `[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your_secret_key_that_is_very_long_and_secure")) `
- Or use any string with 32+ characters

### Issue: "Email sending failed"

**Solution:**
- For Gmail: use App Password, not regular password
- Enable "Less secure app access" if needed
- Or use a test email service like Mailtrap

### Issue: CORS error in frontend

**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches your React dev server URL

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require valid token
- [ ] Profile updates work
- [ ] Subscription creation works
- [ ] Contact form submission works
- [ ] Error handling returns correct status codes
- [ ] MongoDB stores all data correctly
- [ ] Token refresh works
- [ ] Invalid credentials return 401
- [ ] Duplicate emails return 409

---

## Next Steps After Backend Testing

1. ✅ Backend is working and tested
2. **Frontend Integration**: Update React components to call backend APIs
3. **Auth State Management**: Implement context/hook for user session
4. **OAuth Setup** (optional): Configure Google/GitHub OAuth apps
5. **Payment Integration** (optional): Set up Stripe for subscriptions/orders

---

**Test Backend Status:** READY ✅
