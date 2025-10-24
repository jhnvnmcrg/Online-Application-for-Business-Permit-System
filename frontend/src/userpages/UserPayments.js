import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";

function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ownerId = user.owner_id;

  useEffect(() => {
    if (ownerId) {
      fetchPayments();
    }
  }, [ownerId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      // First, fetch all owner's requests
      const requestsResponse = await axios.get(
        `${API_URL}/api/request/owner/${ownerId}`
      );

      if (requestsResponse.data.success) {
        // Then fetch payments for each request
        const requests = requestsResponse.data.requests;
        const allPayments = [];

        for (const request of requests) {
          const paymentResponse = await axios.get(
            `${API_URL}/api/payment/request/${request.request_id}`
          );

          if (paymentResponse.data.success && paymentResponse.data.payments.length > 0) {
            paymentResponse.data.payments.forEach((payment) => {
              allPayments.push({
                ...payment,
                tracking_code: request.tracking_code,
                category_name: request.category_name,
                request_status: request.status,
              });
            });
          }
        }

        setPayments(allPayments);
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

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setError("");
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
      <UserSideBAr>
        <div className="mb-4">
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h2 className="mb-1">Payments</h2>
            <small className="text-muted">Manage your payment requirements</small>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div
                  className="card-header text-white"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  <h5 className="mb-0">Payment Requirements</h5>
                </div>

                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Tracking Code</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Payment Type</th>
                          <th>Status</th>
                          <th>Date Created</th>
                          <th>Action</th>
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
                        ) : payments.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center text-muted py-4">
                              No payment requirements yet
                            </td>
                          </tr>
                        ) : (
                          payments.map((payment, index) => (
                            <tr key={payment.payment_id}>
                              <td>{index + 1}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {payment.tracking_code}
                                </span>
                              </td>
                              <td>{payment.category_name || "N/A"}</td>
                              <td className="fw-bold">₱{parseFloat(payment.amount).toFixed(2)}</td>
                              <td>{payment.payment_type}</td>
                              <td>{getStatusBadge(payment.status)}</td>
                              <td>{formatDate(payment.created_at)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info d-flex align-items-center gap-1"
                                  onClick={() => handleViewPayment(payment)}
                                >
                                  <FileText size={14} />
                                  View Details
                                </button>
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
      </UserSideBAr>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#28a745" }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <DollarSign size={20} />
                  Submit Payment Proof - {selectedPayment.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Deadline Warning */}
                {selectedPayment.payment_deadline && (
                  (() => {
                    const deadlineInfo = getDeadlineInfo(selectedPayment);
                    if (deadlineInfo.isOverdue || deadlineInfo.daysLeft <= 3) {
                      return (
                        <div className={`alert alert-${deadlineInfo.isOverdue ? 'danger' : 'warning'} mb-3`}>
                          <div className="d-flex align-items-center gap-2">
                            <AlertCircle size={20} />
                            <div>
                              <strong>
                                {deadlineInfo.isOverdue ? 'Payment Overdue!' : 'Payment Deadline Approaching!'}
                              </strong>
                              <p className="mb-0">
                                {deadlineInfo.text} - Deadline: {formatDate(selectedPayment.payment_deadline)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}

                {/* Payment Details */}
                <div className="alert alert-info mb-4">
                  <h6 className="mb-3">Payment Details</h6>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Amount:</strong> ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Payment Type:</strong> {selectedPayment.payment_type}
                    </div>
                    {selectedPayment.payment_deadline && (
                      <div className="col-md-12 mb-2">
                        <strong>Deadline:</strong>{" "}
                        <span className={getDeadlineInfo(selectedPayment).isOverdue ? 'text-danger fw-bold' : ''}>
                          {formatDate(selectedPayment.payment_deadline)}
                        </span>
                      </div>
                    )}
                    <div className="col-md-12 mb-2">
                      <strong>Description:</strong>{" "}
                      {selectedPayment.description || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Receiver Details */}
                {selectedPayment.receiver_name && (
                  <div className="alert alert-secondary mb-4">
                    <h6 className="mb-3">Payment Instructions</h6>
                    <p className="mb-2">
                      <strong>Pay to:</strong> {selectedPayment.receiver_name}
                    </p>
                    {selectedPayment.payment_method && (
                      <p className="mb-2">
                        <strong>Method:</strong> {selectedPayment.payment_method}
                      </p>
                    )}
                    {selectedPayment.receiver_number && (
                      <p className="mb-2">
                        <strong>Number/Account:</strong> {selectedPayment.receiver_number}
                      </p>
                    )}
                    {selectedPayment.receiver_account && (
                      <p className="mb-0">
                        <strong>Bank Account:</strong> {selectedPayment.receiver_account}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Form */}
                <form onSubmit={handleSubmitProof}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Your Payment Number/Account <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 09171234567"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        required
                      />
                      <small className="text-muted">
                        Enter your GCash/PayMaya/Bank number used for payment
                      </small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Reference Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., REF123456789"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        required
                      />
                      <small className="text-muted">
                        Transaction reference number from your receipt
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Payment Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Proof of Payment <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files[0])}
                      required
                    />
                    {proofFile && (
                      <small className="text-success d-flex align-items-center gap-1 mt-1">
                        <FileText size={14} />
                        {proofFile.name}
                      </small>
                    )}
                    <small className="text-muted d-block mt-1">
                      Upload a screenshot or photo of your payment receipt (JPG, PNG)
                    </small>
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="me-2" />
                          Submit Proof
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

export default UserPayments;
