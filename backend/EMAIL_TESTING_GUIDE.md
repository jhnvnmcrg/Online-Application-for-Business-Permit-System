# Email Notification Testing Guide

This guide shows how to test all email notifications in your OABP system.

## ✅ Email Notifications Implemented

1. **Email Verification** - After user/admin registration
2. **Password Reset** - Forgot password flow
3. **Request Status Update** - When admin changes request status ⭐
4. **Payment Verification** - When admin verifies/rejects payment
5. **New Request Alert** - Notifies admins when owner submits request

## 🧪 Testing Methods

### Method 1: Unit Tests (Fastest)

Test each email type individually without needing database data.

#### Test 1: Email Verification
```bash
cd backend
node test-email.js
```

Expected: Receives verification email

#### Test 2: Request Status Email ⭐
```bash
node test-request-status-email.js
```

Expected: Receives request status update email with:
- Tracking code
- Old status → New status (colored)
- Remarks
- "Track Your Request" button

#### Test 3: All Emails
```bash
node test-all-emails.js
```

Expected: Receives 5 different emails

### Method 2: API Integration Tests (Real Flow)

Test emails through actual API endpoints.

#### Step 1: Start the Backend
```bash
cd backend
npm start
```

#### Step 2: Create Test Data

First, you need a test owner and a test request in your database.

**Option A: Use existing data**
- Find an existing owner_id and request_id from your database

**Option B: Create test data via API**

1. Register a test owner:
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Owner",
    "email": "your-email@gmail.com",
    "username": "testowner",
    "password": "password123",
    "phone_number": "1234567890",
    "business_name": "Test Business"
  }'
```

2. Check email for verification link and verify

3. Login to get owner_id

#### Step 3: Test Request Status Email

**Using curl:**

```bash
curl -X PUT http://localhost:3000/api/request/update-status/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Under Review",
    "processedBy": 1,
    "remarks": "Your documents are being reviewed by our team."
  }'
```

Replace:
- `1` in URL with your actual request_id
- `1` in processedBy with your actual admin_id

**Using Postman:**

1. Method: PUT
2. URL: `http://localhost:3000/api/request/update-status/1`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "status": "Under Review",
  "processedBy": 1,
  "remarks": "Your documents are being reviewed."
}
```

**Expected Result:**
- API returns success
- Owner receives email at their registered email
- Email contains status update details

### Method 3: Frontend Testing (Most Realistic)

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Login as admin
4. Go to Requests page
5. Update a request status
6. Owner should receive email

## 📧 What to Check in Emails

### Request Status Email Should Contain:
- ✅ Tracking Code (e.g., OABP-2025-00001)
- ✅ Document Type (e.g., Business Permit)
- ✅ Previous Status
- ✅ New Status (color-coded)
- ✅ Remarks from admin
- ✅ "Track Your Request" button
- ✅ Clickable link to tracking page

### Payment Verification Email Should Contain:
- ✅ Tracking Code
- ✅ Reference Number
- ✅ Status (Verified/Rejected)
- ✅ Remarks
- ✅ "View Payment Details" button

### New Request Email (to Admin) Should Contain:
- ✅ Tracking Code
- ✅ Document Type
- ✅ Submitted by (owner name)
- ✅ "Review Request" button

## 🔍 Troubleshooting

### Email Not Received?

**Check 1: Backend Console**
Look for:
```
✅ Request status email sent to: user@email.com
```

Or errors:
```
❌ Email notification error: ...
```

**Check 2: Email Configuration**
```bash
# Verify .env settings
cat backend/.env | grep EMAIL
```

Should show:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="OABP System <your_email@gmail.com>"
```

**Check 3: Gmail Settings**
- 2-Factor Authentication enabled?
- Using App Password (not regular password)?
- Check spam folder

**Check 4: Test Basic Email First**
```bash
node test-email.js
```
If this fails, fix email config first

**Check 5: Database Data**
Verify request has valid owner_id:
```sql
SELECT r.request_id, r.tracking_code, o.email, o.fullname
FROM "Requests" r
JOIN "Owners" o ON r.owner_id = o.owner_id
WHERE r.request_id = 1;
```

### Email Sends But Content is Wrong?

Check `backend/utils/emailService.js` - the email templates are there.

### Email Sends Multiple Times?

This is normal during testing if you:
- Update the same request multiple times
- Run test scripts multiple times

## 🎯 Quick Verification Checklist

- [ ] Basic email test works (`node test-email.js`)
- [ ] Request status email test works (`node test-request-status-email.js`)
- [ ] All email types work (`node test-all-emails.js`)
- [ ] API endpoint sends email when status updated
- [ ] Email received in inbox (check spam)
- [ ] Email contains correct information
- [ ] Links in email work
- [ ] Email formatting looks good

## 📊 Expected Email Flow

### When Admin Updates Request Status:

```
Admin updates request status
         ↓
server.js endpoint: /api/request/update-status/:requestId
         ↓
Updates database
         ↓
Fetches owner email from database
         ↓
Calls sendRequestStatusEmail()
         ↓
emailService.js sends email via nodemailer
         ↓
Gmail SMTP sends email
         ↓
Owner receives email ✅
```

## 🔐 Security Notes

- Emails are sent asynchronously (won't block API response)
- If email fails, API request still succeeds (logged to console)
- Email failures don't affect request status updates
- All emails use secure SMTP with authentication

## 📝 Test Scenarios

### Scenario 1: Happy Path
1. Owner submits request
2. Admin receives new request email ✅
3. Admin updates status to "Under Review"
4. Owner receives status update email ✅
5. Admin updates status to "Approved"
6. Owner receives status update email ✅

### Scenario 2: Payment Flow
1. Owner submits payment proof
2. Admin verifies payment
3. Owner receives payment verification email ✅

### Scenario 3: Email Verification
1. User registers
2. User receives verification email ✅
3. User clicks link
4. Account activated

## 💡 Pro Tips

1. **Check Console**: Always watch backend console for email logs
2. **Test Incrementally**: Test basic email first, then advanced
3. **Use Your Own Email**: Test with email you can access
4. **Check Spam**: Gmail might filter emails initially
5. **Wait 30 seconds**: Sometimes emails take a moment to arrive

## ✅ Success Criteria

Your email system is working correctly if:
- ✅ All 5 email types send successfully
- ✅ Emails arrive within 1 minute
- ✅ Email content is correct and formatted well
- ✅ Links in emails work
- ✅ No errors in backend console
- ✅ API endpoints don't fail even if email fails

---

**Need Help?**
1. Run `node test-all-emails.js` to test everything
2. Check backend console for specific errors
3. Verify EMAIL_* settings in .env
4. Make sure you're using Gmail App Password
