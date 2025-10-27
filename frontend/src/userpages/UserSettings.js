import { useState, useEffect } from 'react';
import UserSideBAr from '../includes/UserSideBar';
import axios from 'axios';
import {
  User,
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

function UserSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form states
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = 'https://oabs-f7by.onrender.com';
  // const API_URL = 'http://localhost:3000';

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const ownerId = user.owner_id;

  useEffect(() => {
    if (ownerId) {
      fetchUserProfile();
    }
  }, [ownerId]);

  const fetchUserProfile = async () => {
    try {
      // Load from localStorage first
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setFullname(storedUser.fullname || '');
      setEmail(storedUser.email || '');
      setUsername(storedUser.username || '');
      setPhoneNumber(storedUser.phone_number || '');
      setBusinessName(storedUser.business_name || '');
      setBusinessAddress(storedUser.business_address || '');
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/api/user/update-profile/${ownerId}`,
        {
          fullname,
          email,
          phoneNumber,
          businessName,
          businessAddress,
        }
      );

      if (response.data.success) {
        // Update localStorage with new data
        const updatedUser = {
          ...user,
          ...response.data.user,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(
        err.response?.data?.message || 'An error occurred while updating profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/user/change-password/${ownerId}`,
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(
        err.response?.data?.message || 'An error occurred while changing password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          {/* Page Header */}
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h2 className="mb-1">Account Settings</h2>
            <small className="text-muted">
              Manage your profile and security settings
            </small>
          </div>

          {/* Success/Error Alerts */}
          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} className="me-2" style={{ display: 'inline' }} />
                Profile Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={16} className="me-2" style={{ display: 'inline' }} />
                Change Password
              </button>
            </li>
          </ul>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <User size={20} className="me-2" style={{ display: 'inline' }} />
                  Profile Information
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateProfile}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <User size={16} className="me-1" style={{ display: 'inline' }} />
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <Mail size={16} className="me-1" style={{ display: 'inline' }} />
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <User size={16} className="me-1" style={{ display: 'inline' }} />
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={username}
                        disabled
                        readOnly
                      />
                      <small className="text-muted">Username cannot be changed</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <Phone size={16} className="me-1" style={{ display: 'inline' }} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="09123456789"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <Building size={16} className="me-1" style={{ display: 'inline' }} />
                        Business Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your Business Name"
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <MapPin size={16} className="me-1" style={{ display: 'inline' }} />
                        Business Address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Complete Business Address"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary d-flex align-items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <Lock size={20} className="me-2" style={{ display: 'inline' }} />
                  Change Password
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info mb-4">
                  <small>
                    <strong>Password Requirements:</strong>
                    <ul className="mb-0 mt-1 ps-3">
                      <li>Minimum 6 characters long</li>
                      <li>Should be different from your current password</li>
                      <li>Use a strong, unique password</li>
                    </ul>
                  </small>
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label">
                      <Lock size={16} className="me-1" style={{ display: 'inline' }} />
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <Lock size={16} className="me-1" style={{ display: 'inline' }} />
                      New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <Lock size={16} className="me-1" style={{ display: 'inline' }} />
                      Confirm New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <div className="alert alert-warning">
                      <small>Passwords do not match</small>
                    </div>
                  )}

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="submit"
                      className="btn btn-danger d-flex align-items-center gap-2"
                      disabled={loading || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </UserSideBAr>
    </>
  );
}

export default UserSettings;