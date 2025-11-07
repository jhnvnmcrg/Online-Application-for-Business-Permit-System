import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  CreditCard,
  Library,
  Menu,
  FileDown,
  House,
  History,
  UserRoundCog,
  Building,
  LogOut,
  Settings,
} from "lucide-react";
import { PORTAL_ROUTES } from "../config/routes";
// Import the external CSS file

function UserSidebar({ children }) {
  // Check if mobile on initial load
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [username, setUsername] = useState("User");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("owner");

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUsername(user.username || user.fullname || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleLogout = () => {

    localStorage.removeItem("owner");
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("userType");
    // Redirect to login
    navigate(PORTAL_ROUTES.AUTH);
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    // Navigate to settings page
    navigate(PORTAL_ROUTES.CONFIG);
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Check if current path matches any menu item
  const isActiveItem = (path) => {
    return location.pathname === path;
  };

  // Check if any submenu item under Business Services is active
  const isBusinessServicesActive = () => {
    return (
      location.pathname.includes("/business/") ||
      location.pathname === PORTAL_ROUTES.APPLY ||
      location.pathname === PORTAL_ROUTES.RENEW
    );
  };

  return (
    <div className="d-flex position-relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        } bg-white shadow-lg`}
        style={isMobile ? {
          position: 'fixed',
          zIndex: 1050,
          height: '100vh',
          transition: 'transform 0.3s ease',
          transform: !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          top: 0,
          left: 0,
        } : undefined}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center">
            <Link to={PORTAL_ROUTES.HUB} className="text-decoration-none">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fbbf24",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#dc3545",
                  }}
                >
                  <Building size={18} className="text-white" />
                </div>
              </div>
            </Link>

            {sidebarOpen && (
              <Link to={PORTAL_ROUTES.HUB} className="text-decoration-none">
                <h5 className="mb-0 fw-bold text-dark" style={{ transition: "color 0.2s" }}>
                  OABP
                </h5>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-2 flex-grow-1">
          {/* Dashboard Link */}
          <Link
            to={PORTAL_ROUTES.HUB}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/dashboard") ? "active" : ""
            }`}
            style={{
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/dashboard") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/dashboard") ? "#fff" : "#495057",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/dashboard")) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/dashboard")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <div className="d-flex align-items-center">
              <House size={20} />
              {sidebarOpen && <span className="ms-3 fw-medium">Dashboard</span>}
            </div>
          </Link>

          {/* Business Services Dropdown */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("businessServices")}
              className={`sidebar-menu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start ${
                isBusinessServicesActive() ? "active" : ""
              }`}
              style={{
                borderRadius: "8px",
                transition: "all 0.2s ease",
                backgroundColor: isBusinessServicesActive() ? "#dc3545" : "transparent",
                color: isBusinessServicesActive() ? "#fff" : "#495057",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!isBusinessServicesActive()) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isBusinessServicesActive()) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <div className="d-flex align-items-center">
                <FileText size={20} />
                {sidebarOpen && (
                  <span className="ms-3 fw-medium">Business Services</span>
                )}
              </div>
              {sidebarOpen &&
                (expandedMenus["businessServices"] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                ))}
            </button>

            {sidebarOpen && expandedMenus["businessServices"] && (
              <div className="ms-4 mt-1">
                <Link
                  to={PORTAL_ROUTES.APPLY}
                  onClick={handleLinkClick}
                  className={`sidebar-submenu-item btn w-100 text-start p-2 small text-decoration-none ${
                    isActiveItem("/oabps/user/checklist")
                      ? "active"
                      : ""
                  }`}
                  style={{
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    backgroundColor: isActiveItem("/oabps/user/checklist") ? "#dc3545" : "transparent",
                    color: isActiveItem("/oabps/user/checklist") ? "#fff" : "#6c757d",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveItem("/oabps/user/checklist")) {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                      e.currentTarget.style.paddingLeft = "12px";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveItem("/oabps/user/checklist")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.paddingLeft = "8px";
                    }
                  }}
                >
                  New Application
                </Link>
                <Link
                  to={PORTAL_ROUTES.RENEW}
                  onClick={handleLinkClick}
                  className={`sidebar-submenu-item btn w-100 text-start p-2 small text-decoration-none ${
                    isActiveItem("/oabps/user/renewal") ? "active" : ""
                  }`}
                  style={{
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    backgroundColor: isActiveItem("/oabps/user/renewal") ? "#dc3545" : "transparent",
                    color: isActiveItem("/oabps/user/renewal") ? "#fff" : "#6c757d",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveItem("/oabps/user/renewal")) {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                      e.currentTarget.style.paddingLeft = "12px";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveItem("/oabps/user/renewal")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.paddingLeft = "8px";
                    }
                  }}
                >
                  Renewal Services
                </Link>
              </div>
            )}
          </div>

          <Link
            to={PORTAL_ROUTES.APPLY}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/checklist")
                ? "active"
                : ""
            }`}
            style={{
              borderRadius: "6px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/checklist") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/checklist") ? "#fff" : "#6c757d",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/checklist")) {
                e.currentTarget.style.backgroundColor = "#e9ecef";
                e.currentTarget.style.paddingLeft = "12px";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/checklist")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.paddingLeft = "8px";
              }
            }}
          >
            New Application
          </Link>

          {/* Transactions Link */}
          <Link
            to={PORTAL_ROUTES.HISTORY}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/transaction") ? "active" : ""
            }`}
            style={{
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/transaction") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/transaction") ? "#fff" : "#495057",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/transaction")) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/transaction")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <div className="d-flex align-items-center">
              <History size={20} />
              {sidebarOpen && (
                <span className="ms-3 fw-medium">Transactions</span>
              )}
            </div>
          </Link>

          {/* Payments Link */}
          <Link
            to={PORTAL_ROUTES.LEDGER}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/payments") ? "active" : ""
            }`}
            style={{
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/payments") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/payments") ? "#fff" : "#495057",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/payments")) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/payments")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <div className="d-flex align-items-center">
              <CreditCard size={20} />
              {sidebarOpen && (
                <span className="ms-3 fw-medium">Payments</span>
              )}
            </div>
          </Link>

          {/* Application Forms Link */}
          <Link
            to={PORTAL_ROUTES.TEMPLATES}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/forms") ? "active" : ""
            }`}
            style={{
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/forms") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/forms") ? "#fff" : "#495057",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/forms")) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/forms")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <div className="d-flex align-items-center">
              <Library size={20} />
              {sidebarOpen && (
                <span className="ms-3 fw-medium">Application Forms</span>
              )}
            </div>
          </Link>

          {/* Downloadables Link */}
          <Link
            to={PORTAL_ROUTES.RESOURCES}
            onClick={handleLinkClick}
            className={`sidebar-submenu-item btn w-100 d-flex align-items-center justify-content-between p-3 text-start text-decoration-none ${
              isActiveItem("/oabps/user/downloadables") ? "active" : ""
            }`}
            style={{
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor: isActiveItem("/oabps/user/downloadables") ? "#dc3545" : "transparent",
              color: isActiveItem("/oabps/user/downloadables") ? "#fff" : "#495057",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActiveItem("/oabps/user/downloadables")) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveItem("/oabps/user/downloadables")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <div className="d-flex align-items-center">
              <FileDown size={20} />
              {sidebarOpen && (
                <span className="ms-3 fw-medium">Downloadables</span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`main-content ${
          sidebarOpen ? "main-content-open" : "main-content-closed"
        } d-flex flex-column w-100`}
        style={isMobile ? {
          marginLeft: '0',
          width: '100%',
        } : undefined}
      >
        {/* Top Navigation */}
        <nav className="navbar navbar-dark bg-dark px-2 px-md-3">
          <div className="d-flex align-items-center w-100 justify-content-between">
            <div className="d-flex align-items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-outline-light me-3"
                aria-label="Toggle sidebar"
                style={{
                  transition: "all 0.2s ease",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Menu size={20} />
              </button>
              <Link
                to={PORTAL_ROUTES.HUB}
                className="d-flex align-items-center text-decoration-none d-none d-md-flex"
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#fbbf24",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "26px",
                      height: "26px",
                      backgroundColor: "#dc3545",
                    }}
                  >
                    <Building size={16} className="text-white" />
                  </div>
                </div>
                <h4 className="navbar-brand mb-0 text-white" style={{ transition: "color 0.2s" }}>
                  OABP
                </h4>
              </Link>
            </div>
            <div
              className="d-flex align-items-center gap-2 position-relative me-4 text-white"
              ref={userMenuRef}
            >
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  cursor: "pointer",
                  width: "40px",
                  height: "40px",
                  transition: "all 0.2s ease",
                  backgroundColor: showUserMenu ? "rgba(255, 255, 255, 0.2)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  if (!showUserMenu) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <UserRoundCog className="text-white" size={24} />
              </div>
              

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="position-absolute bg-white shadow-lg border-0"
                  style={{
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    minWidth: "220px",
                    zIndex: 1000,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div className="py-2">
                    <div
                      className="px-3 py-2 mb-1"
                      style={{
                        borderBottom: "1px solid #e9ecef",
                      }}
                    >
                      <small className="text-muted fw-medium">Account</small>
                    </div>
                    <div
                      className="d-flex align-items-center px-3 py-2 text-decoration-none mx-2"
                      onClick={handleSettings}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle me-2"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#e9ecef",
                        }}
                      >
                        <Settings size={16} className="text-secondary" />
                      </div>
                      <span className="text-dark fw-medium">Settings</span>
                    </div>
                    <hr className="my-2" />
                    <div
                      className="d-flex align-items-center px-3 py-2 text-decoration-none mx-2"
                      onClick={handleLogout}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffe5e5";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle me-2"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#fee2e2",
                        }}
                      >
                        <LogOut size={16} className="text-danger" />
                      </div>
                      <span className="text-danger fw-medium">Logout</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content - This will render whatever is passed as children */}
        <main className="flex-grow-1 p-2 p-md-4">
          <div className="container-fluid">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default UserSidebar;
