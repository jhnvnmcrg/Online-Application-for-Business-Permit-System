const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require('../utils/emailService');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

/**
 * Enhanced authentication routes with JWT, email verification, and password reset
 *
 * To integrate these routes into your server.js:
 * 1. Add these routes after your existing authentication routes
 * 2. Replace existing login/register endpoints with these enhanced versions
 * 3. Make sure to apply the supabase client reference
 */

module.exports = function(app, supabase) {

  // ==================== ADMIN REGISTRATION WITH EMAIL VERIFICATION ====================
  app.post("/api/main/register", authLimiter, async (req, res) => {
    const { fullname, email, username, password, role } = req.body;

    try {
      // Validation
      if (!fullname || !email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from("Admins")
        .select("email")
        .eq("email", email)
        .single();

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }

      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from("Admins")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already taken"
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Insert new admin
      const { data: newAdmin, error } = await supabase
        .from("Admins")
        .insert([{
          fullname,
          email,
          username,
          password: hashedPassword,
          role: role || 'Superadmin',
          status: 'Inactive', // Inactive until email verified
          email_verified: false,
          verification_token: verificationToken,
          verification_token_expires: verificationExpires.toISOString()
        }])
        .select();

      if (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
          success: false,
          message: "Registration failed"
        });
      }

      // Send verification email
      await sendVerificationEmail(email, fullname, verificationToken, 'Admin');

      // Log successful registration attempt
      await supabase.from("Login Audits").insert([{
        admin_id: newAdmin[0].admin_id,
        user_type: 'Admin',
        status: 'Success',
        login_datetime: new Date().toISOString()
      }]);

      return res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        data: {
          admin_id: newAdmin[0].admin_id,
          fullname: newAdmin[0].fullname,
          email: newAdmin[0].email,
          username: newAdmin[0].username,
          email_verified: false
        }
      });

    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== ADMIN EMAIL VERIFICATION ====================
  app.post("/api/main/verify-email", async (req, res) => {
    const { token } = req.body;

    try {
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token required"
        });
      }

      // Find admin with this token
      const { data: admin, error } = await supabase
        .from("Admins")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (error || !admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification token"
        });
      }

      // Check if token expired
      if (new Date(admin.verification_token_expires) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification token has expired"
        });
      }

      // Update admin to verified
      const { error: updateError } = await supabase
        .from("Admins")
        .update({
          email_verified: true,
          status: 'Active',
          verification_token: null,
          verification_token_expires: null
        })
        .eq("admin_id", admin.admin_id);

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: "Verification failed"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now log in."
      });

    } catch (err) {
      console.error("Verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== ADMIN LOGIN WITH JWT ====================
  app.post("/api/main/login", authLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }

      // Find admin by username
      const { data: admin, error } = await supabase
        .from("Admins")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !admin) {
        // Log failed attempt
        await supabase.from("Login Audits").insert([{
          user_type: 'Admin',
          status: 'Failed',
          login_datetime: new Date().toISOString()
        }]);

        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // Check if email is verified
      if (!admin.email_verified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in"
        });
      }

      // Check if account is active
      if (admin.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive. Please contact administrator."
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        // Log failed attempt
        await supabase.from("Login Audits").insert([{
          admin_id: admin.admin_id,
          user_type: 'Admin',
          status: 'Failed',
          login_datetime: new Date().toISOString()
        }]);

        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        userType: 'Admin'
      });

      const refreshToken = generateRefreshToken({
        userId: admin.admin_id,
        userType: 'Admin'
      });

      // Update last login
      await supabase
        .from("Admins")
        .update({ last_login_at: new Date().toISOString() })
        .eq("admin_id", admin.admin_id);

      // Log successful login
      await supabase.from("Login Audits").insert([{
        admin_id: admin.admin_id,
        user_type: 'Admin',
        status: 'Success',
        login_datetime: new Date().toISOString()
      }]);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          admin_id: admin.admin_id,
          fullname: admin.fullname,
          email: admin.email,
          username: admin.username,
          role: admin.role,
          status: admin.status
        }
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== ADMIN FORGOT PASSWORD ====================
  app.post("/api/main/forgot-password", passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      // Find admin by email
      const { data: admin, error } = await supabase
        .from("Admins")
        .select("*")
        .eq("email", email)
        .single();

      // Always return success even if email doesn't exist (security best practice)
      if (error || !admin) {
        return res.status(200).json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent."
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update admin with reset token
      await supabase
        .from("Admins")
        .update({
          reset_token: resetToken,
          reset_token_expires: resetExpires.toISOString()
        })
        .eq("admin_id", admin.admin_id);

      // Send password reset email
      await sendPasswordResetEmail(email, admin.fullname, resetToken, 'Admin');

      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });

    } catch (err) {
      console.error("Forgot password error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== ADMIN RESET PASSWORD ====================
  app.post("/api/main/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }

      // Find admin with this reset token
      const { data: admin, error } = await supabase
        .from("Admins")
        .select("*")
        .eq("reset_token", token)
        .single();

      if (error || !admin) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }

      // Check if token expired
      if (new Date(admin.reset_token_expires) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Reset token has expired"
        });
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await supabase
        .from("Admins")
        .update({
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null
        })
        .eq("admin_id", admin.admin_id);

      return res.status(200).json({
        success: true,
        message: "Password reset successful! You can now log in with your new password."
      });

    } catch (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== USER/OWNER ROUTES (Similar pattern) ====================

  // USER REGISTRATION WITH EMAIL VERIFICATION
  app.post("/api/user/register", authLimiter, async (req, res) => {
    const {fullname, email, username, password, phone_number, business_name, business_address} = req.body;

    try {
      if (!fullname || !email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be filled"
        });
      }

      // Check existing email
      const { data: existingEmail } = await supabase
        .from("Owners")
        .select("email")
        .eq("email", email)
        .single();

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }

      // Check existing username
      const { data: existingUsername } = await supabase
        .from("Owners")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already taken"
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Insert new owner
      const { data: newOwner, error } = await supabase
        .from("Owners")
        .insert([{
          fullname,
          email,
          username,
          password: hashedPassword,
          phone_number,
          business_name,
          business_address,
          status: 'Inactive',
          email_verified: false,
          verification_token: verificationToken,
          verification_token_expires: verificationExpires.toISOString()
        }])
        .select();

      if (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
          success: false,
          message: "Registration failed"
        });
      }

      // Send verification email
      await sendVerificationEmail(email, fullname, verificationToken, 'Owner');

      return res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        data: {
          owner_id: newOwner[0].owner_id,
          fullname: newOwner[0].fullname,
          email: newOwner[0].email,
          username: newOwner[0].username,
          email_verified: false
        }
      });

    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // USER EMAIL VERIFICATION
  app.post("/api/user/verify-email", async (req, res) => {
    const { token } = req.body;

    try {
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token required"
        });
      }

      const { data: owner, error } = await supabase
        .from("Owners")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (error || !owner) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification token"
        });
      }

      if (new Date(owner.verification_token_expires) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification token has expired"
        });
      }

      await supabase
        .from("Owners")
        .update({
          email_verified: true,
          status: 'Active',
          verification_token: null,
          verification_token_expires: null
        })
        .eq("owner_id", owner.owner_id);

      return res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now log in."
      });

    } catch (err) {
      console.error("Verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // USER LOGIN WITH JWT
  app.post("/api/user/login", authLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }

      const { data: owner, error } = await supabase
        .from("Owners")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !owner) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      if (!owner.email_verified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in"
        });
      }

      if (owner.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive. Please contact administrator."
        });
      }

      const passwordMatch = await bcrypt.compare(password, owner.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: owner.owner_id,
        username: owner.username,
        email: owner.email,
        userType: 'Owner'
      });

      const refreshToken = generateRefreshToken({
        userId: owner.owner_id,
        userType: 'Owner'
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          owner_id: owner.owner_id,
          fullname: owner.fullname,
          email: owner.email,
          username: owner.username,
          phone_number: owner.phone_number,
          business_name: owner.business_name,
          business_address: owner.business_address,
          status: owner.status
        }
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // USER FORGOT PASSWORD
  app.post("/api/user/forgot-password", passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const { data: owner, error } = await supabase
        .from("Owners")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !owner) {
        return res.status(200).json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent."
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await supabase
        .from("Owners")
        .update({
          reset_token: resetToken,
          reset_token_expires: resetExpires.toISOString()
        })
        .eq("owner_id", owner.owner_id);

      await sendPasswordResetEmail(email, owner.fullname, resetToken, 'Owner');

      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });

    } catch (err) {
      console.error("Forgot password error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // USER RESET PASSWORD
  app.post("/api/user/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }

      const { data: owner, error } = await supabase
        .from("Owners")
        .select("*")
        .eq("reset_token", token)
        .single();

      if (error || !owner) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }

      if (new Date(owner.reset_token_expires) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Reset token has expired"
        });
      }

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await supabase
        .from("Owners")
        .update({
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null
        })
        .eq("owner_id", owner.owner_id);

      return res.status(200).json({
        success: true,
        message: "Password reset successful! You can now log in with your new password."
      });

    } catch (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // ==================== TOKEN REFRESH ====================
  app.post("/api/auth/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;

    try {
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token required"
        });
      }

      const { verifyRefreshToken } = require('../utils/jwt');
      const decoded = verifyRefreshToken(refreshToken);

      // Generate new access token
      let newAccessToken;

      if (decoded.userType === 'Admin') {
        const { data: admin } = await supabase
          .from("Admins")
          .select("*")
          .eq("admin_id", decoded.userId)
          .single();

        if (!admin) {
          return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
          });
        }

        newAccessToken = generateAccessToken({
          userId: admin.admin_id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          userType: 'Admin'
        });
      } else if (decoded.userType === 'Owner') {
        const { data: owner } = await supabase
          .from("Owners")
          .select("*")
          .eq("owner_id", decoded.userId)
          .single();

        if (!owner) {
          return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
          });
        }

        newAccessToken = generateAccessToken({
          userId: owner.owner_id,
          username: owner.username,
          email: owner.email,
          userType: 'Owner'
        });
      }

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });

    } catch (err) {
      console.error("Token refresh error:", err);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token"
      });
    }
  });

};
