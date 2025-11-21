# Quick Test Setup

## For Windows PowerShell Users

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Configure Environment

Copy the `.env.example` file:
```powershell
Copy-Item .env.example -Destination .env
```

Edit `.env` with minimal config (for local testing):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/optimus-ai
JWT_SECRET=test_secret_key_longer_than_32_characters_for_testing_only
JWT_REFRESH_SECRET=test_refresh_secret_key_longer_than_32_characters_for_testing
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@test.com
```

### Step 3: Start MongoDB

**Option A - Local MongoDB:**
```powershell
# Open new PowerShell window
mongod
```

**Option B - Skip MongoDB setup for now:**
- The server will show connection error but you can still test auth endpoints that don't require DB operations

### Step 4: Start Backend Server

```powershell
cd backend
npm run dev
```

You should see:
```
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
Server running on port 5000
MongoDB connected successfully
```

### Step 5: Test in Another Terminal

```powershell
# Test health check (no auth needed)
curl http://localhost:5000/api/health

# Or use PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

---

## Recommended Testing Tools

### Option 1: VS Code Thunder Client (Easiest)
1. Install "Thunder Client" extension in VS Code
2. Open Thunder Client
3. Create new request
4. Test endpoints from TESTING_GUIDE.md

### Option 2: Postman
1. Download from https://www.postman.com/downloads/
2. Import collection or create requests manually
3. Use examples from TESTING_GUIDE.md

### Option 3: curl (Command Line)
```powershell
# Register
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d @- <<EOF
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "firstName": "Test",
  "lastName": "User"
}
EOF

# Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d @- <<EOF
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
EOF
```

---

## Quick API Test Sequence

1. **Health Check** - Verify server is running
   - GET `/api/health`
   - Expected: 200 OK

2. **Register User** - Create test account
   - POST `/api/auth/register`
   - Expected: 201 Created + tokens

3. **Get Profile** - Test protected route
   - GET `/api/users/profile`
   - Header: `Authorization: Bearer <your_token>`
   - Expected: 200 OK + user data

4. **Create Subscription** - Test subscription logic
   - POST `/api/subscriptions`
   - Body: `{ "planName": "professional", "type": "RAAS", "billingCycle": "monthly" }`
   - Expected: 201 Created

5. **Submit Contact Form** - Test public route
   - POST `/api/contact`
   - Body: Contact form data
   - Expected: 201 Created

---

## MongoDB Verification

After testing, verify data in MongoDB:

```powershell
# Open MongoDB shell
mongosh

# Use database
use optimus-ai

# View all users
db.users.find().pretty()

# View subscriptions
db.subscriptions.find().pretty()

# View contact forms
db.contactforms.find().pretty()
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process: `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| MongoDB connection error | Ensure `mongod` is running OR update MONGODB_URI to Atlas cloud instance |
| JWT_SECRET too short | Use string with 32+ characters |
| CORS error | Verify FRONTEND_URL in .env matches React dev server (usually http://localhost:5173) |
| Email test fails | Skip for now, use test credentials later |

---

## Status

✅ Backend code complete  
✅ All APIs implemented  
✅ Error handling configured  
⏳ **Testing in progress** - Follow TESTING_GUIDE.md  
🔲 Frontend integration (next)

Ready to test? Go to TESTING_GUIDE.md for detailed endpoint testing!
