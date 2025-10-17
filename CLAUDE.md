# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online Application for Business Permit System (OABP) - A full-stack web application for managing business permit applications and renewals. The system serves two user types: business owners and administrators.

## Technology Stack

**Backend:**
- Node.js with Express.js
- Supabase (PostgreSQL database)
- bcrypt for password hashing
- CORS enabled for cross-origin requests

**Frontend:**
- React 19.1.0 with React Router DOM
- Bootstrap 5.3.6 with custom CSS
- Lucide React for icons
- Axios for API calls

## Development Commands

### Backend
```bash
cd backend
npm install
npm start          # Starts server on port 3000 (or PORT env variable)
```

### Frontend
```bash
cd frontend
npm install
npm start          # Starts React dev server on http://localhost:3000
npm run build      # Production build
npm test           # Run tests
```

## Architecture

### Backend Structure (`backend/`)
- **server.js** - Main Express server with authentication endpoints
- **testserver.js** - Test/development server
- **.env** - Environment variables (SUPABASE_URL, SUPABASE_KEY, PORT)

**Key API Endpoint Groups:**
- **Admin/Superadmin:** `/api/main/*` - register, login, forgot-password
- **Processor:** `/api/processor/*` - login, forgot-password, assigned-categories/:adminId, documents/:adminId
- **Business Owner:** `/api/user/*` - register, login, forgot-password
- **Admin Management:** `/api/admin/*` - all, update/:id, delete/:id
- **Categories:** `/api/category/*` - add, all, update/:id, delete/:id
- **Documents:** `/api/document/*` - add (with file upload), all, update/:id, delete/:id
- **Form Fields:** `/api/form/*` - add, all, update/:id, delete/:id
- **Field Groups:** `/api/group/*` - add, all, update/:id, delete/:id
- **Field Options:** `/api/option/*` - add, all, by-field/:formId, update/:id, delete/:id
- **Assignments:** `/api/assignment/*` - add, all, update/:id, delete/:id
- **Audit Logs:** `/api/audit/*` - all, login

All endpoints return JSON with `{success: boolean, message?: string, error?: string}` structure.

### Frontend Structure (`frontend/src/`)

**Entry Points:**
- **index.js** - React app root with Bootstrap imports
- **App.js** - Route definitions using React Router

**User Roles & Portals:**

1. **Public Pages** (`pages/`)
   - Home, Requirements, Tracking, ContactUs, About
   - Accessible without authentication

2. **Business Owner Portal** (`userpages/`)
   - Components: UserLogin, UserRegister, UserForgot
   - Main pages: UserDashboard, UserChecklist, UserRenewal, UserTransaction, UserForms, UserDownloadables
   - Routes: `/oabps/user/*`

3. **Admin Portal (Superadmin)** (`mainadminpage/`)
   - Components: MainLogin, MainRegister, MainForgot
   - Main pages: MainDashboard, MainDocuments, MainDocCategory, MainDocForms, MainRequests, MainPayments, MainTransactions, MainAssign, MainAdmins, MainUsers, MainLogAudits
   - Routes: `/oabps/main/*`
   - Full system control including user management and role assignments

4. **Processor Portal** (`processorpage/`)
   - Components: ProcessorLogin, ProcessorForgot
   - Main pages: ProcessorDashboard, ProcessorDocuments, ProcessorRequests, ProcessorPayments, ProcessorTransactions
   - Routes: `/oabps/processor/*`
   - Limited-access admin role assigned to specific document categories

**Shared Components** (`includes/`)
- **UserSideBar** - Navigation for business owner portal
- **MainSideBar** - Navigation for superadmin portal
- **ProcessorSideBar** - Navigation for processor portal
- **Header** - Public site header
- **UserTopBar** - Business owner top bar

### Database Schema (Supabase)

**Core Tables:**
- **Admins** - Admin/processor users (admin_id, fullname, email, username, password, role, status, created_at)
  - role: "Superadmin" or "Processor"
  - status: "active" or "inactive"
- **Owners** - Business owners (owner_id, fullname, email, username, password, created_at)
- **Document Categories** - Business permit types (category_id, category_name, description, created_at)
- **Documents** - Uploaded document files (document_id, category_id, document_name, document_path, description, created_by, created_at)
- **Document Forms** - Dynamic form fields for categories (form_id, category_id, field_name, field_type, is_required, field_order, placeholder, default_value, group_id, validation_rule, field_width)
- **Form Field Groups** - Grouping for form fields (group_id, category_id, group_name, group_order)
- **Form Field Options** - Select dropdown options (option_id, form_id, option_value, option_order)
- **Assigned Roles** - Processor-to-category assignments (assignment_id, admin_id, category_id, created_at)
- **Login Audits** - Login attempt logs (audit_id, admin_id, status, login_datetime)

### Authentication Flow

**Three-Role System:**
1. **Business Owners** (Owners table) - Apply for permits, track applications
2. **Processors** (Admins table, role="Processor") - Limited admin access to assigned document categories
3. **Superadmin** (Admins table, role="Superadmin") - Full system control

**Login Process:**
1. User credentials sent to backend API (`/api/main/login`, `/api/processor/login`, or `/api/user/login`)
2. Backend queries Supabase by username or email
3. bcrypt compares hashed password
4. Processor login validates role="Processor" and status="active"
5. Simple base64 token generated: `Buffer.from(${user.id}:${Date.now()}).toString("base64")`
6. Token and user data stored in localStorage
7. Frontend redirects to appropriate dashboard
8. Login attempts logged to Login Audits table (for admin/processor only)

**Note:** Current token implementation is basic. Consider upgrading to JWT for production.

### File Upload System

- **multer** configured for memory storage (10MB limit)
- Uploaded files stored in **Supabase Storage** bucket named "documents"
- File naming: `${Date.now()}-${Math.random()}.${extension}`
- File path stored in Documents table with public URL
- Document deletion also removes file from storage

## Environment Setup

### Backend `.env` file required:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
```

### Frontend API Configuration
API base URL is hardcoded in components:
- Production: `https://oabs-f7by.onrender.com`
- Local: `http://localhost:3000`

When developing locally, update API URLs in login/register components to point to local backend.

## Key Development Patterns

**Component Structure:**
- Most pages use layout components (UserSideBar, MainSideBar) as wrappers
- Children prop pattern for content injection
- useState for local state, useNavigate for routing, useLocation for active states

**API Calls:**
- Axios with async/await
- Error handling with try/catch
- Loading states tracked with useState
- Errors displayed to user via state

**Styling:**
- Bootstrap classes for layout and components
- Custom CSS in `style.css` and `App.css`
- Responsive design with Bootstrap grid system
- Lucide React icons throughout

## Common Development Tasks

**Adding a new admin/superadmin feature:**
1. Create component in `frontend/src/mainadminpage/`
2. Add route in [App.js](frontend/src/App.js) under `/oabps/main/*`
3. Add menu item in [MainSideBar.js](frontend/src/includes/MainSideBar.js)
4. Create corresponding backend API endpoint in [server.js](backend/server.js)

**Adding a new processor feature:**
1. Create component in `frontend/src/processorpage/`
2. Add route in [App.js](frontend/src/App.js) under `/oabps/processor/*`
3. Add menu item in [ProcessorSideBar.js](frontend/src/includes/ProcessorSideBar.js)
4. Create corresponding backend API endpoint in [server.js](backend/server.js)

**Adding a new user portal feature:**
1. Create component in `frontend/src/userpages/`
2. Add route in [App.js](frontend/src/App.js) under `/oabps/user/*`
3. Add navigation link in [UserSideBar.js](frontend/src/includes/UserSideBar.js)
4. Create corresponding backend API endpoint if needed

**Creating a dynamic form for a document category:**
1. Superadmin creates category via MainDocCategory page
2. Superadmin defines form fields via MainDocForms page
   - Field types: TEXT, TEXTAREA, NUMBER, DATE, SELECT, FILE
   - Configure field order, validation, width (Bootstrap columns)
   - Group related fields with Form Field Groups
   - Add options for SELECT fields
3. Form fields render dynamically based on category_id
4. User submissions stored with form data

**Modifying authentication:**
- Backend logic in [server.js](backend/server.js) (endpoints: `/api/main/login`, `/api/processor/login`, `/api/user/login`)
- Frontend login components: [UserLogin.js](frontend/src/userpages/components/UserLogin.js), [ProcessorLogin.js](frontend/src/processorpage/components/ProcessorLogin.js), [MainLogin.js](frontend/src/mainadminpage/components/MainLogin.js)
- Registration components: [UserRegister.js](frontend/src/userpages/components/UserRegister.js), [MainRegister.js](frontend/src/mainadminpage/components/MainRegister.js)

**Working with file uploads:**
- Backend uses multer middleware: `upload.single("document")`
- Files stored in Supabase Storage bucket "documents"
- Example endpoint: `POST /api/document/add` in [server.js](backend/server.js)
- Frontend uses FormData with axios for multipart uploads
