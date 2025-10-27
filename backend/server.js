const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://oabsfront.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const PORT = process.env.PORT || 3000;

// Configure multer for memory storage (files stored in memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ==================== NOTIFICATION HELPER FUNCTIONS ====================
async function createNotification(userId, userType, type, subject, message, requestId = null, paymentId = null) {
  try {
    // Build notification data with proper foreign keys
    const notificationData = {
      type: type,
      subject: subject,
      message: message,
      request_id: requestId,
      payment_id: paymentId,
      status: 'Pending'
    };

    // Set the appropriate foreign key based on user type
    if (userType === 'Admin') {
      notificationData.admin_id = userId;
      notificationData.owner_id = null;
    } else if (userType === 'User') {
      notificationData.owner_id = userId;
      notificationData.admin_id = null;
    } else {
      console.error('Invalid user type:', userType);
      return null;
    }

    const { data, error } = await supabase
      .from('Notifications')
      .insert([notificationData])
      .select();

    if (error) {
      console.error('Notification creation error:', error);
      return null;
    }

    console.log('✅ Notification created:', data[0].notification_id, 'for', userType, userId);
    return data[0];
  } catch (err) {
    console.error('Notification helper error:', err);
    return null;
  }
}

// Helper to notify admin when user submits a new request
async function notifyAdminNewRequest(requestId, trackingCode, categoryName) {
  // Get all main admins to notify them
  const { data: admins } = await supabase
    .from('Admins')
    .select('admin_id')
    .eq('role', 'Main Admin')
    .eq('status', 'active');

  // Notify all main admins about the new request
  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.admin_id,
        'Admin',
        'Request',
        `New Request - ${trackingCode}`,
        `A new request for ${categoryName} has been submitted and is awaiting review.`,
        requestId,
        null
      );
    }
  }
}

// Helper to notify user when admin updates request status
async function notifyUserStatusChange(requestId, ownerId, trackingCode, newStatus) {
  const statusMessages = {
    'Pending': 'Your request has been received and is pending review.',
    'Under Review': 'Your request is now being reviewed by our team.',
    'Approved': 'Congratulations! Your request has been approved.',
    'Rejected': 'Your request has been rejected. Please check the remarks for details.',
    'Completed': 'Your document is ready! You can now download it from the Downloadables section.',
    'Cancelled': 'Your request has been cancelled.'
  };

  const message = statusMessages[newStatus] || `Your request status has been updated to ${newStatus}.`;

  // Notify the USER (owner) about status change
  await createNotification(
    ownerId,
    'User',
    'Request',
    `Request ${trackingCode} - Status Update`,
    message,
    requestId,
    null
  );
}

// Helper to notify admin when user submits payment proof
async function notifyAdminPaymentSubmitted(paymentId, requestId, trackingCode, amount) {
  // Get all main admins to notify them
  const { data: admins } = await supabase
    .from('Admins')
    .select('admin_id')
    .eq('role', 'Main Admin')
    .eq('status', 'active');

  // Notify all main admins about new payment proof
  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.admin_id,
        'Admin',
        'Payment',
        `Payment Proof Submitted - ${trackingCode}`,
        `New payment proof of ₱${amount.toFixed(2)} submitted for ${trackingCode}. Please review.`,
        requestId,
        paymentId
      );
    }
  }
}

// Helper to notify user about payment status change
async function notifyUserPaymentStatus(paymentId, ownerId, requestId, trackingCode, status, amount) {
  const userMessages = {
    'Pending': `A payment of ₱${amount.toFixed(2)} is required for request ${trackingCode}.`,
    'Submitted': `Your payment proof for request ${trackingCode} has been received and is under review.`,
    'Verified': `Your payment of ₱${amount.toFixed(2)} for request ${trackingCode} has been verified.`,
    'Rejected': `Your payment proof for request ${trackingCode} was rejected. Please resubmit.`
  };

  const message = userMessages[status] || `Payment status updated to ${status}.`;

  // Notify the USER (owner)
  await createNotification(
    ownerId,
    'User',
    'Payment',
    `Payment Update - ${trackingCode}`,
    message,
    requestId,
    paymentId
  );
}

// Register main admin endpoint
app.post("/api/main/register", async (req, res) => {
  try {
    const { fullname, email, username, password, role, status } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("Admins")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("Admins")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const { data, error } = await supabase
      .from("Admins")
      .insert([
        {
          fullname,
          email,
          username,
          password: hashedPassword,
          role: role || "Superadmin",
          status: status || "Active",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create account. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        admin_id: data[0].id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});

// Login main admin endpoint
app.post("/api/main/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find user by username or email and verify role is Superadmin
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .eq("role", "Superadmin")
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Check if account is active
    if (user.status !== "Active") {
      return res.status(401).json({
        success: false,
        error: "Your account is inactive. Please contact the administrator.",
        admin_id: user.admin_id,
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
        admin_id: user.admin_id, // Include admin_id for audit logging
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        admin_id: user.admin_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Main admin (Superadmin) forgot password endpoint
app.post("/api/main/forgot-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Validation
    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Find admin by username or email (any admin can reset, not limited to Superadmin)
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "Admin account not found with this username/email",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { error: updateError } = await supabase
      .from("Admins")
      .update({ password: hashedPassword })
      .eq("admin_id", user.admin_id)
      .select();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Main admin forgot password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during password reset",
    });
  }
});

// Get all admins endpoint
app.get("/api/admin/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Admins")
      .select("admin_id, fullname, email, username, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admins",
      });
    }

    res.status(200).json({
      success: true,
      admins: data,
    });
  } catch (err) {
    console.error("Fetch admins error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching admins",
    });
  }
});

// Update admin endpoint
app.put("/api/admin/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, username, role, status, password } = req.body;

    // Validation
    if (!fullname || !email || !username) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Check if username already exists (excluding current admin)
    const { data: existingUsername } = await supabase
      .from("Admins")
      .select("admin_id")
      .eq("username", username)
      .neq("admin_id", id)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists (excluding current admin)
    const { data: existingEmail } = await supabase
      .from("Admins")
      .select("admin_id")
      .eq("email", email)
      .neq("admin_id", id)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Prepare update data
    const updateData = {
      fullname,
      email,
      username,
    };

    // Only update role if explicitly provided
    if (role) {
      updateData.role = role;
    }

    // Only update status if explicitly provided
    if (status) {
      updateData.status = status;
    }

    // If password is provided, hash it and include in update
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Update admin in database
    const { data, error } = await supabase
      .from("Admins")
      .update(updateData)
      .eq("admin_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update admin. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        admin_id: data[0].admin_id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
        role: data[0].role,
        status: data[0].status,
      },
    });
  } catch (err) {
    console.error("Update admin error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while updating admin",
    });
  }
});

// Delete admin endpoint
app.delete("/api/admin/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete admin from database
    const { data, error } = await supabase
      .from("Admins")
      .delete()
      .eq("admin_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete admin. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting admin",
    });
  }
});

// Register user endpoint
app.post("/api/user/register", async (req, res) => {
  try {
    const { fullname, email, username, password } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("Owners")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("Owners")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const { data, error } = await supabase
      .from("Owners")
      .insert([
        {
          fullname,
          email,
          username,
          password: hashedPassword,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create account. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        owner_id: data[0].id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});

// Login user endpoint
app.post("/api/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find user by username or email
    const { data: user, error } = await supabase
      .from("Owners")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        owner_id: user.owner_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Owner (User) forgot password endpoint
app.post("/api/user/forgot-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Validation
    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Find owner by username or email
    const { data: user, error } = await supabase
      .from("Owners")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "Owner account not found with this username/email",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { error: updateError } = await supabase
      .from("Owners")
      .update({ password: hashedPassword })
      .eq("owner_id", user.owner_id)
      .select();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Owner forgot password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during password reset",
    });
  }
});

// Update user profile endpoint
app.put("/api/user/update-profile/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { fullname, email, phoneNumber, businessName, businessAddress } = req.body;

    // Validation
    if (!fullname || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    // Check if email is already used by another user
    const { data: existingUser } = await supabase
      .from("Owners")
      .select("owner_id")
      .eq("email", email)
      .neq("owner_id", ownerId)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account",
      });
    }

    // Update profile
    const { data, error } = await supabase
      .from("Owners")
      .update({
        fullname: fullname,
        email: email,
        phone_number: phoneNumber || null,
        business_name: businessName || null,
        business_address: businessAddress || null,
      })
      .eq("owner_id", ownerId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return updated user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        owner_id: data[0].owner_id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
        phone_number: data[0].phone_number,
        business_name: data[0].business_name,
        business_address: data[0].business_address,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
    });
  }
});

// Change user password endpoint
app.put("/api/user/change-password/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user
    const { data: user, error: fetchError } = await supabase
      .from("Owners")
      .select("password")
      .eq("owner_id", ownerId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from("Owners")
      .update({ password: hashedPassword })
      .eq("owner_id", ownerId);

    if (updateError) {
      console.error("Supabase error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
});

// Get all owners (for admin view)
app.get("/api/owners/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Owners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch owners",
      });
    }

    res.json({
      success: true,
      owners: data,
    });
  } catch (err) {
    console.error("Get all owners error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching owners",
    });
  }
});

// Login processor endpoint
app.post("/api/processor/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find processor by username or email and verify role is Processor
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .eq("role", "Processor")
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password, or you are not a processor",
      });
    }

    // Check if account is active
    if (user.status !== "Active") {
      return res.status(401).json({
        success: false,
        error: "Your account is inactive. Please contact the administrator.",
        admin_id: user.admin_id,
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
        admin_id: user.admin_id, // Include admin_id for audit logging
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        admin_id: user.admin_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Processor login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Processor forgot password endpoint
app.post("/api/processor/forgot-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    // Validation
    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Find processor by username or email and verify role is Processor
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .eq("role", "Processor")
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: "Processor account not found with this username/email",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { data: updateData, error: updateError } = await supabase
      .from("Admins")
      .update({ password: hashedPassword })
      .eq("admin_id", user.admin_id)
      .select();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Processor forgot password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during password reset",
    });
  }
});

// Add category endpoint
app.post("/api/category/add", async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    // Validation
    if (!categoryName || !description) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are required",
      });
    }

    // Check if category name already exists
    const { data: existingCategory } = await supabase
      .from("Document Categories")
      .select("category_name")
      .eq("category_name", categoryName)
      .single();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Insert category into database
    const { data, error } = await supabase
      .from("Document Categories")
      .insert([
        {
          category_name: categoryName,
          description: description,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add category. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: data[0],
    });
  } catch (err) {
    console.error("Add category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding category",
    });
  }
});

// Get all categories endpoint
app.get("/api/category/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Document Categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }

    res.status(200).json({
      success: true,
      categories: data,
    });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories",
    });
  }
});

// Update category endpoint
app.put("/api/category/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    // Validation
    if (!categoryName || !description) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are required",
      });
    }

    // Check if category name already exists (excluding current category)
    const { data: existingCategory } = await supabase
      .from("Document Categories")
      .select("category_id")
      .eq("category_name", categoryName)
      .neq("category_id", id)
      .single();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Update category in database
    const { data, error } = await supabase
      .from("Document Categories")
      .update({
        category_name: categoryName,
        description: description,
      })
      .eq("category_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update category. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: data[0],
    });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating category",
    });
  }
});

// Delete category endpoint
app.delete("/api/category/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete category from database
    const { data, error } = await supabase
      .from("Document Categories")
      .delete()
      .eq("category_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete category. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting category",
    });
  }
});

// Add document endpoint with file upload
app.post("/api/document/add", upload.single("document"), async (req, res) => {
  try {
    const { categoryId, description, adminId } = req.body;
    const file = req.file;

    // Validation
    if (!categoryId || !description || !adminId || !file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Generate unique filename
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload document. Please try again.",
      });
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Insert document metadata into database
    const { data, error } = await supabase
      .from("Documents")
      .insert([
        {
          category_id: categoryId,
          document_name: file.originalname,
          document_path: publicUrlData.publicUrl,
          description: description,
          created_by: adminId, // Foreign key to Admins table
        },
      ])
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      // Delete uploaded file if database insert fails
      await supabase.storage.from("documents").remove([filePath]);
      return res.status(500).json({
        success: false,
        message: "Failed to add document. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Document added successfully",
      document: data[0],
    });
  } catch (err) {
    console.error("Add document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding document",
    });
  }
});

// Get all documents endpoint
app.get("/api/document/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Documents")
      .select(`
        *,
        Admins (
          username,
          fullname
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents",
      });
    }

    // Transform data to include admin username
    const transformedData = data.map((doc) => ({
      ...doc,
      created_by_name: doc.Admins?.username || doc.Admins?.fullname || "Unknown",
    }));

    res.status(200).json({
      success: true,
      documents: transformedData,
    });
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching documents",
    });
  }
});

// Update document endpoint
app.put("/api/document/update/:id", upload.single("document"), async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, description } = req.body;
    const file = req.file;

    // Validation
    if (!categoryId || !description) {
      return res.status(400).json({
        success: false,
        message: "Category and description are required",
      });
    }

    let documentPath;

    // If new file is uploaded, upload to Supabase Storage
    if (file) {
      // Get old document to delete from storage
      const { data: oldDoc } = await supabase
        .from("Documents")
        .select("document_path")
        .eq("document_id", id)
        .single();

      // Generate unique filename
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload new file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload document. Please try again.",
        });
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      documentPath = publicUrlData.publicUrl;

      // Delete old file from storage if exists
      if (oldDoc && oldDoc.document_path) {
        const oldFilePath = oldDoc.document_path.split("/documents/")[1];
        if (oldFilePath) {
          await supabase.storage.from("documents").remove([`documents/${oldFilePath}`]);
        }
      }
    }

    // Update document in database
    const updateData = {
      category_id: categoryId,
      description: description,
    };

    if (documentPath) {
      updateData.document_path = documentPath;
      if (file) {
        updateData.document_name = file.originalname;
      }
    }

    const { data, error } = await supabase
      .from("Documents")
      .update(updateData)
      .eq("document_id", id)
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update document. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document: data[0],
    });
  } catch (err) {
    console.error("Update document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating document",
    });
  }
});

// Delete document endpoint
app.delete("/api/document/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { documentPath } = req.body;

    // Delete document from database
    const { data, error } = await supabase
      .from("Documents")
      .delete()
      .eq("document_id", id)
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete document. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete file from Supabase Storage
    if (documentPath) {
      const filePath = documentPath.split("/documents/")[1];
      if (filePath) {
        await supabase.storage.from("documents").remove([`documents/${filePath}`]);
      }
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting document",
    });
  }
});


// Add form field endpoint
app.post("/api/form/add", async (req, res) => {
  try {
    const { categoryId, fieldName, fieldType, isRequired, fieldOrder, placeholder, defaultValue, groupId, validationRule, fieldWidth } = req.body;

    // Validation
    if (!categoryId || !fieldName || !fieldType || isRequired === undefined || !fieldOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate field type
    const validFieldTypes = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "FILE"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field type",
      });
    }

    // Insert form field into database
    const { data, error } = await supabase
      .from("Document Forms")
      .insert([
        {
          category_id: categoryId,
          field_name: fieldName,
          field_type: fieldType,
          is_required: isRequired,
          field_order: fieldOrder,
          placeholder: placeholder || null,
          default_value: defaultValue || null,
          group_id: groupId || null,
          validation_rule: validationRule || null,
          field_width: fieldWidth || 12,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add form field. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Form field added successfully",
      formField: data[0],
    });
  } catch (err) {
    console.error("Add form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding form field",
    });
  }
});

// Get all form fields endpoint
app.get("/api/form/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Document Forms")
      .select("*")
      .order("field_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch form fields",
      });
    }

    res.status(200).json({
      success: true,
      formFields: data,
    });
  } catch (err) {
    console.error("Fetch form fields error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching form fields",
    });
  }
});

// Get form fields by category ID (for form preview)
app.get("/api/form/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Fetch form fields for this category
    const { data, error } = await supabase
      .from("Document Forms")
      .select("*")
      .eq("category_id", categoryId)
      .order("field_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch form fields for category",
      });
    }

    // For each field, fetch group info and options if needed
    const formsWithDetails = await Promise.all(
      data.map(async (field) => {
        let groupName = null;

        // Fetch group name if field has a group_id
        if (field.group_id) {
          const { data: groupData } = await supabase
            .from("Form Field Groups")
            .select("group_name")
            .eq("group_id", field.group_id)
            .single();

          if (groupData) {
            groupName = groupData.group_name;
          }
        }

        // Fetch options for select/radio fields
        let options = [];
        if (field.field_type === "select" || field.field_type === "radio") {
          const { data: optionsData } = await supabase
            .from("Form Field Options")
            .select("*")
            .eq("form_id", field.form_id)
            .order("option_order", { ascending: true });

          options = optionsData || [];
        }

        return {
          ...field,
          group_name: groupName,
          options: options,
        };
      })
    );

    res.status(200).json({
      success: true,
      forms: formsWithDetails,
    });
  } catch (err) {
    console.error("Fetch form fields by category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching form fields",
    });
  }
});

// Update form field endpoint
app.put("/api/form/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, fieldName, fieldType, isRequired, fieldOrder, placeholder, defaultValue, groupId, validationRule, fieldWidth } = req.body;

    // Validation
    if (!categoryId || !fieldName || !fieldType || isRequired === undefined || !fieldOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate field type
    const validFieldTypes = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "FILE"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field type",
      });
    }

    // Update form field in database
    const { data, error } = await supabase
      .from("Document Forms")
      .update({
        category_id: categoryId,
        field_name: fieldName,
        field_type: fieldType,
        is_required: isRequired,
        field_order: fieldOrder,
        placeholder: placeholder || null,
        default_value: defaultValue || null,
        group_id: groupId || null,
        validation_rule: validationRule || null,
        field_width: fieldWidth || 12,
      })
      .eq("form_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update form field. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Form field not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form field updated successfully",
      formField: data[0],
    });
  } catch (err) {
    console.error("Update form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating form field",
    });
  }
});

// Delete form field endpoint
app.delete("/api/form/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete form field from database
    const { data, error } = await supabase
      .from("Document Forms")
      .delete()
      .eq("form_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete form field. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Form field not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form field deleted successfully",
    });
  } catch (err) {
    console.error("Delete form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting form field",
    });
  }
});

// Get all field groups endpoint
app.get("/api/group/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Form Field Groups")
      .select("*")
      .order("group_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field groups",
      });
    }

    res.status(200).json({
      success: true,
      groups: data,
    });
  } catch (err) {
    console.error("Fetch field groups error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field groups",
    });
  }
});

// Add field group endpoint
app.post("/api/group/add", async (req, res) => {
  try {
    const { categoryId, groupName, groupOrder } = req.body;

    // Validation
    if (!categoryId || !groupName || !groupOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Insert field group into database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .insert([
        {
          category_id: categoryId,
          group_name: groupName,
          group_order: groupOrder,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add field group. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Field group added successfully",
      group: data[0],
    });
  } catch (err) {
    console.error("Add field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding field group",
    });
  }
});

// Update field group endpoint
app.put("/api/group/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, groupName, groupOrder } = req.body;

    // Validation
    if (!categoryId || !groupName || !groupOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Update field group in database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .update({
        category_id: categoryId,
        group_name: groupName,
        group_order: groupOrder,
      })
      .eq("group_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update field group. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field group updated successfully",
      group: data[0],
    });
  } catch (err) {
    console.error("Update field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating field group",
    });
  }
});

// Delete field group endpoint
app.delete("/api/group/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete field group from database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .delete()
      .eq("group_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete field group. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field group deleted successfully",
    });
  } catch (err) {
    console.error("Delete field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting field group",
    });
  }
});

// Get all field options endpoint
app.get("/api/option/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Form Field Options")
      .select("*")
      .order("option_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field options",
      });
    }

    res.status(200).json({
      success: true,
      options: data,
    });
  } catch (err) {
    console.error("Fetch field options error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field options",
    });
  }
});

// Get options by form field ID
app.get("/api/option/by-field/:formId", async (req, res) => {
  try {
    const { formId } = req.params;

    const { data, error } = await supabase
      .from("Form Field Options")
      .select("*")
      .eq("form_id", formId)
      .order("option_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field options",
      });
    }

    res.status(200).json({
      success: true,
      options: data,
    });
  } catch (err) {
    console.error("Fetch field options error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field options",
    });
  }
});

// Add field option endpoint
app.post("/api/option/add", async (req, res) => {
  try {
    const { formId, optionValue, optionOrder } = req.body;

    // Validation
    if (!formId || !optionValue || !optionOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Insert field option into database
    const { data, error } = await supabase
      .from("Form Field Options")
      .insert([
        {
          form_id: formId,
          option_value: optionValue,
          option_order: optionOrder,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add field option. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Field option added successfully",
      option: data[0],
    });
  } catch (err) {
    console.error("Add field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding field option",
    });
  }
});

// Update field option endpoint
app.put("/api/option/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { formId, optionValue, optionOrder } = req.body;

    // Validation
    if (!formId || !optionValue || !optionOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Update field option in database
    const { data, error } = await supabase
      .from("Form Field Options")
      .update({
        form_id: formId,
        option_value: optionValue,
        option_order: optionOrder,
      })
      .eq("option_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update field option. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field option not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field option updated successfully",
      option: data[0],
    });
  } catch (err) {
    console.error("Update field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating field option",
    });
  }
});

// Delete field option endpoint
app.delete("/api/option/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete field option from database
    const { data, error } = await supabase
      .from("Form Field Options")
      .delete()
      .eq("option_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete field option. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field option not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field option deleted successfully",
    });
  } catch (err) {
    console.error("Delete field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting field option",
    });
  }
});

// Get all assignments endpoint with joined data
app.get("/api/assignment/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Assigned Roles")
      .select(`
        *,
        Admins (
          fullname,
          username
        ),
        DocumentCategories:category_id (
          category_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
      });
    }

    // Transform data to include admin and category names
    const transformedData = data.map((assignment) => ({
      ...assignment,
      admin_fullname: assignment.Admins?.fullname || "Unknown",
      admin_username: assignment.Admins?.username || "Unknown",
      category_name: assignment.DocumentCategories?.category_name || "N/A",
    }));

    res.status(200).json({
      success: true,
      assignments: transformedData,
    });
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching assignments",
    });
  }
});

// Add assignment endpoint
app.post("/api/assignment/add", async (req, res) => {
  try {
    const { admin_id, category_id } = req.body;

    // Validation
    if (!admin_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Admin and category are required",
      });
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from("Assigned Roles")
      .select("*")
      .eq("admin_id", admin_id)
      .eq("category_id", category_id)
      .single();

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "This admin is already assigned to this category",
      });
    }

    // Insert assignment into database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .insert([
        {
          admin_id,
          category_id,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add assignment. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Assignment added successfully",
      assignment: data[0],
    });
  } catch (err) {
    console.error("Add assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding assignment",
    });
  }
});

// Update assignment endpoint
app.put("/api/assignment/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, category_id } = req.body;

    // Validation
    if (!admin_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Admin and category are required",
      });
    }

    // Check if assignment already exists (excluding current assignment)
    const { data: existingAssignment } = await supabase
      .from("Assigned Roles")
      .select("*")
      .eq("admin_id", admin_id)
      .eq("category_id", category_id)
      .neq("assignment_id", id)
      .single();

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "This admin is already assigned to this category",
      });
    }

    // Update assignment in database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .update({
        admin_id,
        category_id,
      })
      .eq("assignment_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update assignment. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: data[0],
    });
  } catch (err) {
    console.error("Update assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating assignment",
    });
  }
});

// Delete assignment endpoint
app.delete("/api/assignment/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete assignment from database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .delete()
      .eq("assignment_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete assignment. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    console.error("Delete assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting assignment",
    });
  }
});

// Get all login audits endpoint with joined data
app.get("/api/audit/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Login Audits")
      .select(`
        *,
        Admins (
          fullname,
          username
        )
      `)
      .order("login_datetime", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch audits",
      });
    }

    // Transform data to include admin details
    const transformedData = data.map((audit) => ({
      ...audit,
      admin_fullname: audit.Admins?.fullname || "Unknown",
      admin_username: audit.Admins?.username || "Unknown",
    }));

    res.status(200).json({
      success: true,
      audits: transformedData,
    });
  } catch (err) {
    console.error("Fetch audits error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching audits",
    });
  }
});

// Add login audit endpoint
app.post("/api/audit/login", async (req, res) => {
  try {
    const { admin_id, status } = req.body;

    // Validation
    if (!admin_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and status are required",
      });
    }

    // Validate status
    if (status !== "Success" && status !== "Failed") {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Success' or 'Failed'",
      });
    }

    // Insert audit log into database
    const { data, error } = await supabase
      .from("Login Audits")
      .insert([
        {
          admin_id,
          status,
          login_datetime: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to log audit. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Audit logged successfully",
      audit: data[0],
    });
  } catch (err) {
    console.error("Log audit error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while logging audit",
    });
  }
});

// Get assigned categories for a processor
app.get("/api/processor/assigned-categories/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Validation
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Get all assignments for this processor with category details
    const { data, error } = await supabase
      .from("Assigned Roles")
      .select(`
        *,
        DocumentCategories:category_id (
          category_id,
          category_name,
          description
        )
      `)
      .eq("admin_id", adminId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assigned categories",
      });
    }

    // Transform data to return categories array
    const categories = (data || [])
      .filter(assignment => assignment.DocumentCategories) // Filter out null categories
      .map(assignment => ({
        ...assignment.DocumentCategories,
        assignment_id: assignment.assignment_id,
        assigned_at: assignment.created_at
      }));

    res.status(200).json({
      success: true,
      categories: categories,
      assignments: data || [], // Keep for backward compatibility
    });
  } catch (err) {
    console.error("Fetch assigned categories error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching assigned categories",
    });
  }
});

// Get documents uploaded by a specific processor
app.get("/api/processor/documents/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Validation
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    // Get all documents created by this processor with category details
    const { data, error } = await supabase
      .from("Documents")
      .select(`
        *,
        DocumentCategories:category_id (
          category_id,
          category_name
        ),
        Admins:created_by (
          username,
          fullname
        )
      `)
      .eq("created_by", adminId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents",
      });
    }

    // Transform data to include category and admin details
    const transformedData = data.map((doc) => ({
      ...doc,
      created_by_name: doc.Admins?.username || doc.Admins?.fullname || "Unknown",
    }));

    res.status(200).json({
      success: true,
      documents: transformedData,
    });
  } catch (err) {
    console.error("Fetch processor documents error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching documents",
    });
  }
});

// ============================================
// REQUEST MANAGEMENT ENDPOINTS
// ============================================

// Get form fields by category ID with groups and options
app.get("/api/request/form-fields/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Validation
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Get all form fields for this category
    const { data: formFields, error: formError } = await supabase
      .from("Document Forms")
      .select("*")
      .eq("category_id", categoryId)
      .order("field_order", { ascending: true });

    if (formError) {
      console.error("Supabase error:", formError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch form fields",
      });
    }

    // Get all groups for this category
    const { data: groups, error: groupError } = await supabase
      .from("Form Field Groups")
      .select("*")
      .eq("category_id", categoryId)
      .order("group_order", { ascending: true });

    if (groupError) {
      console.error("Supabase error:", groupError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field groups",
      });
    }

    // Get all options for fields in this category
    const formIds = formFields.map((field) => field.form_id);
    let options = [];

    if (formIds.length > 0) {
      const { data: optionsData, error: optionsError } = await supabase
        .from("Form Field Options")
        .select("*")
        .in("form_id", formIds)
        .order("option_order", { ascending: true });

      if (optionsError) {
        console.error("Supabase error:", optionsError);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch field options",
        });
      }
      options = optionsData;
    }

    // Group options by form_id for easy lookup
    const optionsByFormId = {};
    options.forEach((option) => {
      if (!optionsByFormId[option.form_id]) {
        optionsByFormId[option.form_id] = [];
      }
      optionsByFormId[option.form_id].push(option);
    });

    // Attach options to form fields
    const fieldsWithOptions = formFields.map((field) => ({
      ...field,
      options: optionsByFormId[field.form_id] || [],
    }));

    res.status(200).json({
      success: true,
      formFields: fieldsWithOptions,
      groups: groups,
    });
  } catch (err) {
    console.error("Fetch form fields error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching form fields",
    });
  }
});

// Submit a new request with form data
app.post("/api/request/submit", upload.any(), async (req, res) => {
  try {
    const { ownerId, categoryId, formData } = req.body;
    const files = req.files; // Array of uploaded files

    // Validation
    if (!ownerId || !categoryId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Owner ID, Category ID, and form data are required",
      });
    }

    // Parse formData if it's a string
    let parsedFormData;
    try {
      parsedFormData = typeof formData === "string" ? JSON.parse(formData) : formData;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data format",
      });
    }

    // Generate tracking code in Node.js (format: OABP-YYYY-XXXXX)
    const year = new Date().getFullYear();

    // Get the count of existing requests to generate sequential number
    const { count, error: countError } = await supabase
      .from("Requests")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
    }

    const sequentialNumber = ((count || 0) + 1).toString().padStart(5, "0");
    const trackingCode = `OABP-${year}-${sequentialNumber}`;

    // Insert the request with the generated tracking code
    const { data: requestData, error: requestError } = await supabase
      .from("Requests")
      .insert([
        {
          owner_id: ownerId,
          category_id: categoryId,
          tracking_code: trackingCode,
          status: "Pending",
        },
      ])
      .select();

    if (requestError) {
      console.error("Supabase request error:", requestError);
      return res.status(500).json({
        success: false,
        message: "Failed to create request. Please try again.",
      });
    }

    const requestId = requestData[0].request_id;

    // Process file uploads if any
    const fileUploadPromises = [];
    const fileFieldMap = {}; // Map field names to uploaded file URLs

    if (files && files.length > 0) {
      for (const file of files) {
        const fieldName = file.fieldname;

        // Generate unique filename
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `request-files/${fileName}`;

        // Upload file to Supabase Storage
        const uploadPromise = supabase.storage
          .from("documents")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          })
          .then(({ data, error }) => {
            if (error) {
              console.error("File upload error:", error);
              throw error;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from("documents")
              .getPublicUrl(filePath);

            fileFieldMap[fieldName] = publicUrlData.publicUrl;
          });

        fileUploadPromises.push(uploadPromise);
      }

      // Wait for all file uploads to complete
      try {
        await Promise.all(fileUploadPromises);
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        // Rollback: Delete the request
        await supabase.from("Requests").delete().eq("request_id", requestId);
        return res.status(500).json({
          success: false,
          message: "Failed to upload files. Please try again.",
        });
      }
    }

    // Insert form field data into Request Form Data table
    const formDataInserts = [];

    for (const [fieldName, fieldValue] of Object.entries(parsedFormData)) {
      // Get form_id from field name (we need to query Document Forms)
      const { data: formField } = await supabase
        .from("Document Forms")
        .select("form_id")
        .eq("category_id", categoryId)
        .eq("field_name", fieldName)
        .single();

      if (formField) {
        // Check if this is a file field and use uploaded URL
        const value = fileFieldMap[fieldName] || fieldValue;

        formDataInserts.push({
          request_id: requestId,
          form_id: formField.form_id,
          field_value: typeof value === "object" ? JSON.stringify(value) : String(value),
        });
      }
    }

    // Bulk insert form data
    if (formDataInserts.length > 0) {
      const { error: formDataError } = await supabase
        .from("Request Form Data")
        .insert(formDataInserts);

      if (formDataError) {
        console.error("Supabase form data error:", formDataError);
        // Rollback: Delete the request and uploaded files
        await supabase.from("Requests").delete().eq("request_id", requestId);

        // Delete uploaded files
        for (const fileUrl of Object.values(fileFieldMap)) {
          const filePath = fileUrl.split("/request-files/")[1];
          if (filePath) {
            await supabase.storage.from("documents").remove([`request-files/${filePath}`]);
          }
        }

        return res.status(500).json({
          success: false,
          message: "Failed to save form data. Please try again.",
        });
      }
    }

    // Get category name for notification
    const { data: categoryData } = await supabase
      .from("Document Categories")
      .select("category_name")
      .eq("category_id", categoryId)
      .single();

    // Notify admin about new request submission
    if (categoryData) {
      await notifyAdminNewRequest(
        requestId,
        trackingCode,
        categoryData.category_name
      );
    }

    res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      request: {
        request_id: requestId,
        tracking_code: trackingCode,
        status: "Pending",
      },
    });
  } catch (err) {
    console.error("Submit request error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting request",
    });
  }
});

// Get all requests for a specific owner
app.get("/api/request/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validation
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    // Get all requests for this owner with category details
    const { data, error } = await supabase
      .from("Requests")
      .select(`
        *,
        DocumentCategories:category_id (
          category_id,
          category_name,
          description
        ),
        Admins:processed_by (
          admin_id,
          fullname,
          username
        )
      `)
      .eq("owner_id", ownerId)
      .order("date_requested", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch requests",
      });
    }

    // Transform data
    const transformedData = data.map((request) => ({
      ...request,
      category_name: request.DocumentCategories?.category_name || "N/A",
      processor_name: request.Admins?.fullname || request.Admins?.username || "Not Assigned",
    }));

    res.status(200).json({
      success: true,
      requests: transformedData,
    });
  } catch (err) {
    console.error("Fetch owner requests error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching requests",
    });
  }
});

// Get request details with form data
app.get("/api/request/details/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Validation
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    // Get request details
    const { data: request, error: requestError } = await supabase
      .from("Requests")
      .select(`
        *,
        DocumentCategories:category_id (
          category_id,
          category_name,
          description
        ),
        Admins:processed_by (
          admin_id,
          fullname,
          username
        ),
        Owners:owner_id (
          owner_id,
          fullname,
          email,
          username
        )
      `)
      .eq("request_id", requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Get form data for this request with field details
    const { data: formData, error: formDataError } = await supabase
      .from("Request Form Data")
      .select(`
        *,
        DocumentForms:form_id (
          form_id,
          field_name,
          field_type,
          is_required,
          field_order,
          group_id
        )
      `)
      .eq("request_id", requestId)
      .order("DocumentForms(field_order)", { ascending: true });

    if (formDataError) {
      console.error("Supabase error:", formDataError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch form data",
      });
    }

    res.status(200).json({
      success: true,
      request: request,
      formData: formData,
    });
  } catch (err) {
    console.error("Fetch request details error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching request details",
    });
  }
});

// Get all requests (for admin/processor)
app.get("/api/request/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Requests")
      .select(`
        *,
        DocumentCategories:category_id (
          category_id,
          category_name
        ),
        Owners:owner_id (
          owner_id,
          fullname,
          username
        ),
        Admins:processed_by (
          admin_id,
          fullname,
          username
        )
      `)
      .order("date_requested", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch requests",
      });
    }

    // Transform data
    const transformedData = data.map((request) => ({
      ...request,
      category_name: request.DocumentCategories?.category_name || "N/A",
      owner_name: request.Owners?.fullname || request.Owners?.username || "Unknown",
      processor_name: request.Admins?.fullname || request.Admins?.username || "Not Assigned",
    }));

    res.status(200).json({
      success: true,
      requests: transformedData,
    });
  } catch (err) {
    console.error("Fetch all requests error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching requests",
    });
  }
});

// Update request status
app.put("/api/request/update-status/:requestId", upload.single("attachmentFile"), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, processedBy, remarks, attachmentRemarks } = req.body;
    const file = req.file;

    // Validation
    if (!requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "Request ID and status are required",
      });
    }

    // Validate status
    const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // If status is Completed, file is required
    if (status === "Completed" && !file) {
      return res.status(400).json({
        success: false,
        message: "File attachment is required when completing a request",
      });
    }

    // Get current request to track status change
    const { data: currentRequest } = await supabase
      .from("Requests")
      .select("status, owner_id, tracking_code")
      .eq("request_id", requestId)
      .single();

    // Update request
    const updateData = { status };
    if (processedBy) updateData.processed_by = processedBy;
    if (remarks !== undefined) updateData.remarks = remarks;

    // Auto-set date_release when status is Completed
    if (status === "Completed") {
      updateData.date_release = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("Requests")
      .update(updateData)
      .eq("request_id", requestId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update request status",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Handle file upload if status is Completed and file provided
    if (status === "Completed" && file) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(`request-attachments/${fileName}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload attachment file",
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(`request-attachments/${fileName}`);

      // Insert attachment record
      const { error: attachmentError } = await supabase
        .from("Request Attachments")
        .insert([
          {
            request_id: requestId,
            file_name: file.originalname,
            file_path: urlData.publicUrl,
            uploaded_by: processedBy || null,
            remarks: attachmentRemarks || null,
          },
        ]);

      if (attachmentError) {
        console.error("Attachment insert error:", attachmentError);
        // Don't fail the whole request, just log the error
      }
    }

    // Log status change to Request History
    if (currentRequest) {
      await supabase.from("Request History").insert([
        {
          request_id: requestId,
          previous_status: currentRequest.status,
          new_status: status,
          changed_by: processedBy || null,
          remarks: remarks || null,
        },
      ]);

      // Send notification to user about status change
      await notifyUserStatusChange(
        requestId,
        currentRequest.owner_id,
        currentRequest.tracking_code,
        status
      );
    }


    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request: data[0],
    });
  } catch (err) {
    console.error("Update request status error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating request status",
    });
  }
});

// Get request attachments
app.get("/api/request/attachments/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const { data, error } = await supabase
      .from("Request Attachments")
      .select(`
        *,
        Admins:uploaded_by (
          admin_id,
          fullname,
          username
        )
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch request attachments",
      });
    }

    res.status(200).json({
      success: true,
      attachments: data,
    });
  } catch (err) {
    console.error("Fetch request attachments error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching request attachments",
    });
  }
});

// Get request history
app.get("/api/request/history/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const { data, error } = await supabase
      .from("Request History")
      .select(`
        *,
        Admins:changed_by (
          admin_id,
          fullname,
          username
        )
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch request history",
      });
    }

    res.status(200).json({
      success: true,
      history: data,
    });
  } catch (err) {
    console.error("Fetch request history error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching request history",
    });
  }
});

// Update request (Owner only - can only update Pending requests)
app.put("/api/request/update/:requestId", upload.any(), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { formData } = req.body;
    const files = req.files;

    // Validation
    if (!requestId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Request ID and form data are required",
      });
    }

    // Parse formData
    let parsedFormData;
    try {
      parsedFormData = typeof formData === "string" ? JSON.parse(formData) : formData;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid form data format",
      });
    }

    // Get current request
    const { data: currentRequest, error: fetchError } = await supabase
      .from("Requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (fetchError || !currentRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only allow updates if status is Pending
    if (currentRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot update request with status "${currentRequest.status}". Only pending requests can be updated.`,
      });
    }

    // Process file uploads if any
    const fileFieldMap = {};

    if (files && files.length > 0) {
      for (const file of files) {
        const fieldName = file.fieldname;
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `request-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error("File upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload files. Please try again.",
          });
        }

        const { data: publicUrlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        fileFieldMap[fieldName] = publicUrlData.publicUrl;
      }
    }

    // Delete existing form data for this request
    await supabase
      .from("Request Form Data")
      .delete()
      .eq("request_id", requestId);

    // Insert updated form data
    const formDataInserts = [];
    const categoryId = currentRequest.category_id;

    for (const [fieldName, fieldValue] of Object.entries(parsedFormData)) {
      const { data: formField } = await supabase
        .from("Document Forms")
        .select("form_id")
        .eq("category_id", categoryId)
        .eq("field_name", fieldName)
        .single();

      if (formField) {
        const value = fileFieldMap[fieldName] || fieldValue;

        formDataInserts.push({
          request_id: requestId,
          form_id: formField.form_id,
          field_value: typeof value === "object" ? JSON.stringify(value) : String(value),
        });
      }
    }

    if (formDataInserts.length > 0) {
      const { error: formDataError } = await supabase
        .from("Request Form Data")
        .insert(formDataInserts);

      if (formDataError) {
        console.error("Supabase form data error:", formDataError);
        return res.status(500).json({
          success: false,
          message: "Failed to update form data. Please try again.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Request updated successfully",
    });
  } catch (err) {
    console.error("Update request error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating request",
    });
  }
});

// Cancel request (Owner only - can only cancel Pending requests)
app.put("/api/request/cancel/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { ownerId } = req.body;

    // Validation
    if (!requestId || !ownerId) {
      return res.status(400).json({
        success: false,
        message: "Request ID and Owner ID are required",
      });
    }

    // Get current request to verify ownership and status
    const { data: currentRequest, error: fetchError } = await supabase
      .from("Requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (fetchError || !currentRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Verify ownership
    if (currentRequest.owner_id !== parseInt(ownerId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this request",
      });
    }

    // Only allow cancellation if status is Pending
    if (currentRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status "${currentRequest.status}". Only pending requests can be cancelled.`,
      });
    }

    // Update request status to Cancelled
    const { data, error } = await supabase
      .from("Requests")
      .update({ status: "Cancelled" })
      .eq("request_id", requestId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel request",
      });
    }

    // Log status change to Request History
    await supabase.from("Request History").insert([
      {
        request_id: requestId,
        previous_status: currentRequest.status,
        new_status: "Cancelled",
        changed_by: null, // Owner cancelled, not admin
        remarks: "Cancelled by owner",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
      request: data[0],
    });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while cancelling request",
    });
  }
});

// ============================================
// PAYMENT MANAGEMENT ENDPOINTS
// ============================================

// Add payment requirement to a request (Admin only)
app.post("/api/payment/add", async (req, res) => {
  try {
    const {
      requestId,
      amount,
      paymentType,
      description,
      paymentMethod,
      createdBy,
    } = req.body;

    // Validation
    if (!requestId || !amount || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Request ID, amount, and admin ID are required",
      });
    }

    // Verify request exists
    const { data: request, error: requestError } = await supabase
      .from("Requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Insert payment
    const { data, error } = await supabase
      .from("Payments")
      .insert([
        {
          request_id: requestId,
          amount: parseFloat(amount),
          payment_type: paymentType || "Permit Fee",
          description: description || null,
          payment_method: paymentMethod || null,
          processed_by: createdBy,
          status: "Pending",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add payment requirement",
      });
    }

    // Create history entry for payment creation
    await supabase
      .from("Payment History")
      .insert([
        {
          payment_id: data[0].payment_id,
          previous_status: null,
          new_status: "Pending",
          changed_by: createdBy,
          remarks: "Payment requirement created",
        },
      ]);

    // Send notification to user about new payment requirement
    const { data: requestData } = await supabase
      .from("Requests")
      .select("owner_id, tracking_code")
      .eq("request_id", requestId)
      .single();

    if (requestData) {
      await notifyUserPaymentStatus(
        data[0].payment_id,
        requestData.owner_id,
        requestId,
        requestData.tracking_code,
        "Pending",
        parseFloat(amount)
      );
    }

    res.status(201).json({
      success: true,
      message: "Payment requirement added successfully",
      payment: data[0],
    });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding payment",
    });
  }
});

// Get all payments for a request
app.get("/api/payment/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const { data, error } = await supabase
      .from("Payments")
      .select(`
        *,
        ProcessedBy:processed_by (
          admin_id,
          fullname,
          username
        )
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }

    res.status(200).json({
      success: true,
      payments: data,
    });
  } catch (err) {
    console.error("Fetch payments error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payments",
    });
  }
});

// Get all payments (Admin view)
app.get("/api/payment/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Payments")
      .select(`
        *,
        Requests:request_id (
          request_id,
          tracking_code,
          status,
          category_id,
          Owners:owner_id (
            owner_id,
            fullname,
            username,
            email,
            phone_number
          ),
          DocumentCategories:category_id (
            category_name
          )
        ),
        ProcessedBy:processed_by (
          fullname,
          username
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }

    res.status(200).json({
      success: true,
      payments: data,
    });
  } catch (err) {
    console.error("Fetch all payments error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payments",
    });
  }
});

// Submit payment proof (Owner)
app.put("/api/payment/submit-proof/:paymentId", upload.single("proofPayment"), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { senderNumber, referenceNumber, paymentDate } = req.body;
    const file = req.file;

    // Validation
    if (!paymentId || !senderNumber || !referenceNumber || !file) {
      return res.status(400).json({
        success: false,
        message: "All fields and proof of payment are required",
      });
    }

    // Get current payment
    const { data: payment, error: fetchError } = await supabase
      .from("Payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Only allow submission if status is Pending or Rejected
    if (payment.status !== "Pending" && payment.status !== "Rejected") {
      return res.status(400).json({
        success: false,
        message: `Cannot submit proof for payment with status "${payment.status}"`,
      });
    }

    // Upload proof of payment to Supabase Storage
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload payment proof",
      });
    }

    // Update payment (over-the-counter payment - no proof upload)
    const { data, error } = await supabase
      .from("Payments")
      .update({
        reference_number: referenceNumber,
        payment_date: paymentDate || new Date().toISOString(),
        status: "Verified", // Auto-verified for over-the-counter
        remarks: "Over-the-counter payment received",
      })
      .eq("payment_id", paymentId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to submit payment proof",
      });
    }

    // Get request information for notification
    const { data: requestData } = await supabase
      .from("Requests")
      .select("tracking_code")
      .eq("request_id", payment.request_id)
      .single();

    // Send notification to admin that payment proof was submitted
    if (requestData) {
      await notifyAdminPaymentSubmitted(
        paymentId,
        payment.request_id,
        requestData.tracking_code,
        payment.amount
      );
    }

    res.status(200).json({
      success: true,
      message: "Payment proof submitted successfully",
      payment: data[0],
    });
  } catch (err) {
    console.error("Submit payment proof error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting payment proof",
    });
  }
});

// Generate receipt number for OTC payment
app.get("/api/payment/generate-receipt-number", async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // Get all receipt numbers for the current year
    const { data, error } = await supabase
      .from("Payments")
      .select("receipt_number")
      .not("receipt_number", "is", null)
      .like("receipt_number", `OR-${year}-%`);

    if (error) {
      console.error("Supabase error:", error);
      // Fallback to starting sequence if query fails
      return res.status(200).json({
        success: true,
        receiptNumber: `OR-${year}-00001`,
      });
    }

    let maxSequence = 0;

    if (data && data.length > 0) {
      // Parse all receipt numbers and find the highest sequence number
      data.forEach((payment) => {
        if (payment.receipt_number) {
          const parts = payment.receipt_number.split('-');
          if (parts.length === 3 && parts[1] === year.toString()) {
            const sequence = parseInt(parts[2]);
            if (sequence > maxSequence) {
              maxSequence = sequence;
            }
          }
        }
      });
    }

    // Increment sequence number
    const nextSequence = maxSequence + 1;

    // Format: OR-YYYY-NNNNN (5 digits, zero-padded)
    const receiptNumber = `OR-${year}-${nextSequence.toString().padStart(5, '0')}`;

    res.status(200).json({
      success: true,
      receiptNumber: receiptNumber,
    });
  } catch (err) {
    console.error("Generate receipt number error:", err);
    // Fallback to starting sequence on error
    const year = new Date().getFullYear();
    res.status(200).json({
      success: true,
      receiptNumber: `OR-${year}-00001`,
    });
  }
});

// Verify payment (Admin) - OTC Payment Model
app.put("/api/payment/verify/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, processedBy, remarks, receiptNumber, paymentDate } = req.body;

    // Validation
    if (!paymentId || !status || !processedBy) {
      return res.status(400).json({
        success: false,
        message: "Payment ID, status, and admin ID are required",
      });
    }

    // Validate status
    if (status !== "Verified" && status !== "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Verified' or 'Rejected'",
      });
    }

    // For verified payments, require receipt number and payment date
    if (status === "Verified") {
      if (!receiptNumber || !paymentDate) {
        return res.status(400).json({
          success: false,
          message: "Receipt number and payment date are required for verified payments",
        });
      }
    }

    // Prepare update data
    const updateData = {
      status: status,
      processed_by: processedBy,
      remarks: remarks || null,
    };

    // Add receipt number and payment date only for verified payments
    if (status === "Verified") {
      updateData.receipt_number = receiptNumber;
      updateData.payment_date = paymentDate;
    }

    // Update payment
    const { data, error } = await supabase
      .from("Payments")
      .update(updateData)
      .eq("payment_id", paymentId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Get request information for notification
    const { data: requestData } = await supabase
      .from("Requests")
      .select("owner_id, tracking_code")
      .eq("request_id", data[0].request_id)
      .single();

    // Send notification to user about payment verification
    if (requestData) {
      await notifyUserPaymentStatus(
        paymentId,
        requestData.owner_id,
        data[0].request_id,
        requestData.tracking_code,
        status,
        data[0].amount
      );
    }

    // Add to payment history
    await supabase.from("Payment History").insert([
      {
        payment_id: paymentId,
        status: status,
        changed_by: processedBy,
        remarks: remarks || `Payment ${status.toLowerCase()} at counter${status === "Verified" ? ` - Receipt: ${receiptNumber}` : ""}`,
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Payment verification completed",
      payment: data[0],
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying payment",
    });
  }
});

// Update payment requirement (Admin only)
app.put("/api/payment/update/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      amount,
      paymentType,
      description,
      paymentMethod,
      updatedBy,
    } = req.body;

    // Validation
    if (!paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and amount are required",
      });
    }

    // Get current payment data for history
    const { data: currentPayment } = await supabase
      .from("Payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    // Update payment
    const { data, error } = await supabase
      .from("Payments")
      .update({
        amount: parseFloat(amount),
        payment_type: paymentType || "Permit Fee",
        description: description || null,
        payment_method: paymentMethod || null,
      })
      .eq("payment_id", paymentId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update payment requirement",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Create history entry for payment update
    await supabase
      .from("Payment History")
      .insert([
        {
          payment_id: paymentId,
          previous_status: currentPayment?.status,
          new_status: currentPayment?.status,
          changed_by: updatedBy || null,
          remarks: `Payment details updated (Amount: ${currentPayment?.amount} → ${amount})`,
        },
      ]);

    res.status(200).json({
      success: true,
      message: "Payment requirement updated successfully",
      payment: data[0],
    });
  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating payment",
    });
  }
});

// Delete payment (Admin only)
app.delete("/api/payment/delete/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { deletedBy } = req.body;

    // Get current payment data for history before deleting
    const { data: currentPayment } = await supabase
      .from("Payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (!currentPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Create history entry before deletion (CASCADE will delete it otherwise)
    await supabase
      .from("Payment History")
      .insert([
        {
          payment_id: paymentId,
          previous_status: currentPayment?.status,
          new_status: "Deleted",
          changed_by: deletedBy || null,
          remarks: "Payment requirement removed",
        },
      ]);

    const { data, error } = await supabase
      .from("Payments")
      .delete()
      .eq("payment_id", paymentId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete payment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (err) {
    console.error("Delete payment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting payment",
    });
  }
});

// Get payment history
app.get("/api/payment/history/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const { data, error } = await supabase
      .from("Payment History")
      .select(`
        *,
        Admins:changed_by (
          admin_id,
          fullname,
          username
        )
      `)
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment history",
      });
    }

    res.status(200).json({
      success: true,
      history: data,
    });
  } catch (err) {
    console.error("Fetch payment history error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching payment history",
    });
  }
});

// ============================================
// DASHBOARD STATISTICS ENDPOINTS
// ============================================

// Get admin/superadmin dashboard statistics
app.get("/api/dashboard/admin/stats", async (req, res) => {
  try {
    // Get total requests by status
    const { data: requests, error: requestsError } = await supabase
      .from("Requests")
      .select("status");

    if (requestsError) throw requestsError;

    // Get total payments by status
    const { data: payments, error: paymentsError } = await supabase
      .from("Payments")
      .select("status");

    if (paymentsError) throw paymentsError;

    // Get total business owners
    const { count: ownersCount, error: ownersError } = await supabase
      .from("Owners")
      .select("*", { count: "exact", head: true });

    if (ownersError) throw ownersError;

    // Get total admins/processors
    const { count: adminsCount, error: adminsError } = await supabase
      .from("Admins")
      .select("*", { count: "exact", head: true });

    if (adminsError) throw adminsError;

    // Get total document categories
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from("Document Categories")
      .select("*", { count: "exact", head: true });

    if (categoriesError) throw categoriesError;

    // Calculate statistics
    const stats = {
      requests: {
        total: requests.length,
        pending: requests.filter(r => r.status === "Pending").length,
        underReview: requests.filter(r => r.status === "Under Review").length,
        approved: requests.filter(r => r.status === "Approved").length,
        rejected: requests.filter(r => r.status === "Rejected").length,
        completed: requests.filter(r => r.status === "Completed").length,
      },
      payments: {
        total: payments.length,
        pending: payments.filter(p => p.status === "Pending").length,
        verified: payments.filter(p => p.status === "Verified").length,
        rejected: payments.filter(p => p.status === "Rejected").length,
      },
      users: {
        owners: ownersCount || 0,
        admins: adminsCount || 0,
        total: (ownersCount || 0) + (adminsCount || 0),
      },
      categories: categoriesCount || 0,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Fetch admin stats error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard statistics",
    });
  }
});

// Get user/owner dashboard statistics
app.get("/api/dashboard/user/stats/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Get all requests for this owner
    const { data: requests, error: requestsError } = await supabase
      .from("Requests")
      .select("request_id, status, created_at")
      .eq("owner_id", ownerId);

    if (requestsError) throw requestsError;

    // Get all payments for this owner's requests
    const requestIds = requests.map(r => r.request_id);
    let payments = [];

    if (requestIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("Payments")
        .select("status, amount")
        .in("request_id", requestIds);

      if (paymentsError) throw paymentsError;
      payments = paymentsData || [];
    }

    // Calculate statistics
    const stats = {
      requests: {
        total: requests.length,
        pending: requests.filter(r => r.status === "Pending").length,
        underReview: requests.filter(r => r.status === "Under Review").length,
        approved: requests.filter(r => r.status === "Approved").length,
        rejected: requests.filter(r => r.status === "Rejected").length,
        completed: requests.filter(r => r.status === "Completed").length,
      },
      payments: {
        total: payments.length,
        pending: payments.filter(p => p.status === "Pending").length,
        verified: payments.filter(p => p.status === "Verified").length,
        rejected: payments.filter(p => p.status === "Rejected").length,
        totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      },
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Fetch user stats error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard statistics",
    });
  }
});

// Get recent requests for admin dashboard
app.get("/api/dashboard/admin/recent-requests", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Requests")
      .select(`
        request_id,
        tracking_code,
        status,
        created_at,
        Owners!Requests_owner_id_fkey(fullname),
        DocumentCategories:category_id(category_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const formattedRequests = data.map(req => ({
      request_id: req.request_id,
      tracking_code: req.tracking_code,
      status: req.status,
      created_at: req.created_at,
      owner_name: req.Owners?.fullname || "Unknown",
      category_name: req.DocumentCategories?.category_name || "Unknown",
    }));

    res.status(200).json({
      success: true,
      requests: formattedRequests,
    });
  } catch (err) {
    console.error("Fetch recent requests error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching recent requests",
    });
  }
});

// Get recent activity for user dashboard
app.get("/api/dashboard/user/recent-activity/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const { data, error } = await supabase
      .from("Requests")
      .select(`
        request_id,
        tracking_code,
        status,
        created_at,
        updated_at,
        DocumentCategories:category_id(category_name)
      `)
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    const formattedActivity = data.map(req => ({
      request_id: req.request_id,
      tracking_code: req.tracking_code,
      status: req.status,
      created_at: req.created_at,
      updated_at: req.updated_at,
      category_name: req.DocumentCategories?.category_name || "Unknown",
    }));

    res.status(200).json({
      success: true,
      activity: formattedActivity,
    });
  } catch (err) {
    console.error("Fetch recent activity error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching recent activity",
    });
  }
});

// Get request status timeline/history
app.get("/api/request/timeline/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from("Requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Build timeline based on request status and dates
    const timeline = [];

    // Step 1: Submitted (always present)
    timeline.push({
      step: 1,
      status: "Submitted",
      label: "Request Submitted",
      description: "Your application has been received",
      date: request.created_at,
      completed: true,
      current: request.status === "Pending",
      icon: "FileText",
    });

    // Step 2: Under Review
    const isUnderReview = ["Under Review", "Approved", "Rejected", "Completed"].includes(request.status);
    timeline.push({
      step: 2,
      status: "Under Review",
      label: "Under Review",
      description: "Application is being reviewed by our team",
      date: request.updated_at && isUnderReview ? request.updated_at : null,
      completed: isUnderReview,
      current: request.status === "Under Review",
      icon: "Clock",
    });

    // Step 3: Decision Made (Approved or Rejected)
    if (request.status === "Rejected") {
      timeline.push({
        step: 3,
        status: "Rejected",
        label: "Application Rejected",
        description: request.remarks || "Your application was not approved",
        date: request.updated_at,
        completed: true,
        current: true,
        icon: "XCircle",
        isRejected: true,
      });
    } else {
      const isApproved = ["Approved", "Completed"].includes(request.status);
      timeline.push({
        step: 3,
        status: "Approved",
        label: "Application Approved",
        description: "Your application has been approved",
        date: request.updated_at && isApproved ? request.updated_at : null,
        completed: isApproved,
        current: request.status === "Approved",
        icon: "CheckCircle",
      });

      // Step 4: Completed (only if approved)
      if (isApproved) {
        timeline.push({
          step: 4,
          status: "Completed",
          label: "Permit Completed",
          description: "Your permit is ready for download",
          date: request.date_release,
          completed: request.status === "Completed",
          current: request.status === "Completed",
          icon: "Download",
        });
      }
    }

    // Determine what's next
    let whatsNext = {
      message: "",
      action: "",
    };

    switch (request.status) {
      case "Pending":
        whatsNext = {
          message: "Your application is in queue for review",
          action: "Wait for our team to start processing your request",
        };
        break;
      case "Under Review":
        whatsNext = {
          message: "Your application is currently being reviewed",
          action: "Our team is evaluating your submitted documents",
        };
        break;
      case "Approved":
        whatsNext = {
          message: "Payment required to proceed",
          action: "Complete the payment to receive your permit",
        };
        break;
      case "Completed":
        whatsNext = {
          message: "Your document is ready!",
          action: "Download your document from the attachments section",
        };
        break;
      case "Rejected":
        whatsNext = {
          message: "Application not approved",
          action: "Review the remarks and consider submitting a new application",
        };
        break;
      case "Cancelled":
        whatsNext = {
          message: "Request was cancelled",
          action: "Submit a new application if needed",
        };
        break;
      default:
        whatsNext = {
          message: "Status update pending",
          action: "Check back later for updates",
        };
    }

    res.status(200).json({
      success: true,
      timeline,
      whatsNext,
      currentStatus: request.status,
    });
  } catch (err) {
    console.error("Fetch request timeline error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching request timeline",
    });
  }
});

// ==================== NOTIFICATION ENDPOINTS ====================

// Get all notifications for a user
app.get("/api/notifications/:userType/:userId", async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    // Build query based on user type using proper foreign keys
    let query = supabase
      .from('Notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Filter by user type using admin_id or owner_id
    if (userType === 'Admin') {
      query = query.eq('admin_id', userId);
    } else if (userType === 'User') {
      query = query.eq('owner_id', userId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type. Must be "Admin" or "User"'
      });
    }

    if (unreadOnly === 'true') {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Notifications fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }

    res.json({
      success: true,
      notifications: data
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching notifications'
    });
  }
});

// Get unread notification count
app.get("/api/notifications/:userType/:userId/unread-count", async (req, res) => {
  try {
    const { userType, userId } = req.params;

    // Build query based on user type using proper foreign keys
    let query = supabase
      .from('Notifications')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null);

    // Filter by user type using admin_id or owner_id
    if (userType === 'Admin') {
      query = query.eq('admin_id', userId);
    } else if (userType === 'User') {
      query = query.eq('owner_id', userId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type'
      });
    }

    const { count, error } = await query;

    if (error) {
      console.error('Unread count error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get unread count'
      });
    }

    res.json({
      success: true,
      count: count || 0
    });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
});

// Mark notification as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Mark as read
    const { data, error } = await supabase
      .from('Notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('notification_id', notificationId)
      .select();

    if (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }

    res.json({
      success: true,
      notification: data[0]
    });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
});

// Mark all notifications as read
app.put("/api/notifications/:userType/:userId/read-all", async (req, res) => {
  try {
    const { userType, userId } = req.params;

    // Build query based on user type using proper foreign keys
    let query = supabase
      .from('Notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    // Filter by user type using admin_id or owner_id
    if (userType === 'Admin') {
      query = query.eq('admin_id', userId);
    } else if (userType === 'User') {
      query = query.eq('owner_id', userId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type'
      });
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read'
      });
    }

    res.json({
      success: true,
      message: `Marked ${data.length} notifications as read`
    });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
});

// Delete notification
app.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { error } = await supabase
      .from('Notifications')
      .delete()
      .eq('notification_id', notificationId);

    if (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
