# Notification System Database Update Guide

## Overview

This guide explains how to update the Notifications table to use proper foreign key relationships instead of generic `user_id` and `user_type` fields.

## Problem with Current Schema

The current Notifications table uses:
```sql
user_type VARCHAR  -- 'Admin' or 'User'
user_id INTEGER    -- Could be admin_id OR owner_id
```

**Issues:**
- No foreign key constraint on `user_id` (can't enforce referential integrity)
- Can't use CASCADE delete behavior
- Harder to write efficient queries
- No database-level validation

## New Schema Design

The updated schema uses specific foreign keys:
```sql
admin_id INTEGER  -- References Admins(admin_id) with FK constraint
owner_id INTEGER  -- References Owners(owner_id) with FK constraint
CHECK (
  (admin_id IS NOT NULL AND owner_id IS NULL) OR
  (admin_id IS NULL AND owner_id IS NOT NULL)
)
```

**Benefits:**
- Proper foreign key relationships
- Automatic CASCADE delete when user is deleted
- Better query performance with indexes
- Database-level data integrity
- Clearer intent in the schema

## Migration Steps

### Step 1: Run the SQL Migration

Execute the SQL script to update the database:

```bash
# Using psql
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f backend/update_notifications_table.sql

# Or run directly in Supabase SQL Editor
# Copy the contents of update_notifications_table.sql and execute
```

The migration script will:
1. Add `admin_id` and `owner_id` columns
2. Migrate existing data from `user_id` to appropriate column
3. Add foreign key constraints
4. Add CHECK constraint to ensure only one is set
5. Create indexes for better performance
6. Optionally drop old `user_id` and `user_type` columns (commented out by default)

### Step 2: Update Backend Code

Replace the notification functions in `backend/server.js`:

1. **Find these functions** (around line 34-110):
   - `createNotification()`
   - `notifyRequestStatusChange()`
   - `notifyPaymentStatusChange()`

2. **Find these endpoints** (around line 750-850):
   - `GET /api/notifications/:userType/:userId`
   - `GET /api/notifications/:userType/:userId/unread-count`
   - `PUT /api/notifications/:notificationId/mark-read`
   - `PUT /api/notifications/:userType/:userId/mark-all-read`
   - `DELETE /api/notifications/:notificationId`

3. **Replace with updated versions** from `backend/updated_notification_functions.js`

**Key Changes in Backend:**
```javascript
// OLD WAY
const notificationData = {
  user_type: userType,
  user_id: userId,
  // ...
};

// NEW WAY
const notificationData = {
  admin_id: userType === 'Admin' ? userId : null,
  owner_id: userType === 'User' ? userId : null,
  // ...
};

// OLD QUERY
query = query
  .eq('user_type', userType)
  .eq('user_id', userId);

// NEW QUERY
if (userType === 'Admin') {
  query = query.eq('admin_id', userId);
} else if (userType === 'User') {
  query = query.eq('owner_id', userId);
}
```

### Step 3: Test the Changes

**Test Notification Creation:**
```bash
# Create a test request status change
# Should create notification with owner_id set
```

**Test Notification Fetching:**
```bash
# User notifications
curl http://localhost:3000/api/notifications/User/1

# Admin notifications
curl http://localhost:3000/api/notifications/Admin/1
```

**Test Unread Count:**
```bash
curl http://localhost:3000/api/notifications/User/1/unread-count
```

**Test Mark as Read:**
```bash
curl -X PUT http://localhost:3000/api/notifications/1/mark-read
```

### Step 4: Frontend Compatibility

**Good News:** The frontend code (NotificationBell.js) does NOT need to be changed!

The API still uses the same endpoints with `userType` and `userId` parameters:
- `GET /api/notifications/User/123`
- `GET /api/notifications/Admin/456`

The backend translates these to the appropriate `admin_id` or `owner_id` queries internally.

## Updated Database Schema Reference

```sql
CREATE TABLE public.Notifications (
  notification_id SERIAL PRIMARY KEY,

  -- User references (one must be set, other must be null)
  admin_id INTEGER REFERENCES public.Admins(admin_id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES public.Owners(owner_id) ON DELETE CASCADE,

  -- Notification details
  type VARCHAR,                    -- 'Request', 'Payment', etc.
  template VARCHAR,
  subject VARCHAR,
  message TEXT,

  -- Status tracking
  status VARCHAR DEFAULT 'Pending', -- 'Pending', 'Read', 'Sent', 'Failed'
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Related entities
  request_id INTEGER REFERENCES public.Requests(request_id),
  payment_id INTEGER REFERENCES public.Payments(payment_id),

  -- Constraints
  CONSTRAINT notifications_user_check CHECK (
    (admin_id IS NOT NULL AND owner_id IS NULL) OR
    (admin_id IS NULL AND owner_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_notifications_admin_id ON Notifications(admin_id);
CREATE INDEX idx_notifications_owner_id ON Notifications(owner_id);
CREATE INDEX idx_notifications_status ON Notifications(status);
CREATE INDEX idx_notifications_created_at ON Notifications(created_at DESC);
CREATE INDEX idx_notifications_request_id ON Notifications(request_id);
CREATE INDEX idx_notifications_payment_id ON Notifications(payment_id);
```

## Rollback Plan

If you need to rollback the changes:

```sql
-- Remove new constraints and indexes
ALTER TABLE public."Notifications"
  DROP CONSTRAINT IF EXISTS "Notifications_admin_id_fkey",
  DROP CONSTRAINT IF EXISTS "Notifications_owner_id_fkey",
  DROP CONSTRAINT IF EXISTS "Notifications_user_check";

DROP INDEX IF EXISTS idx_notifications_admin_id;
DROP INDEX IF EXISTS idx_notifications_owner_id;

-- Remove new columns
ALTER TABLE public."Notifications"
  DROP COLUMN IF EXISTS admin_id,
  DROP COLUMN IF EXISTS owner_id;

-- Restore backend code to previous version
```

## Benefits Summary

✅ **Data Integrity:** Foreign keys ensure notifications always reference valid users
✅ **Automatic Cleanup:** CASCADE delete removes notifications when user is deleted
✅ **Better Performance:** Indexes on admin_id and owner_id speed up queries
✅ **Clearer Schema:** Explicit columns show intent better than generic user_id
✅ **Type Safety:** Database enforces that only one user type is set
✅ **No Frontend Changes:** Existing frontend code continues to work

## Files Included

1. **update_notifications_table.sql** - Database migration script
2. **updated_notification_functions.js** - Updated backend functions
3. **NOTIFICATION_UPDATE_GUIDE.md** - This guide

## Questions or Issues?

If you encounter any issues during migration:
1. Check Supabase logs for foreign key violations
2. Ensure all existing notifications have valid user_id values
3. Verify that admin_id and owner_id are properly set after migration
4. Test all notification endpoints after update
