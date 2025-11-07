import { Plus, Trash, Pencil, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../includes/MainSideBar";
import axios from "axios";
import { SYSTEM_ROUTES } from "../config/routes";

function MainDocCategory() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Message modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Delete confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper functions for message modal
  const showMessage = (message, type = "success") => {
    setMessageContent(message);
    setMessageType(type);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageContent("");
    setMessageType("success");
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("mainadmin");

    if (!userData) {
      // If no user data, redirect to login
      navigate(SYSTEM_ROUTES.AUTH);
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate(SYSTEM_ROUTES.AUTH);
    }

    // Fetch categories
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/category/all"
      );
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddCategory = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCategoryName("");
    setDescription("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/category/add",
        {
          categoryName,
          description,
        }
      );

      if (response.data.success) {
        showMessage("Category added successfully!", "success");
        handleCloseModal();
        fetchCategories(); // Refresh the categories list
      } else {
        setError(response.data.message || "Failed to add category");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setDescription(category.description);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/category/update/${editingCategory.category_id}`,
        {
          categoryName,
          description,
        }
      );

      if (response.data.success) {
        showMessage("Category updated successfully!", "success");
        handleCloseEditModal();
        fetchCategories(); // Refresh the categories list
      } else {
        setError(response.data.message || "Failed to update category");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (categoryId) => {
    setPendingDeleteId(categoryId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    const categoryId = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/category/delete/${categoryId}`
      );

      if (response.data.success) {
        showMessage("Category deleted successfully!", "success");
        fetchCategories(); // Refresh the categories list
      } else {
        showMessage(response.data.message || "Failed to delete category", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Error deleting category", "error");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);

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
          <div className="bg-light p-3 border-bottom text-center mb-4 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Document Category</h4>
              <div className="d-flex gap-2">
                  {/* <select
                    className="form-select"
                    style={{ maxWidth: "100px" }}
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
                    onClick={handleAddCategory}
                  >
                    <Plus /> Add Category
                  </button>
              </div>
            </div>
            <hr className="my-0" />
            <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
              {/* Table */} 
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th className="w-25">Category Name</th>
                      <th style={{ width: "50em" }}>Description</th>
                      
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((category, index) => (
                        <tr key={category.category_id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{category.category_name}</td>
                          <td className="">{category.description}</td>
                          
                          <td>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="text-primary" />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDelete(category.category_id)}
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
              {categories.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, categories.length)} of {categories.length} category(ies)
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
        </div>

        {/* Add Category Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="categoryName" className="form-label">
                        Category Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        disabled={loading}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Category</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseEditModal}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="editCategoryName" className="form-label">
                        Category Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editCategoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editDescription" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="editDescription"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        disabled={loading}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEditModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Category"}
                    </button>
                  </div>
                </form>
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
                <div className="modal-body text-center py-4">
                  {messageType === "success" && (
                    <CheckCircle className="text-success mb-3" size={48} />
                  )}
                  {messageType === "error" && (
                    <XCircle className="text-danger mb-3" size={48} />
                  )}
                  {messageType === "info" && (
                    <AlertCircle className="text-info mb-3" size={48} />
                  )}
                  <p className="mb-0">{messageContent}</p>
                </div>
                <div className="modal-footer justify-content-center">
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={handleCancelDelete}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <AlertCircle size={20} />
                    Confirm Category Deletion
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCancelDelete}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Are you sure you want to delete this category?
                  </p>
                  <p className="text-danger fw-bold mb-0">
                    <AlertCircle size={16} className="me-1" />
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                  >
                    <Trash size={16} className="me-1" />
                    Delete Category
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

export default MainDocCategory;
