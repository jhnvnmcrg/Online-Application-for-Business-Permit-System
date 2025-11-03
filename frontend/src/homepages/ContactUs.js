import Header from '../includes/Header';
import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Facebook,
  Globe,
  FileText,
  Search,
  User
} from 'lucide-react';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormStatus({ type: '', message: '' });

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setFormStatus({
        type: 'success',
        message: 'Thank you for contacting us! We will get back to you within 24-48 hours.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const faqs = [
    {
      question: 'How long does it take to process my business permit application?',
      answer: 'Processing time varies depending on the completeness of your documents and the type of business. Typically, it takes 5-10 business days for a complete application.'
    },
    {
      question: 'Can I track my application status online?',
      answer: 'Yes! Use the tracking code sent to your email to track your application status on our Permit Tracking page.'
    },
    {
      question: 'What if I forgot my tracking code?',
      answer: 'Contact our support team with your application details, and we will help you retrieve your tracking code.'
    },
    {
      question: 'Can I update my application after submission?',
      answer: 'For minor corrections, please contact us immediately. For major changes, you may need to submit a new application.'
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
            <h1 className="display-3 fw-bold mb-4">Contact Us</h1>
            <p className="lead mb-0" style={{ fontSize: "1.3rem", maxWidth: "800px", margin: "0 auto" }}>
              Have questions? We're here to help. Reach out to us through any of the following channels.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="container" style={{ marginTop: "-50px", position: "relative", zIndex: 10 }}>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "70px", height: "70px" }}>
                  <Phone size={32} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Phone</h5>
                <p className="text-muted mb-2">
                  <a href="tel:+1234567890" className="text-decoration-none text-dark fw-medium">
                    (123) 456-7890
                  </a>
                </p>
                <p className="text-muted small mb-0">Monday - Friday, 8AM - 5PM</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "70px", height: "70px" }}>
                  <Mail size={32} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Email</h5>
                <p className="text-muted mb-2">
                  <a href="mailto:support@oabp.gov" className="text-decoration-none text-dark fw-medium">
                    support@oabp.gov
                  </a>
                </p>
                <p className="text-muted small mb-0">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 text-center">
                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: "70px", height: "70px" }}>
                  <MapPin size={32} className="text-danger" />
                </div>
                <h5 className="fw-bold mb-3">Office Address</h5>
                <p className="text-muted mb-2 fw-medium">
                  City Hall Building<br />
                  123 Government Street<br />
                  City, Province 1000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-danger text-white py-4">
                <div className="d-flex align-items-center gap-3">
                  <MessageCircle size={28} />
                  <h4 className="mb-0 fw-bold">Send Us a Message</h4>
                </div>
              </div>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Full Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Email Address *</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Subject *</label>
                    <select
                      className="form-select form-select-lg"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="application">Application Inquiry</option>
                      <option value="tracking">Tracking Issue</option>
                      <option value="technical">Technical Support</option>
                      <option value="requirements">Requirements Question</option>
                      <option value="payment">Payment Concern</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Message *</label>
                    <textarea
                      className="form-control form-control-lg"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Please provide details about your inquiry..."
                    ></textarea>
                  </div>

                  {formStatus.message && (
                    <div className={`alert ${formStatus.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-2 mb-4`}>
                      {formStatus.type === 'success' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      {formStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Office Hours & Additional Info */}
          <div className="col-lg-5">
            {/* Office Hours */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <Clock size={24} className="text-danger" />
                  <h5 className="mb-0 fw-bold">Office Hours</h5>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span className="text-muted">Monday - Friday</span>
                  <span className="fw-medium">8:00 AM - 5:00 PM</span>
                </div>
                <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                  <span className="text-muted">Saturday</span>
                  <span className="fw-medium">Closed</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Sunday & Holidays</span>
                  <span className="fw-medium">Closed</span>
                </div>
                <div className="alert alert-info d-flex align-items-start gap-2 mt-4 mb-0">
                  <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                  <small>Online services are available 24/7. Visit during office hours for in-person assistance.</small>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">Quick Links</h5>
              </div>
              <div className="card-body p-4">
                <div className="d-grid gap-2">
                  <a href="/requirements" className="btn btn-outline-danger text-start">
                    <FileText size={18} className="me-2" />
                    View Requirements
                  </a>
                  <a href="/tracking" className="btn btn-outline-danger text-start">
                    <Search size={18} className="me-2" />
                    Track Application
                  </a>
                  <a href="/oabps/user/login" className="btn btn-outline-danger text-start">
                    <User size={18} className="me-2" />
                    Login to Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                 style={{ width: "80px", height: "80px" }}>
              <HelpCircle size={40} className="text-danger" />
            </div>
            <h2 className="display-6 fw-bold text-dark mb-3">Frequently Asked Questions</h2>
            <p className="lead text-muted">Find answers to common questions</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div className="accordion-item border-0 shadow-sm mb-3" key={index}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button collapsed fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body text-muted">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <p className="text-muted">
                  Still have questions?{' '}
                  <a href="#contact-form" className="text-danger fw-medium text-decoration-none">
                    Send us a message
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section - Placeholder */}
      <div className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-3">Visit Our Office</h3>
            <p className="text-muted">Find us at City Hall Building</p>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "400px" }}>
                <div className="text-center">
                  <MapPin size={64} className="text-danger mb-3" />
                  <h5 className="fw-bold">Map Location</h5>
                  <p className="text-muted">
                    City Hall Building<br />
                    123 Government Street, City, Province 1000
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-danger mt-3"
                  >
                    <Globe size={18} className="me-2" />
                    Open in Google Maps
                  </a>
                </div>
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

export default ContactUs;
