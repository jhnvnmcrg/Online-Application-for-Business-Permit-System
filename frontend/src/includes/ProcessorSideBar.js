import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  History,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Folders,
  X,
  CreditCard,
  ClipboardClock,
  UserRoundCog,
  Settings,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { WORKFLOW_ROUTES } from "../config/routes";

function ProcessorSideBar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

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

  // Update active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const findActiveItem = (items) => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item.id;
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === currentPath) {
              setExpandedItems((prev) => ({
                ...prev,
                [item.id]: true,
              }));
              return child.id;
            }
          }
        }
      }
      return "dashboard";
    };

    setActiveItem(findActiveItem(menuItems));
  }, [location.pathname]);

  const toggleExpanded = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleItemClick = (item) => {
    setActiveItem(item.id);

    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      // Navigate to the path
      navigate(item.path);
    }
  };

  const handleChildClick = (child, parentId) => {
    setActiveItem(child.id);
    navigate(child.path);
  };

  const handleLogout = () => {

    localStorage.removeItem("userType");
    localStorage.removeItem("processor");
    localStorage.removeItem("processorToken");

    // Redirect to login page
    navigate(WORKFLOW_ROUTES.AUTH);
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    // Navigate to settings page
    navigate(WORKFLOW_ROUTES.CONFIG);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: WORKFLOW_ROUTES.HUB,
    },

    {
      id: "documents",
      label: "Documents",
      icon: FolderOpen,
      path: WORKFLOW_ROUTES.FILES,
    },
    {
      id: "requests",
      label: "Requests",
      icon: ClipboardClock,
      path: WORKFLOW_ROUTES.QUEUE,
    },
    {
      id: "payment",
      label: "Payments",
      icon: CreditCard,
      path: WORKFLOW_ROUTES.LEDGER,
    },
    {
      id: "transaction",
      label: "Transactions",
      icon: History,
      path: WORKFLOW_ROUTES.RECORDS,
    },
  ];

  const SidebarItem = ({ item }) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const isActive = activeItem === item.id;

    return (
      <div className="mb-1">
        <div
          className={`d-flex align-items-center p-3 text-decoration-none msidebar-item ${
            isActive ? "active" : ""
          }`}
          onClick={() => handleItemClick(item)}
          style={{ cursor: "pointer" }}
        >
          <Icon size={20} className="me-3" />
          <span className="flex-grow-1">{item.label}</span>
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            ))}
        </div>
        {hasChildren && isExpanded && (
          <div className="ps-4">
            {item.children.map((child) => (
              <div
                key={child.id}
                className={`d-flex align-items-center p-2 ps-5 text-decoration-none msidebar-item ${
                  activeItem === child.id ? "active" : ""
                }`}
                onClick={() => handleChildClick(child, item.id)}
                style={{ cursor: "pointer" }}
              >
                <span>{child.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="min-vh-100 bg-light">
        <div className="d-flex">
          {/* Sidebar */}
          <div
            className={`msidebar ${
              !sidebarOpen ? "collapsed" : ""
            } position-relative`}
          >
            <div className="p-3 border-bottom">
              <div className="d-flex align-items-center">
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: "32px", height: "32px" }}
                >
                  <span className="text-white fw-bold">D</span>
                </div>
                <h5 className="mb-0 fw-bold">DMS</h5>
              </div>
            </div>

            <div
              className="p-2 flex-grow-1"
              style={{ overflowY: "auto", height: "calc(100vh - 80px)" }}
            >
              {menuItems.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`flex-grow-1 mmain-content bg-dark bg-opacity-10 ${
              !sidebarOpen ? "expanded" : ""
            }`}
          >
            {/* Header */}
            <div className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-link p-0 me-3"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h4 className="mb-0">Dashboard</h4>
              </div>

              <div
                className="d-flex align-items-center gap-3 position-relative me-4"
                ref={userMenuRef}
              >
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{ cursor: "pointer" }}
                >
                  <UserRoundCog className="text-secondary" size={24} />
                </div>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="position-absolute bg-white shadow-lg rounded border"
                    style={{
                      top: "100%",
                      right: 0,
                      marginTop: "0.5rem",
                      minWidth: "200px",
                      zIndex: 1000,
                    }}
                  >
                    <div className="py-1">
                      <div
                        className="d-flex align-items-center px-3 py-2 text-decoration-none"
                        onClick={handleSettings}
                        style={{
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Settings size={18} className="me-2 text-secondary" />
                        <span className="text-dark">Settings</span>
                      </div>
                      <hr className="my-1" />
                      <div
                        className="d-flex align-items-center px-3 py-2 text-decoration-none"
                        onClick={handleLogout}
                        style={{
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <LogOut size={18} className="me-2 text-danger" />
                        <span className="text-danger">Logout</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Content */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProcessorSideBar;
