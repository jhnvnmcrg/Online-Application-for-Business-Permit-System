import { useState, useEffect } from "react";
import MainSideBar from "../includes/MainSideBar";
import { User, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MainSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // API Base URL
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000"; // For local development

  // Get admin data from localStorage
  const [adminData, setAdminData] = useState({});
  const [adminId, setAdminId] = useState(null);

  // Profile Form State
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  // Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get admin data from localStorage
    const userData = localStorage.getItem("main");

    if (!userData) {
      navigate("/oabps/main/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      setAdminData(user);
      setAdminId(user.admin_id);
      setFullname(user.fullname || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/main/login");
    }
  }, [navigate]);

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        `${API_URL}/api/admin/update/${adminId}`,
        {
          fullname,
          email,
          username,
        }
      );

      if (response.data.success) {
        // Update localStorage
        const updatedData = { ...adminData, fullname, email, username };
        localStorage.setItem("main", JSON.stringify(updatedData));
        setAdminData(updatedData);

        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error updating profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/admin/update/${adminId}`,
        {
          fullname,
          email,
          username,
          password: newPassword,
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Password changed successfully!",
        });

        // Clear password fields
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Error changing password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render Profile Settings Tab
  const renderProfileTab = () => (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <User size={20} className="me-2" />
          Profile Information
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleProfileUpdate}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="fullname" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-control"
                value={
                  adminData.role
                    ? adminData.role.charAt(0).toUpperCase() +
                      adminData.role.slice(1)
                    : "N/A"
                }
                disabled
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Account Status</label>
              <div>
                <span
                  className={`badge ${
                    adminData.status === "active" ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {adminData.status || "Active"}
                </span>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Account Created</label>
              <input
                type="text"
                className="form-control"
                value={
                  adminData.created_at
                    ? new Date(adminData.created_at).toLocaleDateString()
                    : "N/A"
                }
                disabled
              />
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="me-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Password Change Tab
  const renderPasswordTab = () => (
    <div className="card">
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">
          <Lock size={20} className="me-2" />
          Change Password
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handlePasswordChange}>
          <div className="alert alert-info">
            <small>
              Password must be at least 6 characters long. For security, use a
              mix of letters, numbers, and special characters.
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="position-relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: "45px" }}
              />
              <button
                type="button"
                className="btn btn-link position-absolute"
                style={{
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: "45px" }}
              />
              <button
                type="button"
                className="btn btn-link position-absolute"
                style={{
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Changing...
                </>
              ) : (
                <>
                  <Lock size={18} className="me-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <MainSideBar>
      <div className="container-fluid p-4">
        {/* Header */}
        

        {/* Success/Error Messages */}
        {message.text && (
          <div
            className={`alert alert-${
              message.type === "success" ? "success" : "danger"
            } alert-dismissible fade show d-flex align-items-center`}
            role="alert"
          >
            {message.type === "success" ? (
              <CheckCircle size={20} className="me-2" />
            ) : (
              <AlertCircle size={20} className="me-2" />
            )}
            {message.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage({ type: "", text: "" })}
            ></button>
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("profile");
                setMessage({ type: "", text: "" });
              }}
            >
              <User size={18} className="me-2" />
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "password" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("password");
                setMessage({ type: "", text: "" });
              }}
            >
              <Lock size={18} className="me-2" />
              Password
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "password" && renderPasswordTab()}
        </div>
      </div>
    </MainSideBar>
  );
}

export default MainSettings;
