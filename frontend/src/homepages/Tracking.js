import Header from '../includes/Header';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Building,
  User,
  Mail,
  Phone,
  Package
} from 'lucide-react';

function Tracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingResult(null);

    try {
      // API call to search by tracking code
      const response = await axios.get(`${API_URL}/api/request/track/${searchTerm.trim()}`);

      if (response.data.success) {
        setTrackingResult(response.data.request);
      } else {
        setError('No application found with this tracking code');
      }
    } catch (err) {
      setError('Application not found. Please check your tracking code and try again.');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'Pending': {
        icon: Clock,
        color: '#fbbf24',
        bgColor: 'bg-warning',
        text: 'Your application is pending review'
      },
      'Under Review': {
        icon: AlertCircle,
        color: '#0dcaf0',
        bgColor: 'bg-info',
        text: 'Your application is currently under review'
      },
      'Approved': {
        icon: CheckCircle,
        color: '#198754',
        bgColor: 'bg-success',
        text: 'Your application has been approved'
      },
      'Rejected': {
        icon: XCircle,
        color: '#dc3545',
        bgColor: 'bg-danger',
        text: 'Your application was rejected'
      },
      'Completed': {
        icon: CheckCircle,
        color: '#198754',
        bgColor: 'bg-success',
        text: 'Your permit is ready for download'
      },
      'Cancelled': {
        icon: XCircle,
        color: '#6c757d',
        bgColor: 'bg-secondary',
        text: 'This application was cancelled'
      }
    };

    return statusMap[status] || statusMap['Pending'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <Header />

      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div className="container">
          <div className="text-center text-white">
            <h1 className="display-3 fw-bold mb-4">Track Your Application</h1>
            <p className="lead mb-0" style={{ fontSize: "1.3rem", maxWidth: "800px", margin: "0 auto" }}>
              Enter your tracking code to check the status of your business permit application
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container" style={{ marginTop: "-50px", position: "relative", zIndex: 10 }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4 text-center">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: "80px", height: "80px" }}>
                    <Search size={40} className="text-danger" />
                  </div>
                  <h4 className="fw-bold mb-2">Enter Tracking Code</h4>
                  <p className="text-muted mb-0">
                    Your tracking code was provided when you submitted your application
                  </p>
                </div>

                <div className="mb-3">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white">
                      <FileText size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your tracking code (e.g., OABP-2025-001)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Track Application
                    </>
                  )}
                </button>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0" role="alert">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {trackingResult && (
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {/* Status Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className={`card-header ${getStatusInfo(trackingResult.status).bgColor} text-white py-4`}>
                  <div className="d-flex align-items-center gap-3">
                    {(() => {
                      const StatusIcon = getStatusInfo(trackingResult.status).icon;
                      return <StatusIcon size={32} />;
                    })()}
                    <div>
                      <h4 className="mb-1 fw-bold">Application Status: {trackingResult.status}</h4>
                      <p className="mb-0">{getStatusInfo(trackingResult.status).text}</p>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <FileText size={20} className="text-danger mt-1" />
                        <div>
                          <p className="text-muted mb-1 small">Tracking Code</p>
                          <p className="fw-bold mb-0">{trackingResult.tracking_code || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <Calendar size={20} className="text-danger mt-1" />
                        <div>
                          <p className="text-muted mb-1 small">Date Submitted</p>
                          <p className="fw-bold mb-0">{formatDate(trackingResult.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <Building size={20} className="text-danger mt-1" />
                        <div>
                          <p className="text-muted mb-1 small">Document Category</p>
                          <p className="fw-bold mb-0">{trackingResult.category_name || 'Business Permit'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-3">
                        <Package size={20} className="text-danger mt-1" />
                        <div>
                          <p className="text-muted mb-1 small">Request ID</p>
                          <p className="fw-bold mb-0">#{trackingResult.request_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold">Application Timeline</h5>
                </div>
                <div className="card-body p-4">
                  <div className="timeline">
                    <div className="d-flex gap-3 mb-4">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                             style={{ width: "40px", height: "40px" }}>
                          <CheckCircle size={20} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Application Submitted</h6>
                        <p className="text-muted small mb-0">
                          {formatDate(trackingResult.created_at)}
                        </p>
                      </div>
                    </div>

                    {trackingResult.status !== 'Pending' && (
                      <div className="d-flex gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                            ['Under Review', 'Approved', 'Rejected', 'Completed'].includes(trackingResult.status)
                              ? 'bg-success'
                              : 'bg-secondary bg-opacity-25'
                          }`} style={{ width: "40px", height: "40px" }}>
                            <AlertCircle size={20} className={
                              ['Under Review', 'Approved', 'Rejected', 'Completed'].includes(trackingResult.status)
                                ? 'text-white'
                                : 'text-secondary'
                            } />
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Under Review</h6>
                          <p className="text-muted small mb-0">
                            Your application is being reviewed by our team
                          </p>
                        </div>
                      </div>
                    )}

                    {['Approved', 'Completed'].includes(trackingResult.status) && (
                      <div className="d-flex gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                               style={{ width: "40px", height: "40px" }}>
                            <CheckCircle size={20} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Approved</h6>
                          <p className="text-muted small mb-0">
                            Your application has been approved
                          </p>
                        </div>
                      </div>
                    )}

                    {trackingResult.status === 'Rejected' && (
                      <div className="d-flex gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                               style={{ width: "40px", height: "40px" }}>
                            <XCircle size={20} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Rejected</h6>
                          <p className="text-muted small mb-0">
                            Your application was rejected. Please contact support for details.
                          </p>
                        </div>
                      </div>
                    )}

                    {trackingResult.status === 'Completed' && (
                      <div className="d-flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                               style={{ width: "40px", height: "40px" }}>
                            <CheckCircle size={20} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">Completed</h6>
                          <p className="text-muted small mb-0">
                            Your permit is ready. Please log in to download.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="alert alert-info d-flex align-items-start gap-3" role="alert">
                <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                <div>
                  <h6 className="fw-bold mb-2">Next Steps</h6>
                  {trackingResult.status === 'Pending' && (
                    <p className="mb-0">Please wait for your application to be reviewed. You will be notified via email once the status changes.</p>
                  )}
                  {trackingResult.status === 'Under Review' && (
                    <p className="mb-0">Your application is being processed. We may contact you if additional information is needed.</p>
                  )}
                  {trackingResult.status === 'Approved' && (
                    <p className="mb-0">Congratulations! Please log in to your account to proceed with payment and download your permit.</p>
                  )}
                  {trackingResult.status === 'Completed' && (
                    <p className="mb-0">Your permit is ready! Log in to your account to download your business permit.</p>
                  )}
                  {trackingResult.status === 'Rejected' && (
                    <p className="mb-0">Please contact our support team for more information about your rejection and reapplication process.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No results state - show helpful info */}
      {!trackingResult && !loading && !error && searchTerm.length === 0 && (
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: "60px", height: "60px" }}>
                    <FileText size={30} className="text-danger" />
                  </div>
                  <h5 className="fw-bold mb-3">Find Your Tracking Code</h5>
                  <p className="text-muted small mb-0">
                    Your tracking code was sent to your email after submitting your application.
                    Check your inbox or spam folder.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: "60px", height: "60px" }}>
                    <Clock size={30} className="text-danger" />
                  </div>
                  <h5 className="fw-bold mb-3">Real-Time Updates</h5>
                  <p className="text-muted small mb-0">
                    Track your application status in real-time. Updates are reflected immediately
                    as your application progresses.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: "60px", height: "60px" }}>
                    <Phone size={30} className="text-danger" />
                  </div>
                  <h5 className="fw-bold mb-3">Need Help?</h5>
                  <p className="text-muted small mb-0">
                    Can't find your tracking code? Contact our support team and we'll help you
                    locate your application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0 small">© 2025 OABP - Online Application for Business Permit. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="mb-0 small text-muted">
                Developed by John Ivan Macaraeg & Fre Ann Jaleco Arroyo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracking;
