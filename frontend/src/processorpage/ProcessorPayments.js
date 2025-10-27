import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProcessorSideBar from "../includes/ProcessorSideBar";
import axios from "axios";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Printer,
} from "lucide-react";

function ProcessorPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignedCategoryIds, setAssignedCategoryIds] = useState([]);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ title: "", message: "", type: "success" });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

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

      fetchAssignedCategoriesAndPayments(processorId);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/processor/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, payments]);

  const fetchAssignedCategoriesAndPayments = async (processorId) => {
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
          setPayments([]);
          setFilteredPayments([]);
          setAssignedCategoryIds([]);
          setStats({
            total: 0,
            pending: 0,
            verified: 0,
            rejected: 0,
          });
          setLoading(false);
          return;
        }

        const categoryIds = categories.map((cat) => cat.category_id);
        setAssignedCategoryIds(categoryIds);

        console.log("Assigned Category IDs:", categoryIds);

        // Fetch all payments
        const response = await axios.get(`${API_URL}/api/payment/all`);

        if (response.data.success && response.data.payments) {
          const allPayments = response.data.payments || [];
          console.log("All Payments from API:", allPayments);

          // Filter payments by requests in assigned categories
          const filteredPaymentsData = allPayments.filter((payment) => {
            const categoryId = payment.Requests?.category_id;
            const isIncluded = categoryIds.includes(categoryId);
            console.log(`Payment ${payment.payment_id}: category_id=${categoryId}, included=${isIncluded}`);
            return isIncluded;
          });

          console.log("Filtered Payments:", filteredPaymentsData);

          setPayments(filteredPaymentsData);
          setFilteredPayments(filteredPaymentsData);

          // Calculate statistics
          setStats({
            total: filteredPaymentsData.length,
            pending: filteredPaymentsData.filter((p) => p.status === "Pending").length,
            verified: filteredPaymentsData.filter((p) => p.status === "Verified").length,
            rejected: filteredPaymentsData.filter((p) => p.status === "Rejected").length,
          });
        } else {
          setError("Failed to fetch payments");
        }
      } else {
        setError("No categories assigned to this processor");
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
      setError("An error occurred while fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (statusFilter !== "All") {
      filtered = filtered.filter((pay) => pay.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pay) =>
          pay.Requests?.tracking_code?.toLowerCase().includes(search) ||
          pay.Requests?.Owners?.fullname?.toLowerCase().includes(search) ||
          pay.reference_number?.toLowerCase().includes(search)
      );
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleOpenVerifyModal = async (payment) => {
    setSelectedPayment(payment);
    setVerifyStatus("");
    setVerifyRemarks("");

    // Set today's date as default payment date
    const today = new Date().toISOString().split('T')[0];
    setPaymentDate(today);

    // Generate receipt number - OR-YYYY-NNNNN
    try {
      const response = await axios.get(`${API_URL}/api/payment/generate-receipt-number`);
      if (response.data.success) {
        setReceiptNumber(response.data.receiptNumber);
      }
    } catch (err) {
      console.error("Failed to generate receipt number:", err);
      // Fallback if API fails
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      setReceiptNumber(`OR-${year}-${random}`);
    }

    setShowVerifyModal(true);
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();

    if (!verifyStatus) {
      setError("Please select verification status");
      return;
    }

    // For OTC payments being verified, require receipt number and payment date
    if (verifyStatus === "Verified") {
      if (!receiptNumber) {
        setError("Receipt number is required for verified payments");
        return;
      }
      if (!paymentDate) {
        setError("Payment date is required for verified payments");
        return;
      }
    }

    try {
      setVerifying(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("processor") || "{}");
      const processorId = user.admin_id;

      const requestData = {
        status: verifyStatus,
        processedBy: processorId,
        remarks: verifyRemarks || null,
      };

      // Only include receipt_number and payment_date if status is Verified
      if (verifyStatus === "Verified") {
        requestData.receiptNumber = receiptNumber;
        requestData.paymentDate = paymentDate;
      }

      const response = await axios.put(
        `${API_URL}/api/payment/verify/${selectedPayment.payment_id}`,
        requestData
      );

      if (response.data.success) {
        const paymentId = selectedPayment.payment_id;

        // Refresh the payments list
        await fetchAssignedCategoriesAndPayments(processorId);

        // Close the verify modal
        setShowVerifyModal(false);
        setVerifyStatus("");
        setVerifyRemarks("");
        setReceiptNumber("");
        setPaymentDate("");

        // If payment was verified, ask if user wants to print receipt
        if (verifyStatus === "Verified") {
          const shouldPrint = window.confirm(
            "Payment verified successfully! Would you like to print the official receipt now?"
          );

          if (shouldPrint) {
            // Need to get the updated payment from the API
            try {
              const paymentResponse = await axios.get(`${API_URL}/api/payment/all`);
              if (paymentResponse.data.success) {
                const updatedPayment = paymentResponse.data.payments.find(
                  p => p.payment_id === paymentId
                );
                if (updatedPayment) {
                  handlePrintReceipt(updatedPayment);
                }
              }
            } catch (err) {
              console.error("Error fetching payment for receipt:", err);
              showMessage("Success", "Payment verified successfully! Please click the Print button in the table to print the receipt.", "success");
            }
          } else {
            showMessage("Success", "Payment verified successfully!", "success");
          }
        } else {
          showMessage("Success", `Payment ${verifyStatus.toLowerCase()} successfully`, "success");
        }
      } else {
        setError(response.data.message || "Failed to verify payment");
      }
    } catch (err) {
      console.error("Verify payment error:", err);
      setError(
        err.response?.data?.message || "An error occurred while verifying payment"
      );
    } finally {
      setVerifying(false);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowVerifyModal(false);
    setSelectedPayment(null);
    setError("");
  };

  const handlePrintReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setSelectedPayment(null);
  };

  const printReceipt = () => {
    window.print();
  };

  const showMessage = (title, message, type = "success") => {
    setMessageModal({ title, message, type });
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
  };

  const handleImageClick = (imageUrl) => {
    setLightboxImage(imageUrl);
    setShowLightbox(true);
  };

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredPayments.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredPayments.length / entriesPerPage);

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
      Verified: { color: "success", icon: <CheckCircle size={14} /> },
      Rejected: { color: "danger", icon: <XCircle size={14} /> },
    };

    const badge = badges[status] || badges.Pending;

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
          {/* Page Header */}
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">Payment Verification</h2>
            <p className="text-muted">Review and verify payment submissions</p>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4 g-3">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h3 className="mb-0 fw-bold text-primary">{stats.total}</h3>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-2 rounded">
                      <DollarSign size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending</p>
                      <h3 className="mb-0 fw-bold text-warning">{stats.pending}</h3>
                      <small className="text-muted">Awaiting payment</small>
                    </div>
                    <div className="bg-warning bg-opacity-10 p-2 rounded">
                      <Clock size={24} className="text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Verified</p>
                      <h3 className="mb-0 fw-bold text-success">{stats.verified}</h3>
                      <small className="text-muted">Approved</small>
                    </div>
                    <div className="bg-success bg-opacity-10 p-2 rounded">
                      <CheckCircle size={24} className="text-success" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Rejected</p>
                      <h3 className="mb-0 fw-bold text-danger">{stats.rejected}</h3>
                      <small className="text-muted">Denied</small>
                    </div>
                    <div className="bg-danger bg-opacity-10 p-2 rounded">
                      <XCircle size={24} className="text-danger" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">All Payments</h5>
            </div>
            <div className="card-body">
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
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by tracking code, owner, or reference number..."
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
                    <th>Owner</th>
                    <th>Amount</th>
                    <th>Payment Type</th>
                    <th>Status</th>
                    <th>Payment Date</th>
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
                        No payments found in your assigned categories
                      </td>
                    </tr>
                  ) : (
                    currentEntries.map((payment, index) => (
                      <tr key={payment.payment_id}>
                        <td>{indexOfFirstEntry + index + 1}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {payment.Requests?.tracking_code || "N/A"}
                          </span>
                        </td>
                        <td>{payment.Requests?.Owners?.fullname || "N/A"}</td>
                        <td className="fw-bold">₱{parseFloat(payment.amount).toFixed(2)}</td>
                        <td>{payment.payment_type}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewDetails(payment)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {payment.status === "Pending" && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleOpenVerifyModal(payment)}
                                title="Process Payment"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {payment.status === "Verified" && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handlePrintReceipt(payment)}
                                title="Print Official Receipt"
                              >
                                <Printer size={16} />
                              </button>
                            )}
                          </div>
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
                  {Math.min(indexOfLastEntry, filteredPayments.length)} of{" "}
                  {filteredPayments.length} entries
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
        </div>
      </ProcessorSideBar>

      {/* View Details Modal */}
      {showViewModal && selectedPayment && (
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
                  Payment Details - {selectedPayment.Requests?.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                {/* Payment Information */}
                <div className="mb-4">
                  <h6 className="text-primary border-bottom pb-2">
                    Payment Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Tracking Code</label>
                      <p className="mb-0">
                        <span className="badge bg-secondary fs-6">
                          {selectedPayment.Requests?.tracking_code}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Status</label>
                      <p className="mb-0">{getStatusBadge(selectedPayment.status)}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Amount</label>
                      <p className="mb-0 fw-bold fs-5 text-success">
                        ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Payment Type</label>
                      <p className="mb-0">{selectedPayment.payment_type}</p>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="text-muted small">Description</label>
                      <p className="mb-0">{selectedPayment.description || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="mb-4">
                  <h6 className="text-primary border-bottom pb-2">
                    Owner Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Owner Name</label>
                      <p className="mb-0 d-flex align-items-center gap-1">
                        <User size={14} />
                        {selectedPayment.Requests?.Owners?.fullname || "N/A"}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-muted small">Category</label>
                      <p className="mb-0">
                        {selectedPayment.Requests?.DocumentCategories?.category_name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Reference */}
                <div className="mb-4">
                  <h6 className="text-primary border-bottom pb-2">
                    Payment Details
                  </h6>
                  <div className="row">
                    {selectedPayment.payment_method && (
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Payment Method</label>
                        <p className="mb-0">{selectedPayment.payment_method}</p>
                      </div>
                    )}
                    {selectedPayment.reference_number && (
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Reference Number</label>
                        <p className="mb-0">{selectedPayment.reference_number}</p>
                      </div>
                    )}
                    {selectedPayment.payment_date && (
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Payment Date</label>
                        <p className="mb-0 d-flex align-items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(selectedPayment.payment_date)}
                        </p>
                      </div>
                    )}
                    {selectedPayment.receipt_number && (
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Receipt Number</label>
                        <p className="mb-0">{selectedPayment.receipt_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing Details */}
                {selectedPayment.ProcessedBy && (
                  <div className="mb-4">
                    <h6 className="text-primary border-bottom pb-2">
                      Processing Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Processed By</label>
                        <p className="mb-0">
                          {selectedPayment.ProcessedBy?.fullname || selectedPayment.ProcessedBy?.username || "N/A"}
                        </p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Processed Date</label>
                        <p className="mb-0">{formatDate(selectedPayment.updated_at)}</p>
                      </div>
                      {selectedPayment.remarks && (
                        <div className="col-md-12 mb-3">
                          <label className="text-muted small">Remarks</label>
                          <p className="mb-0">{selectedPayment.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
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
                {selectedPayment.status === "Pending" && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      closeModals();
                      handleOpenVerifyModal(selectedPayment);
                    }}
                  >
                    <CheckCircle size={16} className="me-2" />
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Payment Modal */}
      {showVerifyModal && selectedPayment && (
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
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <CheckCircle size={20} />
                  Process Payment - {selectedPayment.Requests?.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                {/* Quick Payment Info */}
                <div className="alert alert-info mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Amount:</strong> ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                    </div>
                    <div className="col-md-6">
                      <strong>Type:</strong> {selectedPayment.payment_type || "N/A"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Note:</strong> This is an over-the-counter payment. Verify that payment has been received before processing.
                    </small>
                  </div>
                </div>

                <form onSubmit={handleVerifyPayment}>
                  <div className="mb-3">
                    <label className="form-label">
                      Verification Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={verifyStatus}
                      onChange={(e) => setVerifyStatus(e.target.value)}
                      required
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Verified">✅ Verified (Payment Received)</option>
                      <option value="Rejected">❌ Rejected (Payment Not Received)</option>
                    </select>
                  </div>

                  {/* Show receipt and payment date fields only for Verified status */}
                  {verifyStatus === "Verified" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">
                          Official Receipt Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={receiptNumber}
                          readOnly
                          disabled
                        />
                        <small className="text-muted">Auto-generated receipt number</small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Payment Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control bg-light"
                          value={paymentDate}
                          readOnly
                          disabled
                        />
                        <small className="text-muted">Current date (auto-set to today)</small>
                      </div>

                      <div className="alert alert-success mb-3">
                        <small>
                          <strong>Full Payment Only:</strong> Verify that the full amount of ₱{parseFloat(selectedPayment.amount).toFixed(2)} has been received.
                        </small>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Remarks {verifyStatus === "Rejected" ? <span className="text-danger">*</span> : "(Optional)"}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={verifyRemarks}
                      onChange={(e) => setVerifyRemarks(e.target.value)}
                      placeholder={verifyStatus === "Rejected" ? "Please provide reason for rejection..." : "Add verification notes (e.g., 'Paid in full', 'Cash payment received')..."}
                      required={verifyStatus === "Rejected"}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModals}
                      disabled={verifying}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn ${
                        verifyStatus === "Verified" ? "btn-success" : "btn-danger"
                      }`}
                      disabled={verifying || !verifyStatus}
                    >
                      {verifying ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          {verifyStatus === "Verified" ? (
                            <CheckCircle size={16} className="me-2" />
                          ) : (
                            <XCircle size={16} className="me-2" />
                          )}
                          {verifyStatus === "Verified" ? "Receive & Verify Payment" : "Reject Payment"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {showLightbox && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setShowLightbox(false)}
        >
          <div className="modal-dialog modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  onClick={() => setShowLightbox(false)}
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center justify-content-center">
                <img
                  src={lightboxImage}
                  alt="Payment Proof Full Size"
                  className="img-fluid"
                  style={{ maxHeight: "90vh", maxWidth: "90vw" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {showReceipt && selectedPayment && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeReceipt}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white d-print-none"
                style={{ backgroundColor: "#28a745" }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <CheckCircle size={20} />
                  Official Receipt - {selectedPayment.receipt_number || selectedPayment.reference_number}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeReceipt}
                ></button>
              </div>
              <div className="modal-body">
                {/* Printable Official Receipt */}
                <div className="official-receipt p-4 border border-success border-2">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h3 className="mb-2 text-success fw-bold">OFFICIAL RECEIPT</h3>
                    <h5>Online Application for Business Permit</h5>
                    <p className="mb-1">City Hall, Main Street, City</p>
                    <p className="mb-0">Tel: (123) 456-7890 | Email: oabp@city.gov</p>
                  </div>

                  <hr className="my-4 border-success" />

                  {/* Receipt Header Info */}
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Receipt Number</label>
                      <h5 className="mb-0 fw-bold text-success">{selectedPayment.receipt_number || selectedPayment.reference_number}</h5>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Payment Date</label>
                      <p className="mb-0 fw-bold">{formatDate(selectedPayment.payment_date)}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Tracking Code</label>
                      <p className="mb-0 fw-bold">{selectedPayment.Requests?.tracking_code || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Payment Method</label>
                      <p className="mb-0">{selectedPayment.payment_method || "Cash"}</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Payor Information */}
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted small mb-3">Received From</h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label className="text-uppercase text-muted small mb-1">Name</label>
                        <p className="mb-0 fw-bold">{selectedPayment.Requests?.Owners?.fullname || "N/A"}</p>
                      </div>

                      <div className="col-md-6 mb-2">
                        <label className="text-uppercase text-muted small mb-1">Contact Number</label>
                        <p className="mb-0">{selectedPayment.Requests?.Owners?.phone_number || "N/A"}</p>
                      </div>

                      <div className="col-md-12 mb-2">
                        <label className="text-uppercase text-muted small mb-1">Email Address</label>
                        <p className="mb-0">{selectedPayment.Requests?.Owners?.email || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Payment Details */}
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted small mb-3">Payment Details</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-uppercase text-muted small mb-1">Permit Category</label>
                        <p className="mb-0">{selectedPayment.Requests?.DocumentCategories?.category_name || "N/A"}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="text-uppercase text-muted small mb-1">Payment Type</label>
                        <p className="mb-0">{selectedPayment.payment_type}</p>
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="text-uppercase text-muted small mb-1">Description</label>
                        <p className="mb-0">{selectedPayment.description || "Payment for business permit application"}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Amount Section */}
                  <div className="mb-4">
                    <div className="row">
                      <div className="col-md-8 text-end">
                        <h5 className="mb-0 fw-bold">TOTAL AMOUNT PAID:</h5>
                      </div>
                      <div className="col-md-4">
                        <h3 className="mb-0 fw-bold text-success">₱{parseFloat(selectedPayment.amount).toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Processing Information */}
                  {selectedPayment.ProcessedBy && (
                    <div className="mb-4">
                      <div className="row">
                        <div className="col-md-12 mb-2">
                          <label className="text-uppercase text-muted small mb-1">Processed By</label>
                          <p className="mb-0 fw-bold">{selectedPayment.ProcessedBy.fullname || selectedPayment.ProcessedBy.username || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedPayment.remarks && (
                    <div className="mb-4">
                      <label className="text-uppercase text-muted small mb-1">Remarks</label>
                      <p className="mb-0 fst-italic">{selectedPayment.remarks}</p>
                    </div>
                  )}



                  {/* Footer Notice */}
                  <div className="text-center mt-5 pt-3 border-top">
                    <p className="mb-1 small text-muted">This is an official receipt for payment received</p>
                    <p className="mb-1 small text-muted">Please keep this receipt for your records</p>
                    <p className="mb-0 small text-muted">Issued on: {formatDate(new Date().toISOString())}</p>
                  </div>

                  {/* Watermark for verified */}
                  <div className="text-center mt-3">
                    <span className="badge bg-success fs-6 px-4 py-2">
                      <CheckCircle size={16} className="me-2" />
                      PAYMENT VERIFIED
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-print-none">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeReceipt}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={printReceipt}
                >
                  <Printer size={16} />
                  Print Receipt
                </button>
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

export default ProcessorPayments;
