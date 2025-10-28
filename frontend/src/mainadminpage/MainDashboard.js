import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../includes/MainSideBar";
import axios from "axios";
import {
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function MainDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("mainadmin");

    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/main/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
      fetchDashboardData();
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/main/login");
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch statistics
      const statsResponse = await axios.get(`${API_URL}/api/dashboard/admin/stats`);

      // Fetch recent requests
      const requestsResponse = await axios.get(
        `${API_URL}/api/dashboard/admin/recent-requests`
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (requestsResponse.data.success) {
        setRecentRequests(requestsResponse.data.requests);
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
      <span
        className={`badge bg-${badge.color} d-inline-flex align-items-center gap-1`}
      >
        {badge.icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <MainSideBar>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainSideBar>
    );
  }

  return (
    <>
      <MainSideBar>
        <div className="p-4">
          {/* Header */}
          <div className="mb-4">
            <h2 className="display-5 fw-bold text-dark mb-2">
              Welcome, {username}!
            </h2>
            <p className="text-muted">Here's what's happening with your system today</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Stats Cards Row 1 - Main Metrics */}
          <div className="row mb-4">
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Requests</p>
                      <h3 className="mb-0 fw-bold text-primary">
                        {stats?.requests?.total || 0}
                      </h3>
                      <small className="text-success">
                        <TrendingUp size={12} className="me-1" />
                        Active system
                      </small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <FileText size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending Requests</p>
                      <h3 className="mb-0 fw-bold text-warning">
                        {stats?.requests?.pending || 0}
                      </h3>
                      <small className="text-muted">Needs attention</small>
                    </div>
                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                      <Clock size={24} className="text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Users</p>
                      <h3 className="mb-0 fw-bold text-info">
                        {stats?.users?.owners || 0}
                      </h3>
                      <small className="text-muted">Business owners</small>
                    </div>
                    <div className="bg-info bg-opacity-10 p-3 rounded">
                      <Users size={24} className="text-info" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {/* Stats Cards Row 2 - Detailed Metrics */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Processing</span>
                    <span className="badge bg-info">{stats?.requests?.processing || 0}</span>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
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
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Approved</span>
                    <span className="badge bg-success">{stats?.requests?.approved || 0}</span>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
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
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Released</span>
                    <span className="badge bg-primary">{stats?.requests?.released || 0}</span>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
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

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Payments to Verify</span>
                    <span className="badge bg-warning">{stats?.payments?.submitted || 0}</span>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.payments?.total > 0
                            ? (stats.payments.submitted / stats.payments.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="card-title mb-0 d-flex align-items-center gap-2">
                    <FileText size={20} />
                    Recent Requests
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Tracking Code</th>
                          <th>Category</th>
                          <th>Owner</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRequests.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">
                              No recent requests
                            </td>
                          </tr>
                        ) : (
                          recentRequests.map((request) => (
                            <tr key={request.request_id}>
                              <td>
                                <span className="badge bg-secondary">
                                  {request.tracking_code}
                                </span>
                              </td>
                              <td>{request.category_name}</td>
                              <td>{request.owner_name}</td>
                              <td>{getStatusBadge(request.status)}</td>
                              <td className="text-muted small">
                                {formatDate(request.created_at)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainSideBar>
    </>
  );
}

export default MainDashboard;
