# Notification System Debugging Guide

## Problem: Notifications not appearing for users or admins

This guide will help you identify and fix why notifications aren't working.

## Quick Diagnosis Steps

### Step 1: Run the Test Script

```bash
cd backend
node test_notifications.js
```

This will:
- ✅ Verify the Notifications table exists
- ✅ Create test notifications
- ✅ Test API endpoints
- ✅ Show you exactly what data should appear

### Step 2: Check Browser Console

1. **Login to the app**
2. **Open browser console** (F12 or Right-click → Inspect → Console)
3. **Look for errors** when the page loads

**Common errors to look for:**
```
❌ Error fetching unread count: Network Error
❌ Error fetching notifications: 404 Not Found
❌ Cannot read property 'owner_id' of undefined
❌ userType is undefined
```

### Step 3: Check localStorage

In browser console, run:
```javascript
console.log('userType:', localStorage.getItem('userType'));
console.log('user:', JSON.parse(localStorage.getItem('user') || '{}'));
console.log('main:', JSON.parse(localStorage.getItem('main') || '{}'));
```

**Expected output for User:**
```javascript
userType: "User"
user: { owner_id: 1, username: "john", email: "john@example.com", ... }
```

**Expected output for Admin:**
```javascript
userType: "Admin"
main: { admin_id: 1, username: "admin", email: "admin@example.com", ... }
```

**If userType is null or undefined:**
- You need to logout and login again
- Check that login pages set `localStorage.setItem('userType', 'User')` or `'Admin'`

### Step 4: Test API Endpoints Manually

**Get your user ID from Step 3**, then test these URLs in your browser:

**For Users:**
```
https://oabs-f7by.onrender.com/api/notifications/User/YOUR_OWNER_ID/unread-count
https://oabs-f7by.onrender.com/api/notifications/User/YOUR_OWNER_ID
```

**For Admins:**
```
https://oabs-f7by.onrender.com/api/notifications/Admin/YOUR_ADMIN_ID/unread-count
https://oabs-f7by.onrender.com/api/notifications/Admin/YOUR_ADMIN_ID
```

**Expected response:**
```json
{
  "success": true,
  "count": 5
}
```

**If you get 500 error:**
- Check backend console logs
- Notifications table might not exist
- Database connection issue

**If you get empty results (count: 0):**
- No notifications exist yet
- Create a test request and update its status

### Step 5: Verify Notifications Table

In **Supabase SQL Editor**, run:

```sql
-- Check if table exists
SELECT * FROM "Notifications" LIMIT 5;

-- Check schema
\d "Notifications"

-- Count notifications by user
SELECT user_type, user_id, COUNT(*) as count
FROM "Notifications"
GROUP BY user_type, user_id;
```

**If table doesn't exist**, create it:

```sql
CREATE TABLE IF NOT EXISTS public."Notifications" (
  notification_id SERIAL PRIMARY KEY,
  user_type VARCHAR,
  user_id INTEGER,
  type VARCHAR,
  template VARCHAR,
  subject VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'Pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  request_id INTEGER,
  payment_id INTEGER
);

CREATE INDEX idx_notifications_user ON "Notifications"(user_type, user_id);
CREATE INDEX idx_notifications_status ON "Notifications"(status);
CREATE INDEX idx_notifications_created_at ON "Notifications"(created_at DESC);
```

## Common Issues & Solutions

### Issue 1: NotificationBell Not Visible

**Symptoms:**
- Bell icon doesn't appear in navbar

**Check:**
1. Inspect element on navbar
2. Look for `<div class="notification-bell">`

**Solution:**
- Verify NotificationBell is imported in sidebar files
- Check that sidebars include `<NotificationBell />` component

**Files to check:**
- `frontend/src/includes/UserSideBar.js` (line 248)
- `frontend/src/includes/MainSideBar.js` (line 301)
- `frontend/src/includes/ProcessorSideBar.js`

### Issue 2: Unread Count Always 0

**Symptoms:**
- Bell icon appears but badge never shows

**Possible causes:**
1. **No notifications in database**
   - Solution: Create a test request and update its status

2. **API returns 0**
   - Test URL manually (see Step 4)
   - Check if `user_id` and `userType` match database

3. **Polling not working**
   - Check browser console for network errors
   - Verify API_URL is correct in NotificationBell.js

### Issue 3: Notifications Not Being Created

**Symptoms:**
- Update request status but no notification appears

**Check backend logs** when updating request:
```bash
cd backend
node server.js
```

When you update a request status, you should see:
```
Notification created: { notification_id: 123, user_id: 1, ... }
```

**If you don't see this:**

1. Check that `notifyRequestStatusChange()` is called:
   - File: `backend/server.js`
   - Line: ~2947
   - In: `PUT /api/request/update-status/:requestId`

2. Check the function exists:
   - File: `backend/server.js`
   - Lines: 63-84

3. Add console.log to debug:
```javascript
async function notifyRequestStatusChange(requestId, ownerId, trackingCode, oldStatus, newStatus) {
  console.log('🔔 Creating notification for:', { requestId, ownerId, trackingCode, newStatus });

  // ... rest of function

  const result = await createNotification(...);
  console.log('📬 Notification result:', result);
}
```

### Issue 4: Wrong User Type

**Symptoms:**
- Logged in as User but getting Admin notifications (or vice versa)

**Solution:**
1. Logout completely
2. Clear all localStorage:
```javascript
localStorage.clear();
```
3. Login again
4. Verify `localStorage.getItem('userType')` is correct

### Issue 5: CORS or Network Errors

**Symptoms:**
```
Access to XMLHttpRequest at 'https://oabs-f7by.onrender.com/api/notifications/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
Check `backend/server.js` has CORS enabled:
```javascript
const cors = require('cors');
app.use(cors({
  origin: '*', // or specific origins
  credentials: true
}));
```

## Manual Test Procedure

### Test Creating Notifications

1. **Login as a user**
2. **Create a new request**
3. **Logout**
4. **Login as admin**
5. **Go to Requests page**
6. **Update the request status to "Processing"**
7. **Logout**
8. **Login as the user again**
9. **Check the notification bell**

You should see:
- Bell icon with red badge showing "1"
- Clicking bell shows: "Request [CODE] - Status Update"
- Message: "Your request is now being processed by our team."

## Checklist for Verification

- [ ] Notifications table exists in Supabase
- [ ] Backend server is running without errors
- [ ] Frontend can connect to backend API
- [ ] User has `userType` in localStorage
- [ ] User has `owner_id` or `admin_id` in localStorage
- [ ] API endpoint returns notifications when called directly
- [ ] NotificationBell component is imported in sidebars
- [ ] No CORS errors in browser console
- [ ] Notification creation functions are called when status changes
- [ ] Test script runs successfully

## Still Not Working?

If you've checked everything above and it still doesn't work:

1. **Share backend console output** when updating a request
2. **Share browser console errors** (copy all red errors)
3. **Share result of test script** (`node test_notifications.js`)
4. **Share screenshot** of Supabase Notifications table
5. **Share localStorage values** (copy output from Step 3)

## Quick Fix: Force Create Notification

If you just want to see if the UI works, manually insert a notification in Supabase SQL Editor:

```sql
-- Replace USER_ID with your actual owner_id
INSERT INTO "Notifications" (user_type, user_id, type, subject, message, status)
VALUES (
  'User',
  1,  -- YOUR owner_id HERE
  'Test',
  'Test Notification',
  'This is a manual test notification. If you see this, the UI is working!',
  'Pending'
);
```

Then reload the page and check the bell icon.

## Contact Information

After running through this guide, you should know exactly where the problem is. Common fixes:
- 90% of cases: Table doesn't exist or userType not set
- 5% of cases: Backend not calling notification functions
- 5% of cases: API URL mismatch or network issues
