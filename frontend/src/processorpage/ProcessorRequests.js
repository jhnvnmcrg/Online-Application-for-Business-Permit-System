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
  AlertTriangle,
  Ban,
  DollarSign,
  Edit,
  AlertCircle,
  User,
  Trash2,
} from "lucide-react";

function ProcessorRequests() {
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status update states
  const [newStatus, setNewStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentRemarks, setAttachmentRemarks] = useState("");
  const [showPaymentOption, setShowPaymentOption] = useState(false);
  const [hasExistingPayment, setHasExistingPayment] = useState(false);

  // Payment modal states
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Permit Fee");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [addingPayment, setAddingPayment] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [removingPayment, setRemovingPayment] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ title: "", message: "", type: "success" });

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

          // Filter to show only Pending, Under Review, and Approved for assigned categories
          const activeRequests = allRequests.filter(
            (req) =>
              categoryIds.includes(req.category_id) &&
              (req.status === "Pending" ||
                req.status === "Under Review" ||
                req.status === "Approved")
          );
          setRequests(activeRequests);
          setFilteredRequests(activeRequests);
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

  const handleOpenStatusModal = async (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);

    // Check if payment already exists for this request
    try {
      const response = await axios.get(`${API_URL}/api/payment/request/${request.request_id}`);

      if (response.data.success && response.data.payments.length > 0) {
        setHasExistingPayment(true);
      } else {
        setHasExistingPayment(false);
      }
    } catch (err) {
      console.error("Check payment error:", err);
      setHasExistingPayment(false);
    }

    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    // Validate file if status is Completed
    if (newStatus === "Completed" && !attachmentFile) {
      setError("Please upload the document file for completion");
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("processor") || "{}");
      const processorId = user.admin_id;

      const formData = new FormData();
      formData.append("status", newStatus);
      formData.append("processedBy", processorId);
      if (statusRemarks) formData.append("remarks", statusRemarks);
      if (attachmentRemarks) formData.append("attachmentRemarks", attachmentRemarks);
      if (attachmentFile) formData.append("attachmentFile", attachmentFile);

      const response = await axios.put(
        `${API_URL}/api/request/update-status/${selectedRequest.request_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const user = JSON.parse(localStorage.getItem("processor") || "{}");
        await fetchAssignedCategoriesAndRequests(user.admin_id);
        setShowStatusModal(false);
        setNewStatus("");
        setStatusRemarks("");
        setAttachmentFile(null);
        setAttachmentRemarks("");

        // If Approved and payment option checked, open payment modal
        if (newStatus === "Approved" && showPaymentOption) {
          await handleOpenPaymentModal(selectedRequest);
        } else {
          showMessage("Success", "Request status updated successfully", "success");
        }
      } else {
        setError(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error:", err);
      setError(
        err.response?.data?.message || "An error occurred while updating status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchPaymentHistory = async (paymentId) => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${API_URL}/api/payment/history/${paymentId}`);

      if (response.data.success) {
        setPaymentHistory(response.data.history || []);
      } else {
        setPaymentHistory([]);
      }
    } catch (err) {
      console.error("Fetch payment history error:", err);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenPaymentModal = async (request) => {
    setSelectedRequest(request);

    // Check if payment already exists for this request
    try {
      const response = await axios.get(`${API_URL}/api/payment/request/${request.request_id}`);

      if (response.data.success && response.data.payments.length > 0) {
        // Payment exists, populate form with existing data (OTC model - Cash only)
        const payment = response.data.payments[0];
        setExistingPayment(payment);
        setIsUpdatingPayment(true);
        setPaymentAmount(payment.amount.toString());
        setPaymentType(payment.payment_type || "Permit Fee");
        setPaymentDescription(payment.description || "");

        // Fetch payment history
        await fetchPaymentHistory(payment.payment_id);
      } else {
        // No payment exists, reset form
        setExistingPayment(null);
        setIsUpdatingPayment(false);
        setPaymentAmount("");
        setPaymentType("Permit Fee");
        setPaymentDescription("");
        setPaymentHistory([]);
      }
    } catch (err) {
      console.error("Fetch payment error:", err);
      // If error, assume no payment exists
      setExistingPayment(null);
      setIsUpdatingPayment(false);
      setPaymentHistory([]);
    }

    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      setAddingPayment(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("processor") || "{}");
      const processorId = user.admin_id;

      let response;

      if (isUpdatingPayment && existingPayment) {
        // Update existing payment (OTC model - Cash only)
        response = await axios.put(
          `${API_URL}/api/payment/update/${existingPayment.payment_id}`,
          {
            amount: parseFloat(paymentAmount),
            paymentType,
            description: paymentDescription,
            paymentMethod: "Cash",
            updatedBy: processorId,
          }
        );
      } else {
        // Add new payment (OTC model - Cash only)
        response = await axios.post(`${API_URL}/api/payment/add`, {
          requestId: selectedRequest.request_id,
          amount: parseFloat(paymentAmount),
          paymentType,
          description: paymentDescription,
          paymentMethod: "Cash",
          createdBy: processorId,
        });
      }

      if (response.data.success) {
        setShowPaymentModal(false);
        // Reset form
        setPaymentAmount("");
        setPaymentType("Permit Fee");
        setPaymentDescription("");
        setExistingPayment(null);
        setIsUpdatingPayment(false);
        showMessage(
          "Success",
          isUpdatingPayment
            ? "Payment requirement updated successfully"
            : "Payment requirement added successfully",
          "success"
        );
      } else {
        setError(
          response.data.message ||
            `Failed to ${isUpdatingPayment ? "update" : "add"} payment`
        );
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.message ||
          `An error occurred while ${isUpdatingPayment ? "updating" : "adding"} payment`
      );
    } finally {
      setAddingPayment(false);
    }
  };

  const handleRemovePayment = async () => {
    if (!window.confirm("Are you sure you want to remove this payment requirement? This action cannot be undone.")) {
      return;
    }

    try {
      setRemovingPayment(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("processor") || "{}");
      const processorId = user.admin_id;

      const response = await axios.delete(
        `${API_URL}/api/payment/delete/${existingPayment.payment_id}`,
        {
          data: { deletedBy: processorId }
        }
      );

      if (response.data.success) {
        setShowPaymentModal(false);
        // Reset form (OTC model)
        setPaymentAmount("");
        setPaymentType("Permit Fee");
        setPaymentDescription("");
        setExistingPayment(null);
        setIsUpdatingPayment(false);
        showMessage("Success", "Payment requirement removed successfully", "success");
      } else {
        setError(response.data.message || "Failed to remove payment");
      }
    } catch (err) {
      console.error("Remove payment error:", err);
      setError(
        err.response?.data?.message || "An error occurred while removing payment"
      );
    } finally {
      setRemovingPayment(false);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowStatusModal(false);
    setShowPaymentModal(false);
    setSelectedRequest(null);
    setRequestDetails(null);
    setError("");
  };

  const showMessage = (title, message, type = "success") => {
    setMessageModal({ title, message, type });
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
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
      Pending: { color: "warning", icon: <Clock size={14} /> },
      "Under Review": { color: "info", icon: <AlertTriangle size={14} /> },
      Approved: { color: "success", icon: <CheckCircle size={14} /> },
      Rejected: { color: "danger", icon: <XCircle size={14} /> },
      Completed: { color: "primary", icon: <CheckCircle size={14} /> },
      Cancelled: { color: "secondary", icon: <Ban size={14} /> },
    };

    const badge = badges[status] || badges.Pending;

    return (
      <span className={`badge bg-${badge.color} d-inline-flex align-items-center gap-1`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const badges = {
      Pending: { color: "warning", icon: <Clock size={12} />, text: "Pending" },
      Verified: { color: "success", icon: <CheckCircle size={12} />, text: "Verified" },
      Rejected: { color: "danger", icon: <XCircle size={12} />, text: "Rejected" },
      "No Payment": {  },
    };

    const badge = badges[paymentStatus] || badges["No Payment"];

    return (
      <span className={`badge bg-${badge.color} d-inline-flex align-items-center gap-1`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  return (
    <>
      <ProcessorSideBar>
        <div className="container-fluid p-4">
          <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
            <h4 className="mb-4">Request Management</h4>

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
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
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
                    <th>Status</th>
                    <th>Payment</th>
                    <th>ProcessedBy</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentEntries.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        No requests found in your assigned categories
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
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{getPaymentBadge(request.payment_status)}</td>
                        <td>{request.processor_name || "Unassigned"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => handleViewDetails(request)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => handleOpenStatusModal(request)}
                            title="Update Status"
                          >
                            <Edit size={16} />
                          </button>
                          {request.status === "Approved" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleOpenPaymentModal(request)}
                              title="Manage Payment"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
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
          onClick={closeModals}
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
                  onClick={closeModals}
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
                  onClick={closeModals}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal - Same as MainRequests but using processorId */}
      {showStatusModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModals}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Edit size={20} />
                  Update Request Status - {selectedRequest?.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdateStatus}>
                  <div className="mb-3">
                    <label className="form-label">
                      Current Status: {getStatusBadge(selectedRequest?.status)}
                    </label>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      New Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Show Add/Update Payment Option for Approved status */}
                  {newStatus === "Approved" && !hasExistingPayment && (
                    <div className="mb-3">
                      <div className="alert alert-success">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="paymentOptionCheck"
                            checked={showPaymentOption}
                            onChange={(e) => setShowPaymentOption(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="paymentOptionCheck">
                            <strong>Add Payment Requirement (Optional)</strong>
                            <p className="mb-0 small">
                              Check this to immediately add payment details after updating status
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show Update Payment Option when payment already exists */}
                  {newStatus === "Approved" && hasExistingPayment && (
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="paymentOptionCheck"
                            checked={showPaymentOption}
                            onChange={(e) => setShowPaymentOption(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="paymentOptionCheck">
                            <strong>Update Payment Requirement (Optional)</strong>
                            <p className="mb-0 small">
                              A payment requirement already exists. Check this to update payment details after updating status
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show File Upload for Completed status */}
                  {newStatus === "Completed" && (
                    <>
                      <div className="alert alert-info mb-3">
                        <strong>Note:</strong> Completion date will be set automatically. Please upload the processed document.
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Upload Document <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => setAttachmentFile(e.target.files[0])}
                          required
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                        />
                        <small className="text-muted">
                          Accepted formats: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB)
                        </small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Attachment Remarks (Optional)</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={attachmentRemarks}
                          onChange={(e) => setAttachmentRemarks(e.target.value)}
                          placeholder="Add notes about the uploaded document..."
                        />
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Status Remarks (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="Add any notes or remarks about the status change..."
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModals}
                      disabled={updatingStatus}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModals}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className={`modal-header text-white ${existingPayment?.status === "Verified" ? "bg-info" : "bg-success"}`}>
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <DollarSign size={20} />
                  {existingPayment?.status === "Verified" ? "Payment Details" : (isUpdatingPayment ? "Update" : "Add") + " Payment Requirement"} - {selectedRequest?.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                {/* Show Read-Only Details if Payment is Verified */}
                {existingPayment?.status === "Verified" ? (
                  <>
                    <div className="alert alert-success">
                      <strong>Payment Verified!</strong> This payment has been successfully verified and processed.
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Amount</label>
                        <p className="mb-0 fw-bold fs-5">₱{parseFloat(paymentAmount).toFixed(2)}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Payment Type</label>
                        <p className="mb-0">{paymentType}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Status</label>
                        <p className="mb-0">
                          <span className="badge bg-success">Verified</span>
                        </p>
                      </div>



                      {existingPayment?.payment_date && (
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Payment Date</label>
                          <p className="mb-0">{formatDate(existingPayment.payment_date)}</p>
                        </div>
                      )}

                      {existingPayment?.receipt_number && (
                        <div className="col-md-6 mb-3">
                          <label className="text-muted small">Receipt Number</label>
                          <p className="mb-0">{existingPayment.receipt_number}</p>
                        </div>
                      )}

                      {paymentDescription && (
                        <div className="col-md-12 mb-3">
                          <label className="text-muted small">Description</label>
                          <p className="mb-0">{paymentDescription}</p>
                        </div>
                      )}

                      {existingPayment?.remarks && (
                        <div className="col-md-12 mb-3">
                          <label className="text-muted small">Remarks</label>
                          <p className="mb-0">{existingPayment.remarks}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleAddPayment}>
                  <div className="alert alert-info">
                    <strong>Note:</strong> {isUpdatingPayment ? "Update" : "Add"} payment requirement for payment.

                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Amount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        required
                      >
                        <option value="Permit Fee">Permit Fee</option>
                        <option value="Processing Fee">Processing Fee</option>
                        <option value="Renewal Fee">Renewal Fee</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      placeholder="Payment description or instructions..."
                    />
                  </div>





                  
                  <div className="d-flex justify-content-between gap-2 mt-3">
                    {/* Left side - Remove Payment button (only show when updating) */}
                    <div>
                      {isUpdatingPayment && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleRemovePayment}
                          disabled={addingPayment || removingPayment}
                        >
                          {removingPayment ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Removing...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} className="me-1" />
                              Remove Payment
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Right side - Cancel and Save buttons */}
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModals}
                        disabled={addingPayment || removingPayment}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={addingPayment || removingPayment}
                      >
                        {addingPayment ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            {isUpdatingPayment ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          isUpdatingPayment ? "Update Payment" : "Add Payment"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                )}



                {/* Close button for Verified payments */}
                {existingPayment?.status === "Verified" && (
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModals}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeMessageModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className={`modal-header text-white ${messageModal.type === "success" ? "bg-success" : messageModal.type === "error" ? "bg-danger" : "bg-info"}`}>
                <h5 className="modal-title d-flex align-items-center gap-2">
                  {messageModal.type === "success" && <CheckCircle size={20} />}
                  {messageModal.type === "error" && <XCircle size={20} />}
                  {messageModal.type === "info" && <AlertCircle size={20} />}
                  {messageModal.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeMessageModal}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">{messageModal.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeMessageModal}
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

export default ProcessorRequests;
