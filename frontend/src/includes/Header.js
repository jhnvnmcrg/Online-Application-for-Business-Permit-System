import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Building } from 'lucide-react';

function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/requirements', label: 'Requirements' },
    { path: '/tracking', label: 'Track Application' },
    { path: '/contactus', label: 'Contact Us' },
  ];

  return (
    <header className="fixed-top bg-white shadow-sm" style={{ zIndex: 1030 }}>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 py-2">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
                 style={{ width: "50px", height: "50px", backgroundColor: "#fbbf24" }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                   style={{ width: "32px", height: "32px", backgroundColor: "#dc3545" }}>
                <Building size={18} className="text-white" />
              </div>
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-dark">OABP</h5>
              <p className="mb-0 small text-muted" style={{ fontSize: "0.7rem" }}>Business Permit System</p>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links */}
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              {navLinks.map((link) => (
                <li className="nav-item" key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link px-3 py-2 rounded ${
                      isActive(link.path)
                        ? 'fw-bold text-danger'
                        : 'text-dark'
                    }`}
                    style={{
                      transition: 'all 0.2s ease',
                      ...(isActive(link.path) && {
                        backgroundColor: '#fef2f2'
                      })
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-lg-2">
                <Link
                  to="/oabps/user/login"
                  className="btn btn-danger px-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
