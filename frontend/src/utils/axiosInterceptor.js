import axios from 'axios';
import { API_URL, getAuthToken, setAuthToken, removeAuthToken } from '../config/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - refresh token on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        removeAuthToken();
        window.location.href = '/oabps/main/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken } = response.data;
        setAuthToken(accessToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = 'Bearer ' + accessToken;

        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeAuthToken();
        localStorage.removeItem('refreshToken');

        // Redirect based on current path
        const currentPath = window.location.pathname;
        if (currentPath.includes('/oabps/user/')) {
          window.location.href = '/oabps/user/login';
        } else if (currentPath.includes('/oabps/processor/')) {
          window.location.href = '/oabps/processor/login';
        } else {
          window.location.href = '/oabps/main/login';
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
