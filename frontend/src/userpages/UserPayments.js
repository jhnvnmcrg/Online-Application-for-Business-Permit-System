import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
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
                style={{ backgroundColor: "#dc3545" }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <DollarSign size={20} />
                  Payment Details - {selectedPayment.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Payment Details */}
                <div className="alert alert-info mb-4">
                  <h6 className="mb-3">Payment Information</h6>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <strong>Amount:</strong> ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Payment Type:</strong> {selectedPayment.payment_type}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Status:</strong> {getStatusBadge(selectedPayment.status)}
                    </div>
                    <div className="col-md-6 mb-2">
                      <strong>Date Created:</strong> {formatDate(selectedPayment.created_at)}
                    </div>
                    <div className="col-md-12 mb-2">
                      <strong>Description:</strong>{" "}
                      {selectedPayment.description || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Payment Instructions for Pending Status */}
                {selectedPayment.status === "Pending" && (
                  <div className="alert alert-warning mb-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={20} />
                      Payment Instructions
                    </h6>
                    <p className="mb-2">
                      <strong>Please pay at the office counter.</strong>
                    </p>
                    <p className="mb-2">
                      Accepted payment methods: Cash, Check
                    </p>
                    <p className="mb-0">
                      A receipt will be issued upon payment. Your payment will be immediately verified once received by our office.
                    </p>
                  </div>
                )}

                {/* Success Message for Verified Status */}
                {selectedPayment.status === "Verified" && (
                  <div className="alert alert-success mb-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                      <CheckCircle size={20} />
                      Payment Verified
                    </h6>
                    <p className="mb-2">
                      Your payment has been successfully verified and processed.
                    </p>
                    {selectedPayment.reference_number && (
                      <p className="mb-2">
                        <strong>Receipt Number:</strong> {selectedPayment.reference_number}
                      </p>
                    )}
                    {selectedPayment.payment_date && (
                      <p className="mb-2">
                        <strong>Payment Date:</strong> {formatDate(selectedPayment.payment_date)}
                      </p>
                    )}
                    {selectedPayment.remarks && (
                      <p className="mb-0">
                        <strong>Remarks:</strong> {selectedPayment.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Error Message for Rejected Status */}
                {selectedPayment.status === "Rejected" && (
                  <div className="alert alert-danger mb-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                      <XCircle size={20} />
                      Payment Rejected
                    </h6>
                    <p className="mb-2">
                      Your payment has been rejected. Please contact the office for more information.
                    </p>
                    {selectedPayment.remarks && (
                      <p className="mb-0">
                        <strong>Reason:</strong> {selectedPayment.remarks}
                      </p>
                    )}
                  </div>
                )}

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
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserPayments;
