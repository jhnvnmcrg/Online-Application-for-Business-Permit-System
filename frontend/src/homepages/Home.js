import Header from "../includes/Header";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Clock,
  Search,
  Phone,
  FileCheck,
  Building,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";

function Home() {
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
          <div className="row align-items-center">
            <div className="col-lg-7 text-white">
              <h1 className="display-3 fw-bold mb-4">
                Online Application for Business Permit
              </h1>
              <p className="lead mb-4" style={{ fontSize: "1.3rem" }}>
                Start Strong, Stay Legit — Get Your Business Permit Now!
              </p>
              <p className="mb-4" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                Apply online, track your application, and get your Mayor's Permit hassle-free.
                Join thousands of businesses that trust our streamlined permit application system.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/oabps/user/login" className="btn btn-light btn-lg px-4 py-3 d-flex align-items-center gap-2">
                  <FileText size={20} />
                  Apply for New Permit
                </Link>
                <Link to="/tracking" className="btn btn-outline-light btn-lg px-4 py-3 d-flex align-items-center gap-2">
                  <Search size={20} />
                  Track Application
                </Link>
              </div>
            </div>
            <div className="col-lg-5 text-center mt-5 mt-lg-0">
              <div className="bg-white rounded-circle p-5 shadow-lg mx-auto" style={{ width: "300px", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="text-center">
                  <div className="mb-3">
                    <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                         style={{ width: "120px", height: "120px", backgroundColor: "#fbbf24" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center"
                           style={{ width: "80px", height: "80px", backgroundColor: "#dc3545" }}>
                        <Building size={40} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="fw-bold text-dark">OABP</h4>
                  <p className="text-muted small mb-0">Business Permit System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 text-center p-4">
              <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: "70px", height: "70px" }}>
                <Building size={32} className="text-danger" />
              </div>
              <h3 className="fw-bold text-danger mb-1">Fast</h3>
              <p className="text-muted small mb-0">Quick Processing</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 text-center p-4">
              <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: "70px", height: "70px" }}>
                <Shield size={32} className="text-danger" />
              </div>
              <h3 className="fw-bold text-danger mb-1">Secure</h3>
              <p className="text-muted small mb-0">Protected Data</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 text-center p-4">
              <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: "70px", height: "70px" }}>
                <Users size={32} className="text-danger" />
              </div>
              <h3 className="fw-bold text-danger mb-1">24/7</h3>
              <p className="text-muted small mb-0">Online Access</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100 text-center p-4">
              <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                   style={{ width: "70px", height: "70px" }}>
                <TrendingUp size={32} className="text-danger" />
              </div>
              <h3 className="fw-bold text-danger mb-1">Easy</h3>
              <p className="text-muted small mb-0">Simple Process</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">How to Apply for a New Business Permit</h2>
          <p className="lead text-muted">Get your Mayor's Permit for your new business in 4 easy steps</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mb-3"
                     style={{ width: "60px", height: "60px", fontSize: "1.5rem", fontWeight: "bold" }}>
                  1
                </div>
                <h5 className="fw-bold mb-3">Fill Out Application</h5>
                <p className="text-muted mb-0">
                  Complete the online application form and attach all required documents securely.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="rounded-circle text-white d-flex align-items-center justify-content-center mb-3"
                     style={{ width: "60px", height: "60px", fontSize: "1.5rem", fontWeight: "bold", backgroundColor: "#fbbf24" }}>
                  2
                </div>
                <h5 className="fw-bold mb-3">Verification Call</h5>
                <p className="text-muted mb-0">
                  Wait for a call from the Business Bureau for confirmation and document verification.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mb-3"
                     style={{ width: "60px", height: "60px", fontSize: "1.5rem", fontWeight: "bold" }}>
                  3
                </div>
                <h5 className="fw-bold mb-3">Track Progress</h5>
                <p className="text-muted mb-0">
                  Monitor the progress of your application online in real-time using your tracking code.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="rounded-circle text-white d-flex align-items-center justify-content-center mb-3"
                     style={{ width: "60px", height: "60px", fontSize: "1.5rem", fontWeight: "bold", backgroundColor: "#fbbf24" }}>
                  4
                </div>
                <h5 className="fw-bold mb-3">Get Your Permit</h5>
                <p className="text-muted mb-0">
                  Print your Mayor's Permit online or through the link sent to your email.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-5">
          <Link to="/oabps/user/login" className="btn btn-danger btn-lg px-5 py-3">
            Start Your Application Now
          </Link>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="pe-lg-5">
                <h2 className="display-6 fw-bold text-dark mb-4">
                  Requirements for Business Registration
                </h2>
                <p className="lead text-muted mb-4">
                  New Business Requirements (to attach prior to issuance of Business Permit)
                </p>
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <ol className="mb-0" style={{ lineHeight: "2" }}>
                      <li className="mb-2">
                        <strong>Barangay Clearance</strong> - Copy of Barangay Clearance where the business will be established
                      </li>
                      <li className="mb-2">
                        <strong>Lease Contract</strong> - Copy of Lease Contract or similar legal instrument (if renting)
                      </li>
                      <li className="mb-2">
                        <strong>Occupancy Permit</strong> - Copy of Occupancy Permit
                      </li>
                      <li className="mb-2">
                        <strong>DTI Certificate</strong> - Certificate of Registration of Business Name from DTI (Sole Proprietorship)
                      </li>
                      <li className="mb-2">
                        <strong>SEC Registration</strong> - Certificate with Securities and Exchange Commission (Corporation/Partnership)
                      </li>
                      <li className="mb-2">
                        <strong>CDA Registration</strong> - Certificate of Registration with CDA (Cooperatives)
                      </li>
                      <li className="mb-2">
                        <strong>Regulatory Agency</strong> - Certificate from relevant Government Agency (Foundation/Association)
                      </li>
                    </ol>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/requirements" className="btn btn-outline-danger btn-lg">
                    View All Requirements
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-4 h-100">
                    <FileCheck size={48} className="text-danger mx-auto mb-3" />
                    <h6 className="fw-bold">Document Checklist</h6>
                    <p className="small text-muted mb-0">Verify requirements</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-4 h-100">
                    <Clock size={48} className="text-warning mx-auto mb-3" />
                    <h6 className="fw-bold">Fast Processing</h6>
                    <p className="small text-muted mb-0">Quick turnaround</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-4 h-100">
                    <CheckCircle size={48} className="text-success mx-auto mb-3" />
                    <h6 className="fw-bold">Easy Verification</h6>
                    <p className="small text-muted mb-0">Streamlined process</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card border-0 shadow-sm text-center p-4 h-100">
                    <Shield size={48} className="text-info mx-auto mb-3" />
                    <h6 className="fw-bold">Secure Upload</h6>
                    <p className="small text-muted mb-0">Protected files</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-5" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold text-dark mb-4">
                Need Help with Your Application?
              </h2>
              <p className="lead text-dark mb-4" style={{ opacity: 0.9 }}>
                Questions not answered? Experiencing technical issues? Get in touch with our representatives.
                We'll be in contact as soon as possible.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/contactus" className="btn btn-dark btn-lg px-5 py-3 d-flex align-items-center gap-2">
                  <Phone size={20} />
                  Contact Us
                </Link>
                <Link to="/tracking" className="btn btn-outline-dark btn-lg px-5 py-3 d-flex align-items-center gap-2">
                  <Search size={20} />
                  Track Your Application
                </Link>
              </div>
            </div>
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

export default Home;
