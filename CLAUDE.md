# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OABP (Online Application for Business Permits) - A full-stack document processing and permit management system for business owners. The system handles permit applications, document submissions, payments, and status tracking through a multi-role architecture.

## Tech Stack

**Backend** (Express + Supabase):
- Express.js server (CommonJS)
- Supabase for database (PostgreSQL)
- JWT authentication with access/refresh tokens
- bcrypt for password hashing
- Multer for file uploads (memory storage)

**Frontend** (React):
- Create React App (React 19)
- React Router for routing
- Tailwind CSS + Bootstrap for styling
- Axios for API calls
- FontAwesome and Lucide React for icons

## Development Commands

**Backend** (`/backend`):
```bash
npm start              # Start server on PORT 3000 (or env PORT)
```

**Frontend** (`/frontend`):
```bash
npm start              # Dev server on localhost:3000
npm test               # Run tests in watch mode
npm run build          # Production build
```

## Architecture

### Monorepo Structure
```
oabp/
├── backend/
│   ├── server.js              # Main Express server (all routes in one file)
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── utils/jwt.js           # JWT token utilities
│   └── database.sql           # Complete DB schema with indexes
└── frontend/
    └── src/
        ├── config/api.js      # Centralized API config & endpoints
        ├── homepages/         # Public pages (Home, About, Tracking)
        ├── mainadminpage/     # Superadmin dashboard & pages
        ├── processorpage/     # Processor dashboard & pages
        └── userpages/         # Business owner (Owner) pages
```

### Three-Tier Role System

**Role hierarchy and access:**
1. **Superadmin** (`Admins` table, role='Superadmin')
   - Full system access
   - Manages categories, documents, forms, payments
   - Creates processors and assigns categories
   - Views all requests, users, audit logs

2. **Processor** (`Admins` table, role='Processor')
   - Assigned to specific document categories
   - Reviews and processes requests for their categories
   - Verifies payments and uploads documents
   - Limited administrative access

3. **Owner** (`Owners` table)
   - Business owners who submit permit applications
   - Create requests, upload attachments, pay fees
   - Track application status and download approved documents

### Key Architectural Patterns

**Authentication Flow:**
- JWT tokens stored in `localStorage`
- Token passed as `Authorization: Bearer {token}` header
- Backend middleware validates token and extracts `req.user` (contains `userId`, `userType`, `role`)
- 5 middleware functions in [backend/middleware/auth.js](backend/middleware/auth.js): `authenticateToken`, `requireAdmin`, `requireSuperadmin`, `requireProcessor`, `requireOwner`

**API Communication:**
- Frontend uses centralized [frontend/src/config/api.js](frontend/src/config/api.js) for all API calls
- `API_URL` points to production or localhost
- `API_ENDPOINTS` object contains all endpoint paths
- Helper functions: `getAuthToken()`, `setAuthToken()`, `getAuthHeaders()`, `isAuthenticated()`

**Routing Convention:**
- Public pages: `/`, `/home`, `/requirements`, `/tracking`, `/contactus`, `/about`
- Superadmin: `/oabps/main/*` (login, dashboard, documents, requests, payments, etc.)
- Processor: `/oabps/processor/*` (login, dashboard, documents, requests, payments, etc.)
- Owner: `/oabps/user/*` (register, login, dashboard, payments, forms, etc.)

**Database Schema:**
- Core tables: `Admins`, `Owners`, `Document Categories`, `Documents`, `Requests`, `Payments`, `Notifications`
- Foreign keys: Requests link to Owners and Categories; Payments link to Requests
- Dynamic forms: `Document Forms`, `Form Field Groups`, `Form Field Options`, `Request Form Data` tables store configurable form definitions per category
- Full schema in [backend/database.sql](backend/database.sql) with DROP statements safe for Supabase SQL Editor

**Notifications System:**
- Created via `createNotification()` helper in [backend/server.js](backend/server.js)
- Targeted by `userType` (Admin/Processor/Owner) and `userId`
- Triggered on request status changes, payment submissions, assignments

**File Uploads:**
- Multer configured for memory storage (10MB limit)
- Files uploaded as base64 or stored in Supabase storage
- Used for payment proofs and request attachments

## Important Notes

- **Monolithic Backend**: [backend/server.js](backend/server.js) is ~4900 lines with all routes, helpers, and business logic in one file (no route modules or controllers)
- **Rate limiting removed**: Previously had express-rate-limit, now removed (see git commits: "Remove rate limiter middleware completely")
- **CORS Configuration**: Allows origins:
  - `http://localhost:3000` (local development)
  - `https://oabsfront.onrender.com` (production frontend v1)
  - `https://oabp-frontend.onrender.com` (production frontend v2)
  - Credentials enabled with methods: GET, POST, PUT, DELETE, OPTIONS
- **Frontend API URL**: Despite having `.env` file with `REACT_APP_API_URL`, the actual URL is hardcoded in [frontend/src/config/api.js](frontend/src/config/api.js) as `https://oabs-f7by.onrender.com` for production. Change this line directly when switching environments.
- **Backend Port**: Defaults to 3000 if `PORT` env var not set

## Environment Setup

Backend `.env` required variables:
```bash
# Supabase Connection
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key

# Server
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10
```

Frontend `.env` (currently not used, API_URL hardcoded in api.js):
```bash
REACT_APP_API_URL=http://localhost:3000
```
