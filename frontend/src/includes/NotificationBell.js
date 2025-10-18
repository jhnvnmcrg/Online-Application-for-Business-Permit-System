import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const API_URL = 'http://localhost:3000';

  // Get user info from localStorage
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); // 'User', 'Admin', or 'Processor'

    return { user, token, userType };
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { user, token, userType } = getUserInfo();
      if (!user || !token || !userType) return;

      const userId = userType === 'User' ? user.owner_id : user.admin_id;

      const response = await axios.get(
        `${API_URL}/api/notifications/${userType}/${userId}/unread-count`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { user, token, userType } = getUserInfo();
      if (!user || !token || !userType) return;

      const userId = userType === 'User' ? user.owner_id : user.admin_id;

      const response = await axios.get(
        `${API_URL}/api/notifications/${userType}/${userId}?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { token } = getUserInfo();
      if (!token) return;

      await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local state
      setNotifications(notifications.map(n =>
        n.notification_id === notificationId
          ? { ...n, read_at: new Date().toISOString() }
          : n
      ));

      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { user, token, userType } = getUserInfo();
      if (!user || !token || !userType) return;

      const userId = userType === 'User' ? user.owner_id : user.admin_id;

      await axios.put(
        `${API_URL}/api/notifications/${userType}/${userId}/read-all`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh notifications
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const { token } = getUserInfo();
      if (!token) return;

      await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local state
      setNotifications(notifications.filter(n => n.notification_id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and set interval
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link position-relative p-2"
        onClick={toggleDropdown}
        style={{ textDecoration: 'none' }}
      >
        <i className="fas fa-bell" style={{ fontSize: '20px', color: '#333' }}></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '10px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu dropdown-menu-end show p-0"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '350px',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1050,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-primary"
                onClick={markAllAsRead}
                style={{ fontSize: '12px', textDecoration: 'none' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div>
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="fas fa-bell-slash mb-2" style={{ fontSize: '24px' }}></i>
                <p className="mb-0">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`notification-item p-3 border-bottom ${!notification.read_at ? 'bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !notification.read_at && markAsRead(notification.notification_id)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ fontSize: '14px', fontWeight: !notification.read_at ? 'bold' : 'normal' }}>
                        {notification.subject}
                      </h6>
                      <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                        {notification.message}
                      </p>
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        {formatDate(notification.created_at)}
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-link text-danger p-0 ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.notification_id);
                      }}
                      title="Delete"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 text-center border-top">
              <button
                className="btn btn-sm btn-link text-primary"
                onClick={() => setShowDropdown(false)}
                style={{ fontSize: '12px', textDecoration: 'none' }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
