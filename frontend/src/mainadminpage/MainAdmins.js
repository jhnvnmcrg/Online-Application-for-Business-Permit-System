import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainAdmins() {
  const [searchName, setSearchName] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Add Admin Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Processor");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Edit Admin Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);
  const [editFullname, setEditFullname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("Processor");
  const [editStatus, setEditStatus] = useState("active");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete Admin Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [deleteAdminName, setDeleteAdminName] = useState("");

  // Admins List State
  const [admins, setAdmins] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      // Set current admin ID to hide from list
      setCurrentAdminId(user.admin_id);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/main/login");
    }

    // Fetch admins list
    fetchAdmins();
  }, [navigate]);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get("https://oabs-f7by.onrender.com/api/admin/all");
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Filter admins based on search and filters
  const filteredAdmins = admins.filter((admin) => {
    // Hide current logged-in admin from list
    if (admin.admin_id === currentAdminId) {
      return false;
    }

    const searchTerm = searchName.toLowerCase();
    const matchesSearch =
      admin.fullname?.toLowerCase().includes(searchTerm) ||
      admin.email?.toLowerCase().includes(searchTerm) ||
      admin.username?.toLowerCase().includes(searchTerm);

    const matchesRole = filterRole === "all" || admin.role === filterRole;
    const matchesStatus = filterStatus === "all" || admin.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, filterRole, filterStatus]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Handle Add Admin Modal Open
  const handleAddModalOpen = () => {
    setFullname("");
    setEmail("");
    setAdminUsername("");
    setPassword("");
    setRole("Processor");
    setStatus("active");
    setShowPassword(false);
    setShowAddModal(true);
  };

  // Handle Add Admin Modal Close
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setFullname("");
    setEmail("");
    setAdminUsername("");
    setPassword("");
    setRole("Processor");
    setStatus("active");
    setShowPassword(false);
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
          role,
          status,
        }
      );

      if (response.data.success) {
        alert("Admin added successfully!");
        handleAddModalClose();
        fetchAdmins(); // Refresh admins list
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

  // Handle Edit Admin Modal Open
  const handleEditModalOpen = (admin) => {
    setEditAdminId(admin.admin_id);
    setEditFullname(admin.fullname);
    setEditEmail(admin.email);
    setEditUsername(admin.username);
    setEditPassword("");
    setEditRole(admin.role || "Processor");
    setEditStatus(admin.status || "active");
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  // Handle Edit Admin Modal Close
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditAdminId(null);
    setEditFullname("");
    setEditEmail("");
    setEditUsername("");
    setEditPassword("");
    setEditRole("Processor");
    setEditStatus("active");
    setShowEditPassword(false);
  };

  // Handle Edit Admin Submit
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        fullname: editFullname,
        email: editEmail,
        username: editUsername,
        role: editRole,
        status: editStatus,
      };

      // Only include password if it's provided
      if (editPassword && editPassword.trim() !== "") {
        updateData.password = editPassword;
      }

      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/admin/update/${editAdminId}`,
        updateData
      );

      if (response.data.success) {
        alert("Admin updated successfully!");
        handleEditModalClose();
        fetchAdmins(); // Refresh admins list
      } else {
        alert(response.data.message || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      alert(error.response?.data?.error || "Error updating admin");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Admin Modal Open
  const handleDeleteModalOpen = (admin) => {
    setDeleteAdminId(admin.admin_id);
    setDeleteAdminName(admin.fullname);
    setShowDeleteModal(true);
  };

  // Handle Delete Admin Modal Close
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteAdminId(null);
    setDeleteAdminName("");
  };

  // Handle Delete Admin Submit
  const handleDeleteAdmin = async () => {
    setLoading(true);

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/admin/delete/${deleteAdminId}`
      );

      if (response.data.success) {
        alert("Admin deleted successfully!");
        handleDeleteModalClose();
        fetchAdmins(); // Refresh admins list
      } else {
        alert(response.data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert(error.response?.data?.error || "Error deleting admin");
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
              <h4 className="mb-0">Admins & Processors</h4>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddModalOpen}
                >
                  <Plus size={18} className="me-2" />
                  Add Admin
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="row mb-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, or username..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="Superadmin">Superadmin</option>
                  <option value="Processor">Processor</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>Show 10</option>
                  <option value={25}>Show 25</option>
                  <option value={50}>Show 50</option>
                  <option value={100}>Show 100</option>
                </select>
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
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchLoading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        {searchName || filterRole !== "all" || filterStatus !== "all"
                          ? "No admins found matching your filters"
                          : "No admins registered yet"}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((admin, index) => (
                      <tr key={admin.admin_id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td className="fw-semibold">{admin.fullname}</td>
                        <td>{admin.email}</td>
                        <td>{admin.username}</td>
                        <td>
                          <span
                            className={`badge ${
                              admin.role === "Superadmin"
                                ? "bg-primary"
                                : "bg-info"
                            }`}
                          >
                            {admin.role || "Processor"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              admin.status === "active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {admin.status || "active"}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {admin.created_at
                            ? new Date(admin.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleEditModalOpen(admin)}
                            title="Edit"
                          >
                            <Pencil size={16} className="text-primary" />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteModalOpen(admin)}
                            title="Delete"
                          >
                            <Trash size={16} className="text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!fetchLoading && filteredAdmins.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAdmins.length)} of {filteredAdmins.length} admin(s)
                </div>

                {totalPages > 1 && (
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>

                      {getPageNumbers().map((pageNum, index) => (
                        <li
                          key={index}
                          className={`page-item ${pageNum === currentPage ? 'active' : ''} ${pageNum === '...' ? 'disabled' : ''}`}
                        >
                          {pageNum === '...' ? (
                            <span className="page-link">...</span>
                          ) : (
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          )}
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            )}
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
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-lg"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          style={{ paddingRight: "45px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute"
                          style={{ right: "5px", top: "50%", transform: "translateY(-50%)" }}
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          tabIndex="-1"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">
                        Role
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                      >
                        <option value="Processor">Processor</option>
                        <option value="Superadmin">Superadmin</option>
                      </select>
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

        {/* Edit Admin Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Admin</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleEditModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <form onSubmit={handleEditAdmin}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="editFullname" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="editFullname"
                        value={editFullname}
                        onChange={(e) => setEditFullname(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editEmail" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="editEmail"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editUsername" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="editUsername"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editPassword" className="form-label">
                        New Password
                      </label>
                      <div className="position-relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          className="form-control form-control-lg"
                          id="editPassword"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}

                          disabled={loading}
                          style={{ paddingRight: "45px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute"
                          style={{ right: "5px", top: "50%", transform: "translateY(-50%)" }}
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          disabled={loading}
                          tabIndex="-1"
                        >
                          {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <small className="text-muted">
                        *Leave empty if you don't want to change the password
                      </small>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editRole" className="form-label">
                        Role
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="editRole"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        disabled={loading}
                      >
                        <option value="Processor">Processor</option>
                        <option value="Superadmin">Superadmin</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editStatus" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="editStatus"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        disabled={loading}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleEditModalClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Admin"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Admin Modal */}
        {showDeleteModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Admin</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete admin{" "}
                    <strong>{deleteAdminName}</strong>?
                  </p>
                  <p className="text-danger">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDeleteModalClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteAdmin}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </MainSideBar>
    </>
  );
}

export default MainAdmins;
