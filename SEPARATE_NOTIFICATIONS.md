# Separate Notifications for User and Admin

## Problem Solved

Previously, when a request status changed or payment was updated, only the **User** received a notification. Now, **both the User and the Admin/Processor** receive separate, independent notifications that they can mark as read individually.

## What Changed

### Before:
- ❌ Only User gets notified about request/payment updates
- ❌ Admin has no notification when user submits payment proof
- ❌ No visibility for admins on new activities

### After:
- ✅ **User gets a notification** about their request/payment
- ✅ **Admin gets a separate notification** about the same event
- ✅ Each can **mark their own notification as read independently**
- ✅ Marking as read in User side does NOT affect Admin's notification
- ✅ Marking as read in Admin side does NOT affect User's notification

## How It Works

### Separate Notifications Created

When an event happens (e.g., request status changes), **TWO notifications** are created:

1. **Notification for User** (owner_id = User's ID, admin_id = NULL)
2. **Notification for Admin** (admin_id = Admin's ID, owner_id = NULL)

### Example Scenario

**User submits a document request:**
- Status changes to "Pending"
- Notification 1 created for **User**: "Your request has been received and is pending review."
- Notification 2 created for **Admin/Processor**: "Request ABC123 has been submitted and is awaiting review."

**Admin updates status to "Processing":**
- Status changes to "Processing"
- Notification 3 created for **User**: "Your request is now being processed by our team."
- Notification 4 created for **Admin/Processor**: "You are now processing request ABC123."

**User marks notification 1 as read:**
- Only notification 1's `read_at` is updated
- Notification 2 for Admin remains unread
- Admin still sees their notification in the bell dropdown

## Notification Messages

### Request Status Notifications

| Status | User Message | Admin Message |
|--------|--------------|---------------|
| Pending | "Your request has been received and is pending review." | "Request {CODE} has been submitted and is awaiting review." |
| Processing | "Your request is now being processed by our team." | "You are now processing request {CODE}." |
| Approved | "Congratulations! Your request has been approved." | "You have approved request {CODE}." |
| Rejected | "Your request has been rejected. Please check the remarks for details." | "You have rejected request {CODE}." |
| Released | "Your document is ready! You can now download it from the Downloadables section." | "Request {CODE} has been released to the user." |
| Cancelled | "Your request has been cancelled." | "Request {CODE} has been cancelled." |

### Payment Status Notifications

| Status | User Message | Admin Message |
|--------|--------------|---------------|
| Pending | "A payment of ₱{AMOUNT} is required for request {CODE}." | "Payment of ₱{AMOUNT} is pending for request {CODE}." |
| Submitted | "Your payment proof for request {CODE} has been received and is under review." | "New payment proof submitted for request {CODE}. Please review." |
| Verified | "Your payment of ₱{AMOUNT} for request {CODE} has been verified." | "You have verified payment of ₱{AMOUNT} for request {CODE}." |
| Rejected | "Your payment proof for request {CODE} was rejected. Please resubmit." | "You have rejected payment proof for request {CODE}." |

## Database Structure

Each notification in the `Notifications` table has:

```sql
-- For User notifications
{
  notification_id: 1,
  owner_id: 5,        -- User's ID
  admin_id: NULL,
  subject: "Request ABC123 - Status Update",
  message: "Your request has been received...",
  read_at: NULL,      -- Unread
  ...
}

-- For Admin notifications (separate record)
{
  notification_id: 2,
  owner_id: NULL,
  admin_id: 3,        -- Admin's ID
  subject: "Request ABC123 - Status Update",
  message: "Request ABC123 has been submitted...",
  read_at: NULL,      -- Unread
  ...
}
```

## Independent Read Status

### When User marks as read:
```sql
UPDATE Notifications
SET read_at = NOW()
WHERE notification_id = 1 AND owner_id = 5;
```
✅ Only affects notification #1
❌ Does NOT affect notification #2 (Admin's notification)

### When Admin marks as read:
```sql
UPDATE Notifications
SET read_at = NOW()
WHERE notification_id = 2 AND admin_id = 3;
```
✅ Only affects notification #2
❌ Does NOT affect notification #1 (User's notification)

## Code Changes

### Updated Functions

**1. `notifyRequestStatusChange(requestId, ownerId, trackingCode, oldStatus, newStatus, processedBy)`**
- Now accepts `processedBy` parameter (Admin ID)
- Creates TWO notifications:
  - One for the User (owner)
  - One for the Admin (processor) if `processedBy` is provided

**2. `notifyPaymentStatusChange(paymentId, ownerId, requestId, trackingCode, status, amount, verifiedBy)`**
- Now accepts `verifiedBy` parameter (Admin ID)
- Creates TWO notifications:
  - One for the User (owner)
  - One for the Admin (verifier) if `verifiedBy` is provided

### Updated API Calls

**When request status is updated:**
```javascript
await notifyRequestStatusChange(
  requestId,
  currentRequest.owner_id,
  currentRequest.tracking_code,
  currentRequest.status,
  status,
  processedBy  // ← NEW: Admin who processed the request
);
```

**When payment is verified:**
```javascript
await notifyPaymentStatusChange(
  paymentId,
  requestData.owner_id,
  data[0].request_id,
  requestData.tracking_code,
  status,
  data[0].amount,
  verifiedBy  // ← NEW: Admin who verified the payment
);
```

**When payment proof is submitted:**
```javascript
await notifyPaymentStatusChange(
  paymentId,
  requestData.owner_id,
  payment.request_id,
  requestData.tracking_code,
  "Submitted",
  payment.amount,
  requestData.processed_by  // ← NEW: Admin assigned to the request
);
```

## Backend Console Output

When notifications are created, you'll see:

```
✅ Notification created: 123 for User 5
✅ Notification created: 124 for Admin 3
```

This confirms that TWO separate notifications were created.

## Testing

### Test 1: Request Status Change
1. **Login as User** and create a request
2. **Logout** and **login as Admin**
3. **Update request status** to "Processing"
4. **Check Admin's notification bell** - should show 1 unread notification
5. **Logout** and **login as User again**
6. **Check User's notification bell** - should show 1 unread notification
7. **Click User's notification** to mark as read
8. **Logout** and **login as Admin**
9. **Check Admin's notification** - should still be unread (not affected by User marking theirs as read)

### Test 2: Payment Verification
1. **Login as User** and submit payment proof
2. **Check User's notification** - should say "Your payment proof has been received and is under review"
3. **Logout** and **login as Admin**
4. **Check Admin's notification** - should say "New payment proof submitted. Please review."
5. **Verify the payment**
6. **Check Admin's notification** - new notification says "You have verified payment"
7. **Logout** and **login as User**
8. **Check User's notification** - new notification says "Your payment has been verified"

## Benefits

✅ **Independent tracking** - Each user manages their own read/unread status
✅ **Better visibility** - Admins are notified of new activities
✅ **Better UX** - Users see user-friendly messages, Admins see admin-specific messages
✅ **No interference** - Marking as read on one side doesn't affect the other
✅ **Audit trail** - Each notification is separate in database
✅ **Scalable** - Works for multiple admins and users without conflicts

## Troubleshooting

### Admin not receiving notifications
**Check:** Is `processed_by` field set when updating request status?
**Solution:** Ensure the request has an assigned processor

### Notifications appearing for both users when marking as read
**Check:** Did you run the database migration?
**Solution:** Run `migrate_notifications.sql` to add `admin_id` and `owner_id` columns

### Getting "column admin_id does not exist" error
**Solution:** Run the database migration in Supabase SQL Editor

## Summary

Now the notification system creates **separate, independent notifications** for Users and Admins. Each can mark their own notifications as read without affecting the other person's notifications. This provides better visibility and a cleaner user experience for everyone.
