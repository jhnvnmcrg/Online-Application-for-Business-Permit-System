# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OABP (Online Application for Business Permit) is a document management and business permit tracking system with role-based access control. The system allows business owners to submit permit applications, track their status, and make payments, while administrators manage the workflow and process requests.

## Tech Stack

**Backend:**
- Node.js/Express (CommonJS)
- Supabase (PostgreSQL database)
- JWT authentication with bcrypt password hashing
- Multer for file uploads (memory storage, 10MB limit)

**Frontend:**
- React 19 with React Router DOM
- TailwindCSS + Bootstrap for styling
- Axios for API requests
- Authentication via localStorage

## Repository Structure

```
oabp/
├── backend/
│   ├── server.js           # Monolithic API server (4480 lines, all endpoints)
│   ├── database.sql        # Database schema reference
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   └── utils/
│       └── jwt.js         # JWT token utilities
└── frontend/
    └── src/
        ├── config/
        │   └── api.js     # Centralized API configuration
        ├── homepages/     # Public landing pages
        ├── mainadminpage/ # Superadmin dashboard & components
        ├── processorpage/ # Processor dashboard & components
        └── userpages/     # Business owner dashboard & components
```

## Development Commands

**Backend:**
```bash
cd backend
npm start              # Runs server.js on port 3000
```

**Frontend:**
```bash
cd frontend
npm start              # Starts React dev server on port 3000
npm run build          # Creates production build
npm test               # Runs React tests
```

**Note:** Backend runs on port 3000 by default. You may need to adjust the frontend dev server port to avoid conflicts.

## Architecture

### User Roles & Access Levels

The system has three distinct user types with separate authentication flows:

1. **Superadmin** (role: 'Superadmin' in Admins table)
   - Full system access
   - Manages document categories, forms, processors, and assignments
   - Routes: `/oabps/main/*`

2. **Processor** (role: 'Processor' in Admins table)
   - Assigned to specific document categories
   - Processes requests for assigned categories
   - Routes: `/oabps/processor/*`

3. **Owner** (business owners, stored in Owners table)
   - Submits document requests
   - Tracks applications and makes payments
   - Routes: `/oabps/user/*`

### Authentication Flow

- JWT tokens are generated on login and stored in `localStorage` (key: `authToken`)
- Tokens include `userId`, `userType` ('Admin' or 'Owner'), and `role` (for Admins)
- Backend middleware in [backend/middleware/auth.js](backend/middleware/auth.js) provides:
  - `authenticateToken`: Verifies JWT
  - `requireSuperadmin`: Restricts to Superadmins only
  - `requireProcessor`: Restricts to Processors only
  - `requireOwner`: Restricts to Owners only
  - `requireAdminOrOwner`: Allows Admins or resource owner

### API Architecture

All API endpoints are defined in [backend/server.js](backend/server.js) (single monolithic file). Key endpoint groups:

- `/api/main/*` - Superadmin authentication and management
- `/api/processor/*` - Processor authentication and operations
- `/api/user/*` - Owner authentication and profile management
- `/api/category/*` - Document category management
- `/api/document/*` - Document library management
- `/api/form/*` - Dynamic form builder (fields, groups, options)
- `/api/request/*` - Document request submission and tracking
- `/api/payment/*` - Payment processing and verification
- `/api/assignment/*` - Processor-to-category assignments
- `/api/audit/*` - Login audit logs
- `/api/dashboard/*` - Dashboard statistics

### Frontend API Configuration

The API base URL is hardcoded in [frontend/src/config/api.js](frontend/src/config/api.js):
- Production: `https://oabs-f7by.onrender.com`
- Local development: `http://localhost:3000` (commented out)

To switch between environments, edit the `API_URL` export in this file.

### Database Schema

Key tables and their relationships:

- **Admins**: Superadmins and Processors (with role column)
- **Owners**: Business owners/end users
- **Document Categories**: Types of permits/documents (e.g., Business Permit, Renewal)
- **Document Forms**: Dynamic form fields for each category
- **Form Field Groups**: Logical grouping of form fields
- **Form Field Options**: Select/radio/checkbox options
- **Documents**: Document library with file paths
- **Requests**: User-submitted applications with tracking codes
- **Request Form Data**: Captured form field values for each request
- **Request Attachments**: Files attached during processing
- **Payments**: Payment tracking with reference numbers and receipts
- **Assigned Roles**: Links Processors to specific Document Categories
- **Login Audits**: Tracks login attempts for both Admins and Owners

Request status workflow: `Pending → Under Review → Approved/Rejected → Completed` (or `Cancelled`)

### File Upload Handling

Files are uploaded using `multer` with memory storage:
- Uploaded to Supabase Storage
- 10MB size limit per file
- Single file endpoint: `upload.single('fieldName')`
- Multiple files endpoint: `upload.any()`
- File paths stored in database, actual files in Supabase Storage buckets

## Key Development Patterns

### Adding a New API Endpoint

Add directly to [backend/server.js](backend/server.js):
```javascript
app.post("/api/your-endpoint", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("TableName")
      .insert([req.body]);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

### Adding Authentication to an Endpoint

Import middleware and apply:
```javascript
const { authenticateToken, requireSuperadmin } = require('./middleware/auth');

app.post("/api/admin/action", authenticateToken, requireSuperadmin, async (req, res) => {
  // req.user contains decoded JWT payload
});
```

### Frontend API Calls

Use the centralized API configuration:
```javascript
import { API_URL, getAuthHeaders } from '../config/api';
import axios from 'axios';

const response = await axios.get(`${API_URL}/api/endpoint`, {
  headers: getAuthHeaders()
});
```

### Dynamic Form System

Document requests use a dynamic form builder:
1. Define fields in `Document Forms` table for a category
2. Optionally group fields using `Form Field Groups`
3. For SELECT/RADIO/CHECKBOX fields, define options in `Form Field Options`
4. Frontend fetches form structure via `/api/request/form-fields/:categoryId`
5. User input is saved to `Request Form Data` table

## Environment Variables

**Backend (.env):**
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-anon-key>
PORT=3000
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<your-refresh-secret>
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:3000
```

**Important:** The backend `.env` file is tracked in git. In production, ensure secrets are properly secured.

## Deployment

- Backend is deployed to Render: `https://oabs-f7by.onrender.com`
- Frontend is deployed to Render: `https://oabp-frontend.onrender.com`
- CORS is configured in server.js to allow both localhost:3000 and the production frontend URL
