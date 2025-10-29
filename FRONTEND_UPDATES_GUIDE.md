# Frontend Updates Guide - Optional Security Enhancements

## 🎯 Current Status

**Email Notifications:** ✅ **WORK NOW** - No frontend changes needed
**Existing Features:** ✅ **WORK NOW** - No frontend changes needed

**New Security Features:** ⚠️ Need frontend updates to use them

---

## 📊 What Works vs What Doesn't

### ✅ Works Without Frontend Changes

1. **Email Notifications** - Backend sends emails automatically
   - Request status updates → Owner receives email ✅
   - Payment verification → Owner receives email ✅
   - New requests → Admin receives email ✅

2. **Existing Authentication** - Old endpoints still work
   - Login/Register ✅
   - Dashboard access ✅
   - All CRUD operations ✅

3. **Rate Limiting** - Backend protects all endpoints ✅

### ❌ Doesn't Work Without Frontend Changes

1. **Email Verification** - Requires new page
2. **Password Reset via Email** - Requires new page
3. **JWT Token Authentication** - Requires login component updates
4. **Token Refresh** - Requires axios interceptor

---

## 🔧 Frontend Changes Needed (Optional)

### Change 1: Update API URLs (Recommended)

**Current:** Hardcoded in each component
```javascript
// MainLogin.js line 25
const response = await axios.post("https://oabs-f7by.onrender.com/api/main/login", ...);
```

**Updated:** Use centralized config
```javascript
import { API_URL } from '../../config/api';

const response = await axios.post(`${API_URL}/api/main/login`, ...);
```

**Why:** Easier to change API URL (dev/prod)

**Files to update:** ~50 components with API calls

---

### Change 2: Add Email Verification Page (Optional)

**Create:** `frontend/src/pages/VerifyEmail.js`

```javascript
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'admin' or 'owner'

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const endpoint = type === 'admin'
          ? `${API_URL}/api/main/verify-email`
          : `${API_URL}/api/user/verify-email`;

        const response = await axios.post(endpoint, { token });

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    if (token && type) {
      verifyEmail();
    }
  }, [token, type]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ maxWidth: '500px' }}>
        <div className="card-body p-5 text-center">
          {status === 'verifying' && (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4>Verifying your email...</h4>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-success mb-3">
                <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="mb-3">Email Verified!</h4>
              <p className="text-muted mb-4">{message}</p>
              <Link
                to={type === 'admin' ? '/oabps/main/login' : '/oabps/user/login'}
                className="btn btn-primary"
              >
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-danger mb-3">
                <i className="fas fa-times-circle" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="mb-3">Verification Failed</h4>
              <p className="text-muted mb-4">{message}</p>
              <Link
                to={type === 'admin' ? '/oabps/main/register' : '/oabps/user/register'}
                className="btn btn-secondary"
              >
                Back to Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
```

**Add to App.js:**
```javascript
import VerifyEmail from './pages/VerifyEmail';

// In Routes:
<Route path='/verify-email' element={<VerifyEmail/>}></Route>
```

---

### Change 3: Add Password Reset Page (Optional)

**Create:** `frontend/src/pages/ResetPassword.js`

```javascript
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'admin' or 'owner'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = type === 'admin'
        ? `${API_URL}/api/main/reset-password`
        : `${API_URL}/api/user/reset-password`;

      const response = await axios.post(endpoint, {
        token,
        newPassword
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(type === 'admin' ? '/oabps/main/login' : '/oabps/user/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !type) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-lg">
          <div className="card-body p-5 text-center">
            <h4>Invalid Reset Link</h4>
            <p>This password reset link is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-lg">
          <div className="card-body p-5 text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="mb-3">Password Reset Successful!</h4>
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg" style={{ maxWidth: '500px' }}>
        <div className="card-body p-5">
          <h4 className="text-center mb-4">Reset Password</h4>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
```

**Add to App.js:**
```javascript
import ResetPassword from './pages/ResetPassword';

// In Routes:
<Route path='/reset-password' element={<ResetPassword/>}></Route>
```

---

### Change 4: Update Login Components for JWT (Optional)

**Update:** `frontend/src/mainadminpage/components/MainLogin.js`

```javascript
// Add import
import { API_URL, setAuthToken } from '../../../config/api';

// In handleLogin function:
const response = await axios.post(`${API_URL}/api/main/login`, {
  username: username,
  password: password,
});

if (response.data.success) {
  // Check if email verified (NEW)
  if (!response.data.user.email_verified) {
    setError("Please verify your email before logging in. Check your inbox.");
    return;
  }

  // Store JWT tokens (NEW)
  setAuthToken(response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);

  // Store user data
  localStorage.setItem("mainadmin", JSON.stringify(response.data.user));
  localStorage.setItem("userType", "Admin");

  navigate("/oabps/main/dashboard");
}
```

**Similar updates for:**
- `UserLogin.js`
- `ProcessorLogin.js`

---

### Change 5: Update Register Components (Optional)

**Update:** `frontend/src/mainadminpage/components/MainRegister.js`

Add message after registration:
```javascript
if (response.data.success) {
  // Show email verification message
  alert("Registration successful! Please check your email to verify your account.");
  navigate("/oabps/main/login");
}
```

---

### Change 6: Update Forgot Password Components (Optional)

**Update:** `frontend/src/mainadminpage/components/MainForgot.js`

Change endpoint to use new email-based reset:
```javascript
const response = await axios.post(`${API_URL}/api/main/forgot-password`, {
  email: email, // Changed from username to email
});

if (response.data.success) {
  setSuccess("Password reset link has been sent to your email!");
}
```

---

### Change 7: Add Axios Interceptor for Token Refresh (Optional)

**Create:** `frontend/src/utils/axiosInterceptor.js`

```javascript
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
        window.location.href = '/oabps/main/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

**Import in:** `frontend/src/index.js`

```javascript
import './utils/axiosInterceptor'; // Add this line
```

---

## 📋 Summary: What to Update

### Minimum Changes (Recommended)
- [ ] None! Everything works as-is for email notifications

### Recommended Changes (Better UX)
- [ ] Update all API URLs to use centralized config (~50 files)
- [ ] Add "Check your email" message after registration
- [ ] Update forgot password to show email sent message

### Full Security Upgrade (Most Secure)
- [ ] All recommended changes above
- [ ] Create VerifyEmail page
- [ ] Create ResetPassword page
- [ ] Update login components for JWT
- [ ] Add axios interceptor for token refresh
- [ ] Update register components for email verification
- [ ] Update forgot password for email-based reset

---

## 🚀 Deployment Options

### Option A: Deploy Current Frontend (Simplest)
```bash
cd frontend
npm run build
# Deploy to Vercel/Netlify as-is
```

**Result:**
- ✅ Email notifications work
- ✅ All features work
- ❌ No email verification
- ❌ No password reset via email

### Option B: Update Then Deploy (More Secure)
1. Make frontend changes
2. Test locally
3. Deploy

**Result:**
- ✅ Email notifications work
- ✅ Email verification required
- ✅ Password reset via email
- ✅ JWT token security

---

## 💡 Recommendation

**For immediate deployment:**
- Use **Option A** (current frontend)
- Email notifications already work!
- All features functional
- No frontend changes needed

**For long-term security:**
- Plan frontend updates gradually
- Start with centralized API config
- Add email verification pages
- Implement JWT authentication

**Both options work!** Choose based on your timeline.

---

## 🧪 Testing

Current frontend works with:
- ✅ Old authentication endpoints (still active)
- ✅ Email notifications (automatic backend)
- ✅ Rate limiting (backend protection)

New frontend would use:
- ✅ New JWT authentication endpoints
- ✅ Email verification flow
- ✅ Password reset flow

---

**Questions?**
- Current frontend: Works as-is ✅
- Email notifications: Work without frontend changes ✅
- New security features: Need frontend updates (optional)
