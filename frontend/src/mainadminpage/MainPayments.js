import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../includes/MainSideBar";
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
} from "lucide-react";

function MainPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  // Get logged-in admin
  const user = JSON.parse(localStorage.getItem("main") || "{}");
  const adminId = user.admin_id;

  useEffect(() => {
    if (!user || !adminId) {
      navigate("/oabps/main/login");
      return;
    }
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/api/payment/all`);

      if (response.data.success) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
      } else {
        setError("Failed to fetch payments");
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

  const handleOpenVerifyModal = (payment) => {
    setSelectedPayment(payment);
    setVerifyStatus("");
    setVerifyRemarks("");
    setShowVerifyModal(true);
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();

    if (!verifyStatus) {
      setError("Please select verification status");
      return;
    }

    try {
      setVerifying(true);
      setError("");

      const response = await axios.put(
        `${API_URL}/api/payment/verify/${selectedPayment.payment_id}`,
        {
          status: verifyStatus,
          verifiedBy: adminId,
          remarks: verifyRemarks || null,
        }
      );

      if (response.data.success) {
        await fetchPayments();
        setShowVerifyModal(false);
        setVerifyStatus("");
        setVerifyRemarks("");
        alert(`Payment ${verifyStatus.toLowerCase()} successfully`);
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
      Submitted: { color: "info", icon: <Upload size={14} /> },
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
      <MainSideBar>
        <div className="container-fluid p-4">
          <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
            <h4 className="mb-4">Payment Verification</h4>

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
                  <option value="Submitted">Submitted</option>
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
                    <th>Date Submitted</th>
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
                        No payments found
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
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => handleViewDetails(payment)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {payment.status === "Submitted" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleOpenVerifyModal(payment)}
                              title="Verify Payment"
                            >
                              <CheckCircle size={16} />
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
      </MainSideBar>

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

                {/* Payment Receiver Details */}
                {selectedPayment.receiver_name && (
                  <div className="mb-4">
                    <h6 className="text-primary border-bottom pb-2">
                      Payment Receiver Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Receiver Name</label>
                        <p className="mb-0">{selectedPayment.receiver_name}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Payment Method</label>
                        <p className="mb-0">{selectedPayment.payment_method || "N/A"}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Receiver Number</label>
                        <p className="mb-0">{selectedPayment.receiver_number || "N/A"}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Bank Account</label>
                        <p className="mb-0">{selectedPayment.receiver_account || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Proof (if submitted) */}
                {selectedPayment.proof_payment && (
                  <div className="mb-4">
                    <h6 className="text-primary border-bottom pb-2">
                      Payment Proof Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Sender Number</label>
                        <p className="mb-0">{selectedPayment.sender_number || "N/A"}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Reference Number</label>
                        <p className="mb-0">{selectedPayment.reference_number || "N/A"}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Payment Date</label>
                        <p className="mb-0 d-flex align-items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(selectedPayment.payment_date)}
                        </p>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="text-muted small d-block mb-2">
                          Proof of Payment
                        </label>
                        <img
                          src={selectedPayment.proof_payment}
                          alt="Payment Proof"
                          className="img-fluid border rounded"
                          style={{ maxHeight: "400px", cursor: "pointer" }}
                          onClick={() => window.open(selectedPayment.proof_payment, "_blank")}
                        />
                        <p className="text-muted small mt-2">
                          Click image to view full size
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Details */}
                {selectedPayment.verified_by && (
                  <div className="mb-4">
                    <h6 className="text-primary border-bottom pb-2">
                      Verification Details
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Verified By</label>
                        <p className="mb-0">
                          {selectedPayment.VerifiedBy?.fullname || "N/A"}
                        </p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="text-muted small">Verification Date</label>
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
                {selectedPayment.status === "Submitted" && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      closeModals();
                      handleOpenVerifyModal(selectedPayment);
                    }}
                  >
                    <CheckCircle size={16} className="me-2" />
                    Verify Payment
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
                  Verify Payment - {selectedPayment.Requests?.tracking_code}
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
                      <strong>Reference:</strong> {selectedPayment.reference_number || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Proof Preview */}
                {selectedPayment.proof_payment && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">Payment Proof:</label>
                    <div className="text-center">
                      <img
                        src={selectedPayment.proof_payment}
                        alt="Payment Proof"
                        className="img-fluid border rounded"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                  </div>
                )}

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
                      <option value="Verified">✅ Verified (Approve Payment)</option>
                      <option value="Rejected">❌ Rejected (Deny Payment)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Remarks (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={verifyRemarks}
                      onChange={(e) => setVerifyRemarks(e.target.value)}
                      placeholder="Add verification notes or reason for rejection..."
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
                      disabled={verifying}
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
                          {verifyStatus === "Verified" ? "Verify Payment" : "Reject Payment"}
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
    </>
  );
}

export default MainPayments;
