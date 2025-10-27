import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainAssign() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // Add Assignment Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit Assignment Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState(null);
  const [editAdminId, setEditAdminId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  // Delete Assignment Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
  const [deleteAssignmentName, setDeleteAssignmentName] = useState("");

  // Data States
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Message Modal States
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("success"); // "success", "error", "info"

  // Helper function to show message modal
  const showMessage = (message, type = "success") => {
    setMessageContent(message);
    setMessageType(type);
    setShowMessageModal(true);
  };

  // Helper function to close message modal
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageContent("");
    setMessageType("success");
  };

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

    // Fetch data
    fetchAdmins();
    fetchCategories();
    fetchAssignments();
  }, [navigate]);

  // Fetch all admins (only Processors)
  const fetchAdmins = async () => {
    try {
      const response = await axios.get("https://oabs-f7by.onrender.com/api/admin/all");
      if (response.data.success) {
        // Filter only Processor admins
        const processors = response.data.admins.filter(
          (admin) => admin.role === "Processor"
        );
        setAdmins(processors);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // Fetch all document categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/category/all"
      );
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/assignment/all"
      );
      if (response.data.success) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Handle Add Assignment Modal Open
  const handleAddModalOpen = () => {
    setAdminId("");
    setCategoryId("");
    setShowAddModal(true);
  };

  // Handle Add Assignment Modal Close
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setAdminId("");
    setCategoryId("");
  };

  // Handle Add Assignment Submit
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/assignment/add",
        {
          admin_id: adminId,
          category_id: categoryId,
        }
      );

      if (response.data.success) {
        showMessage("Assignment added successfully!", "success");
        handleAddModalClose();
        fetchAssignments(); // Refresh assignments list
      } else {
        showMessage(response.data.message || "Failed to add assignment", "error");
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      showMessage(error.response?.data?.error || "Error adding assignment", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Assignment Modal Open
  const handleEditModalOpen = (assignment) => {
    setEditAssignmentId(assignment.assignment_id);
    setEditAdminId(assignment.admin_id);
    setEditCategoryId(assignment.category_id);
    setShowEditModal(true);
  };

  // Handle Edit Assignment Modal Close
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditAssignmentId(null);
    setEditAdminId("");
    setEditCategoryId("");
  };

  // Handle Edit Assignment Submit
  const handleEditAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/assignment/update/${editAssignmentId}`,
        {
          admin_id: editAdminId,
          category_id: editCategoryId,
        }
      );

      if (response.data.success) {
        showMessage("Assignment updated successfully!", "success");
        handleEditModalClose();
        fetchAssignments(); // Refresh assignments list
      } else {
        showMessage(response.data.message || "Failed to update assignment", "error");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      showMessage(error.response?.data?.error || "Error updating assignment", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Assignment Modal Open
  const handleDeleteModalOpen = (assignment) => {
    setDeleteAssignmentId(assignment.assignment_id);
    setDeleteAssignmentName(
      `${assignment.admin_fullname} - ${assignment.category_name}`
    );
    setShowDeleteModal(true);
  };

  // Handle Delete Assignment Modal Close
  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteAssignmentId(null);
    setDeleteAssignmentName("");
  };

  // Handle Delete Assignment Submit
  const handleDeleteAssignment = async () => {
    setLoading(true);

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/assignment/delete/${deleteAssignmentId}`
      );

      if (response.data.success) {
        showMessage("Assignment deleted successfully!", "success");
        handleDeleteModalClose();
        fetchAssignments(); // Refresh assignments list
      } else {
        showMessage(response.data.message || "Failed to delete assignment", "error");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      showMessage(error.response?.data?.error || "Error deleting assignment", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assignments.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  return (
    <>
      <MainSideBar>
        <div className="container-fluid p-4">
          {/* Header */}

          <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Assign Processor to Category</h4>
              <div className="d-flex gap-2">
                {/* <select 
                  className="form-select"
                  
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select> */}
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleAddModalOpen}
                >
                  <Plus /> Add Assignment
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
                    <th>Admin Name</th>
                    <th>Username</th>
                    <th>Assigned Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No assignments found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((assignment, index) => (
                      <tr key={assignment.assignment_id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{assignment.admin_fullname || "Unknown"}</td>
                        <td>{assignment.admin_username || "Unknown"}</td>
                        <td>
                          <span className="badge bg-info">
                            {assignment.category_name || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleEditModalOpen(assignment)}
                          >
                            <Pencil className="text-primary" />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteModalOpen(assignment)}
                          >
                            <Trash className="text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {assignments.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, assignments.length)} of {assignments.length} assignment(s)
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

        {/* Add Assignment Modal */}
        {showAddModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Assignment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleAddModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <form onSubmit={handleAddAssignment}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="adminId" className="form-label">
                        Select Processor Admin
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="adminId"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">-- Select Admin --</option>
                        {admins.map((admin) => (
                          <option key={admin.admin_id} value={admin.admin_id}>
                            {admin.fullname} ({admin.username})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="categoryId" className="form-label">
                        Select Document Category
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                          <option
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.category_name}
                          </option>
                        ))}
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
                      {loading ? "Adding..." : "Add Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Assignment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleEditModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <form onSubmit={handleEditAssignment}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="editAdminId" className="form-label">
                        Select Processor Admin
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="editAdminId"
                        value={editAdminId}
                        onChange={(e) => setEditAdminId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">-- Select Admin --</option>
                        {admins.map((admin) => (
                          <option key={admin.admin_id} value={admin.admin_id}>
                            {admin.fullname} ({admin.username})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="editCategoryId" className="form-label">
                        Select Document Category
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="editCategoryId"
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                          <option
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.category_name}
                          </option>
                        ))}
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
                      {loading ? "Updating..." : "Update Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Assignment Modal */}
        {showDeleteModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Assignment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete assignment{" "}
                    <strong>{deleteAssignmentName}</strong>?
                  </p>
                  <p className="text-danger">This action cannot be undone.</p>
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
                    onClick={handleDeleteAssignment}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Assignment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    {messageType === "success" && (
                      <CheckCircle className="text-success" />
                    )}
                    {messageType === "error" && (
                      <XCircle className="text-danger" />
                    )}
                    {messageType === "info" && (
                      <AlertCircle className="text-info" />
                    )}
                    {messageType === "success" && "Success"}
                    {messageType === "error" && "Error"}
                    {messageType === "info" && "Information"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeMessageModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">{messageContent}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={closeMessageModal}
                  >
                    OK
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

export default MainAssign;
