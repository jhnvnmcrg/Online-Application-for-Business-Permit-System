const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * Send email verification email
 * @param {String} email - Recipient email
 * @param {String} fullname - Recipient full name
 * @param {String} verificationToken - Verification token
 * @param {String} userType - 'Owner' or 'Admin'
 */
async function sendVerificationEmail(email, fullname, verificationToken, userType) {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&type=${userType.toLowerCase()}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - OABP System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hi ${fullname},</p>
        <p>Thank you for registering with OABP System. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #007bff; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">OABP System - Document Processing Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} fullname - Recipient full name
 * @param {String} resetToken - Password reset token
 * @param {String} userType - 'Owner' or 'Admin'
 */
async function sendPasswordResetEmail(email, fullname, resetToken, userType) {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType.toLowerCase()}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - OABP System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${fullname},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #dc3545; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">OABP System - Document Processing Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send request status update notification
 * @param {String} email - Recipient email
 * @param {String} fullname - Recipient full name
 * @param {String} trackingCode - Request tracking code
 * @param {String} categoryName - Document category name
 * @param {String} oldStatus - Previous status
 * @param {String} newStatus - New status
 * @param {String} remarks - Admin remarks
 */
async function sendRequestStatusEmail(email, fullname, trackingCode, categoryName, oldStatus, newStatus, remarks) {
  const transporter = createTransporter();

  // Determine status color
  const statusColors = {
    'Pending': '#ffc107',
    'Under Review': '#17a2b8',
    'Approved': '#28a745',
    'Rejected': '#dc3545',
    'Cancelled': '#6c757d',
    'Completed': '#007bff'
  };

  const statusColor = statusColors[newStatus] || '#333';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Request ${trackingCode} Status Update - OABP System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Request Status Update</h2>
        <p>Hi ${fullname},</p>
        <p>Your request has been updated:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Tracking Code:</strong> ${trackingCode}</p>
          <p style="margin: 5px 0;"><strong>Document Type:</strong> ${categoryName}</p>
          <p style="margin: 5px 0;"><strong>Previous Status:</strong> ${oldStatus || 'N/A'}</p>
          <p style="margin: 5px 0;">
            <strong>New Status:</strong>
            <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span>
          </p>
          ${remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/tracking?code=${trackingCode}"
             style="background-color: #007bff; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Request
          </a>
        </div>
        <p>You can log in to your account to view more details about your request.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">OABP System - Document Processing Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Request status email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending request status email:', error);
    return false;
  }
}

/**
 * Send payment status update notification
 * @param {String} email - Recipient email
 * @param {String} fullname - Recipient full name
 * @param {String} trackingCode - Request tracking code
 * @param {String} referenceNumber - Payment reference number
 * @param {String} newStatus - New payment status
 * @param {String} remarks - Admin remarks
 */
async function sendPaymentStatusEmail(email, fullname, trackingCode, referenceNumber, newStatus, remarks) {
  const transporter = createTransporter();

  const statusColor = newStatus === 'Verified' ? '#28a745' : '#dc3545';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Payment ${newStatus} - ${trackingCode} - OABP System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Status Update</h2>
        <p>Hi ${fullname},</p>
        <p>Your payment has been ${newStatus.toLowerCase()}:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Tracking Code:</strong> ${trackingCode}</p>
          <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p style="margin: 5px 0;">
            <strong>Status:</strong>
            <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span>
          </p>
          ${remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/oabps/user/payments"
             style="background-color: #007bff; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Payment Details
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">OABP System - Document Processing Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment status email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending payment status email:', error);
    return false;
  }
}

/**
 * Send new request notification to admin
 * @param {String} email - Admin email
 * @param {String} adminName - Admin full name
 * @param {String} trackingCode - Request tracking code
 * @param {String} categoryName - Document category name
 * @param {String} ownerName - Owner full name
 */
async function sendNewRequestNotificationToAdmin(email, adminName, trackingCode, categoryName, ownerName) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `New Request Submitted - ${trackingCode} - OABP System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Request Submitted</h2>
        <p>Hi ${adminName},</p>
        <p>A new request has been submitted and is awaiting review:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Tracking Code:</strong> ${trackingCode}</p>
          <p style="margin: 5px 0;"><strong>Document Type:</strong> ${categoryName}</p>
          <p style="margin: 5px 0;"><strong>Submitted by:</strong> ${ownerName}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/oabps/main/requests"
             style="background-color: #007bff; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Request
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">OABP System - Document Processing Management</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ New request notification email sent to admin:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending new request notification email:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRequestStatusEmail,
  sendPaymentStatusEmail,
  sendNewRequestNotificationToAdmin
};
