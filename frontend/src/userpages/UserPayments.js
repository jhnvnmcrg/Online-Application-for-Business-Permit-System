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
  Printer,
} from "lucide-react";

function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

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

  const handlePrintSlip = (payment) => {
    setSelectedPayment(payment);
    setShowPrintSlip(true);
  };

  const closePrintSlip = () => {
    setShowPrintSlip(false);
    setSelectedPayment(null);
  };

  const printSlip = () => {
    window.print();
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
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-info d-flex align-items-center gap-1"
                                    onClick={() => handleViewPayment(payment)}
                                    title="View Details"
                                  >
                                    <FileText size={14} />
                                  </button>
                                  {payment.status === "Pending" && (
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                      onClick={() => handlePrintSlip(payment)}
                                      title="Print Payment Slip"
                                    >
                                      <Printer size={14} />
                                    </button>
                                  )}
                                  {payment.status === "Verified" && (
                                    <button
                                      className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                      onClick={() => handlePrintReceipt(payment)}
                                      title="Print Official Receipt"
                                    >
                                      <Printer size={14} />
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

      {/* Print Payment Slip Modal */}
      {showPrintSlip && selectedPayment && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closePrintSlip}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white d-print-none"
                style={{ backgroundColor: "#0d6efd" }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Printer size={20} />
                  Payment Slip - {selectedPayment.tracking_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closePrintSlip}
                ></button>
              </div>
              <div className="modal-body">
                {/* Printable Payment Slip */}
                <div className="payment-slip p-4 border">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h4 className="mb-2">PAYMENT SLIP</h4>
                    <h5 className="text-primary">Online Application for Business Permit</h5>
                    <p className="mb-1 text-muted">City Hall, Main Street, City</p>
                    <p className="mb-0 text-muted">Tel: (123) 456-7890 | Email: oabp@city.gov</p>
                  </div>

                  <hr className="my-4" />

                  {/* Payment Information */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h6 className="text-uppercase text-muted small mb-2">Payment Reference</h6>
                      <h5 className="mb-0 fw-bold">{selectedPayment.reference_number}</h5>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Tracking Code</label>
                      <p className="mb-0 fw-bold">{selectedPayment.tracking_code}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Category</label>
                      <p className="mb-0">{selectedPayment.category_name || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Business Owner</label>
                      <p className="mb-0">{user.fullname || "N/A"}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Contact Number</label>
                      <p className="mb-0">{user.phone_number || "N/A"}</p>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Email</label>
                      <p className="mb-0">{user.email || "N/A"}</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Payment Details */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h6 className="text-uppercase text-muted small mb-2">Payment Details</h6>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Payment Type</label>
                      <p className="mb-0">{selectedPayment.payment_type}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Amount to Pay</label>
                      <h4 className="mb-0 text-success fw-bold">₱{parseFloat(selectedPayment.amount).toFixed(2)}</h4>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="text-uppercase text-muted small mb-1">Description</label>
                      <p className="mb-0">{selectedPayment.description || "N/A"}</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Instructions */}
                  <div className="alert alert-warning mb-0">
                    <h6 className="mb-2 fw-bold">PAYMENT INSTRUCTIONS:</h6>
                    <ol className="mb-2 ps-3">
                      <li>Present this payment slip to the cashier at the office counter</li>
                      <li>Payment must be made in full amount (₱{parseFloat(selectedPayment.amount).toFixed(2)})</li>
                      <li>Accepted payment methods: Cash, Check</li>
                      <li>Official receipt will be issued upon payment</li>
                      <li>Keep your official receipt for your records</li>
                    </ol>
                    <p className="mb-0 small text-muted">
                      <strong>Note:</strong> Partial payments are not accepted. Payment must be made during office hours: Mon-Fri, 8:00 AM - 5:00 PM
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="mb-1 small text-muted">This is a computer-generated payment slip</p>
                    <p className="mb-0 small text-muted">Generated on: {formatDate(new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-print-none">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePrintSlip}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={printSlip}
                >
                  <Printer size={16} />
                  Print Slip
                </button>
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
                      <p className="mb-0 fw-bold">{selectedPayment.tracking_code}</p>
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
                        <p className="mb-0 fw-bold">{user.fullname || "N/A"}</p>
                      </div>

                      <div className="col-md-6 mb-2">
                        <label className="text-uppercase text-muted small mb-1">Contact Number</label>
                        <p className="mb-0">{user.phone_number || "N/A"}</p>
                      </div>

                      <div className="col-md-12 mb-2">
                        <label className="text-uppercase text-muted small mb-1">Email Address</label>
                        <p className="mb-0">{user.email || "N/A"}</p>
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
                        <p className="mb-0">{selectedPayment.category_name || "N/A"}</p>
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

                  {/* Footer - Authorized Signature */}
                  <div className="row mt-5 pt-4">
                    <div className="col-md-6">
                      <div className="text-center">
                        <div className="border-top border-dark pt-2 mt-5" style={{width: "200px", margin: "0 auto"}}>
                          <p className="mb-0 small">Payor's Signature</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-center">
                        <div className="border-top border-dark pt-2 mt-5" style={{width: "200px", margin: "0 auto"}}>
                          <p className="mb-0 small">Authorized Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
    </>
  );
}

export default UserPayments;
