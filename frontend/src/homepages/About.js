import Header from '../includes/Header';
import {
  Target,
  Eye,
  Award,
  Clock,
  Shield,
  Users,
  FileText,
  CheckCircle,
  Zap,
  HeartHandshake
} from 'lucide-react';

function About() {
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
            <h1 className="display-3 fw-bold my-4">About OABP</h1>
            <p className="lead mb-0" style={{ fontSize: "1.3rem", maxWidth: "800px", margin: "0 auto" }}>
              Revolutionizing business permit applications through digital innovation and streamlined processes
            </p>
          </div>
        </div>
      </div>

      {/* What is OABP Section */}
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h2 className="display-5 fw-bold text-dark mb-4">What is OABP?</h2>
            <p className="lead text-muted mb-4">
              The Online Application for Business Permit (OABP) is a comprehensive digital platform designed to simplify and expedite the business permit application process.
            </p>
            <p className="text-muted mb-4">
              Our system eliminates the need for physical visits to government offices, long queues, and paperwork hassles.
              Business owners can now apply for permits, submit documents, track applications, and receive approvals entirely online.
            </p>
            <p className="text-muted mb-0">
              OABP represents a significant step forward in government service digitalization, making it easier for entrepreneurs
              to establish and operate legitimate businesses while maintaining compliance with local regulations.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
              <div className="card-body p-5 text-center text-dark">
                <div className="mb-4">
                  <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center"
                       style={{ width: "120px", height: "120px" }}>
                    <FileText size={60} className="text-danger" />
                  </div>
                </div>
                <h3 className="fw-bold mb-3">Fully Digital Platform</h3>
                <p className="mb-0" style={{ fontSize: "1.1rem" }}>
                  Complete your business permit application from anywhere, at any time, with just an internet connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-danger text-white py-4">
                  <div className="d-flex align-items-center gap-3">
                    <Target size={32} />
                    <h3 className="mb-0 fw-bold">Our Mission</h3>
                  </div>
                </div>
                <div className="card-body p-4">
                  <p className="mb-3" style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
                    To provide a seamless, efficient, and transparent online platform for business permit applications,
                    empowering entrepreneurs to establish and operate their businesses with ease while ensuring regulatory compliance.
                  </p>
                  <p className="mb-0 text-muted">
                    We are committed to reducing bureaucratic barriers and accelerating the business registration process through
                    technology-driven solutions that benefit both business owners and government agencies.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header text-white py-4" style={{ backgroundColor: "#fbbf24" }}>
                  <div className="d-flex align-items-center gap-3 text-dark">
                    <Eye size={32} />
                    <h3 className="mb-0 fw-bold">Our Vision</h3>
                  </div>
                </div>
                <div className="card-body p-4">
                  <p className="mb-3" style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
                    To be the leading digital platform for business permit applications, setting the standard for
                    government service digitalization and contributing to a thriving business ecosystem.
                  </p>
                  <p className="mb-0 text-muted">
                    We envision a future where obtaining business permits is completely paperless, efficient, and accessible
                    to all entrepreneurs, fostering economic growth and business development in our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">Key Features</h2>
          <p className="lead text-muted">Everything you need for a hassle-free permit application experience</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <Zap size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Fast Processing</h5>
                <p className="text-muted mb-0">
                  Streamlined workflow ensures your application is processed quickly without unnecessary delays.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <Clock size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Real-Time Tracking</h5>
                <p className="text-muted mb-0">
                  Monitor your application status in real-time with our comprehensive tracking system.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <Shield size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Secure & Protected</h5>
                <p className="text-muted mb-0">
                  Your data and documents are protected with enterprise-grade security measures.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <FileText size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Paperless Process</h5>
                <p className="text-muted mb-0">
                  100% digital application process - no physical documents or office visits required.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <Users size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">User-Friendly Interface</h5>
                <p className="text-muted mb-0">
                  Intuitive design makes it easy for anyone to navigate and complete applications.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "80px", height: "80px" }}>
                  <HeartHandshake size={40} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Dedicated Support</h5>
                <p className="text-muted mb-0">
                  Get assistance from our support team whenever you need help with your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Benefits of Using OABP</h2>
            <p className="lead text-muted">Why thousands of business owners choose our platform</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Save Time</h5>
                  <p className="text-muted mb-0">
                    No more waiting in long queues or making multiple trips to government offices.
                    Complete everything from the comfort of your home or office.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Reduce Costs</h5>
                  <p className="text-muted mb-0">
                    Eliminate transportation costs, printing expenses, and other fees associated with
                    traditional application processes.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">24/7 Accessibility</h5>
                  <p className="text-muted mb-0">
                    Apply for permits anytime, anywhere. Our platform is available round the clock,
                    fitting into your busy schedule.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Transparent Process</h5>
                  <p className="text-muted mb-0">
                    Track every step of your application process with clear status updates and
                    notifications at each stage.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Environmental Impact</h5>
                  <p className="text-muted mb-0">
                    Contribute to environmental conservation by going paperless with digital applications
                    and documents.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                       style={{ width: "50px", height: "50px" }}>
                    <CheckCircle size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Organized Records</h5>
                  <p className="text-muted mb-0">
                    All your documents and permits are stored digitally in one secure location,
                    easily accessible when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Team */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">Development Team</h2>
          <p className="lead text-muted">Meet the developers behind OABP</p>
        </div>
        <div className="row justify-content-center g-4">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-5 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "100px", height: "100px" }}>
                  <Users size={50} className="text-danger" />
                </div>
                <h4 className="fw-bold mb-2">John Ivan Macaraeg</h4>
                <p className="text-muted mb-0">Full-Stack Developer</p>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-5 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "100px", height: "100px" }}>
                  <Users size={50} className="text-danger" />
                </div>
                <h4 className="fw-bold mb-2">Fre Ann Jaleco Arroyo</h4>
                <p className="text-muted mb-0">Full-Stack Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-5" style={{ background: "linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%)" }}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="lead text-white mb-4" style={{ opacity: 0.9 }}>
            Join thousands of business owners who have simplified their permit application process with OABP.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a href="/oabps/user/login" className="btn btn-light btn-lg px-5 py-3">
              Apply for Permit Now
            </a>
            <a href="/contactus" className="btn btn-outline-light btn-lg px-5 py-3">
              Contact Support
            </a>
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

export default About;
