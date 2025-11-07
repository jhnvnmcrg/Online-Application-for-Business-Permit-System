import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import {
  FileText,
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PORTAL_ROUTES } from "../config/routes";

function UserDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [ownerId, setOwnerId] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("owner");

    if (!userData) {
      // If no user data, redirect to login
      navigate(PORTAL_ROUTES.AUTH);
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
      setOwnerId(user.owner_id);

      if (user.owner_id) {
        fetchDashboardData(user.owner_id);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate(PORTAL_ROUTES.AUTH);
    }
  }, [navigate]);

  const fetchDashboardData = async (ownerId) => {
    try {
      setLoading(true);
      setError("");

      // Fetch statistics
      const statsResponse = await axios.get(
        `${API_URL}/api/dashboard/user/stats/${ownerId}`
      );

      // Fetch recent activity
      const activityResponse = await axios.get(
        `${API_URL}/api/dashboard/user/recent-activity/${ownerId}`
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.activity);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: { color: "warning", icon: <Clock size={12} /> },
      Processing: { color: "info", icon: <AlertTriangle size={12} /> },
      Approved: { color: "success", icon: <CheckCircle size={12} /> },
      Rejected: { color: "danger", icon: <XCircle size={12} /> },
      Released: { color: "primary", icon: <CheckCircle size={12} /> },
    };

    const badge = badges[status] || badges.Pending;

    return (
      <span className={`badge bg-${badge.color} d-inline-flex align-items-center gap-1`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <UserSideBAr>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserSideBAr>
    );
  }

  return (
    <>
      <UserSideBAr>
        <div className="mb-3 mb-md-4">
          <h2 className="h3 h2-md fw-bold text-dark mb-2">
            Welcome, {username}!
          </h2>
          <p className="text-muted small">Manage your business permits and applications</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Quick Action Cards */}
        <div className="row g-2 g-md-4 mb-3 mb-md-4">
          <div className="col-12 col-md-4">
            <Link to={PORTAL_ROUTES.APPLY} className="text-decoration-none">
              <div className="dashboard-card card bg-danger text-white h-100 hover-shadow">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold mb-1">New Business</h5>
                      <p className="card-text opacity-75 small">Apply for new permit</p>
                    </div>
                    <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                      <FileText size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to={PORTAL_ROUTES.HISTORY} className="text-decoration-none">
              <div className="dashboard-card card bg-danger text-white h-100 hover-shadow">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold mb-1">My Transactions</h5>
                      <p className="card-text opacity-75 small">View application status</p>
                    </div>
                    <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                      <CreditCard size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to={PORTAL_ROUTES.RESOURCES} className="text-decoration-none">
              <div className="dashboard-card card bg-danger text-white h-100 hover-shadow">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold mb-1">Downloadables</h5>
                      <p className="card-text opacity-75 small">Forms & documents</p>
                    </div>
                    <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                      <Download size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-2 g-md-4 mb-3 mb-md-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Total Requests</p>
                    <h4 className="mb-0 fw-bold text-primary h5 h3-md">
                      {stats?.requests?.total || 0}
                    </h4>
                    <small className="text-muted d-none d-md-block">All applications</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-1 p-md-2 rounded">
                    <FileText size={16} className="text-primary d-md-none" />
                    <FileText size={20} className="text-primary d-none d-md-block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Pending</p>
                    <h4 className="mb-0 fw-bold text-warning h5 h3-md">
                      {stats?.requests?.pending || 0}
                    </h4>
                    <small className="text-muted d-none d-md-block">Under review</small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-1 p-md-2 rounded">
                    <Clock size={16} className="text-warning d-md-none" />
                    <Clock size={20} className="text-warning d-none d-md-block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Approved</p>
                    <h4 className="mb-0 fw-bold text-success h5 h3-md">
                      {stats?.requests?.approved || 0}
                    </h4>
                    <small className="text-muted d-none d-md-block">Ready for payment</small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-1 p-md-2 rounded">
                    <CheckCircle size={16} className="text-success d-md-none" />
                    <CheckCircle size={20} className="text-success d-none d-md-block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Completed</p>
                    <h4 className="mb-0 fw-bold text-primary h5 h3-md">
                      {stats?.requests?.released || 0}
                    </h4>
                    <small className="text-muted d-none d-md-block">
                      Finished
                    </small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-1 p-md-2 rounded">
                    <CheckCircle size={16} className="text-primary d-md-none" />
                    <CheckCircle size={20} className="text-primary d-none d-md-block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview & Recent Activity */}
        <div className="row g-2 g-md-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom p-2 p-md-3">
                <h6 className="card-title mb-0 fw-bold">Application Status Overview</h6>
              </div>
              <div className="card-body p-2 p-md-3">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Pending Review</span>
                    <span className="fw-bold text-warning">
                      {stats?.requests?.pending || 0}
                    </span>
                  </div>
                  <div className="progress mb-1" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.requests?.total > 0
                            ? (stats.requests.pending / stats.requests.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Processing</span>
                    <span className="fw-bold text-info">
                      {stats?.requests?.processing || 0}
                    </span>
                  </div>
                  <div className="progress mb-1" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.requests?.total > 0
                            ? (stats.requests.processing / stats.requests.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Approved</span>
                    <span className="fw-bold text-success">
                      {stats?.requests?.approved || 0}
                    </span>
                  </div>
                  <div className="progress mb-1" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.requests?.total > 0
                            ? (stats.requests.approved / stats.requests.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Released</span>
                    <span className="fw-bold text-primary">
                      {stats?.requests?.released || 0}
                    </span>
                  </div>
                  <div className="progress mb-1" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.requests?.total > 0
                            ? (stats.requests.released / stats.requests.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom p-2 p-md-3">
                <h6 className="card-title mb-0 fw-bold">Recent Activity</h6>
              </div>
              <div className="card-body p-2 p-md-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <FileText size={48} className="text-muted opacity-25 mb-2" />
                    <p className="mb-0">No recent activity</p>
                    <small>Start by applying for a new permit</small>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.request_id}
                        className="activity-item d-flex align-items-start mb-3 pb-3 border-bottom"
                      >
                        <div className="activity-icon me-3">
                          <div className="bg-light p-2 rounded">
                            <FileText size={20} className="text-danger" />
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p className="mb-1 fw-medium">
                                {activity.category_name}
                              </p>
                              <p className="mb-1 small text-muted">
                                {activity.tracking_code}
                              </p>
                            </div>
                            <div>{getStatusBadge(activity.status)}</div>
                          </div>
                          <small className="text-muted">
                            {formatDate(activity.updated_at)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {stats && stats.payments.total > 0 && (
          <div className="row g-2 g-md-4 mt-1">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom p-2 p-md-3">
                  <h6 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                    <DollarSign size={18} />
                    Payment Summary
                  </h6>
                </div>
                <div className="card-body p-2 p-md-3">
                  <div className="row">
                    <div className="col-6 col-md-3 mb-2 mb-md-3">
                      <div className="border-start border-primary border-4 ps-2 ps-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Total Payments</p>
                        <h5 className="mb-0 h6 h4-md">{stats.payments.total}</h5>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-3">
                      <div className="border-start border-warning border-4 ps-2 ps-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Pending</p>
                        <h5 className="mb-0 h6 h4-md">{stats.payments.pending}</h5>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-3">
                      <div className="border-start border-success border-4 ps-2 ps-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Verified</p>
                        <h5 className="mb-0 h6 h4-md">{stats.payments.verified}</h5>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mb-2 mb-md-3">
                      <div className="border-start border-info border-4 ps-2 ps-md-3">
                        <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Total Amount</p>
                        <h5 className="mb-0 h6 h4-md">
                          ₱{stats.payments.totalAmount.toFixed(2)}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </UserSideBAr>
    </>
  );
}

export default UserDashboard;
