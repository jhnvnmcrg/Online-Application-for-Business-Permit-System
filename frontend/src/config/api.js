/**
 * Centralized API Configuration
 *
 * This file contains the API base URL and helper functions for making API requests.
 * Update REACT_APP_API_URL in .env file to change the API endpoint.
 */

// API Base URL - Use production backend
// IMPORTANT: The backend on Render must have the new auth routes deployed first!
export const API_URL = 'https://oabs-f7by.onrender.com';
// For local backend: export const API_URL = 'http://localhost:3000';

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    MAIN_LOGIN: '/api/main/login',
    MAIN_REGISTER: '/api/main/register',
    MAIN_FORGOT_PASSWORD: '/api/main/forgot-password',
    MAIN_RESET_PASSWORD: '/api/main/reset-password',
    MAIN_VERIFY_EMAIL: '/api/main/verify-email',

    USER_LOGIN: '/api/user/login',
    USER_REGISTER: '/api/user/register',
    USER_FORGOT_PASSWORD: '/api/user/forgot-password',
    USER_RESET_PASSWORD: '/api/user/reset-password',
    USER_VERIFY_EMAIL: '/api/user/verify-email',

    PROCESSOR_LOGIN: '/api/processor/login',
    PROCESSOR_FORGOT_PASSWORD: '/api/processor/forgot-password',
    PROCESSOR_RESET_PASSWORD: '/api/processor/reset-password',

    REFRESH_TOKEN: '/api/auth/refresh-token',
  },

  // Admin endpoints
  ADMIN: {
    ALL: '/api/admin/all',
    UPDATE: (id) => `/api/admin/update/${id}`,
    DELETE: (id) => `/api/admin/delete/${id}`,
  },

  // Owner endpoints
  OWNER: {
    ALL: '/api/owners/all',
    UPDATE_PROFILE: (id) => `/api/user/update-profile/${id}`,
    CHANGE_PASSWORD: (id) => `/api/user/change-password/${id}`,
  },

  // Category endpoints
  CATEGORY: {
    ADD: '/api/category/add',
    ALL: '/api/category/all',
    UPDATE: (id) => `/api/category/update/${id}`,
    DELETE: (id) => `/api/category/delete/${id}`,
  },

  // Document endpoints
  DOCUMENT: {
    ADD: '/api/document/add',
    ALL: '/api/document/all',
    UPDATE: (id) => `/api/document/update/${id}`,
    DELETE: (id) => `/api/document/delete/${id}`,
  },

  // Form endpoints
  FORM: {
    ADD: '/api/form/add',
    ALL: '/api/form/all',
    BY_CATEGORY: (categoryId) => `/api/form/category/${categoryId}`,
    UPDATE: (id) => `/api/form/update/${id}`,
    DELETE: (id) => `/api/form/delete/${id}`,
  },

  // Request endpoints
  REQUEST: {
    ADD: '/api/request/add',
    ALL: '/api/request/all',
    BY_OWNER: (ownerId) => `/api/request/owner/${ownerId}`,
    BY_PROCESSOR: (processorId) => `/api/request/processor/${processorId}`,
    DETAILS: (requestId) => `/api/request/details/${requestId}`,
    UPDATE_STATUS: (requestId) => `/api/request/update-status/${requestId}`,
    CANCEL: (requestId) => `/api/request/cancel/${requestId}`,
    TIMELINE: (requestId) => `/api/request/timeline/${requestId}`,
  },

  // Payment endpoints
  PAYMENT: {
    ADD: '/api/payment/add',
    ALL: '/api/payment/all',
    BY_REQUEST: (requestId) => `/api/payment/request/${requestId}`,
    SUBMIT_PROOF: (paymentId) => `/api/payment/submit-proof/${paymentId}`,
    VERIFY: (paymentId) => `/api/payment/verify/${paymentId}`,
    UPDATE: (paymentId) => `/api/payment/update/${paymentId}`,
    DELETE: (paymentId) => `/api/payment/delete/${paymentId}`,
    HISTORY: (paymentId) => `/api/payment/history/${paymentId}`,
    GENERATE_RECEIPT: '/api/payment/generate-receipt-number',
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN_STATS: '/api/dashboard/admin/stats',
    ADMIN_RECENT_REQUESTS: '/api/dashboard/admin/recent-requests',
    USER_STATS: (ownerId) => `/api/dashboard/user/stats/${ownerId}`,
    USER_RECENT_ACTIVITY: (ownerId) => `/api/dashboard/user/recent-activity/${ownerId}`,
  },

  // Notification endpoints
  NOTIFICATION: {
    GET: (userType, userId) => `/api/notifications/${userType}/${userId}`,
    UNREAD_COUNT: (userType, userId) => `/api/notifications/${userType}/${userId}/unread-count`,
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: (userType, userId) => `/api/notifications/${userType}/${userId}/read-all`,
    DELETE: (notificationId) => `/api/notifications/${notificationId}`,
  },

  // Processor endpoints
  PROCESSOR: {
    ASSIGNED_CATEGORIES: (processorId) => `/api/processor/assigned-categories/${processorId}`,
  },
};

export default API_URL;
