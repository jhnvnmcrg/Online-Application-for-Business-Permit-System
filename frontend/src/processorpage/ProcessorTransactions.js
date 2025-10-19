import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProcessorSideBar from "../includes/ProcessorSideBar";
import axios from "axios";
import {
  Eye,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  AlertCircle,
  User,
} from "lucide-react";

function ProcessorTransactions() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignedCategoryIds, setAssignedCategoryIds] = useState([]);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const navigate = useNavigate();
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

      fetchAssignedCategoriesAndRequests(processorId);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/processor/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, requests]);

  const fetchAssignedCategoriesAndRequests = async (processorId) => {
    try {
      setLoading(true);
      setError("");

      // First, fetch assigned categories
      const categoriesResponse = await axios.get(
        `${API_URL}/api/processor/assigned-categories/${processorId}`
      );

      if (categoriesResponse.data.success && categoriesResponse.data.categories) {
        const categories = categoriesResponse.data.categories || [];

        if (categories.length === 0) {
          setError("No categories assigned to this processor");
          setRequests([]);
          setFilteredRequests([]);
          setAssignedCategoryIds([]);
          setLoading(false);
          return;
        }

        const categoryIds = categories.map((cat) => cat.category_id);
        setAssignedCategoryIds(categoryIds);

        // Fetch all requests
        const response = await axios.get(`${API_URL}/api/request/all`);

        if (response.data.success && response.data.requests) {
          const allRequests = response.data.requests || [];

          // Filter to show only Rejected, Released, and Cancelled for assigned categories
          const completedRequests = allRequests.filter(
            (req) =>
              categoryIds.includes(req.category_id) &&
              (req.status === "Rejected" ||
                req.status === "Released" ||
                req.status === "Cancelled")
          );
          setRequests(completedRequests);
          setFilteredRequests(completedRequests);
        } else {
          setError("Failed to fetch requests");
        }
      } else {
        setError("No categories assigned to this processor");
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

    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.tracking_code.toLowerCase().includes(search) ||
          req.category_name?.toLowerCase().includes(search) ||
          req.owner_name?.toLowerCase().includes(search)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
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
    setShowViewModal(true);
    await fetchRequestDetails(request.request_id);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
    setRequestDetails(null);
    setError("");
  };

  // Pagination
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      Rejected: { color: "danger", icon: <XCircle size={14} /> },
      Released: { color: "success", icon: <CheckCircle size={14} /> },
      Cancelled: { color: "secondary", icon: <Ban size={14} /> },
    };

    const badge = badges[status] || { color: "secondary", icon: <Clock size={14} /> };

    return (
      <span className={`badge bg-${badge.color} d-inline-flex align-items-center gap-1`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  return (
    <>
      <ProcessorSideBar>
        <div className="container-fluid p-4">
          <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
            <h4 className="mb-4">Transaction History (My Categories)</h4>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                >
                  <option value={10}>10 entries</option>
                  <option value={25}>25 entries</option>
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Released">Released</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by tracking code, category, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Tracking Code</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Date Requested</th>
                    <th>Date Release</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentEntries.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No completed transactions found in your assigned categories
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
                        <td>{request.owner_name || "N/A"}</td>
                        <td>{formatDate(request.date_requested)}</td>
                        <td>{formatDate(request.date_release)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewDetails(request)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="row mt-3">
              <div className="col-md-6">
                <p className="text-muted small">
                  Showing {indexOfFirstEntry + 1} to{" "}
                  {Math.min(indexOfLastEntry, filteredRequests.length)} of{" "}
                  {filteredRequests.length} entries
                </p>
              </div>
              <div className="col-md-6">
                <nav>
                  <ul className="pagination pagination-sm justify-content-end mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
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
      </ProcessorSideBar>

      {/* View Details Modal */}
      {showViewModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FileText size={20} />
                  Request Details - {selectedRequest?.tracking_code}
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
                          <label className="text-muted small">Tracking Code</label>
                          <p className="mb-0">
                            <span className="badge bg-secondary fs-6">
                              {selectedRequest?.tracking_code}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Status</label>
                          <p className="mb-0">{getStatusBadge(selectedRequest?.status)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Category</label>
                          <p className="mb-0">
                            {requestDetails.request?.DocumentCategories?.category_name || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Owner</label>
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <User size={14} />
                            {requestDetails.request?.Owners?.fullname || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Date Requested</label>
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(selectedRequest?.date_requested)}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Date Release</label>
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(selectedRequest?.date_release)}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Processed By</label>
                          <p className="mb-0">
                            {requestDetails.request?.Admins?.fullname || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Remarks</label>
                          <p className="mb-0">
                            {selectedRequest?.remarks || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Data */}
                    {requestDetails.formData && requestDetails.formData.length > 0 && (
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
                                    {data.DocumentForms?.field_type === "FILE" ? (
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
                  <div className="alert alert-warning">Failed to load request details</div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProcessorTransactions;
