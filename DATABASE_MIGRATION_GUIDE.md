# Database Simplification Migration Guide

## Overview
This document outlines all changes made to simplify the OABP database from online payment system to **over-the-counter payment processing**.

---

## Database Schema Changes

### Tables Removed (4 tables)
- ✅ `System_Settings` - No code references found
- ✅ `SLA_Breaches` - No code references found
- ✅ `Notification_Templates` - No code references found
- ✅ `Blacklist` - No code references found

### Payments Table - Simplified

**Removed Columns (13 fields):**
- `proof_payment` - Online payment proof image upload
- `receiver_name` - Payment receiver name (for online transfers)
- `receiver_number` - Payment receiver mobile/account number
- `receiver_account` - Bank account details
- `sender_number` - User's sender mobile number
- `deadline` - Payment deadline date
- `reminded_at` - Reminder sent timestamp
- `overdue` - Overdue status flag
- `reminder_count` - Number of reminders sent
- `last_reminder_at` - Last reminder timestamp
- `verified_at` - Verification timestamp
- `rejected_at` - Rejection timestamp
- `rejected_reason` - Rejection reason text
- `payment_deadline` - Payment deadline (duplicate)
- `created_by` - Replaced by `processed_by`
- `verified_by` - Replaced by `processed_by`

**Kept Essential Columns (13 fields):**
- `payment_id` - Primary key
- `request_id` - Foreign key to Requests
- `reference_number` - Receipt/reference number
- `amount` - Payment amount
- `status` - Payment status (Pending, Verified, Rejected)
- `payment_type` - Type of payment
- `description` - Payment description
- `payment_method` - Payment method (Cash, Check, etc.)
- `payment_date` - Date payment was made
- `processed_by` - Admin who processed payment (consolidated field)
- `updated_at` - Last update timestamp
- `remarks` - Processing remarks
- `receipt_number` - Unique receipt number
- `created_at` - Creation timestamp

### Requests Table - Simplified

**Removed Columns (5 fields):**
- `sla_deadline` - Service level agreement deadline
- `payment_verified_at` - Payment verification timestamp (tracked in Payments)
- `document_downloaded_at` - Document download timestamp (tracked in Download_Logs)
- `source` - Request source (web vs other)
- `priority` - Request priority level

**Kept Core Columns (17 fields):**
- `request_id`, `owner_id`, `category_id`, `tracking_code`
- `date_requested`, `date_release`, `status`, `processed_by`
- `remarks`, `assigned_at`, `completed_at`, `cancelled_at`
- `cancelled_by`, `rejection_reason`, `payment_required`
- `updated_at`, `created_at`

---

## Backend Changes (server.js)

### Payment API Endpoints Updated

#### 1. POST /api/payment/add (Line ~3452)
**Before:**
```javascript
{
  request_id, amount, payment_type, description,
  receiver_name, receiver_number, receiver_account,
  payment_method, payment_deadline, created_by, status
}
```
**After:**
```javascript
{
  request_id, amount, payment_type, description,
  payment_method, processed_by, status
}
```

#### 2. GET /api/payment/request/:requestId (Line ~3526)
**Before:**
```javascript
CreatedBy:created_by (admin_id, fullname, username),
VerifiedBy:verified_by (admin_id, fullname, username)
```
**After:**
```javascript
ProcessedBy:processed_by (admin_id, fullname, username)
```

#### 3. GET /api/payment/all (Line ~3563)
**Before:**
```javascript
CreatedBy:created_by (fullname, username),
VerifiedBy:verified_by (fullname, username)
```
**After:**
```javascript
ProcessedBy:processed_by (fullname, username)
```

#### 4. PUT /api/payment/submit-proof/:paymentId (Line ~3670)
**Before (Online Payment):**
```javascript
{
  sender_number, reference_number, proof_payment,
  payment_date, status: "Submitted"
}
```
**After (Over-the-Counter):**
```javascript
{
  reference_number, payment_date,
  status: "Verified", // Auto-verified for OTC
  remarks: "Over-the-counter payment received"
}
```

#### 5. PUT /api/payment/verify/:paymentId (Line ~3743)
**Before:**
```javascript
{ status, verified_by, remarks }
```
**After:**
```javascript
{ status, processed_by, remarks }
```

#### 6. PUT /api/payment/update/:paymentId (Line ~3834)
**Before:**
```javascript
{
  amount, payment_type, description,
  receiver_name, receiver_number, receiver_account,
  payment_method, payment_deadline
}
```
**After:**
```javascript
{
  amount, payment_type, description, payment_method
}
```

#### 7. GET /api/dashboard/admin/stats (Line ~4001)
**Before:**
```javascript
.select("status, payment_deadline")
payments: { total, pending, submitted, verified, overdue }
```
**After:**
```javascript
.select("status")
payments: { total, pending, verified, rejected }
```

#### 8. GET /api/dashboard/user/stats/:ownerId (Line ~4084)
**Before:**
```javascript
.select("status, payment_deadline, amount")
payments: { total, pending, submitted, verified, overdue, totalAmount }
```
**After:**
```javascript
.select("status, amount")
payments: { total, pending, verified, rejected, totalAmount }
```

---

## Frontend Changes Required

### Files Needing Updates (7 files)

#### 1. frontend/src/mainadminpage/MainPayments.js
**Changes Needed:**
- Remove `getDeadlineInfo()` function (Line ~182)
- Remove stats for "submitted" and "overdue" (Line ~42-44, ~82)
- Update stats to: `{ total, pending, verified, rejected }`
- Remove receiver details section (Line ~602-626)
- Remove payment proof section (Line ~629-668)
- Remove proof image display in verify modal (Line ~761-774)
- Update to use `ProcessedBy` instead of `CreatedBy`/`VerifiedBy`
- Remove verified_at field references (Line ~671)

**Status Filter Options:**
- Remove: "Submitted", "Overdue"
- Keep: "All", "Pending", "Verified", "Rejected"

#### 2. frontend/src/processorpage/ProcessorPayments.js
**Changes Needed:**
- Remove `getDeadlineInfo()` function (Line ~237)
- Remove receiver details section (Line ~657-681)
- Remove payment proof section (Line ~684-723)
- Remove proof image display in verify modal (Line ~816-828)
- Update to use `ProcessedBy` instead of `CreatedBy`/`VerifiedBy`
- Remove verified_at field references (Line ~726)

#### 3. frontend/src/userpages/UserPayments.js
**Changes Needed:**
- Remove `getDeadlineInfo()` function (Line ~179)
- Remove deadline warning alerts (Line ~380-396)
- Remove deadline display (Line ~414-421)
- Remove receiver details section (Line ~430-451)
- Remove proof upload form fields (sender_number, proof upload)
- Update payment submission to OTC flow
- Show message: "Please pay at the office counter"

#### 4. frontend/src/processorpage/ProcessorDashboard.js
**Changes Needed:**
- Update payment stats to remove "overdue" count
- Update to: `{ total, pending, verified, rejected }`

#### 5. frontend/src/mainadminpage/MainRequests.js
**Changes Needed:**
- Check if `verified_by` is referenced
- Update to `processed_by` if found

#### 6. frontend/src/processorpage/ProcessorRequests.js
**Changes Needed:**
- Check if `verified_by` is referenced
- Update to `processed_by` if found

#### 7. frontend/src/mainadminpage/MainDocuments.js
**Note:** `created_by` field in Documents table is **STILL VALID** - no changes needed here.

---

## Over-the-Counter Payment Flow

### Old Flow (Online Payment)
1. Admin creates payment requirement with receiver details
2. User uploads proof of payment (GCash screenshot)
3. Admin verifies payment proof
4. Payment marked as "Verified"

### New Flow (Over-the-Counter)
1. Admin creates payment requirement
2. **User pays at office counter (physical cash/check)**
3. Admin receives payment and issues receipt
4. Admin records payment with receipt number
5. Payment automatically marked as "Verified"

### UI Changes Needed

**Admin Payment Form:**
- Remove: Receiver Name, Number, Account fields
- Remove: Payment Deadline field
- Keep: Amount, Payment Type, Payment Method, Description

**User Payment View:**
- Remove: Upload proof button
- Remove: Deadline countdown
- Show: "Please pay at the office. Receipt will be issued upon payment."
- Show: Payment amount and instructions

**Payment Status:**
- Remove: "Submitted" status (no longer used)
- Remove: "Overdue" status (no deadlines)
- Keep: "Pending", "Verified", "Rejected"

---

## Testing Checklist

### Backend Testing
- [ ] Create payment without receiver fields
- [ ] Fetch payments with ProcessedBy join
- [ ] Update payment status without verified_by
- [ ] Dashboard stats show correct counts (no overdue)

### Frontend Testing
- [ ] Payment list displays correctly without proof images
- [ ] Payment details modal shows only relevant fields
- [ ] Payment creation form simplified (no receiver/deadline)
- [ ] Dashboard stats display pending/verified/rejected only
- [ ] User payment page shows OTC instructions

---

## Migration Steps

1. ✅ **Database Schema** - Already updated in database.sql
2. ✅ **Backend API** - Updated in server.js (8 endpoints)
3. ⏳ **Frontend Components** - 7 files need updating
4. ⏳ **Testing** - Verify all payment flows work correctly
5. ⏳ **Documentation** - Update CLAUDE.md

---

## Summary

The system is now focused on **over-the-counter payment processing**:
- Simplified Payments table (removed 15+ fields)
- Simplified Requests table (removed 5 fields)
- Removed 4 unused tables
- Consolidated admin tracking (processed_by instead of created_by/verified_by)
- No more online payment proofs, deadlines, or reminders
- Cleaner, more maintainable codebase

**Database is ready. Backend is updated. Frontend needs UI updates.**
