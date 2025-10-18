import axios from 'axios';

// API base URL - Update this to match your backend URL
const API_URL = 'https://oabs-f7by.onrender.com';
// For local development, use: const API_URL = 'http://localhost:3000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => {
    // If response is successful, return it
    return response;
  },
  (error) => {
    // Check if error is due to authentication
    if (error.response) {
      const { status } = error.response;

      // If token expired or invalid (401 or 403)
      if (status === 401 || status === 403) {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('main');
        localStorage.removeItem('mainToken');
        localStorage.removeItem('processor');
        localStorage.removeItem('processorToken');

        // Redirect to appropriate login page based on current path
        const currentPath = window.location.pathname;

        if (currentPath.includes('/oabps/main/')) {
          window.location.href = '/oabps/main/login';
        } else if (currentPath.includes('/oabps/processor/')) {
          window.location.href = '/oabps/processor/login';
        } else if (currentPath.includes('/oabps/user/')) {
          window.location.href = '/oabps/user/login';
        } else {
          // Default to user login
          window.location.href = '/oabps/user/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
