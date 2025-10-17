# OABP Dynamic Request System - Setup Guide

## Overview

This guide will walk you through setting up the dynamic request/form submission system for the Online Application for Business Permit System (OABP).

## Prerequisites

- Supabase account with project already set up
- Node.js and npm installed
- Backend and frontend projects already configured

## Step 1: Database Setup

### 1.1 Run the Database Schema SQL

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `backend/database_schema.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** to execute the SQL statements

This will create:
- **Requests** table - Stores business permit requests
- **Request Form Data** table - Stores form field answers
- **Request History** table - Tracks status changes (optional)
- **Tracking code sequence** and **trigger function** - Auto-generates unique tracking codes

### 1.2 Verify Tables Created

Check that the following tables now exist in your Supabase database:
- `Requests`
- `Request Form Data`
- `Request History`

### 1.3 Configure Storage Bucket

1. In Supabase, go to **Storage**
2. Ensure the `documents` bucket exists (should already exist from previous setup)
3. The system will upload files to `request-files/` folder within this bucket

## Step 2: Backend Configuration

The backend API endpoints have already been added to `backend/server.js`. The following endpoints are now available:

### Request Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/request/form-fields/:categoryId` | GET | Fetch form fields, groups, and options for a category |
| `/api/request/submit` | POST | Submit a new request with form data and file uploads |
| `/api/request/owner/:ownerId` | GET | Get all requests for a specific owner |
| `/api/request/details/:requestId` | GET | Get request details with form data |
| `/api/request/all` | GET | Get all requests (admin/processor) |
| `/api/request/update-status/:requestId` | PUT | Update request status |
| `/api/request/history/:requestId` | GET | Get request status change history |

### Environment Variables

Ensure your `backend/.env` file has:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
```

## Step 3: Frontend Configuration

### 3.1 API URL Configuration

In `frontend/src/userpages/UserChecklist.js`, update the API URL:

```javascript
// For production
const API_URL = "https://oabs-f7by.onrender.com";

// For local development
// const API_URL = "http://localhost:3000";
```

Comment/uncomment based on your environment.

### 3.2 User Authentication

The system expects user data in `localStorage` with this structure:
```javascript
{
  "owner_id": 1,
  "fullname": "John Doe",
  "email": "john@example.com",
  "username": "johndoe"
}
```

This is automatically stored when the user logs in via `UserLogin.js`.

## Step 4: Testing the System

### 4.1 Create a Document Category

1. Log in as Superadmin
2. Navigate to **Document Categories**
3. Add a new category (e.g., "Business Permit Application")

### 4.2 Create Form Fields

1. Navigate to **Document Forms**
2. Select the category you created
3. Add form fields with various types:

**Example Field 1 - Business Name:**
- Field Name: `Business Name`
- Field Type: `TEXT`
- Is Required: `Yes`
- Field Order: `1`
- Placeholder: `Enter your business name`
- Field Width: `12` (full width)

**Example Field 2 - Business Type:**
- Field Name: `Business Type`
- Field Type: `SELECT`
- Is Required: `Yes`
- Field Order: `2`
- Field Width: `6` (half width)
- Add options: `Sole Proprietorship`, `Partnership`, `Corporation`

**Example Field 3 - Number of Employees:**
- Field Name: `Number of Employees`
- Field Type: `NUMBER`
- Is Required: `Yes`
- Field Order: `3`
- Validation Rule: `{"min": 1, "max": 10000}`
- Field Width: `6` (half width)

**Example Field 4 - Business License:**
- Field Name: `Business License`
- Field Type: `FILE`
- Is Required: `Yes`
- Field Order: `4`
- Field Width: `12`

### 4.3 Create Field Groups (Optional)

Field groups help organize related fields together:

1. Navigate to **Field Groups**
2. Create a group (e.g., "Business Information")
3. Set Group Order: `1`
4. When creating/editing form fields, assign them to this group via `group_id`

### 4.4 Test the User Flow

1. Log in as a **Business Owner** (Owner account)
2. Navigate to **Checklist** page
3. You should see a list of available document categories
4. Click **Select** on a category
5. Fill out the dynamically generated form
6. Upload any required files
7. Click **Submit Request**
8. You should receive a **Tracking Code** (e.g., `OABP-2025-00001`)

### 4.5 Verify Database Records

Check in Supabase that:
1. A new record was created in `Requests` table with the tracking code
2. Form field answers were saved to `Request Form Data` table
3. Files were uploaded to Supabase Storage under `request-files/`

## Step 5: Common Issues & Troubleshooting

### Issue: "Failed to fetch categories"

**Solution:**
- Verify backend server is running
- Check API URL in `UserChecklist.js` is correct
- Check browser console for CORS errors
- Ensure Supabase credentials in `.env` are correct

### Issue: "Failed to submit request"

**Solution:**
- Check that `owner_id` is available in localStorage
- Verify all required fields are filled
- Check file size (max 10MB per file)
- Check browser console for detailed error messages

### Issue: Tracking code not generated

**Solution:**
- Ensure the database trigger function was created successfully
- Check Supabase logs for errors
- Verify the `tracking_code_seq` sequence exists

### Issue: File uploads fail

**Solution:**
- Verify the `documents` storage bucket exists in Supabase
- Check storage bucket permissions
- Ensure bucket is public or has appropriate RLS policies
- Verify file size is under 10MB limit

## Step 6: Customization

### Custom Validation Rules

Add validation rules to form fields using JSON format:

**Number Range Validation:**
```json
{
  "min": 0,
  "max": 100,
  "message": "Value must be between 0 and 100"
}
```

**Regex Pattern Validation:**
```json
{
  "pattern": "^[A-Za-z0-9]+$",
  "message": "Only alphanumeric characters allowed"
}
```

**Email Validation:**
```json
{
  "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  "message": "Please enter a valid email address"
}
```

### Field Width (Bootstrap Grid)

Use field width to control layout:
- `12` = Full width
- `6` = Half width (2 columns)
- `4` = One-third width (3 columns)
- `3` = One-fourth width (4 columns)

Example: Put "First Name" and "Last Name" side by side:
- First Name: `field_width = 6`
- Last Name: `field_width = 6`

## Step 7: Next Steps

Now that the request submission system is working, you can:

1. **Create a Requests Management Page** for admins to view and process requests
2. **Add Email Notifications** when requests are submitted or status changes
3. **Create a Tracking Page** where users can check their request status using the tracking code
4. **Add Payment Integration** for permit fees
5. **Generate PDF Reports** for approved permits

## Support

For issues or questions:
- Check the [CLAUDE.md](CLAUDE.md) file for project architecture details
- Review the backend API endpoints in [server.js](backend/server.js)
- Check Supabase logs for database errors

---

**Last Updated:** 2025-01-17
