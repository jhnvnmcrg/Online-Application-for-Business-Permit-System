import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import {
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  CreditCard,
  Download,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/user/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/user/login");
    }
  }, [navigate]);

  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          <h2 className="display-5 fw-bold text-dark mb-2">Welcome, {username}!</h2>
          <p className="text-muted">Select your transaction</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-4">
            <Link
              to="/oabps/user/checklist"
              className="text-decoration-none"
            >
              <div className="dashboard-card card bg-danger text-white h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold mb-1">New Business</h5>
                      <p className="card-text opacity-75 small">CY 2023</p>
                    </div>
                    <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                      <FileText size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-lg-4">
            <Link
              to="/oabps/user/transaction"
              className="text-decoration-none"
            >
              <div className="dashboard-card card bg-danger text-white h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title fw-bold mb-1">
                        My Transaction
                      </h5>
                      <p className="card-text opacity-75 small">
                        Transaction History
                      </p>
                    </div>
                    <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                      <CreditCard size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-lg-4">
            <div className="dashboard-card card bg-danger text-white h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title fw-bold mb-1">Downloadables</h5>
                    <p className="card-text opacity-75 small">
                      Application Forms, etc.
                    </p>
                  </div>
                  <div className="bg-dark bg-opacity-25 p-2 rounded-circle">
                    <Download size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Quick Stats</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Active Applications</span>
                  <span className="fw-bold">3</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Pending Renewals</span>
                  <span className="fw-bold">1</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Completed This Year</span>
                  <span className="fw-bold">12</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Recent Activity</h5>
                <div className="mb-3">
                  <div className="fw-medium small">Business Permit Renewal</div>
                  <div className="text-muted small">2 days ago</div>
                </div>
                <div className="mb-3">
                  <div className="fw-medium small">Payment Processed</div>
                  <div className="text-muted small">1 week ago</div>
                </div>
                <div>
                  <div className="fw-medium small">Document Downloaded</div>
                  <div className="text-muted small">2 weeks ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Notifications</h5>
                <div className="notification-yellow p-3 mb-3">
                  <div className="fw-medium small text-warning-emphasis">
                    Renewal Due Soon
                  </div>
                  <div className="small text-warning-emphasis opacity-75">
                    Your permit expires in 30 days
                  </div>
                </div>
                <div className="notification-green p-3">
                  <div className="fw-medium small text-success-emphasis">
                    Payment Confirmed
                  </div>
                  <div className="small text-success-emphasis opacity-75">
                    Your payment has been processed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserSideBAr>
    </>
  )
}

export default UserDashboard