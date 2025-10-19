# Fix: Notifications Not Appearing

## Problem
After the recent changes, notifications are not appearing in the notification bell dropdown.

## Root Cause
The backend code was updated to use `admin_id` and `owner_id` columns, but the **database migration hasn't been run yet**. The Notifications table still only has `user_type` and `user_id` columns.

When the backend tries to query:
```sql
SELECT * FROM Notifications WHERE owner_id = 5
```

The database returns an error because the `owner_id` column doesn't exist yet.

## Solution: Run the Database Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration

Copy and paste this SQL and click **Run**:

```sql
-- Add admin_id and owner_id columns
ALTER TABLE public."Notifications"
ADD COLUMN IF NOT EXISTS admin_id BIGINT,
ADD COLUMN IF NOT EXISTS owner_id BIGINT;

-- Migrate existing data from user_id to appropriate column
UPDATE public."Notifications"
SET admin_id = user_id
WHERE user_type = 'Admin' AND admin_id IS NULL;

UPDATE public."Notifications"
SET owner_id = user_id
WHERE user_type = 'User' AND owner_id IS NULL;

-- Add foreign key constraints
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_admin_id_fkey"
  FOREIGN KEY (admin_id) REFERENCES public."Admins"(admin_id) ON DELETE CASCADE;

ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_owner_id_fkey"
  FOREIGN KEY (owner_id) REFERENCES public."Owners"(owner_id) ON DELETE CASCADE;

-- Add CHECK constraint
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_user_check"
  CHECK (
    (admin_id IS NOT NULL AND owner_id IS NULL) OR
    (admin_id IS NULL AND owner_id IS NOT NULL)
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public."Notifications"(admin_id) WHERE admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON public."Notifications"(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public."Notifications"(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public."Notifications"(created_at DESC);

-- Verify migration
SELECT
  COUNT(*) as total_notifications,
  COUNT(admin_id) as admin_notifications,
  COUNT(owner_id) as owner_notifications
FROM public."Notifications";
```

### Step 3: Restart Backend Server

```bash
cd backend
# Stop the server (Ctrl+C if running)
node server.js
```

### Step 4: Test Notifications

1. **Open your browser and login as a User**
2. **Open browser console** (F12)
3. **Click the notification bell**

You should see console logs like:
```
🔔 Fetching notifications for: {userType: "User", userId: 5}
✅ Notifications response: {success: true, notifications: [...]}
📬 Loaded 3 notifications
```

## Debugging Steps

### Check 1: Verify Migration Ran Successfully

In Supabase SQL Editor, run:
```sql
-- Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Notifications'
  AND column_name IN ('admin_id', 'owner_id');
```

**Expected result:** Should show 2 rows with admin_id and owner_id

### Check 2: Check Browser Console

1. Login to your app
2. Press **F12** to open developer tools
3. Click on **Console** tab
4. Click the notification bell icon

**Look for:**
- ✅ `🔔 Fetching notifications for: ...` - Shows it's trying to fetch
- ✅ `✅ Notifications response: ...` - Shows API returned data
- ✅ `📬 Loaded X notifications` - Shows how many loaded

**Errors to watch for:**
- ❌ `Error fetching notifications` - API call failed
- ❌ `column "owner_id" does not exist` - Migration not run
- ❌ `User info not found` - localStorage issue

### Check 3: Verify localStorage

In browser console, run:
```javascript
console.log('userType:', localStorage.getItem('userType'));
console.log('user:', JSON.parse(localStorage.getItem('user') || '{}'));
```

**Expected for User:**
```javascript
userType: "User"
user: {owner_id: 5, username: "john", email: "john@example.com", ...}
```

**Expected for Admin:**
```javascript
userType: "Admin"
main: {admin_id: 1, username: "admin", email: "admin@example.com", ...}
```

**If userType is null:** Logout and login again

### Check 4: Test API Directly

Replace `USER_ID` with your actual owner_id or admin_id:

**For Users:**
```
https://oabs-f7by.onrender.com/api/notifications/User/USER_ID/unread-count
```

**For Admins:**
```
https://oabs-f7by.onrender.com/api/notifications/Admin/ADMIN_ID/unread-count
```

Open this URL in your browser. **Expected response:**
```json
{
  "success": true,
  "count": 2
}
```

**If you get error 500:** The database columns don't exist - run the migration

### Check 5: Create a Test Notification

In Supabase SQL Editor, manually create a notification:

```sql
-- Get your owner_id first
SELECT owner_id, username FROM "Owners" LIMIT 1;

-- Create test notification (replace 1 with your actual owner_id)
INSERT INTO "Notifications" (owner_id, admin_id, type, subject, message, status)
VALUES (
  1,  -- YOUR owner_id HERE
  NULL,
  'Test',
  'Test Notification',
  'This is a test notification to verify the system works!',
  'Pending'
);
```

Then reload your app and check if the bell shows a badge.

## Common Issues

### Issue: "column owner_id does not exist"
**Solution:** Run the migration SQL script in Step 2

### Issue: Badge shows count but dropdown is empty
**Solution:** The notifications might all be read. In Supabase, check:
```sql
SELECT * FROM "Notifications" WHERE owner_id = YOUR_ID;
```

### Issue: No notifications being created
**Check backend console** when updating request status. You should see:
```
✅ Notification created: 123 for User 5
```

If you don't see this, the notification creation is failing.

### Issue: "Cannot read property 'owner_id' of undefined"
**Solution:** The user object in localStorage is missing. Logout and login again.

## After Migration Works

Once notifications are appearing:

1. **Test creating a request** and updating its status
2. **Verify notification appears** with correct message
3. **Click notification body** - should mark as read (font changes from bold to normal)
4. **Click X button** - should clear notification and remove from list
5. **Notification stays in database** but is marked as read

## Still Not Working?

Run the test script:
```bash
cd backend
node test_notifications.js
```

This will show exactly what's wrong and create test notifications for you.

## Summary

The fix is simple: **Run the database migration** to add the `admin_id` and `owner_id` columns.

After that, notifications will work perfectly with:
- ✅ Proper database relationships
- ✅ Clear function (marks as read, doesn't delete)
- ✅ Unread notifications only shown in dropdown
- ✅ Console logging for easy debugging
