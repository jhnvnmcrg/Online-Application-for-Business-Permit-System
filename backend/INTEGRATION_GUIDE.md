# Security Enhancements Integration Guide

This guide explains how to integrate the new security features into your existing server.js.

## Prerequisites

1. ✅ Run the database migration: `backend/migrations/001_security_enhancements.sql`
2. ✅ Update `.env` file with new environment variables (JWT secrets, email config)
3. ✅ Install npm packages: `jsonwebtoken`, `express-rate-limit`, `nodemailer`

## Step-by-Step Integration

### Step 1: Add Imports to server.js (Top of file, after existing requires)

```javascript
// Add these imports after your existing requires
const { generalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const { authenticateToken, requireAdmin, requireOwner } = require('./middleware/auth');
const {
  sendRequestStatusEmail,
  sendPaymentStatusEmail,
  sendNewRequestNotificationToAdmin
} = require('./utils/emailService');
```

### Step 2: Apply Rate Limiting Middleware (After CORS setup)

```javascript
// Apply general rate limiter to all routes
app.use(generalLimiter);
```

### Step 3: Replace Authentication Routes

**IMPORTANT:** The new authentication routes in `routes/auth.js` should REPLACE your existing:
- `/api/main/register`
- `/api/main/login`
- `/api/main/forgot-password`
- `/api/user/register`
- `/api/user/login`
- `/api/user/forgot-password`
- `/api/processor/login`
- `/api/processor/forgot-password`

**To integrate:**

Option A - Use the auth routes file:
```javascript
// After app initialization and middleware setup
const authRoutes = require('./routes/auth');
authRoutes(app, supabase);
```

Option B - Copy the route handlers from `routes/auth.js` directly into server.js, replacing the existing ones.

### Step 4: Add Email Notifications to Request Status Updates

Find your existing `/api/request/update-status/:requestId` endpoint and add email notification:

```javascript
// After successfully updating request status, add:

// Get owner email to send notification
const { data: ownerData } = await supabase
  .from('Owners')
  .select('email, fullname')
  .eq('owner_id', requestData.owner_id)
  .single();

if (ownerData) {
  await sendRequestStatusEmail(
    ownerData.email,
    ownerData.fullname,
    requestData.tracking_code,
    requestData.category_name,
    previousStatus,
    newStatus,
    remarks
  );
}
```

### Step 5: Add Email Notifications to Payment Verification

Find your `/api/payment/verify/:paymentId` endpoint and add:

```javascript
// After payment verification, add:

const { data: requestData } = await supabase
  .from('Requests')
  .select('*, Owners!inner(email, fullname), Document Categories!inner(category_name)')
  .eq('request_id', payment.request_id)
  .single();

if (requestData) {
  await sendPaymentStatusEmail(
    requestData.Owners.email,
    requestData.Owners.fullname,
    requestData.tracking_code,
    payment.reference_number,
    newStatus,
    remarks
  );
}
```

### Step 6: Add Email Notification When Owner Submits Request

Find your `/api/request/add` endpoint and add after successful request creation:

```javascript
// After creating the request and notification, add:

// Get all superadmins
const { data: admins } = await supabase
  .from('Admins')
  .select('email, fullname')
  .eq('role', 'Superadmin')
  .eq('status', 'Active');

// Send email to all superadmins
if (admins && admins.length > 0) {
  const ownerName = localStorage.getItem('owner') ? JSON.parse(localStorage.getItem('owner')).fullname : 'Owner';

  for (const admin of admins) {
    await sendNewRequestNotificationToAdmin(
      admin.email,
      admin.fullname,
      trackingCode,
      categoryName,
      ownerName
    );
  }
}
```

### Step 7: Protect Routes with JWT Authentication (Optional but Recommended)

To protect specific routes, add the `authenticateToken` middleware:

```javascript
// Example: Protect admin routes
app.get("/api/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  // Your existing code
});

// Example: Protect owner routes
app.get("/api/request/owner/:ownerId", authenticateToken, requireOwner, async (req, res) => {
  // Your existing code
});
```

### Step 8: Apply Upload Rate Limiting

Find file upload endpoints and add `uploadLimiter`:

```javascript
// Example
app.post("/api/document/add", uploadLimiter, upload.single("document"), async (req, res) => {
  // Your existing code
});
```

## Frontend Integration

### Step 1: Update all components to use centralized API config

Replace all instances of:
```javascript
const API_URL = "https://oabs-f7by.onrender.com";
```

With:
```javascript
import { API_URL } from '../config/api';
```

### Step 2: Update Login Components to Handle JWT Tokens

In login handlers, save the tokens:

```javascript
import { setAuthToken } from '../config/api';

// After successful login
if (response.data.success) {
  setAuthToken(response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  // ... rest of your code
}
```

### Step 3: Add Authorization Headers to API Requests

```javascript
import { API_URL, getAuthHeaders } from '../config/api';
import axios from 'axios';

// Add headers to requests
const response = await axios.get(`${API_URL}/api/protected-route`, {
  headers: getAuthHeaders()
});
```

### Step 4: Create Email Verification Page

Create new components for:
- Email verification page (`/verify-email`)
- Password reset page (`/reset-password`)

See `frontend/components/EmailVerification.js` (to be created)

## Testing

### 1. Test Email Configuration

```bash
cd backend
node -e "require('./utils/emailService').sendVerificationEmail('test@example.com', 'Test User', 'test-token', 'Owner')"
```

### 2. Test Rate Limiting

Make multiple rapid requests to login endpoint and verify rate limiting works.

### 3. Test JWT Authentication

1. Register a new account
2. Verify email using the link
3. Login and check that JWT token is returned
4. Use the token in Authorization header for protected routes

### 4. Test Password Reset

1. Request password reset
2. Check email for reset link
3. Use the link to reset password
4. Login with new password

## Important Notes

1. **Email Configuration**: Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env` with valid credentials
   - For Gmail, use App-Specific Password (not your regular password)
   - Enable "Less secure app access" or use OAuth2

2. **JWT Secrets**: In production, use strong, random secrets (at least 32 characters)
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **Frontend URL**: Update `FRONTEND_URL` in backend `.env` to match your deployed frontend

4. **Rate Limiting**: Adjust rate limit values in `.env` based on your needs

5. **Token Expiration**: Access tokens expire in 24h, refresh tokens in 7d (configurable)

## Troubleshooting

### Email not sending:
- Check EMAIL_* environment variables
- Verify SMTP credentials
- Check firewall/network settings
- Look at backend console for error messages

### JWT authentication failing:
- Ensure JWT_SECRET matches on all servers
- Check token format (should be "Bearer <token>")
- Verify token hasn't expired

### Rate limiting too strict:
- Adjust RATE_LIMIT_MAX_REQUESTS in `.env`
- Increase RATE_LIMIT_WINDOW_MS for longer windows

## Next Steps

After integration:
1. ✅ Run database migration
2. ✅ Test authentication flow
3. ✅ Test email notifications
4. ✅ Update all frontend components to use centralized config
5. ✅ Test rate limiting
6. ✅ Deploy and monitor
