# High Priority Security Enhancements - Deployment Guide

This guide walks you through deploying all the high-priority security enhancements that have been implemented.

## What's Been Implemented

✅ **Security Improvements**
- JWT authentication with access and refresh tokens
- Rate limiting for all API endpoints
- Separate rate limiters for auth, uploads, and password reset
- Secure environment variable management

✅ **Database Enhancements**
- Performance indexes on all frequently queried tables
- Unique constraints to prevent duplicate data
- Cascade delete rules for referential integrity
- Email verification and password reset fields
- Soft delete support
- Email queue and activity logs tables

✅ **Centralized API Configuration**
- Frontend centralized API config (`frontend/src/config/api.js`)
- Environment-based URL management
- Helper functions for auth token management

✅ **Email Notifications**
- Email verification on registration (Admin & Owner)
- Password reset via email
- Request status update notifications
- Payment verification notifications
- New request notifications to admins

## Deployment Steps

### Step 1: Database Migration

**IMPORTANT:** Run this first before starting the backend!

1. Log in to your Supabase dashboard
2. Navigate to SQL Editor
3. Open the file: `backend/migrations/001_security_enhancements.sql`
4. Copy all contents and paste into SQL Editor
5. Click "Run" to execute
6. Verify success - check for new indexes and columns

**Verification:**
```sql
-- Check if new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'Admins' AND column_name = 'email_verified';

-- Check if indexes were created
SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

### Step 2: Backend Environment Configuration

1. **Update `.env` file** in `backend/` directory:

```env
# Your existing Supabase config
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
PORT=3000
NODE_ENV=production

# Add these NEW variables:

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your_random_32_character_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_random_32_character_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="OABP System <your_email@gmail.com>"

# Frontend URL (update for production)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=10
```

2. **Generate secure JWT secrets:**
```bash
# On Windows (PowerShell):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Mac/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Set up Gmail App Password** (if using Gmail):
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate new
   - Copy and use in `EMAIL_PASSWORD`

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install the newly added packages:
- jsonwebtoken
- express-rate-limit
- nodemailer

### Step 4: Frontend Environment Configuration

1. **Create `.env` file** in `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:3000
```

2. For production deployment, change to your backend URL:
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Step 5: Start the Backend

```bash
cd backend
npm start
```

**Expected console output:**
```
Server running on port 3000
```

**Test the server:**
```bash
curl http://localhost:3000/api/category/all
```

### Step 6: Update Frontend Components (Optional for Now)

The backend is fully functional with email notifications. Frontend updates can be done gradually.

**Priority frontend updates:**
1. Login components (to save JWT tokens)
2. API request headers (to include auth tokens)
3. Email verification page
4. Password reset page

See `INTEGRATION_GUIDE.md` for detailed frontend integration steps.

### Step 7: Test Email Notifications

1. **Configure email settings** in `.env`
2. **Test email sending:**

```bash
cd backend
node -e "const { sendVerificationEmail } = require('./utils/emailService'); sendVerificationEmail('your-test-email@gmail.com', 'Test User', 'test-token-123', 'Owner').then(() => console.log('Email sent!')).catch(err => console.error('Error:', err));"
```

3. Check your email inbox
4. If no email received, check:
   - Spam folder
   - Email credentials in `.env`
   - Backend console for errors

### Step 8: Test Authentication Flow

1. **Register a new admin:**
```bash
curl -X POST http://localhost:3000/api/main/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Admin",
    "email": "test@example.com",
    "username": "testadmin",
    "password": "password123"
  }'
```

2. **Check email** for verification link
3. **Verify email** by clicking link or using API:
```bash
curl -X POST http://localhost:3000/api/main/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-verification-token"}'
```

4. **Login with JWT:**
```bash
curl -X POST http://localhost:3000/api/main/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

### Step 9: Test Rate Limiting

Make rapid requests to test rate limiting:

```bash
# This should get rate limited after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/main/login \
    -H "Content-Type: application/json" \
    -d '{"username": "test", "password": "wrong"}';
  echo "\nRequest $i";
done
```

### Step 10: Test Password Reset

1. **Request password reset:**
```bash
curl -X POST http://localhost:3000/api/main/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. **Check email** for reset link
3. **Reset password:**
```bash
curl -X POST http://localhost:3000/api/main/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token",
    "newPassword": "newpassword123"
  }'
```

### Step 11: Test Email Notifications

1. **Create a test request** (as owner)
2. **Update request status** (as admin)
3. **Check owner's email** - should receive status update notification
4. **Submit payment proof** (as owner)
5. **Verify payment** (as admin)
6. **Check owner's email** - should receive payment verification notification

## Production Deployment

### Backend (Render/Heroku/Railway)

1. **Set environment variables** in your hosting platform
2. **Deploy backend code**
3. **Update FRONTEND_URL** to your production frontend URL
4. **Update CORS origins** in server.js if needed

### Frontend (Vercel/Netlify)

1. **Set `REACT_APP_API_URL`** to your production backend URL
2. **Build and deploy**
3. **Test authentication flow**

## Troubleshooting

### Email Not Sending

**Issue:** Emails not being sent

**Solutions:**
- Verify EMAIL_* variables in `.env`
- For Gmail: Use App-Specific Password, not regular password
- Check backend console for error messages
- Try different SMTP provider (SendGrid, Mailgun, etc.)
- Check firewall/network settings

### JWT Authentication Not Working

**Issue:** "Invalid or expired token" errors

**Solutions:**
- Ensure JWT_SECRET is same across all backend instances
- Check token format: "Bearer <token>"
- Verify token hasn't expired (default: 24h)
- Check browser console for token value

### Rate Limiting Too Strict

**Issue:** Getting rate limited too quickly

**Solutions:**
- Increase `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Increase `RATE_LIMIT_WINDOW_MS` for longer windows
- Adjust specific limiters in `middleware/rateLimiter.js`

### Database Migration Errors

**Issue:** Migration script fails

**Solutions:**
- Check if tables exist already
- Run sections of migration separately
- Check Supabase logs for specific error
- Ensure you have proper database permissions

### CORS Errors

**Issue:** Frontend can't connect to backend

**Solutions:**
- Add frontend URL to CORS origins in server.js
- Verify FRONTEND_URL in backend `.env`
- Check browser console for specific CORS error

## Monitoring

### Check Email Queue

```sql
SELECT * FROM "Email_Queue" WHERE status = 'Failed';
```

### Check Activity Logs

```sql
SELECT * FROM "Activity_Logs" ORDER BY created_at DESC LIMIT 100;
```

### Check Failed Login Attempts

```sql
SELECT * FROM "Login Audits"
WHERE status = 'Failed'
AND login_datetime > NOW() - INTERVAL '1 hour';
```

### Monitor Rate Limiting

Check backend console for rate limit messages.

## Next Steps

1. ✅ Complete frontend integration (update components to use centralized API)
2. ✅ Create email verification and password reset pages in frontend
3. ✅ Test all flows end-to-end
4. ✅ Deploy to production
5. ✅ Monitor email delivery and system performance
6. ✅ Set up automated backups

## Support

For issues or questions:
1. Check the `INTEGRATION_GUIDE.md`
2. Review backend console logs
3. Check Supabase dashboard for database issues
4. Test individual components in isolation

## Security Checklist

Before going to production:

- [ ] Changed JWT_SECRET and JWT_REFRESH_SECRET from defaults
- [ ] Used strong, random secrets (32+ characters)
- [ ] Set up email with secure credentials (app passwords)
- [ ] Updated FRONTEND_URL to production URL
- [ ] Updated CORS origins to production domains
- [ ] Tested rate limiting is working
- [ ] Verified email notifications are being sent
- [ ] Tested password reset flow
- [ ] Ran database migration successfully
- [ ] Set NODE_ENV=production
- [ ] Removed any test/debug credentials
- [ ] Enabled HTTPS for production
- [ ] Tested all authentication flows
