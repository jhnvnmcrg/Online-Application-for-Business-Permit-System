# Render Deployment Guide

## Backend Deployment (Already deployed at https://oabs-f7by.onrender.com)

### Update Environment Variables on Render

Go to your Render dashboard for the backend service and update these environment variables:

```env
# Database (keep existing)
SUPABASE_URL=https://ndrjlyirnaztsaynspyh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcmpseWlybmF6dHNheW5zcHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2OTY2MzgsImV4cCI6MjA3NDI3MjYzOH0.17NDpIH_zpXwX_F1jZUNG5dox0oH1tMPx7Pa0cLmmn0

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=53d06324f90266aff3c53978d8ba11411f7f1df069bd8762c6dc1efd2dc9205f
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=369b74065fb190db3b167f329a510c407254e72075a84e6d2c37a6846414d794
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=johnivanmacaraeg01@gmail.com
EMAIL_PASSWORD=vcdl ltts gsae hlzw
EMAIL_FROM=OABP System <johnivanmacaraeg01@gmail.com>

# Frontend URL (UPDATE THIS TO YOUR FRONTEND URL ON RENDER)
FRONTEND_URL=https://your-frontend-app.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=10
```

**IMPORTANT:** After deploying the frontend, come back and update `FRONTEND_URL` to your actual frontend URL on Render.

---

## Frontend Deployment

### Step 1: Prepare for Deployment

The frontend is already configured to use the production API URL (`https://oabs-f7by.onrender.com`).

### Step 2: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (or use the existing one)

### Step 3: Configure the Frontend Service

**Build & Deploy Settings:**
```
Name: oabp-frontend (or any name you prefer)
Region: Same as your backend (for better performance)
Branch: main
Root Directory: frontend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npx serve -s build -l $PORT
```

**Environment Variables:**
```
REACT_APP_API_URL=https://oabs-f7by.onrender.com
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://oabp-frontend.onrender.com`

### Step 5: Update Backend FRONTEND_URL

1. Go back to your **backend service** on Render
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your new frontend URL: `https://oabp-frontend.onrender.com`
4. Save changes - this will redeploy the backend

---

## Alternative: Deploy Frontend to Static Site

If you want faster loading and no server needed:

1. Click **"New +"** → **"Static Site"**
2. Connect repository
3. Configure:
   ```
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://oabs-f7by.onrender.com
   ```

---

## After Deployment

### Test Everything:

1. **User Registration:**
   - Go to `/oabps/user/register`
   - Create a new account
   - Check email for verification link
   - Click verification link
   - Should redirect to login

2. **User Login:**
   - Try logging in without verifying email (should fail)
   - Verify email first
   - Login should work with JWT tokens

3. **Admin Registration:**
   - Go to `/oabps/main/register`
   - Create admin account
   - Verify email
   - Login

4. **Password Reset:**
   - Go to forgot password page
   - Enter email
   - Check email for reset link
   - Click link and reset password

5. **Email Notifications:**
   - Submit a request (as Owner)
   - Admin should receive email notification
   - Update request status (as Admin)
   - Owner should receive email notification

---

## Troubleshooting

### If emails aren't sending:

1. Check Render logs for the backend
2. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
3. Make sure Gmail "App Password" is still valid
4. Check `FRONTEND_URL` is set correctly (for email links)

### If registration fails:

1. Check backend logs on Render
2. Verify database migration was run (check Supabase)
3. Test backend endpoint: `https://oabs-f7by.onrender.com/api/user/register`

### If login fails:

1. Make sure email is verified
2. Check browser console for errors
3. Verify JWT tokens are being stored in localStorage

---

## Quick Commands

**To commit and push changes:**
```bash
git add .
git commit -m "Updated frontend for JWT authentication and email notifications"
git push origin main
```

**Render will automatically redeploy** when you push to the main branch.

---

## What's Already Done

✅ Backend has all auth routes (JWT, email verification, password reset)
✅ Frontend uses centralized API configuration
✅ All login components updated for JWT
✅ All register components updated for email verification
✅ All forgot password components updated for email-based reset
✅ Email verification page created
✅ Password reset page created
✅ Axios interceptor for automatic token refresh
✅ Email service configured and working

**All you need to do is deploy!** 🚀
