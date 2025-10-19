# Bidirectional Notification System

## Overview

The notification system now works **bidirectionally** between Users and Main Admins. Each side gets notified when the other takes an action.

## Notification Flow

### 1. Request Flow

#### User Submits Request →  Notify Admin
- **When**: User submits a new document request
- **Who gets notified**: All active Main Admins
- **Message**: "A new request for {Category Name} has been submitted and is awaiting review."
- **Subject**: "New Request - {Tracking Code}"

#### Admin Updates Status → Notify User
- **When**: Admin changes request status (Pending → Processing → Approved → Released)
- **Who gets notified**: The User who submitted the request
- **Messages**:
  - Pending: "Your request has been received and is pending review."
  - Processing: "Your request is now being processed by our team."
  - Approved: "Congratulations! Your request has been approved."
  - Rejected: "Your request has been rejected. Please check the remarks for details."
  - Released: "Your document is ready! You can now download it from the Downloadables section."
  - Cancelled: "Your request has been cancelled."
- **Subject**: "Request {Tracking Code} - Status Update"

### 2. Payment Flow

#### Admin Creates Payment Requirement → Notify User
- **When**: Admin adds a payment requirement to a request
- **Who gets notified**: The User who owns the request
- **Message**: "A payment of ₱{Amount} is required for request {Tracking Code}."
- **Subject**: "Payment Update - {Tracking Code}"

#### User Submits Payment Proof → Notify Admin
- **When**: User uploads payment proof
- **Who gets notified**: All active Main Admins
- **Message**: "New payment proof of ₱{Amount} submitted for {Tracking Code}. Please review."
- **Subject**: "Payment Proof Submitted - {Tracking Code}"

#### Admin Verifies/Rejects Payment → Notify User
- **When**: Admin verifies or rejects payment
- **Who gets notified**: The User who submitted the payment
- **Messages**:
  - Verified: "Your payment of ₱{Amount} for request {Tracking Code} has been verified."
  - Rejected: "Your payment proof for request {Tracking Code} was rejected. Please resubmit."
- **Subject**: "Payment Update - {Tracking Code}"

## Database Structure

Each notification has either `owner_id` OR `admin_id` (not both):

```sql
-- For User notification
{
  notification_id: 1,
  owner_id: 5,        -- User's ID
  admin_id: NULL,
  subject: "Request ABC-2025-00001 - Status Update",
  message: "Your request is now being processed...",
  type: "Request",
  status: "Pending",  -- Unread
  ...
}

-- For Admin notification (separate record)
{
  notification_id: 2,
  owner_id: NULL,
  admin_id: 3,        -- Admin's ID
  subject: "New Request - ABC-2025-00001",
  message: "A new request for Business Permit has been submitted...",
  type: "Request",
  status: "Pending",  -- Unread
  ...
}
```

## Independent Read Status

- **User marks notification as read** → Only affects User's notification
- **Admin marks notification as read** → Only affects Admin's notification
- They are **completely independent**

## Code Implementation

### New Helper Functions

**1. `notifyAdminNewRequest(requestId, trackingCode, categoryName)`**
- Called when user submits a request
- Notifies all active Main Admins

**2. `notifyUserStatusChange(requestId, ownerId, trackingCode, newStatus)`**
- Called when admin updates request status
- Notifies the User who owns the request

**3. `notifyAdminPaymentSubmitted(paymentId, requestId, trackingCode, amount)`**
- Called when user submits payment proof
- Notifies all active Main Admins

**4. `notifyUserPaymentStatus(paymentId, ownerId, requestId, trackingCode, status, amount)`**
- Called when admin verifies payment or creates payment requirement
- Notifies the User who owns the payment

### Where Notifications Are Triggered

**File: backend/server.js**

1. **User submits request** (Line ~2673)
```javascript
await notifyAdminNewRequest(requestId, trackingCode, categoryData.category_name);
```

2. **Admin updates request status** (Line ~3028)
```javascript
await notifyUserStatusChange(requestId, currentRequest.owner_id, currentRequest.tracking_code, status);
```

3. **Admin creates payment requirement** (Line ~3450)
```javascript
await notifyUserPaymentStatus(paymentId, requestData.owner_id, requestId, requestData.tracking_code, "Pending", amount);
```

4. **User submits payment proof** (Line ~3663)
```javascript
await notifyAdminPaymentSubmitted(paymentId, payment.request_id, requestData.tracking_code, payment.amount);
```

5. **Admin verifies/rejects payment** (Line ~3742)
```javascript
await notifyUserPaymentStatus(paymentId, requestData.owner_id, requestId, requestData.tracking_code, status, amount);
```

## Example Scenario

### Complete Request-to-Release Flow

1. **User submits Business Permit request**
   - ✅ User: No notification (they just submitted it)
   - ✅ Admin: "A new request for Business Permit has been submitted and is awaiting review."

2. **Admin updates status to "Processing"**
   - ✅ User: "Your request is now being processed by our team."
   - ✅ Admin: No new notification (they just updated it)

3. **Admin creates payment requirement (₱5,000)**
   - ✅ User: "A payment of ₱5,000.00 is required for request ABC-2025-00001."
   - ✅ Admin: No new notification (they just created it)

4. **User uploads payment proof**
   - ✅ User: No notification (they just uploaded it)
   - ✅ Admin: "New payment proof of ₱5,000.00 submitted for ABC-2025-00001. Please review."

5. **Admin verifies payment**
   - ✅ User: "Your payment of ₱5,000.00 for request ABC-2025-00001 has been verified."
   - ✅ Admin: No new notification (they just verified it)

6. **Admin updates status to "Approved"**
   - ✅ User: "Congratulations! Your request has been approved."
   - ✅ Admin: No new notification

7. **Admin updates status to "Released"**
   - ✅ User: "Your document is ready! You can now download it from the Downloadables section."
   - ✅ Admin: No new notification

## Testing

### Test 1: Request Submission
1. Login as User
2. Submit a new request
3. Logout and login as Main Admin
4. Check notification bell - should show "A new request for {Category} has been submitted..."

### Test 2: Status Update
1. Login as Main Admin
2. Update a request status to "Processing"
3. Logout and login as User
4. Check notification bell - should show "Your request is now being processed..."

### Test 3: Payment Submission
1. Login as User
2. Upload payment proof
3. Logout and login as Main Admin
4. Check notification bell - should show "New payment proof submitted..."

### Test 4: Payment Verification
1. Login as Main Admin
2. Verify a payment
3. Logout and login as User
4. Check notification bell - should show "Your payment has been verified"

### Test 5: Independent Read Status
1. Login as User and mark notification as read
2. Logout and login as Main Admin
3. Check notification - Admin's notification should still be unread

## Benefits

✅ **Bidirectional communication** - Both parties stay informed
✅ **Independent notifications** - Each user manages their own
✅ **No duplicate notifications** - Only notify the other party, not yourself
✅ **Clear messages** - User-friendly for Users, actionable for Admins
✅ **Full visibility** - Both sides know when actions are taken
✅ **Scalable** - Works with multiple admins (all Main Admins are notified)

## Important Notes

- **All Main Admins** with status "active" receive notifications
- Notifications are **only sent to the other party** (not to the person who performed the action)
- Each notification has **completely independent read status**
- Notifications use proper **foreign keys** (`admin_id` or `owner_id`)
- Frontend **does not need any changes** - works with existing NotificationBell component

## Summary

The notification system now creates a **two-way communication channel**:
- **User actions** → Notify Admin
- **Admin actions** → Notify User

Each person sees only the notifications relevant to them, and can mark them as read independently.
