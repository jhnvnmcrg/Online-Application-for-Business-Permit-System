# JWT Authentication & Notifications System - Implementation Guide

## Overview

This system now includes:
- **JWT Authentication**: Secure token-based authentication with 24-hour expiry
- **Notification System**: Real-time notifications for request and payment status changes
- **Protected API Routes**: Middleware to secure sensitive endpoints

---

## 1. BACKEND CHANGES

### Environment Variables

Add to `backend/.env`:
```
JWT_SECRET=oabps_jwt_secret_key_2025_change_this_in_production
```

**IMPORTANT**: Change the JWT_SECRET to a strong random string in production!

### JWT Authentication

All login endpoints now return a JWT token:

**Main Admin Login:**
```javascript
POST /api/main/login
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { admin_id, fullname, email, username, role }
}
```

**User Login:**
```javascript
POST /api/user/login
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { owner_id, fullname, email, username }
}
```

**Processor Login:**
```javascript
POST /api/processor/login
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { admin_id, fullname, email, username, role }
}
```

### Protected Endpoints

All notification endpoints require authentication:
```
GET    /api/notifications/:userType/:userId
GET    /api/notifications/:userType/:userId/unread-count
PUT    /api/notifications/:notificationId/read
PUT    /api/notifications/:userType/:userId/read-all
DELETE /api/notifications/:notificationId
```

**Headers Required:**
```
Authorization: Bearer <token>
```

### Automatic Notifications

Notifications are automatically sent when:

1. **Request Status Changes**: Pending → Processing → Approved → Released
2. **Payment Created**: Admin adds payment requirement
3. **Payment Proof Submitted**: User uploads payment proof
4. **Payment Verified/Rejected**: Admin verifies or rejects payment

---

## 2. FRONTEND IMPLEMENTATION

### Step 1: Update Login Components

**After successful login, store token and user info:**

```javascript
// Example: UserLogin.js
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post('http://localhost:3000/api/user/login', {
      username: username,
      password: password
    });

    if (response.data.success) {
      // Store token
      localStorage.setItem('token', response.data.token);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Store user type for notification system
      localStorage.setItem('userType', 'User'); // or 'Admin' or 'Processor'

      // Redirect to dashboard
      window.location.href = '/oabps/user/dashboard';
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed');
  }
};
```

### Step 2: Add Notification Bell to Sidebars

**For User Sidebar** - Update `frontend/src/includes/UserSideBar.js`:

```javascript
import NotificationBell from './NotificationBell';

function UserSideBar({ children }) {
  return (
    <div>
      {/* Add to header/top bar */}
      <div className="top-bar d-flex justify-content-between align-items-center p-3">
        <h5>User Dashboard</h5>
        <NotificationBell />
      </div>

      {/* Rest of sidebar */}
      {children}
    </div>
  );
}
```

**For Main Admin Sidebar** - Update `frontend/src/includes/MainSideBar.js`:

```javascript
import NotificationBell from './NotificationBell';

function MainSideBar({ children }) {
  // Add NotificationBell to the top bar
  return (
    <div>
      <div className="top-bar">
        <NotificationBell />
      </div>
      {/* Rest of sidebar */}
    </div>
  );
}
```

**For Processor Sidebar** - Update `frontend/src/includes/ProcessorSideBar.js`:

```javascript
import NotificationBell from './NotificationBell';

function ProcessorSideBar({ children }) {
  // Add NotificationBell to the top bar
  return (
    <div>
      <div className="top-bar">
        <NotificationBell />
      </div>
      {/* Rest of sidebar */}
    </div>
  );
}
```

### Step 3: Update API Calls to Include JWT Token

**Create axios instance with auth headers:**

```javascript
// Create file: frontend/src/config/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      window.location.href = '/oabps/user/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Use in components:**

```javascript
// Instead of axios, import api
import api from '../config/api';

// Example: Fetch requests
const fetchRequests = async () => {
  try {
    const response = await api.get(`/api/request/owner/${ownerId}`);
    // Token is automatically included
  } catch (error) {
    console.error('Error:', error);
  }
};

// Example: Submit payment proof
const submitPayment = async (paymentId, formData) => {
  try {
    const response = await api.put(
      `/api/payment/submit-proof/${paymentId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Step 4: Update Logout Functionality

```javascript
const handleLogout = () => {
  // Clear all stored data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');

  // Redirect to login
  window.location.href = '/oabps/user/login';
};
```

---

## 3. NOTIFICATION FEATURES

### Notification Bell Component

The `NotificationBell` component provides:

- **Real-time unread count** (polls every 30 seconds)
- **Dropdown with recent notifications** (last 10)
- **Mark as read** (click on notification)
- **Mark all as read** (button in header)
- **Delete notification** (X button)
- **Time formatting** (Just now, 5m ago, 2h ago, etc.)

### Notification Structure

```javascript
{
  notification_id: 1,
  user_type: "User",
  user_id: 123,
  type: "InApp",
  subject: "Request OABP-2025-00001 - Status Update",
  message: "Your request is now being processed by our team.",
  request_id: 1,
  payment_id: null,
  status: "Pending",
  read_at: null,
  created_at: "2025-10-18T10:30:00Z"
}
```

### Notification Types

Notifications are automatically created for:

1. **Request Status Changes:**
   - Pending: "Your request has been received and is pending review."
   - Processing: "Your request is now being processed by our team."
   - Approved: "Congratulations! Your request has been approved."
   - Rejected: "Your request has been rejected. Please check the remarks for details."
   - Released: "Your document is ready! You can now download it from the Downloadables section."
   - Cancelled: "Your request has been cancelled."

2. **Payment Status Changes:**
   - Pending: "A payment of ₱500.00 is required for request OABP-2025-00001."
   - Submitted: "Your payment proof for request OABP-2025-00001 has been received and is under review."
   - Verified: "Your payment of ₱500.00 for request OABP-2025-00001 has been verified."
   - Rejected: "Your payment proof for request OABP-2025-00001 was rejected. Please resubmit."

---

## 4. TESTING THE SYSTEM

### Test JWT Authentication

1. **Test Login:**
   ```bash
   curl -X POST http://localhost:3000/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```

2. **Test Protected Endpoint:**
   ```bash
   curl -X GET http://localhost:3000/api/notifications/User/1/unread-count \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Test Invalid Token:**
   ```bash
   curl -X GET http://localhost:3000/api/notifications/User/1/unread-count \
     -H "Authorization: Bearer invalid_token"
   ```
   Should return 403 error.

### Test Notifications

1. **Create a test request** (as user)
2. **Update request status** (as admin) - Check if notification appears
3. **Add payment requirement** (as admin) - Check if notification appears
4. **Submit payment proof** (as user) - Check if notification appears
5. **Verify payment** (as admin) - Check if notification appears

---

## 5. SECURITY BEST PRACTICES

### For Production:

1. **Change JWT_SECRET** in `.env` to a strong random string:
   ```bash
   # Generate strong secret (Linux/Mac)
   openssl rand -base64 64
   ```

2. **Use HTTPS** in production - never send tokens over HTTP

3. **Set shorter token expiry** for sensitive operations:
   ```javascript
   // In server.js, change from 24h to shorter period
   expiresIn: '2h'  // or '1h' for higher security
   ```

4. **Implement refresh tokens** for better UX (optional enhancement)

5. **Add rate limiting** to prevent brute force attacks:
   ```bash
   npm install express-rate-limit
   ```

6. **Validate all inputs** on backend before processing

7. **Never log tokens** in production

---

## 6. TROUBLESHOOTING

### Token Issues

**Error: "Access denied. No token provided"**
- Check if token is stored in localStorage
- Check if Authorization header is being sent
- Check network tab in browser DevTools

**Error: "Invalid or expired token"**
- Token may have expired (24h)
- User needs to login again
- Check if JWT_SECRET is the same on server

### Notification Issues

**Notifications not appearing:**
- Check if user is logged in with valid token
- Check browser console for errors
- Check if notification endpoints are being called
- Verify database has Notifications table

**Unread count not updating:**
- Check if polling is working (every 30 seconds)
- Check network tab for API calls
- Verify token is valid

---

## 7. API REFERENCE

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/main/login | Main admin login | No |
| POST | /api/user/login | User login | No |
| POST | /api/processor/login | Processor login | No |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/notifications/:userType/:userId | Get notifications | Yes |
| GET | /api/notifications/:userType/:userId/unread-count | Get unread count | Yes |
| PUT | /api/notifications/:notificationId/read | Mark as read | Yes |
| PUT | /api/notifications/:userType/:userId/read-all | Mark all as read | Yes |
| DELETE | /api/notifications/:notificationId | Delete notification | Yes |

---

## 8. NEXT STEPS

Consider implementing:

1. **Email Notifications** - Send emails for important updates
2. **SMS Notifications** - Critical alerts via SMS
3. **Push Notifications** - Browser push notifications
4. **Notification Preferences** - Let users choose what to be notified about
5. **Email Verification** - Verify user emails on registration
6. **Password Reset** - Secure password reset with JWT tokens
7. **Refresh Tokens** - Allow seamless token renewal without re-login

---

## Support

For issues or questions:
- Check browser console for errors
- Check backend logs
- Verify environment variables are set
- Test with Postman/curl first
- Review this guide for common solutions
