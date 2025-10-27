import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProcessorSideBar from "../includes/ProcessorSideBar";
import axios from "axios";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";

function ProcessorDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  useEffect(() => {
    const userData = localStorage.getItem("processor");

    if (!userData) {
      navigate("/oabps/processor/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const processorId = user.admin_id;

      if (!processorId) {
        navigate("/oabps/processor/login");
        return;
      }

      setUsername(user.username || user.fullname || "User");
      fetchDashboardData(processorId);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/processor/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async (processorId) => {
    try {
      setLoading(true);
      setError("");

      // First, fetch assigned categories
      const categoriesResponse = await axios.get(
        `${API_URL}/api/processor/assigned-categories/${processorId}`
      );

      if (categoriesResponse.data.success && categoriesResponse.data.categories) {
        const categories = categoriesResponse.data.categories || [];
        setAssignedCategories(categories);

        // Check if processor has any assigned categories
        if (categories.length === 0) {
          setError("No categories assigned to this processor");
          setStats({
            requests: { total: 0, pending: 0, processing: 0, approved: 0, released: 0 },
            categories: 0,
            payments: { total: 0, overdue: 0, submitted: 0 }
          });
          setRecentRequests([]);
          setLoading(false);
          return;
        }

        // Extract category IDs
        const categoryIds = categories.map((cat) => cat.category_id);

        // Fetch all requests and filter by assigned categories
        const requestsResponse = await axios.get(`${API_URL}/api/request/all`);

        if (requestsResponse.data.success && requestsResponse.data.requests) {
          const allRequests = requestsResponse.data.requests || [];

          // Filter requests by assigned categories
          const filteredRequests = allRequests.filter((req) =>
            categoryIds.includes(req.category_id)
          );

          // Calculate statistics for assigned categories only
          const statsData = {
            requests: {
              total: filteredRequests.length,
              pending: filteredRequests.filter((r) => r.status === "Pending").length,
              processing: filteredRequests.filter((r) => r.status === "Processing").length,
              approved: filteredRequests.filter((r) => r.status === "Approved").length,
              released: filteredRequests.filter((r) => r.status === "Released").length,
            },
            categories: categories.length,
          };

          // Fetch all payments and filter by requests in assigned categories
          // Initialize default payment stats
          statsData.payments = {
            total: 0,
            overdue: 0,
            submitted: 0,
          };

          try {
            const paymentsResponse = await axios.get(`${API_URL}/api/payment/all`);

            if (paymentsResponse.data.success && paymentsResponse.data.payments) {
              const allPayments = paymentsResponse.data.payments || [];

              // Filter payments by requests in assigned categories
              const filteredPayments = allPayments.filter((payment) =>
                categoryIds.includes(payment.Requests?.category_id)
              );

              statsData.payments = {
                total: filteredPayments.length,
                pending: filteredPayments.filter((p) => p.status === "Pending").length,
                verified: filteredPayments.filter((p) => p.status === "Verified").length,
              };
            }
          } catch (paymentError) {
            console.error("Error fetching payments:", paymentError);
            // Payment stats already initialized with zeros
          }

          setStats(statsData);

          // Get recent requests (last 10) for assigned categories
          const recent = filteredRequests
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

          setRecentRequests(recent);
        }
      } else {
        setError("No categories assigned to this processor");
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
      <ProcessorSideBar>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </ProcessorSideBar>
    );
  }

  return (
    <>
      <ProcessorSideBar>
        <div className="p-4">
          {/* Header */}
          <div className="mb-4">
            <h2 className="display-5 fw-bold text-dark mb-2">
              Welcome, {username}!
            </h2>
            
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Stats Cards Row 1 - Main Metrics */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">My Requests</p>
                      <h3 className="mb-0 fw-bold text-primary">
                        {stats?.requests?.total || 0}
                      </h3>
                      <small className="text-success">
                        <TrendingUp size={12} className="me-1" />
                        Assigned to you
                      </small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <FileText size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
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

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">My Categories</p>
                      <h3 className="mb-0 fw-bold text-info">
                        {stats?.categories || 0}
                      </h3>
                      <small className="text-muted">Assigned categories</small>
                    </div>
                    <div className="bg-info bg-opacity-10 p-3 rounded">
                      <FolderOpen size={24} className="text-info" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending Payments</p>
                      <h3 className="mb-0 fw-bold text-warning">
                        {stats?.payments?.pending || 0}
                      </h3>
                      <small className="text-muted">
                        Awaiting payment
                      </small>
                    </div>
                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                      <Clock size={24} className="text-warning" />
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
                    <span className="text-muted small">Verified Payments</span>
                    <span className="badge bg-success">{stats?.payments?.verified || 0}</span>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${
                          stats?.payments?.total > 0
                            ? (stats.payments.verified / stats.payments.total) * 100
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
                        {!recentRequests || recentRequests.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">
                              No recent requests in your assigned categories
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
      </ProcessorSideBar>
    </>
  );
}

export default ProcessorDashboard;
