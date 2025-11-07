/**
 * Centralized Route Configuration
 *
 * All application routes are defined here for easy management and updates.
 * Routes use short, less obvious prefixes for security through obscurity.
 *
 * Route Prefixes:
 * - /s/* = System Admin routes
 * - /w/* = Workflow/Processor routes
 * - /p/* = Portal/User routes
 * - /* = Public routes
 */

// ========================================
// PUBLIC ROUTES
// ========================================
export const PUBLIC_ROUTES = {
  HOME: '/',
  HOME_ALT: '/home',
  REQUIREMENTS: '/requirements',
  TRACKING: '/tracking',
  CONTACT: '/contactus',
  ABOUT: '/about',
};

// ========================================
// SYSTEM ADMIN ROUTES (/s/*)
// ========================================
export const SYSTEM_ROUTES = {
  // Authentication
  AUTH: '/s/auth',
  SIGNUP: '/s/signup',
  RECOVER: '/s/recover',

  // Main Pages
  CONSOLE: '/s/console',        // Dashboard
  FILES: '/s/files',            // Documents
  CATEGORIES: '/s/categories',  // Document Categories
  TEMPLATES: '/s/templates',    // Document Forms
  QUEUE: '/s/queue',            // Requests
  LEDGER: '/s/ledger',          // Payments
  RECORDS: '/s/records',        // Transactions
  ROLES: '/s/roles',            // Assign Roles
  STAFF: '/s/staff',            // Admins
  MEMBERS: '/s/members',        // Users
  AUDIT: '/s/audit',            // Login Audits
  CONFIG: '/s/config',          // Settings
};

// ========================================
// WORKFLOW/PROCESSOR ROUTES (/w/*)
// ========================================
export const WORKFLOW_ROUTES = {
  // Authentication
  AUTH: '/w/auth',
  RECOVER: '/w/recover',

  // Main Pages
  HUB: '/w/hub',                // Dashboard
  FILES: '/w/files',            // Documents
  QUEUE: '/w/queue',            // Requests
  LEDGER: '/w/ledger',          // Payments
  RECORDS: '/w/records',        // Transactions
  CONFIG: '/w/config',          // Settings
};

// ========================================
// PORTAL/USER ROUTES (/p/*)
// ========================================
export const PORTAL_ROUTES = {
  // Authentication
  SIGNUP: '/p/signup',
  AUTH: '/p/auth',
  RECOVER: '/p/recover',

  // Main Pages
  HUB: '/p/hub',                // Dashboard
  APPLY: '/p/apply',            // New Application (Checklist)
  RENEW: '/p/renew',            // Renewal
  HISTORY: '/p/history',        // Transactions
  LEDGER: '/p/ledger',          // Payments
  TEMPLATES: '/p/templates',    // Forms
  RESOURCES: '/p/resources',    // Downloadables
  CONFIG: '/p/config',          // Settings
};

// ========================================
// LEGACY ROUTES (For Backwards Compatibility)
// TODO: Remove these after migration is complete
// ========================================
export const LEGACY_ROUTES = {
  // System Admin (Old)
  MAIN_LOGIN: '/oabps/main/login',
  MAIN_REGISTER: '/oabps/main/register',
  MAIN_FORGOT: '/oabps/main/forgot',
  MAIN_DASHBOARD: '/oabps/main/dashboard',
  MAIN_DOCUMENTS: '/oabps/main/documents',
  MAIN_CATEGORY: '/oabps/main/documentcategory',
  MAIN_FORMS: '/oabps/main/documentforms',
  MAIN_REQUESTS: '/oabps/main/requests',
  MAIN_PAYMENTS: '/oabps/main/payments',
  MAIN_TRANSACTIONS: '/oabps/main/transactions',
  MAIN_ASSIGN: '/oabps/main/assign',
  MAIN_ADMINS: '/oabps/main/admins',
  MAIN_USERS: '/oabps/main/users',
  MAIN_AUDITS: '/oabps/main/logaudits',
  MAIN_SETTINGS: '/oabps/main/settings',

  // Processor (Old)
  PROCESSOR_LOGIN: '/oabps/processor/login',
  PROCESSOR_FORGOT: '/oabps/processor/forgot',
  PROCESSOR_DASHBOARD: '/oabps/processor/dashboard',
  PROCESSOR_DOCUMENTS: '/oabps/processor/documents',
  PROCESSOR_REQUESTS: '/oabps/processor/requests',
  PROCESSOR_PAYMENTS: '/oabps/processor/payments',
  PROCESSOR_TRANSACTIONS: '/oabps/processor/transactions',
  PROCESSOR_SETTINGS: '/oabps/processor/settings',

  // User (Old)
  USER_REGISTER: '/oabps/user/register',
  USER_LOGIN: '/oabps/user/login',
  USER_FORGOT: '/oabps/user/forgot',
  USER_DASHBOARD: '/oabps/user/dashboard',
  USER_CHECKLIST: '/oabps/user/checklist',
  USER_RENEWAL: '/oabps/user/renewal',
  USER_TRANSACTION: '/oabps/user/transaction',
  USER_PAYMENTS: '/oabps/user/payments',
  USER_FORMS: '/oabps/user/forms',
  USER_DOWNLOADABLES: '/oabps/user/downloadables',
  USER_SETTINGS: '/oabps/user/settings',
};

// ========================================
// ROUTE MAPPING (Legacy → New)
// ========================================
export const ROUTE_MAP = {
  // System Admin
  [LEGACY_ROUTES.MAIN_LOGIN]: SYSTEM_ROUTES.AUTH,
  [LEGACY_ROUTES.MAIN_REGISTER]: SYSTEM_ROUTES.SIGNUP,
  [LEGACY_ROUTES.MAIN_FORGOT]: SYSTEM_ROUTES.RECOVER,
  [LEGACY_ROUTES.MAIN_DASHBOARD]: SYSTEM_ROUTES.CONSOLE,
  [LEGACY_ROUTES.MAIN_DOCUMENTS]: SYSTEM_ROUTES.FILES,
  [LEGACY_ROUTES.MAIN_CATEGORY]: SYSTEM_ROUTES.CATEGORIES,
  [LEGACY_ROUTES.MAIN_FORMS]: SYSTEM_ROUTES.TEMPLATES,
  [LEGACY_ROUTES.MAIN_REQUESTS]: SYSTEM_ROUTES.QUEUE,
  [LEGACY_ROUTES.MAIN_PAYMENTS]: SYSTEM_ROUTES.LEDGER,
  [LEGACY_ROUTES.MAIN_TRANSACTIONS]: SYSTEM_ROUTES.RECORDS,
  [LEGACY_ROUTES.MAIN_ASSIGN]: SYSTEM_ROUTES.ROLES,
  [LEGACY_ROUTES.MAIN_ADMINS]: SYSTEM_ROUTES.STAFF,
  [LEGACY_ROUTES.MAIN_USERS]: SYSTEM_ROUTES.MEMBERS,
  [LEGACY_ROUTES.MAIN_AUDITS]: SYSTEM_ROUTES.AUDIT,
  [LEGACY_ROUTES.MAIN_SETTINGS]: SYSTEM_ROUTES.CONFIG,

  // Workflow/Processor
  [LEGACY_ROUTES.PROCESSOR_LOGIN]: WORKFLOW_ROUTES.AUTH,
  [LEGACY_ROUTES.PROCESSOR_FORGOT]: WORKFLOW_ROUTES.RECOVER,
  [LEGACY_ROUTES.PROCESSOR_DASHBOARD]: WORKFLOW_ROUTES.HUB,
  [LEGACY_ROUTES.PROCESSOR_DOCUMENTS]: WORKFLOW_ROUTES.FILES,
  [LEGACY_ROUTES.PROCESSOR_REQUESTS]: WORKFLOW_ROUTES.QUEUE,
  [LEGACY_ROUTES.PROCESSOR_PAYMENTS]: WORKFLOW_ROUTES.LEDGER,
  [LEGACY_ROUTES.PROCESSOR_TRANSACTIONS]: WORKFLOW_ROUTES.RECORDS,
  [LEGACY_ROUTES.PROCESSOR_SETTINGS]: WORKFLOW_ROUTES.CONFIG,

  // Portal/User
  [LEGACY_ROUTES.USER_REGISTER]: PORTAL_ROUTES.SIGNUP,
  [LEGACY_ROUTES.USER_LOGIN]: PORTAL_ROUTES.AUTH,
  [LEGACY_ROUTES.USER_FORGOT]: PORTAL_ROUTES.RECOVER,
  [LEGACY_ROUTES.USER_DASHBOARD]: PORTAL_ROUTES.HUB,
  [LEGACY_ROUTES.USER_CHECKLIST]: PORTAL_ROUTES.APPLY,
  [LEGACY_ROUTES.USER_RENEWAL]: PORTAL_ROUTES.RENEW,
  [LEGACY_ROUTES.USER_TRANSACTION]: PORTAL_ROUTES.HISTORY,
  [LEGACY_ROUTES.USER_PAYMENTS]: PORTAL_ROUTES.LEDGER,
  [LEGACY_ROUTES.USER_FORMS]: PORTAL_ROUTES.TEMPLATES,
  [LEGACY_ROUTES.USER_DOWNLOADABLES]: PORTAL_ROUTES.RESOURCES,
  [LEGACY_ROUTES.USER_SETTINGS]: PORTAL_ROUTES.CONFIG,
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get the new route for a legacy route
 * @param {string} legacyRoute - The old route path
 * @returns {string} The new route path
 */
export const getNewRoute = (legacyRoute) => {
  return ROUTE_MAP[legacyRoute] || legacyRoute;
};

/**
 * Check if a route is a system admin route
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isSystemRoute = (path) => {
  return path.startsWith('/s/') || path.startsWith('/oabps/main/');
};

/**
 * Check if a route is a workflow/processor route
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isWorkflowRoute = (path) => {
  return path.startsWith('/w/') || path.startsWith('/oabps/processor/');
};

/**
 * Check if a route is a portal/user route
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isPortalRoute = (path) => {
  return path.startsWith('/p/') || path.startsWith('/oabps/user/');
};

export default {
  PUBLIC_ROUTES,
  SYSTEM_ROUTES,
  WORKFLOW_ROUTES,
  PORTAL_ROUTES,
  LEGACY_ROUTES,
  ROUTE_MAP,
  getNewRoute,
  isSystemRoute,
  isWorkflowRoute,
  isPortalRoute,
};
