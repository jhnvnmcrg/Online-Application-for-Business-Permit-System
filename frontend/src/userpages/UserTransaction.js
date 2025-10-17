import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import {
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  RefreshCw,
} from "lucide-react";

function UserTransaction() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // API Base URL
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000"; // For local development

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ownerId = user.owner_id;

  // Fetch requests on component mount
  useEffect(() => {
    if (ownerId) {
      fetchRequests();
    }
  }, [ownerId]);

  // Filter requests when search term or status filter changes
  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_URL}/api/request/owner/${ownerId}`
      );

      if (response.data.success) {
        setRequests(response.data.requests);
        setFilteredRequests(response.data.requests);
      } else {
        setError("Failed to fetch requests");
      }
    } catch (err) {
      console.error("Fetch requests error:", err);
      setError("An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Filter by search term (tracking code or category name)
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.tracking_code.toLowerCase().includes(search) ||
          req.category_name?.toLowerCase().includes(search)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      setLoadingDetails(true);
      const response = await axios.get(
        `${API_URL}/api/request/details/${requestId}`
      );

      if (response.data.success) {
        setRequestDetails(response.data);
      } else {
        setError("Failed to fetch request details");
      }
    } catch (err) {
      console.error("Fetch request details error:", err);
      setError("An error occurred while fetching request details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    await fetchRequestDetails(request.request_id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setRequestDetails(null);
    setShowCancelConfirm(false);
  };

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);
      setError("");

      const response = await axios.put(
        `${API_URL}/api/request/cancel/${selectedRequest.request_id}`,
        { ownerId: ownerId }
      );

      if (response.data.success) {
        // Refresh the requests list
        await fetchRequests();
        // Close modal
        closeModal();
        // Show success message (optional - you can add a success state)
        alert("Request cancelled successfully");
      } else {
        setError(response.data.message || "Failed to cancel request");
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error("Cancel request error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while cancelling the request"
      );
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredRequests.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      Pending: {
        color: "warning",
        icon: <Clock size={14} className="me-1" />,
      },
      Processing: {
        color: "info",
        icon: <AlertTriangle size={14} className="me-1" />,
      },
      Approved: {
        color: "success",
        icon: <CheckCircle size={14} className="me-1" />,
      },
      Rejected: {
        color: "danger",
        icon: <XCircle size={14} className="me-1" />,
      },
      Released: {
        color: "primary",
        icon: <CheckCircle size={14} className="me-1" />,
      },
      Cancelled: {
        color: "secondary",
        icon: <Ban size={14} className="me-1" />,
      },
    };

    const badge = badges[status] || badges.Pending;

    return (
      <span className={`badge bg-${badge.color} d-flex align-items-center`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h2 className="mb-1">Transactions</h2>
            <small className="text-muted">View all your permit requests</small>
          </div>

          {/* Main Content Card */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                {/* Card Header */}
                <div
                  className="card-header text-white"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  <h5 className="mb-0">List of Transactions</h5>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  {/* Controls Row */}
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Show</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "80px" }}
                          value={entriesPerPage}
                          onChange={(e) =>
                            setEntriesPerPage(parseInt(e.target.value))
                          }
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="ms-2">entries</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Released">Released</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-end align-items-center">
                        <label className="me-2">Search:</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ width: "250px" }}
                          placeholder="Tracking code or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>TRACKING CODE</th>
                          <th>CATEGORY</th>
                          <th>DATE REQUESTED</th>
                          <th>DATE RELEASE</th>
                          <th>STATUS</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : currentEntries.length === 0 ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center text-muted py-4"
                            >
                              {searchTerm || statusFilter !== "All"
                                ? "No requests found matching your filters"
                                : "No requests yet. Submit a request from the Checklist page."}
                            </td>
                          </tr>
                        ) : (
                          currentEntries.map((request, index) => (
                            <tr key={request.request_id}>
                              <td>{indexOfFirstEntry + index + 1}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {request.tracking_code}
                                </span>
                              </td>
                              <td>{request.category_name || "N/A"}</td>
                              <td>{formatDate(request.date_requested)}</td>
                              <td>{formatDate(request.date_release)}</td>
                              <td>{getStatusBadge(request.status)}</td>
                              <td>
                                <button
                                  className="btn btn-warning btn-sm px-3 d-flex align-items-center gap-1"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  <Eye size={14} />
                                  VIEW
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Info and Pagination */}
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p className="text-muted small">
                        Showing {indexOfFirstEntry + 1} to{" "}
                        {Math.min(indexOfLastEntry, filteredRequests.length)} of{" "}
                        {filteredRequests.length} entries
                      </p>
                    </div>
                    <div className="col-md-6">
                      <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm justify-content-end mb-0">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, i) => (
                            <li
                              key={i + 1}
                              className={`page-item ${
                                currentPage === i + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => paginate(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserSideBAr>

      {/* View Details Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#dc3545" }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FileText size={20} />
                  Request Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {loadingDetails ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : requestDetails ? (
                  <>
                    {/* Request Information */}
                    <div className="mb-4">
                      <h6 className="text-primary border-bottom pb-2">
                        Request Information
                      </h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">
                            Tracking Code
                          </label>
                          <p className="mb-0">
                            <span className="badge bg-secondary fs-6">
                              {selectedRequest?.tracking_code}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Status</label>
                          <p className="mb-0">
                            {getStatusBadge(selectedRequest?.status)}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Category</label>
                          <p className="mb-0">
                            {requestDetails.request?.DocumentCategories
                              ?.category_name || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">
                            Date Requested
                          </label>
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(selectedRequest?.date_requested)}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">
                            Date Release
                          </label>
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(selectedRequest?.date_release)}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">
                            Processed By
                          </label>
                          <p className="mb-0">
                            {selectedRequest?.processor_name || "Not yet assigned"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Data */}
                    {requestDetails.formData &&
                      requestDetails.formData.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-primary border-bottom pb-2">
                            Submitted Form Data
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "40%" }}>Field Name</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {requestDetails.formData.map((data) => (
                                  <tr key={data.data_id}>
                                    <td className="fw-bold">
                                      {data.DocumentForms?.field_name || "N/A"}
                                    </td>
                                    <td>
                                      {data.DocumentForms?.field_type ===
                                      "FILE" ? (
                                        <a
                                          href={data.field_value}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-link p-0"
                                        >
                                          View File
                                        </a>
                                      ) : (
                                        data.field_value || "N/A"
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="alert alert-warning">
                    Failed to load request details
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {showCancelConfirm ? (
                  // Confirmation dialog
                  <div className="w-100">
                    <div className="alert alert-warning mb-3">
                      <strong>Are you sure you want to cancel this request?</strong>
                      <p className="mb-0 mt-2 small">
                        This action cannot be undone. Only pending requests can be cancelled.
                      </p>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={cancelling}
                      >
                        No, Keep It
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleCancelRequest}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <Ban size={16} className="me-2" />
                            Yes, Cancel Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal buttons
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    {selectedRequest?.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary d-flex align-items-center gap-1"
                          onClick={() => {
                            closeModal();
                            // Navigate to checklist to update
                            window.location.href = "/oabps/user/checklist";
                          }}
                        >
                          <RefreshCw size={16} />
                          Update Request
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger d-flex align-items-center gap-1"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          <Ban size={16} />
                          Cancel Request
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTransaction;
