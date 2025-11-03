# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OABP (Online Application for Business Permit)** is a full-stack web application for managing business permit applications with three distinct user portals.

**Stack:**
- Frontend: React 19, React Router v7, Bootstrap 5 + Tailwind CSS
- Backend: Express 5, Node.js (CommonJS)
- Database: Supabase (PostgreSQL)
- Auth: JWT with access (24h) and refresh (7d) tokens

**Deployment:**
- Backend: https://oabs-f7by.onrender.com
- Frontend: https://oabp-frontend.onrender.com
- Database: Supabase hosted PostgreSQL

## Development Commands

**Frontend** (in `/frontend`):
```bash
npm start       # Development server on port 3000
npm run build   # Production build
npm test        # Run tests
```

**Backend** (in `/backend`):
```bash
npm start       # Start Express server on port 3000
npm test        # No tests configured
```

## Environment Variables & Deployment

### Backend Environment Variables

**Required Variables:**

Create a `.env` file in the `/backend` directory with the following:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Configuration
JWT_SECRET=your-secret-key-for-access-tokens
JWT_REFRESH_SECRET=your-secret-key-for-refresh-tokens

# Optional - JWT Expiry (defaults shown)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Optional - Port (defaults to 3000)
PORT=3000
```

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the `Project URL` (SUPABASE_URL)
4. Copy the `anon/public` key (SUPABASE_KEY)

**Generating JWT Secrets:**
Use strong random strings for JWT secrets. You can generate them using:
```bash
# In Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use any secure random string generator
```

### Frontend Environment Variables

**Optional Configuration:**

The frontend has the API URL hardcoded in `frontend/src/config/api.js`. If you want to use environment variables instead:

Create a `.env` file in the `/frontend` directory:

```bash
# API Configuration
REACT_APP_API_URL=https://oabs-f7by.onrender.com

# For local development:
# REACT_APP_API_URL=http://localhost:3000
```

**Note:** Currently the API URL is hardcoded in `api.js` and needs manual change. To use the env variable, update `api.js`:
```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'https://oabs-f7by.onrender.com';
```

### Deployment on Render

**Backend Deployment:**

1. **Create Web Service** on Render
2. **Connect Repository** - Link your GitHub repo
3. **Configure Build Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

4. **Add Environment Variables** in Render dashboard:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   JWT_SECRET=your-generated-secret-64-chars
   JWT_REFRESH_SECRET=your-generated-refresh-secret-64-chars
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3000
   ```

5. **Deploy** - Render will automatically deploy your backend

**Frontend Deployment:**

1. **Create Static Site** on Render
2. **Connect Repository** - Link your GitHub repo
3. **Configure Build Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. **Add Environment Variable** (if using env for API URL):
   ```
   REACT_APP_API_URL=https://oabs-f7by.onrender.com
   ```

5. **Update CORS** in backend after getting frontend URL:
   - Edit `backend/server.js` CORS configuration
   - Add your frontend URL to allowed origins:
   ```javascript
   cors({
     origin: [
       "http://localhost:3000",
       "https://oabp-frontend.onrender.com"  // Your frontend URL
     ],
     credentials: true
   })
   ```

6. **Deploy** - Render will build and deploy your frontend

### Deployment Checklist

**Before deploying:**
- [ ] Set up Supabase project and run `database.sql` schema
- [ ] Generate secure JWT secrets (64+ characters recommended)
- [ ] Configure backend environment variables on Render
- [ ] Deploy backend first and verify it's running
- [ ] Update `frontend/src/config/api.js` with production backend URL
- [ ] Add frontend URL to backend CORS configuration
- [ ] Deploy frontend
- [ ] Test authentication flow end-to-end
- [ ] Verify file uploads work (10MB limit)
- [ ] Test all three user portals (Superadmin, Processor, Owner)

**Important Notes:**
- Deploy backend **before** frontend (frontend needs backend URL)
- Update CORS in backend when frontend URL changes
- Keep JWT secrets secure and never commit them to git
- Render free tier may have cold start delays (~30 seconds)
- Database schema should be deployed to Supabase before first backend deployment

## Architecture

### Three-Tier Design

1. **Frontend (React SPA)** - Three separate user portals + public pages
2. **Backend (Express API)** - Monolithic server.js (4426 lines) with all routes
3. **Database (Supabase)** - 12 tables with relational schema

### User Roles & Portals

The application has three distinct user types with separate portals:

1. **Superadmin** (`/oabps/main/**`)
   - Route: `/oabps/main/*`
   - Code: `frontend/src/mainadminpage/`
   - Sidebar: `MainSideBar.js`
   - Storage key: `'mainadmin'`
   - Full system access: manage categories, forms, processors, users, assignments

2. **Processor** (`/oabps/processor/**`)
   - Route: `/oabps/processor/*`
   - Code: `frontend/src/processorpage/`
   - Sidebar: `ProcessorSideBar.js`
   - Storage key: None (uses `'authToken'`)
   - Limited admin: process assigned category requests only

3. **Owner/User** (`/oabps/user/**`)
   - Route: `/oabps/user/*`
   - Code: `frontend/src/userpages/`
   - Sidebar: `UserSideBar.js`
   - Storage key: `'owner'`
   - Business owners: submit applications, upload documents, track status, make payments

4. **Public** (`/`)
   - Code: `frontend/src/homepages/`
   - Header: `Header.js`
   - Pages: Home, About, Requirements, Tracking, Contact Us

### Key Architectural Patterns

**Centralized API Configuration**
- All API endpoints defined in `frontend/src/config/api.js`
- Base URL: `API_URL` constant (production: Render, local: localhost:3000)
- Endpoint paths in `API_ENDPOINTS` object
- When adding new API routes, ALWAYS update this file

**Authentication Flow**
- JWT stored in localStorage as `'authToken'`
- User data stored per role: `'mainadmin'` or `'owner'`
- Middleware chain: `authenticateToken` → role-specific (requireSuperadmin, requireProcessor, requireOwner, requireAdminOrOwner)
- Location: `backend/middleware/auth.js`, `backend/utils/jwt.js`

**Backend Structure (Monolithic)**
- ALL routes in single file: `backend/server.js` (4426 lines)
- Pattern: route handler inline, no separate controllers/services
- When adding routes: add inline to server.js, then update frontend's api.js

**Database Schema (12 tables)**
- Schema file: `backend/database.sql`
- Key relationships:
  - Admins (Superadmin/Processor) → Assigned Roles → Document Categories
  - Owners → Requests → Request Form Data + Attachments
  - Requests → Payments
  - Document Categories → Form Field Groups → Document Forms → Form Field Options

**Request Workflow**
- Status flow: `Pending` → `Under Review` → `Approved`/`Rejected`/`Completed`
- Cancellable by owner when Pending
- Each request has unique tracking code
- Processors only see requests for their assigned categories

## Dynamic Form System

The application includes a flexible form builder:

**Form Field Types** (8 types):
- TEXT, TEXTAREA, NUMBER, FILE, DATE, EMAIL
- SELECT, RADIO, CHECKBOX (with options in separate table)

**Form Structure:**
1. **Document Categories** - Top level (e.g., "Business Permit", "Health Permit")
2. **Form Field Groups** - Group related fields (e.g., "Business Information", "Owner Details")
3. **Document Forms** - Individual fields with validation rules
4. **Form Field Options** - Options for select/radio/checkbox fields

**Form Submission:**
- User fills dynamic form → stored in `Request Form Data` table
- Files uploaded separately → `Request Attachments` table (10MB limit via multer)
- Both linked to parent `Requests` entry

**When modifying forms:**
- Changes to form definitions affect NEW submissions only
- Existing submissions retain original form data structure
- Be careful with field deletions - historical data may reference them

## File Structure

```
oabp/
├── frontend/src/
│   ├── config/api.js              # API configuration - UPDATE WHEN ADDING ROUTES
│   ├── includes/                  # Shared components (sidebars, header)
│   ├── homepages/                 # Public pages (5 pages)
│   ├── mainadminpage/             # Superadmin portal (12 pages)
│   ├── processorpage/             # Processor portal (6 pages)
│   ├── userpages/                 # Owner portal (9 pages)
│   └── App.js                     # Route configuration
│
└── backend/
    ├── server.js                  # ALL API ROUTES (4426 lines)
    ├── middleware/auth.js         # Authentication middleware
    ├── utils/jwt.js               # JWT token utilities
    └── database.sql               # Complete database schema
```

## Common Development Patterns

**Adding a New Feature (Typical Flow):**
1. Update database schema if needed (run in Supabase SQL editor)
2. Add API routes to `backend/server.js` (inline handlers)
3. Add endpoint paths to `frontend/src/config/api.js` in `API_ENDPOINTS`
4. Create/update components in appropriate portal directory
5. Test with appropriate user role

**API Request Pattern:**
```javascript
// Frontend component
import axios from 'axios';
import { API_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

const response = await axios.get(
  `${API_URL}${API_ENDPOINTS.CATEGORY.ALL}`,
  { headers: getAuthHeaders() }
);
```

**Backend Route Pattern:**
```javascript
// In server.js
app.get('/api/category/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('Document Categories').select('*');
    if (error) throw error;
    res.json({ success: true, categories: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## Authentication & Authorization

**Middleware Chain:**
- `authenticateToken` - Verifies JWT token is valid
- `requireSuperadmin` - Checks userType=Admin AND role=Superadmin
- `requireProcessor` - Checks userType=Admin AND role=Processor
- `requireAdmin` - Checks userType=Admin (any role)
- `requireOwner` - Checks userType=Owner
- `requireAdminOrOwner` - Checks either Admin or Owner of resource

**Token Payload:**
```javascript
{
  userId: <id>,
  userType: 'Admin' | 'Owner',
  role: 'Superadmin' | 'Processor',  // Only for Admin userType
  email: <email>
}
```

**Protected Route Example:**
```javascript
app.get('/api/admin/all', authenticateToken, requireSuperadmin, handler);
app.get('/api/request/owner/:ownerId', authenticateToken, requireAdminOrOwner, handler);
```

## State Management

**No Redux/Context API** - Simple localStorage + component state:
- `localStorage.getItem('authToken')` - JWT token
- `localStorage.getItem('mainadmin')` - Superadmin user object
- `localStorage.getItem('owner')` - Owner user object
- Component-level useState for UI state

**Session Persistence:**
- Check localStorage on page load
- Redirect to login if missing
- Token automatically included in headers via getAuthHeaders()

## Styling Approach

**Mixed styling system:**
- Bootstrap 5 classes for layout/components
- Tailwind CSS for utility classes
- Custom CSS in `frontend/src/style.css`

**When adding styles:**
- Prefer Bootstrap classes for existing components
- Use Tailwind for quick utilities (spacing, colors)
- Add custom CSS only when necessary

## File Uploads

**Configuration (backend):**
- Multer with memory storage (not disk)
- 10MB file size limit
- Files typically converted to base64 or forwarded to storage
- Location: Configured inline in server.js multer setup

**Common upload scenarios:**
- Request attachments (proof of documents)
- Payment proof uploads
- Profile images

## Important Notes

**Backend Monolith:**
- The entire backend is in `server.js` (4426 lines)
- No service layer, no controllers - all inline
- When reading backend code, CMD+F in server.js for route paths
- Consider modularizing if adding major features

**Supabase Direct Access:**
- Backend uses Supabase client directly (no ORM)
- Raw SQL-like queries: `supabase.from('Table').select('*')`
- Foreign key relationships enforced at database level
- Refer to database.sql for table structure

**No TypeScript:**
- Pure JavaScript throughout
- No type checking - validate inputs carefully
- PropTypes not used

**Deployed Backend First:**
- Frontend points to production backend by default
- To use local backend: change API_URL in frontend/src/config/api.js
- Backend on Render must be updated before frontend changes that depend on new routes

## Database Relationships

Key foreign keys to remember:
- `Assigned Roles.admin_id` → `Admins.admin_id`
- `Assigned Roles.category_id` → `Document Categories.category_id`
- `Document Forms.category_id` → `Document Categories.category_id`
- `Requests.owner_id` → `Owners.owner_id`
- `Requests.category_id` → `Document Categories.category_id`
- `Request Form Data.request_id` → `Requests.request_id`
- `Request Attachments.request_id` → `Requests.request_id`
- `Payments.request_id` → `Requests.request_id`

## Testing

- No test suite currently configured
- Backend package.json has placeholder test script
- Frontend has React Testing Library installed but no tests written
- Manual testing required for all changes
