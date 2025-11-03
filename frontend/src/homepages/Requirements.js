import Header from '../includes/Header';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Building,
  Shield,
  Users,
  ClipboardList,
  Download,
  FileSignature
} from 'lucide-react';

function Requirements() {
  const newBusinessRequirements = [
    {
      title: "Barangay Clearance",
      description: "Copy of Barangay Clearance where the business will be established",
      required: true
    },
    {
      title: "Lease Contract",
      description: "Copy of Lease Contract or similar legal instrument (if renting a building space or land)",
      required: true
    },
    {
      title: "Occupancy Permit",
      description: "Copy of Occupancy Permit from the building/property",
      required: true
    },
    {
      title: "DTI Registration",
      description: "Copy of Certificate of Registration of Business Name from DTI (for Sole Proprietorship)",
      required: true
    },
    {
      title: "SEC Registration",
      description: "Copy of Certificate of Registration with Securities and Exchange Commission including Articles of Incorporation and By-Laws (for Corporation/Partnership)",
      required: false
    },
    {
      title: "CDA Registration",
      description: "Copy of Certificate of Registration with CDA including Articles of Cooperation and By-Laws (for Cooperatives)",
      required: false
    },
    {
      title: "Regulatory Agency Certificate",
      description: "Copy of Certificate of Registration from Regulating Government Agency including By-laws (for Foundation/Association)",
      required: false
    }
  ];

  const renewalRequirements = [
    {
      title: "Previous Business Permit",
      description: "Copy of previous year's Business/Mayor's Permit",
      required: true
    },
    {
      title: "Application Form",
      description: "Basis for computing taxes, fees, and charges with declared gross sales/receipts",
      required: true
    },
    {
      title: "Barangay Clearance",
      description: "Copy of updated Barangay Clearance where the business is located",
      required: true
    },
    {
      title: "Compliance Certificate",
      description: "Clearance or Compliance Certificate/Permit from government offices/agencies",
      required: true
    }
  ];

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
            <h1 className="display-3 fw-bold mb-4">Business Permit Requirements</h1>
            <p className="lead mb-0" style={{ fontSize: "1.3rem", maxWidth: "800px", margin: "0 auto" }}>
              Complete guide to document requirements for your business permit application
            </p>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <FileCheck size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Document Checklist</h5>
                <p className="text-muted mb-0">
                  Ensure you have all required documents before starting your application
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <ClipboardList size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Clear Guidelines</h5>
                <p className="text-muted mb-0">
                  Follow our step-by-step guide for a smooth application process
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <Shield size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Secure Upload</h5>
                <p className="text-muted mb-0">
                  All documents are securely stored and protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Business Requirements */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="mb-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                   style={{ width: "60px", height: "60px" }}>
                <Building size={30} className="text-white" />
              </div>
              <div>
                <h2 className="display-6 fw-bold text-dark mb-1">New Business Permit</h2>
                <p className="text-muted mb-0">Requirements for first-time business permit applicants</p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {newBusinessRequirements.map((req, index) => (
              <div className="col-lg-6" key={index}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                          req.required ? 'bg-danger' : 'bg-secondary'
                        }`} style={{ width: "45px", height: "45px" }}>
                          {req.required ? (
                            <AlertCircle size={24} className="text-white" />
                          ) : (
                            <FileText size={24} className="text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <h5 className="fw-bold mb-0">{req.title}</h5>
                          {req.required && (
                            <span className="badge bg-danger">Required</span>
                          )}
                        </div>
                        <p className="text-muted mb-0 small">{req.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="alert alert-info d-flex align-items-start gap-3 mt-4" role="alert">
            <AlertCircle size={24} className="flex-shrink-0 mt-1" />
            <div>
              <strong>Important Note:</strong> Requirements may vary depending on your business type.
              Sole proprietorships need DTI registration, while corporations need SEC registration,
              and cooperatives need CDA registration.
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Requirements */}
      <div className="py-5">
        <div className="container">
          <div className="mb-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: "60px", height: "60px", backgroundColor: "#fbbf24" }}>
                <FileSignature size={30} className="text-dark" />
              </div>
              <div>
                <h2 className="display-6 fw-bold text-dark mb-1">Business Permit Renewal</h2>
                <p className="text-muted mb-0">Requirements for renewing your existing business permit</p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {renewalRequirements.map((req, index) => (
              <div className="col-lg-6" key={index}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                             style={{ width: "45px", height: "45px" }}>
                          <CheckCircle size={24} className="text-dark" />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <h5 className="fw-bold mb-0">{req.title}</h5>
                          <span className="badge bg-warning text-dark">Required</span>
                        </div>
                        <p className="text-muted mb-0 small">{req.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Guidelines */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold text-dark mb-3">Document Submission Guidelines</h2>
            <p className="lead text-muted">Follow these guidelines when preparing your documents</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 text-danger">
                    <FileText size={48} />
                  </div>
                  <h6 className="fw-bold mb-2">File Format</h6>
                  <p className="small text-muted mb-0">
                    Upload documents in PDF, JPG, or PNG format
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 text-danger">
                    <Download size={48} />
                  </div>
                  <h6 className="fw-bold mb-2">File Size</h6>
                  <p className="small text-muted mb-0">
                    Maximum file size is 10MB per document
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 text-danger">
                    <FileCheck size={48} />
                  </div>
                  <h6 className="fw-bold mb-2">Clear Copies</h6>
                  <p className="small text-muted mb-0">
                    Ensure all text is readable and legible
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 text-danger">
                    <Shield size={48} />
                  </div>
                  <h6 className="fw-bold mb-2">Complete Info</h6>
                  <p className="small text-muted mb-0">
                    All required fields must be filled out
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="container py-5">
        <div className="card border-0 shadow-lg" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
          <div className="card-body p-5">
            <h3 className="fw-bold text-dark mb-4 text-center">Helpful Tips for a Smooth Application</h3>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="d-flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-dark d-flex align-items-center justify-content-center"
                         style={{ width: "40px", height: "40px" }}>
                      <CheckCircle size={20} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-2">Prepare in Advance</h6>
                    <p className="small text-dark mb-0" style={{ opacity: 0.9 }}>
                      Gather all required documents before starting your application to avoid delays
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-dark d-flex align-items-center justify-content-center"
                         style={{ width: "40px", height: "40px" }}>
                      <CheckCircle size={20} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-2">Verify Information</h6>
                    <p className="small text-dark mb-0" style={{ opacity: 0.9 }}>
                      Double-check all information before submission to prevent processing issues
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-dark d-flex align-items-center justify-content-center"
                         style={{ width: "40px", height: "40px" }}>
                      <CheckCircle size={20} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-2">Save Your Tracking Code</h6>
                    <p className="small text-dark mb-0" style={{ opacity: 0.9 }}>
                      Keep your tracking code to monitor your application status online
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-5" style={{ background: "linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%)" }}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold text-white mb-4">
            Ready to Apply?
          </h2>
          <p className="lead text-white mb-4" style={{ opacity: 0.9 }}>
            Have all your documents ready? Start your business permit application now!
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/oabps/user/login" className="btn btn-light btn-lg px-5 py-3">
              Start New Application
            </Link>
            <Link to="/contactus" className="btn btn-outline-light btn-lg px-5 py-3">
              Need Help?
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-dark text-white py-4">
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

export default Requirements;
