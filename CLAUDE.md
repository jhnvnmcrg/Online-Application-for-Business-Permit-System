# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is OABPS (Online Application and Business Processing System) - a full-stack web application for managing document requests, payments, and transactions. The system supports three user roles: Main Admin, Processor, and User.

**Tech Stack:**
- Frontend: React 19 with React Router, Bootstrap, Tailwind CSS
- Backend: Express.js with Supabase (PostgreSQL)
- File Handling: Multer for file uploads to Supabase storage
- Authentication: bcrypt for password hashing

## Repository Structure

```
oabp/
├── frontend/          # React application
│   ├── src/
│   │   ├── mainadminpage/     # Main admin dashboard and pages
│   │   ├── processorpage/     # Processor dashboard and pages
│   │   ├── userpages/         # User dashboard and pages
│   │   ├── pages/             # Public pages (Home, About, etc.)
│   │   ├── includes/          # Shared components (Sidebar, Header)
│   │   ├── config/            # Configuration files
│   │   └── App.js             # Main routing configuration
│   └── public/
└── backend/           # Express API server
    ├── server.js      # Main server file with all API endpoints
    ├── database.sql   # Database schema reference
    └── .env           # Environment variables (not in git)
```

## Development Commands

### Frontend (React)
Navigate to `frontend/` directory first:
```bash
cd frontend
npm start          # Start development server on http://localhost:3000
npm test           # Run tests in watch mode
npm run build      # Create production build
```

### Backend (Express)
Navigate to `backend/` directory first:
```bash
cd backend
npm start          # Start server on port 3000 (or PORT from .env)
node server.js     # Alternative way to start server
```

**Important:** Both frontend and backend run on port 3000 by default. When running locally, start the backend on a different port or configure CORS appropriately.

## Architecture

### Three-Tier User System

1. **Main Admin** (`/oabps/main/*`)
   - Full system access
   - Manages admins, processors, users
   - Assigns processors to document categories
   - Views all requests, payments, transactions
   - Manages document categories and forms

2. **Processor** (`/oabps/processor/*`)
   - Limited to assigned document categories
   - Processes requests within their categories
   - Views and updates request statuses
   - Handles document verification

3. **User** (`/oabps/user/*`)
   - Submits document requests
   - Uploads supporting files
   - Tracks request status
   - Manages payments
   - Views transaction history

### Database Architecture

The application uses Supabase (PostgreSQL) with the following core tables:

- **Admins**: Main admins and processors (role-based)
- **Owners**: End users who submit requests
- **Document Categories**: Types of documents (e.g., permits, licenses)
- **Document Forms**: Dynamic form fields for each category
- **Form Field Groups**: Grouping of related form fields
- **Form Field Options**: Dropdown/select options for form fields
- **Requests**: User-submitted document requests
- **Request Submissions**: Form data submitted with requests
- **Request Attachments**: Files uploaded by users/admins
- **Request Status History**: Audit trail of status changes
- **Payments**: Payment records linked to requests
- **Payment History**: Payment status change tracking
- **Assigned Roles**: Maps processors to document categories
- **Login Audits**: Login attempt tracking
- **Activity Logs**: System-wide audit logs

Key relationships:
- Processors are assigned to specific Document Categories through Assigned Roles
- Requests belong to a Category and Owner
- Each Request can have multiple Payments and Attachments
- Form structure is defined per Category with dynamic field groups

### API Structure

The backend (`backend/server.js`) follows RESTful conventions:

**Authentication Endpoints:**
- `POST /api/main/register` - Register main admin
- `POST /api/main/login` - Main admin login
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/processor/login` - Processor login
- `POST /api/{role}/forgot-password` - Password reset

**Resource Endpoints Pattern:**
- `GET /api/{resource}/all` - List all records
- `GET /api/{resource}/:id` - Get single record
- `POST /api/{resource}/add` - Create new record
- `PUT /api/{resource}/update/:id` - Update record
- `DELETE /api/{resource}/delete/:id` - Delete record

**Key Resources:**
- `/api/category/*` - Document categories
- `/api/document/*` - Document templates (with file upload)
- `/api/form/*` - Form field definitions
- `/api/group/*` - Form field groups
- `/api/option/*` - Form field options
- `/api/assignment/*` - Processor-category assignments
- `/api/request/*` - Document requests (complex CRUD)
- `/api/payment/*` - Payment processing
- `/api/audit/*` - Login audits
- `/api/dashboard/*` - Statistics and analytics

**Special Endpoints:**
- `/api/processor/assigned-categories/:adminId` - Get processor's categories
- `/api/processor/documents/:adminId` - Get documents for processor
- `/api/request/form-fields/:categoryId` - Get dynamic form fields
- `/api/request/submit` - Submit new request with files
- `/api/request/update-status/:requestId` - Update request status
- `/api/payment/submit-proof/:paymentId` - Upload payment proof
- `/api/payment/verify/:paymentId` - Verify payment

### Frontend Routing

All routes are prefixed with `/oabps/{role}/` where role is `main`, `processor`, or `user`.

**Route Structure:**
- Authentication: `/oabps/{role}/login`, `/register`, `/forgot`
- Dashboard: `/oabps/{role}/dashboard`
- Common pages: `/documents`, `/requests`, `/payments`, `/transactions`
- Main admin only: `/documentcategory`, `/documentforms`, `/assign`, `/admins`, `/users`, `/logaudits`
- User only: `/checklist`, `/renewal`, `/forms`, `/downloadables`

Public routes (no `/oabps` prefix):
- `/` or `/home` - Landing page
- `/requirements`, `/tracking`, `/contactus`, `/about`

### File Upload Pattern

The application uses multer with memory storage for file uploads:

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
```

Files are stored in Supabase Storage buckets:
- Documents: Template files uploaded by admins
- Request Attachments: Files submitted with requests
- Payment Proofs: Payment verification images

Key endpoints with file upload:
- `POST /api/document/add` - Single file: `upload.single("document")`
- `POST /api/request/submit` - Multiple files: `upload.any()`
- `PUT /api/payment/submit-proof/:paymentId` - Single file: `upload.single("proofPayment")`

### Authentication & Authorization

- Passwords are hashed with bcrypt (10 salt rounds)
- No JWT/session management in current implementation (consider adding)
- Role-based access controlled by `role` field in Admins table
- User status tracked via `status` field ("active", "inactive")
- Login attempts logged to Login Audits table

### Environment Variables

Required in `backend/.env`:
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
PORT=3000
```

## Working with This Codebase

### Adding New Form Fields
1. Use Main Admin interface to create fields in Document Forms table
2. Fields support types: text, email, number, select, radio, checkbox, file, date, textarea
3. Group related fields using Form Field Groups
4. Add options for select/radio/checkbox fields via Form Field Options

### Request Processing Flow
1. User submits request via `/api/request/submit` with form data and files
2. Request created with status "Pending"
3. System creates Payment record based on category fees
4. Processor assigned to category reviews request
5. Status updates tracked in Request Status History
6. User uploads payment proof via `/api/payment/submit-proof/:paymentId`
7. Admin verifies payment via `/api/payment/verify/:paymentId`
8. Request processed and documents generated
9. User downloads completed documents from attachments

### Database Schema Reference
The `backend/database.sql` file contains the full schema with warnings that it's for reference only. Table definitions include all constraints and foreign keys but may need reordering for actual execution.

### Common Patterns

**Supabase Query Pattern:**
```javascript
const { data, error } = await supabase
  .from('TableName')
  .select('columns')
  .eq('column', value)
  .single(); // or .maybeSingle() to avoid errors when not found
```

**Error Handling Pattern:**
```javascript
if (error) {
  return res.status(500).json({
    success: false,
    error: error.message
  });
}
```

**Success Response Pattern:**
```javascript
res.json({
  success: true,
  data: data,
  message: "Operation successful"
});
```

### Testing Notes
- No comprehensive test suite currently implemented
- Frontend has default CRA test setup
- Backend has placeholder test script
- Manual testing required for most features
