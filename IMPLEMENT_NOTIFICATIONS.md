# Notification System Implementation Guide

## What Changed

I've updated the notification system to use **proper database relationships** with `admin_id` and `owner_id` instead of generic `user_type` and `user_id`.

### Benefits:
✅ **Proper foreign key relationships** - Database knows exactly which user owns each notification
✅ **Better data integrity** - Can't create notifications for non-existent users
✅ **Automatic cleanup** - Notifications are deleted when user is deleted (CASCADE)
✅ **Better performance** - Database indexes make queries faster
✅ **No frontend changes needed** - Your frontend code stays exactly the same!

## Implementation Steps

### Step 1: Run the Database Migration

1. **Open Supabase SQL Editor**
2. **Copy and paste** the entire contents of `backend/migrate_notifications.sql`
3. **Click "Run"**

This will:
- Add `admin_id` and `owner_id` columns
- Migrate any existing data from `user_id` to the appropriate column
- Add foreign key constraints
- Add performance indexes
- Add validation to ensure only one user type is set

### Step 2: Restart Backend Server

The backend code has already been updated. Just restart your server:

```bash
cd backend
node server.js
```

You should see the normal startup message.

### Step 3: Test the Notification System

**Option A: Run the test script**
```bash
cd backend
node test_notifications.js
```

This will automatically:
- Create test notifications
- Verify they're stored correctly
- Test all API endpoints
- Show you exactly what should happen

**Option B: Manual testing**

1. **Login as a User**
2. **Create a document request**
3. **Logout and login as Admin**
4. **Go to Requests page and update the status to "Processing"**
5. **Logout and login as the User again**
6. **Check the notification bell** - you should see a red badge with "1"

### Step 4: Verify Everything Works

**Check backend console** - When a notification is created, you should see:
```
✅ Notification created: 123 for User 5
```

**Check browser console** (F12) - Should see no errors

**Check the bell icon** - Should show unread count badge

**Click the bell** - Should show notifications in dropdown

## What Was Updated

### Backend Files Modified:

1. **[server.js](backend/server.js)** - Lines 34-74
   - `createNotification()` now uses `admin_id` or `owner_id`
   - All notification API endpoints updated to query by the correct column

2. **[test_notifications.js](backend/test_notifications.js)**
   - Updated to use new schema for testing

### Database Migration:

3. **[migrate_notifications.sql](backend/migrate_notifications.sql)** - NEW FILE
   - Adds new columns
   - Migrates existing data
   - Adds constraints and indexes

### Frontend:
- **NO CHANGES NEEDED!** The frontend continues to use the same API endpoints

## Database Schema

### Old Schema (Removed):
```sql
user_type VARCHAR  -- 'Admin' or 'User'
user_id INTEGER    -- Could be admin_id OR owner_id (no foreign key)
```

### New Schema (Current):
```sql
admin_id BIGINT REFERENCES Admins(admin_id) ON DELETE CASCADE
owner_id BIGINT REFERENCES Owners(owner_id) ON DELETE CASCADE
CHECK ((admin_id IS NOT NULL AND owner_id IS NULL) OR
       (admin_id IS NULL AND owner_id IS NOT NULL))
```

## Notification Flow (Updated)

1. **User submits request** → Status: "Pending"
2. **Admin updates status to "Processing"**
3. **Backend calls** `notifyRequestStatusChange(requestId, ownerId, ...)`
4. **Backend calls** `createNotification(ownerId, 'User', ...)`
5. **Notification inserted** with `owner_id = ownerId, admin_id = NULL`
6. **Console logs**: `✅ Notification created: 123 for User 5`
7. **Frontend polls** (every 30 seconds)
8. **API query**: `GET /api/notifications/User/5/unread-count`
9. **Backend translates** to: `SELECT COUNT(*) WHERE owner_id = 5 AND read_at IS NULL`
10. **Badge updates** with count
11. **User clicks bell** → Notifications appear!

## API Endpoints (No Changes for Frontend)

These all work exactly the same from the frontend's perspective:

```javascript
GET  /api/notifications/User/:userId              // Get all notifications
GET  /api/notifications/User/:userId/unread-count // Get unread count
PUT  /api/notifications/:notificationId/read      // Mark as read
PUT  /api/notifications/User/:userId/read-all     // Mark all as read
DELETE /api/notifications/:notificationId         // Delete notification

// For admins, use 'Admin' instead of 'User':
GET  /api/notifications/Admin/:adminId
```

The backend now intelligently translates:
- `userType: 'User'` → query by `owner_id`
- `userType: 'Admin'` → query by `admin_id`

## Troubleshooting

### "Column admin_id does not exist"
**Solution:** You haven't run the migration yet. Run `migrate_notifications.sql` in Supabase.

### "Violates foreign key constraint"
**Solution:** Your `user_id` values in existing notifications don't match real users. Clear the table:
```sql
TRUNCATE TABLE "Notifications" CASCADE;
```

### Still not seeing notifications
1. Check backend console for "✅ Notification created" message
2. Run the test script: `node test_notifications.js`
3. Check browser console for errors (F12)
4. Verify `localStorage.getItem('userType')` is set

## Testing Checklist

After implementation, verify:

- [ ] Migration ran successfully without errors
- [ ] Backend server restarts without errors
- [ ] Test script runs successfully
- [ ] Creating a request and updating its status triggers notification
- [ ] Bell icon shows unread count
- [ ] Clicking bell shows notifications
- [ ] Marking as read removes badge
- [ ] No console errors in browser
- [ ] Backend logs show "✅ Notification created"

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Remove new constraints
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_admin_id_fkey";
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_owner_id_fkey";
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_user_check";

-- Remove new columns
ALTER TABLE "Notifications" DROP COLUMN IF EXISTS admin_id;
ALTER TABLE "Notifications" DROP COLUMN IF EXISTS owner_id;
```

Then restore the old server.js code from git history.

## Summary

This update makes the notification system **production-ready** with:
- Proper database relationships
- Data integrity constraints
- Better performance
- Easier debugging (console logs show what's happening)
- No frontend changes required

Just run the migration and restart the server!
