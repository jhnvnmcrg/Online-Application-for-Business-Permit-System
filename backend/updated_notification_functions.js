// Updated Notification Helper Functions for server.js
// Replace the existing notification functions with these updated versions

// ===========================
// NOTIFICATION HELPER FUNCTIONS (UPDATED)
// ===========================

/**
 * Create a notification with proper foreign key relationships
 * @param {number} userId - The ID of the user (admin_id or owner_id)
 * @param {string} userType - 'Admin' or 'User'
 * @param {string} type - Notification type (e.g., 'Request', 'Payment')
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @param {number|null} requestId - Related request ID
 * @param {number|null} paymentId - Related payment ID
 * @returns {Object|null} The created notification or null
 */
async function createNotification(userId, userType, type, subject, message, requestId = null, paymentId = null) {
  try {
    // Build the insert object with proper admin_id or owner_id
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

    return data[0];
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

/**
 * Notify user when request status changes
 */
async function notifyRequestStatusChange(requestId, newStatus) {
  try {
    // Fetch request details with owner information
    const { data: request, error } = await supabase
      .from('Requests')
      .select(`
        *,
        category:Document Categories(category_name),
        owner:Owners(owner_id, fullname, email)
      `)
      .eq('request_id', requestId)
      .single();

    if (error || !request) {
      console.error('Request not found:', error);
      return;
    }

    const categoryName = request.category?.category_name || 'Unknown Category';
    const ownerId = request.owner?.owner_id;

    if (!ownerId) {
      console.error('Owner ID not found for request:', requestId);
      return;
    }

    // Create notification for the owner (User type)
    await createNotification(
      ownerId,
      'User', // userType
      'Request',
      'Request Status Updated',
      `Your request for ${categoryName} has been updated to ${newStatus}`,
      requestId,
      null
    );

  } catch (err) {
    console.error('Error notifying request status change:', err);
  }
}

/**
 * Notify user when payment status changes
 */
async function notifyPaymentStatusChange(paymentId, newStatus) {
  try {
    // Fetch payment details with request and owner information
    const { data: payment, error } = await supabase
      .from('Payments')
      .select(`
        *,
        request:Requests(
          request_id,
          category:Document Categories(category_name),
          owner:Owners(owner_id, fullname, email)
        )
      `)
      .eq('payment_id', paymentId)
      .single();

    if (error || !payment) {
      console.error('Payment not found:', error);
      return;
    }

    const categoryName = payment.request?.category?.category_name || 'Unknown Category';
    const ownerId = payment.request?.owner?.owner_id;

    if (!ownerId) {
      console.error('Owner ID not found for payment:', paymentId);
      return;
    }

    // Create notification for the owner (User type)
    await createNotification(
      ownerId,
      'User', // userType
      'Payment',
      'Payment Status Updated',
      `Your payment for ${categoryName} has been ${newStatus}`,
      payment.request_id,
      paymentId
    );

  } catch (err) {
    console.error('Error notifying payment status change:', err);
  }
}

// ===========================
// UPDATED NOTIFICATION API ENDPOINTS
// ===========================

/**
 * GET /api/notifications/:userType/:userId
 * Get all notifications for a specific user
 * Query params: limit, status
 */
app.get("/api/notifications/:userType/:userId", async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { limit, status } = req.query;

    // Build query based on user type
    let query = supabase
      .from('Notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by user type
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

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Limit results if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      notifications: data
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/:userType/:userId/unread-count
 * Get count of unread notifications
 */
app.get("/api/notifications/:userType/:userId/unread-count", async (req, res) => {
  try {
    const { userType, userId } = req.params;

    // Build query based on user type
    let query = supabase
      .from('Notifications')
      .select('notification_id', { count: 'exact', head: true })
      .eq('status', 'Pending');

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
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      count: count || 0
    });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/:notificationId/mark-read
 * Mark a single notification as read
 */
app.put("/api/notifications/:notificationId/mark-read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { data, error } = await supabase
      .from('Notifications')
      .update({
        status: 'Read',
        read_at: new Date().toISOString()
      })
      .eq('notification_id', notificationId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      notification: data[0]
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/:userType/:userId/mark-all-read
 * Mark all notifications as read for a user
 */
app.put("/api/notifications/:userType/:userId/mark-all-read", async (req, res) => {
  try {
    const { userType, userId } = req.params;

    let query = supabase
      .from('Notifications')
      .update({
        status: 'Read',
        read_at: new Date().toISOString()
      })
      .eq('status', 'Pending');

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
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      updated_count: data.length
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
app.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { data, error } = await supabase
      .from('Notifications')
      .delete()
      .eq('notification_id', notificationId)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
