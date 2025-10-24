# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OABP (Online Application for Business Permit) is a full-stack web application for managing business permit applications with role-based access control. The system serves three distinct user types:

- **Main Admin (Superadmin)**: Full system access, manages admins, documents, categories, and system configuration
- **Processor**: Processes applications, manages payments for assigned permit categories
- **Owner (Business User)**: Submits applications, tracks status, manages payments

**Tech Stack**: Node.js/Express backend + React frontend + PostgreSQL (via Supabase)

## Development Commands

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm start            # Start server on port 3000 (or PORT env var)
```

The backend runs as a single Express server defined in [server.js](backend/server.js) (4613 lines).

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start development server (default port 3000)
npm run build        # Create production build in build/
npm test             # Run tests (not currently implemented)
```

**Note**: No test suite or linting is currently configured for either backend or frontend.

### Running the Full Application
You need to run both servers concurrently:
1. Terminal 1: `cd backend && npm start`
2. Terminal 2: `cd frontend && npm start`

## Environment Configuration

### Backend (.env required)
Create [backend/.env](backend/.env) with:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

The backend is configured for CORS with:
- `http://localhost:3000` (development)
- `https://oabsfront.onrender.com` (production)

## Architecture

### Backend Architecture

**Monolithic Structure**: All API endpoints, middleware, and business logic reside in a single [server.js](backend/server.js) file. While this simplifies initial development, consider modularizing if adding substantial new features.

**Database Access**: All database operations use the Supabase JavaScript client. Queries interact with PostgreSQL tables via the Supabase API.

**Important**: Database table names contain spaces (e.g., `"Document Categories"`, `"Form Field Groups"`, `"Request Attachments"`). Always use quotes when referencing these tables in Supabase queries:
```javascript
await supabase.from('Document Categories').select('*')
```

### Frontend Architecture

**Routing Pattern**: All authenticated routes follow `/oabps/{role}/{page}`:
- `/oabps/main/*` - Main Admin pages
- `/oabps/processor/*` - Processor pages
- `/oabps/user/*` - Business Owner pages
- `/` - Public pages (home, tracking, contact, etc.)

**Directory Structure**:
- [frontend/src/mainadminpage/](frontend/src/mainadminpage/) - Superadmin interface
- [frontend/src/processorpage/](frontend/src/processorpage/) - Processor interface
- [frontend/src/userpages/](frontend/src/userpages/) - Business owner interface
- [frontend/src/pages/](frontend/src/pages/) - Public landing pages
- [frontend/src/includes/](frontend/src/includes/) - Shared components (sidebars, headers, notifications)

**Session Management**: Uses `localStorage` for client-side session persistence. User data is stored after successful login.

### Database Schema

**15 Core Tables** (see [backend/database.sql](backend/database.sql)):

The system uses a **simplified over-the-counter payment model**. Online payment features (proof uploads, deadlines, reminders) have been removed.

Key tables:
- `Admins` - System administrators and processors
- `Owners` - Business permit applicants
- `Document Categories` - Types of permits (e.g., Business Permit, Sanitary Permit)
- `Document Forms` - Dynamic form fields per category
- `Form Field Groups` - Organizes form fields into sections
- `Form Field Options` - Dropdown/select field values
- `Requests` - Business permit applications with tracking codes
- `Request Form Data` - Submitted form field responses
- `Request Attachments` - Files uploaded with applications
- `Request History` - Audit trail of status changes
- `Payments` - **Over-the-counter payment records** (simplified)
- `Payment History` - Payment status change history
- `Notifications` - System notifications for admins and users
- `Assigned Roles` - Links processors to permit categories
- `Documents` - Uploaded permit documents
- `Activity Logs` - System-wide audit logging
- `Login Audits` - Login attempt tracking
- `Document Deliveries` - Document delivery tracking
- `Download Logs` - File download tracking

**Removed Tables** (4 tables no longer needed):
- `System_Settings` - Removed
- `SLA_Breaches` - Removed
- `Notification_Templates` - Removed
- `Blacklist` - Removed

**Key Relationships**:
- Each Request belongs to an Owner and Category
- Request Form Data links Requests to Document Forms (dynamic responses)
- Processors can be assigned to specific Document Categories via Assigned Roles
- Notifications reference Requests, Payments, Admins, and Owners

**Important Schema Changes**:
- **Payments table**: Simplified for over-the-counter processing. Removed: `proof_payment`, `receiver_name`, `receiver_number`, `receiver_account`, `sender_number`, `payment_deadline`, `created_by`, `verified_by`. Consolidated to single `processed_by` field.
- **Requests table**: Removed `sla_deadline`, `payment_verified_at`, `document_downloaded_at`, `source`, `priority`.

## Key Features & Patterns

### Dynamic Form System

The application uses a flexible form builder system:
1. Admins create form fields in `Document Forms` for each permit category
2. Fields support: text, textarea, number, date, email, select, radio, checkbox
3. Forms can be grouped using `Form Field Groups`
4. Select/radio options stored in `Form Field Options`
5. User submissions saved to `Request Form Data` (form_id + field_value pairs)

When working with forms, fetch fields ordered by `field_order` and group them by `group_id`.

### File Upload Handling

**Backend Configuration** ([server.js:28-31](backend/server.js#L28-L31)):
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
```

Files are handled in memory (not saved to disk locally), then uploaded to Supabase Storage or saved as base64 in database fields. When adding file upload endpoints, use `upload.single('fieldName')` or `upload.array('fieldName')` middleware.

### Notification System

**Helper Functions** ([server.js:34-99](backend/server.js#L34-L99)):
- `createNotification(userId, userType, type, subject, message, requestId, paymentId)` - Base notification creator
- `notifyAdminNewRequest(requestId, trackingCode, categoryName)` - Notify admins of new submissions
- `notifyUserStatusChange(...)` - Alert users when request status changes
- `notifyAdminPaymentSubmitted(...)` - Alert admins of payment proof uploads
- `notifyUserPaymentStatus(...)` - Inform users of payment verification

**Pattern**: Whenever a request or payment status changes, trigger appropriate notification helper to keep all stakeholders informed.

### Authentication Flow

**Password Security**: Uses bcrypt with 10 salt rounds for hashing:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Endpoints**:
- `POST /api/main/register` & `/api/main/login` - Superadmin auth
- `POST /api/processor/login` - Processor auth (no registration endpoint - admins create processor accounts)
- `POST /api/user/register` & `/api/user/login` - Business owner auth

**Important**: There is no JWT or token-based authentication. Sessions are managed entirely client-side via localStorage.

### Request Processing Workflow

1. **Submission**: User submits via `/api/request/submit` (status: "Pending")
2. **Assignment**: Admin/Processor reviews, assigns to processor, updates status
3. **Processing**: Status flows: Pending → Under Review → Approved/Rejected
4. **Payment**: If payment required, **user pays at office counter**, admin records payment with receipt
5. **Completion**: Document ready for pickup/download
6. **History**: All status changes logged to `Request History`

Status updates should:
- Update the request status in `Requests` table
- Create an entry in `Request History` with remarks
- Trigger notification to relevant parties

### Over-the-Counter Payment Flow

**Important**: The system uses **over-the-counter payment processing only**. No online payment proofs or deadline tracking.

1. Admin creates payment requirement via `/api/payment/add` with amount and description
2. User pays at office counter (cash, check, etc.)
3. Admin receives payment and records it via `/api/payment/submit-proof/:paymentId` with receipt number
4. Payment automatically marked as "Verified"
5. Payment history logged, user notified

**Payment Statuses**: Pending, Verified, Rejected (no "Submitted" or "Overdue" statuses)

### Tracking System

Users can track applications using tracking codes (format varies). The public [Tracking](frontend/src/pages/Tracking.js) page allows anonymous status checks without login.

## Common Development Patterns

### Querying Supabase

**Select with filters**:
```javascript
const { data, error } = await supabase
  .from('Requests')
  .select('*, Owners(fullname, email), "Document Categories"(category_name)')
  .eq('status', 'Pending')
  .order('created_at', { ascending: false });
```

**Insert**:
```javascript
const { data, error } = await supabase
  .from('Requests')
  .insert([{ owner_id, category_id, tracking_code, status: 'Pending' }])
  .select();
```

**Update**:
```javascript
const { data, error } = await supabase
  .from('Requests')
  .update({ status: newStatus, processed_by: adminId })
  .eq('request_id', requestId)
  .select();
```

Always check for `error` after Supabase operations and handle appropriately.

### Frontend API Calls

Frontend components use axios to call backend APIs:
```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:3000/api/request/submit', {
  owner_id: ownerId,
  category_id: categoryId,
  form_data: formValues
});
```

**CORS Note**: If adding new domains, update the CORS origin array in [server.js:11-14](backend/server.js#L11-L14).

## Database Modification Guidelines

When modifying the schema:
1. Update [backend/database.sql](backend/database.sql) with the new structure
2. Apply changes to the Supabase database via Supabase Dashboard or migrations
3. Update relevant API endpoints in [server.js](backend/server.js)
4. Update frontend components that interact with changed tables

**Note**: The database.sql file is for reference/documentation - it cannot be run directly due to table ordering and constraint dependencies.

## Known Limitations & Considerations

- **No automated tests**: Consider adding test coverage for API endpoints and React components
- **Monolithic backend**: The 4600+ line server.js file may benefit from modularization (routes, controllers, models)
- **Client-side session management**: No server-side session validation or JWT tokens
- **No request rate limiting**: Consider adding rate limiting for production
- **File storage**: Files currently in memory - review storage strategy for production scale
- **No database migrations**: Schema changes require manual coordination between database.sql and Supabase
- **Over-the-counter payments only**: System does not support online payment proof uploads or deadlines
- **Frontend needs updates**: After database simplification, frontend components still reference removed fields (see DATABASE_MIGRATION_GUIDE.md)

## Adding New Features

### Adding a New Admin Page
1. Create component in [frontend/src/mainadminpage/](frontend/src/mainadminpage/)
2. Add route in [frontend/src/App.js](frontend/src/App.js) (around line 60-78)
3. Add navigation link to [frontend/src/includes/MainSideBar.js](frontend/src/includes/MainSideBar.js)
4. Add API endpoints in [backend/server.js](backend/server.js)

### Adding a New API Endpoint
1. Add Express route in [backend/server.js](backend/server.js)
2. Follow existing patterns for error handling and response format
3. Add notification triggers if the action affects other users
4. Consider adding activity logging for audit purposes

### Adding New Form Field Types
The system supports: text, textarea, number, date, email, select, radio, checkbox. To add new types:
1. Update form rendering logic in form components ([UserForms.js](frontend/src/userpages/UserForms.js))
2. Update validation in backend submission handler
3. Document the new field type for admin users

## Database Migration (Recent Changes)

**Major Database Simplification Completed**: The system has been migrated from online payment processing to **over-the-counter payment model**.

**Key Changes**:
- Removed 4 tables: System_Settings, SLA_Breaches, Notification_Templates, Blacklist
- Simplified Payments table: Removed 15+ fields related to online payments, deadlines, proof uploads
- Simplified Requests table: Removed 5 fields (SLA tracking, payment verification timestamps)
- Consolidated admin tracking: `created_by` and `verified_by` merged into `processed_by`

**Migration Status**:
- ✅ Database schema updated ([backend/database.sql](backend/database.sql))
- ✅ Backend API endpoints updated ([backend/server.js](backend/server.js))
- ⏳ Frontend components need updates (7 files reference removed fields)

**See [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)** for complete details on what changed and what frontend updates are still needed.

## Payment System Architecture

**Payment Model**: Over-the-counter only (no online payments)

**Payment Fields** (simplified):
- `payment_id`, `request_id`, `reference_number`, `amount`, `status`
- `payment_type`, `description`, `payment_method`, `payment_date`
- `processed_by` (replaces created_by and verified_by)
- `remarks`, `receipt_number`, `created_at`, `updated_at`

**Removed Fields**:
- No payment proofs (`proof_payment`)
- No receiver details (`receiver_name`, `receiver_number`, `receiver_account`)
- No sender information (`sender_number`)
- No deadlines (`payment_deadline`, `reminded_at`, etc.)

**Payment API Endpoints** (updated):
- `POST /api/payment/add` - Create payment requirement (simplified)
- `GET /api/payment/request/:requestId` - Returns `ProcessedBy` join (not CreatedBy/VerifiedBy)
- `GET /api/payment/all` - Returns `ProcessedBy` join
- `PUT /api/payment/submit-proof/:paymentId` - Records OTC payment with receipt
- `PUT /api/payment/verify/:paymentId` - Uses `processed_by` field
- `PUT /api/payment/update/:paymentId` - Simplified update (no receiver/deadline fields)
