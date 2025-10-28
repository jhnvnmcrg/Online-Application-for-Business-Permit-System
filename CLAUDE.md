# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack document request and processing management system with three user types (Owners, Admins, Processors). It manages document requests, payments, dynamic forms, and notifications.

**Tech Stack:**
- Backend: Node.js/Express with Supabase (PostgreSQL)
- Frontend: React 19 SPA with React Router
- Styling: Bootstrap 5, TailwindCSS, FontAwesome icons
- File Upload: Multer with Supabase Storage
- Auth: bcrypt for password hashing, localStorage for session management

## Development Commands

### Backend
```bash
cd backend
npm start                    # Start backend server (runs server.js on port 3000)
```

### Frontend
```bash
cd frontend
npm start                    # Start React development server (port 3000)
npm run build                # Build production bundle
npm test                     # Run tests with react-scripts
```

## Architecture

### User Types and Permissions
The application has three distinct user roles with separate authentication flows:

1. **Owners** (Business users)
   - Submit document requests
   - Track request status
   - Make payments
   - Routes: `/oabps/user/*`
   - localStorage key: `owner`, `userType: 'Owner'`

2. **Admins** (Superadmin role)
   - Full system access
   - Manage categories, forms, documents
   - Approve/reject requests and payments
   - Manage other admins and processors
   - View audit logs
   - Routes: `/oabps/main/*`
   - localStorage key: `mainadmin`, `userType: 'Admin'`

3. **Processors** (Limited admin role)
   - Assigned to specific document categories
   - Process requests only for assigned categories
   - Verify payments
   - Routes: `/oabps/processor/*`
   - localStorage key: `processor`, `userType: 'Processor'`

### Backend Structure

**Single monolithic server** (`backend/server.js`):
- ~76 RESTful API endpoints
- All routes prefixed with `/api/`
- Supabase client initialized with environment variables
- CORS configured for localhost:3000 and production frontend
- Multer configured for file uploads (10MB limit, memory storage)

**Key API endpoint patterns:**
- `/api/main/*` - Admin endpoints (register, login, CRUD operations)
- `/api/user/*` - Owner endpoints (register, login, profile)
- `/api/processor/*` - Processor endpoints (login, forgot-password)
- `/api/category/*` - Document category management
- `/api/document/*` - Document file management
- `/api/form/*` - Dynamic form builder endpoints
- `/api/request/*` - Request processing
- `/api/payment/*` - Payment processing
- `/api/notification/*` - Notification system

**Notification System:**
Helper functions in server.js create notifications automatically:
- `createNotification()` - Base function for creating notifications
- `notifyAdminNewRequest()` - Notifies all superadmins of new requests
- Auto-notifications on status changes for requests and payments

### Frontend Structure

**Page organization by user type:**
```
src/
├── mainadminpage/          # Admin dashboard and features
│   ├── components/         # MainLogin, MainRegister, MainForgot
│   ├── MainDashboard.js
│   ├── MainDocuments.js    # Downloadable documents management
│   ├── MainDocCategory.js  # Document categories
│   ├── MainDocForms.js     # Dynamic form builder
│   ├── MainRequests.js     # Request management
│   ├── MainPayments.js     # Payment verification
│   ├── MainTransactions.js # Transaction history
│   ├── MainAssign.js       # Assign processors to categories
│   ├── MainAdmins.js       # Admin/processor management
│   ├── MainUsers.js        # Owner management
│   └── MainLogAudits.js    # Login audit logs
├── processorpage/          # Processor dashboard
│   ├── components/         # ProcessorLogin, ProcessorForgot
│   ├── ProcessorDashboard.js
│   ├── ProcessorDocuments.js
│   ├── ProcessorRequests.js
│   ├── ProcessorPayments.js
│   └── ProcessorTransactions.js
├── userpages/              # Owner (user) dashboard
│   ├── components/         # UserLogin, UserRegister, UserForgot
│   ├── UserDashboard.js
│   ├── NewApplication.js   # Submit new requests
│   ├── UserChecklist.js    # Track request status
│   ├── UserPayments.js     # Submit payments
│   ├── UserTransaction.js  # View transactions
│   └── UserDownloadables.js
├── pages/                  # Public pages
│   ├── Home.js
│   ├── Requirements.js
│   ├── Tracking.js         # Track request by tracking code
│   ├── ContactUs.js
│   └── About.js
└── includes/               # Shared components
    ├── Header.js           # Public header
    ├── MainSideBar.js      # Admin sidebar
    ├── ProcessorSideBar.js # Processor sidebar
    ├── UserSideBar.js      # Owner sidebar
    └── NotificationBell.js # Real-time notifications
```

### Database Schema

**Core tables** (defined in `backend/database.sql`):
- `Admins` - Admin and Processor users (role: Superadmin/Processor)
- `Owners` - Business users who submit requests
- `Document Categories` - Types of documents (Business Permit, etc.)
- `Document Forms` - Dynamic form fields for each category
- `Form Field Groups` - Grouping for form fields
- `Form Field Options` - Options for SELECT/RADIO/CHECKBOX fields
- `Documents` - Downloadable document templates
- `Assigned Roles` - Links processors to categories
- `Requests` - Document requests from owners
- `Request Form Data` - Form submissions
- `Request Attachments` - Files uploaded with requests
- `Request History` - Status change audit trail
- `Payments` - Payment records
- `Payment History` - Payment status audit trail
- `Notifications` - System notifications (linked to requests/payments)
- `Login Audits` - Admin login attempts

**Key relationships:**
- Requests link Owners → Categories → Processors
- Form Data stores dynamic form submissions
- History tables track all status changes for auditing
- Notifications reference requests/payments and user type

### API URL Configuration

**IMPORTANT:** The API URL is hardcoded in each component that makes API calls.

**Production:** `https://oabs-f7by.onrender.com`
**Local development:** `http://localhost:3000`

When developing locally, you must manually change the API_URL constant in each component that makes API calls. Search for:
```bash
grep -r "const API_URL" frontend/src/
```

### Session Management

The application uses localStorage for session state:
- `localStorage.getItem('userType')` - Returns 'Owner', 'Admin', or 'Processor'
- `localStorage.getItem('owner')` - Owner user object (for Owners)
- `localStorage.getItem('mainadmin')` - Admin user object (for Admins/Processors)
- `localStorage.getItem('processor')` - Processor user object (for Processors)

Each user object contains: user_id, fullname, email, username, role, status

### Dynamic Form System

The application includes a sophisticated form builder:
- Admins create custom forms for each document category
- Field types: TEXT, TEXTAREA, NUMBER, FILE, DATE, EMAIL, SELECT, RADIO, CHECKBOX
- Fields can be grouped for better organization
- Field width options: 3, 4, 6, 12 columns (Bootstrap grid)
- Validation rules and required fields supported
- Form submissions stored in `Request Form Data` table

## Important Notes

### Environment Variables
Backend requires `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
```

### File Uploads
- Files uploaded via Multer to memory
- Then stored in Supabase Storage
- Max file size: 10MB
- Supported for documents and request attachments

### Status Workflows

**Request Status Flow:**
Pending → Under Review → Approved/Rejected/Cancelled → Completed

**Payment Status:**
Pending → Verified/Rejected

All status changes are logged in history tables with timestamp and admin who made the change.

### Notification System
Notifications are automatically created when:
- Owner submits a new request (notifies all superadmins)
- Admin updates request status (notifies owner)
- Owner submits payment (notifies assigned processor or superadmins)
- Admin verifies/rejects payment (notifies owner)

Notifications link to requests/payments for easy navigation and are marked as read when viewed.

## Security Features

### JWT Authentication
- Access tokens (24h expiry) and refresh tokens (7d expiry)
- Token-based authentication for all protected routes
- Middleware: `backend/middleware/auth.js`
- Utilities: `backend/utils/jwt.js`
- Enhanced authentication routes: `backend/routes/auth.js`

### Rate Limiting
All endpoints are protected with rate limiting:
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- File uploads: 20 uploads per hour
- Password reset: 3 attempts per hour

Configuration: `backend/middleware/rateLimiter.js`

### Email Notifications
Automated emails sent for:
- Email verification on registration
- Password reset requests
- Request status updates
- Payment verification
- New request alerts to admins

Service: `backend/utils/emailService.js`

### Database Security
- 30+ performance indexes
- Unique constraints prevent duplicate data
- Cascade delete rules maintain referential integrity
- Soft delete support (deleted_at columns)
- Email verification and password reset fields
- Activity logging for audit trail

Migration: `backend/migrations/001_security_enhancements.sql`
