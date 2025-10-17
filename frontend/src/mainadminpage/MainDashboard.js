import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../includes/MainSideBar";
import { FileText, FolderOpen, Users, Bell } from "lucide-react";

function MainDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("main");
    
    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/main/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/main/login");
    }
  }, [navigate]);

  return (
    <>
      <MainSideBar>
        <div className="p-4">
          {/* Stats Cards */}
          <h2 className="display-5 fw-bold text-dark mb-2">Welcome, {username}!</h2>
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card mcard-stat h-100 text-center p-4">
                <FileText size={48} className="text-primary mx-auto mb-3" />
                <h3 className="mstat-number text-primary">124</h3>
                <p className="text-muted mb-0">Total Documents</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card mcard-stat h-100 text-center p-4">
                <FolderOpen size={48} className="text-success mx-auto mb-3" />
                <h3 className="mstat-number text-success">8</h3>
                <p className="text-muted mb-0">Categories</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card mcard-stat h-100 text-center p-4">
                <Users size={48} className="text-warning mx-auto mb-3" />
                <h3 className="mstat-number text-warning">45</h3>
                <p className="text-muted mb-0">Active Users</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card card-stat h-100 text-center p-4">
                <Bell size={48} className="text-danger mx-auto mb-3" />
                <h3 className="mstat-number text-danger">12</h3>
                <p className="text-muted mb-0">Pending Reviews</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="card mcard-stat">
                <div className="card-header bg-white border-bottom">
                  <h5 className="card-title mb-0">Recent Document Activity</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>Action</th>
                          <th>User</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>HR Policy 2024.pdf</td>
                          <td>Updated</td>
                          <td>John Doe</td>
                          <td>2 hours ago</td>
                          <td>
                            <span className="mbadge bg-success">Approved</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Employee Handbook.docx</td>
                          <td>Reviewed</td>
                          <td>Jane Smith</td>
                          <td>4 hours ago</td>
                          <td>
                            <span className="mbadge bg-warning">Pending</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Safety Guidelines.pdf</td>
                          <td>Created</td>
                          <td>Mike Johnson</td>
                          <td>Yesterday</td>
                          <td>
                            <span className="mbadge bg-primary">Draft</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Training Manual.pptx</td>
                          <td>Assigned</td>
                          <td>Sarah Wilson</td>
                          <td>2 days ago</td>
                          <td>
                            <span className="mbadge bg-info">In Review</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card mcard-stat">
                <div className="card-header bg-white border-bottom">
                  <h5 className="card-title mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">
                      <FileText size={16} className="me-2" />
                      Upload Document
                    </button>
                    <button className="btn btn-outline-primary">
                      <FolderOpen size={16} className="me-2" />
                      Create Category
                    </button>
                    <button className="btn btn-outline-secondary">
                      <Users size={16} className="me-2" />
                      Manage Users
                    </button>
                    <button className="btn btn-outline-info">
                      <Bell size={16} className="me-2" />
                      Set Reminder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainSideBar>
    </>
  )
}

export default MainDashboard