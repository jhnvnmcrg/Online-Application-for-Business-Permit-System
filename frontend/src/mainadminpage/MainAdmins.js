import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainAdmins() {
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = ["Barangay Clearance", "Occupancy Permit"];

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // Add Admin Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");

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

  // Handle Add Admin Modal Open
  const handleAddModalOpen = () => {
    setFullname("");
    setEmail("");
    setAdminUsername("");
    setPassword("");
    setStatus("active");
    setShowAddModal(true);
  };

  // Handle Add Admin Modal Close
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setFullname("");
    setEmail("");
    setAdminUsername("");
    setPassword("");
    setStatus("active");
  };

  // Handle Add Admin Submit
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/main/register",
        {
          fullname,
          email,
          username: adminUsername,
          password,
          status,
        }
      );

      if (response.data.success) {
        alert("Admin added successfully!");
        handleAddModalClose();
        // TODO: Refresh admins list here
      } else {
        alert(response.data.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      alert(error.response?.data?.error || "Error adding admin");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <MainSideBar>
        <div className="container-fluid p-4">
          {/* Header */}

          <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Admins</h4>
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={handleAddModalOpen}
                >
                  <Plus /> Add Admin
                </button>
              </div>
            </div>

            <hr />

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <button className="btn btn-sm">
                        <Pencil className="text-primary" />
                      </button>
                      <button className="btn btn-sm">
                        <Trash className="text-danger" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Admin</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleAddModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <form onSubmit={handleAddAdmin}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="fullname" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="fullname"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="adminUsername" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="adminUsername"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddModalClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Admin"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </MainSideBar>
    </>
  );
}

export default MainAdmins;
