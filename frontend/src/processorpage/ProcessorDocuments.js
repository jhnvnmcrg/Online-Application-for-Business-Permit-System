import { Plus, Trash, Pencil, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProcessorSideBar from "../includes/ProcessorSideBar";
import axios from "axios"

function ProcessorDocuments() {
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingDocument, setEditingDocument] = useState(null);
  const [assignedCategories, setAssignedCategories] = useState([]);

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [createdBy, setCreatedBy] = useState("");
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("processor");

    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/processor/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username and admin_id from user data
      setUsername(user.username || user.fullname || "User");
      setCreatedBy(user.username || user.fullname || "User");
      setAdminId(user.admin_id); // Store admin ID for foreign key
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/processor/login");
    }
  }, [navigate]);

  // Fetch data when adminId is available
  useEffect(() => {
    if (adminId) {
      fetchAssignedCategories();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  // Search and filter effect
  useEffect(() => {
    let filtered = documents;

    // Filter by document name
    if (searchName) {
      filtered = filtered.filter((doc) =>
        doc.document_name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by meta tags (description)
    if (searchTags) {
      filtered = filtered.filter((doc) =>
        doc.description.toLowerCase().includes(searchTags.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((doc) => doc.category_id === parseInt(selectedCategory));
    }

    setFilteredDocuments(filtered);
  }, [searchName, searchTags, selectedCategory, documents]);

  const fetchAssignedCategories = async () => {
    try {
      if (!adminId) return;

      const response = await axios.get(
        `https://oabs-f7by.onrender.com/api/processor/assigned-categories/${adminId}`
      );
      if (response.data.success) {
        setAssignedCategories(response.data.assignments);
        // Extract unique categories from assignments
        const uniqueCategories = response.data.assignments.map(assignment => ({
          category_id: assignment.category_id,
          category_name: assignment.DocumentCategories?.category_name || "Unknown"
        }));
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching assigned categories:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (!adminId) return;

      const response = await axios.get(
        `https://oabs-f7by.onrender.com/api/processor/documents/${adminId}`
      );
      if (response.data.success) {
        setDocuments(response.data.documents);
        setFilteredDocuments(response.data.documents);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleAddDocument = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCategoryId("");
    setDocumentFile(null);
    setDescription("");
    setError("");
  };

  const handleFileChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("document", documentFile);
      formData.append("description", description);
      formData.append("adminId", adminId); // Send admin ID instead of name

      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/document/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Document added successfully!");
        handleCloseModal();
        fetchDocuments(); // Refresh the documents list
      } else {
        setError(response.data.message || "Failed to add document");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding document");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setCategoryId(document.category_id);
    setDescription(document.description);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDocument(null);
    setCategoryId("");
    setDescription("");
    setDocumentFile(null);
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      if (documentFile) {
        formData.append("document", documentFile); // Optional: new file
      }
      formData.append("description", description);

      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/document/update/${editingDocument.document_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Document updated successfully!");
        handleCloseEditModal();
        fetchDocuments(); // Refresh the documents list
      } else {
        setError(response.data.message || "Failed to update document");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating document");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId, documentPath) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/document/delete/${documentId}`,
        {
          data: { documentPath },
        }
      );

      if (response.data.success) {
        alert("Document deleted successfully!");
        fetchDocuments(); // Refresh the documents list
      } else {
        alert(response.data.message || "Failed to delete document");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting document");
    }
  };

  const handleDownload = (documentPath, documentName) => {
    // Open document URL in new tab for download
    const link = document.createElement("a");
    link.href = documentPath;
    link.download = documentName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <ProcessorSideBar>
        <div className="container-fluid p-4">
          <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Documents</h4>
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={handleAddDocument}
                >
                  <Plus /> Add Document
                </button>
              </div>
            </div>
            <hr className="my-0" />
            <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
              {/* Search and Filter Row */}
              

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Category Name</th>
                      <th>Document Name</th>
                      <th>Description</th>
                      <th>Date Added</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No documents found
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc, index) => (
                        <tr key={doc.document_id}>
                          <td>{index + 1}</td>
                          <td>{doc.DocumentCategories?.category_name || "N/A"}</td>
                          <td>{doc.document_name}</td>
                          <td>{doc.description}</td>
                          <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDownload(doc.document_path, doc.document_name)}
                            >
                              <Download />
                            </button>
                            <button className="btn btn-sm" onClick={() => handleEdit(doc)}>
                              <Pencil className="text-primary" />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDelete(doc.document_id, doc.document_path)}
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
            </div>
          </div>
        </div>

        {/* Add Document Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Document</h5>
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
                      <label htmlFor="categoryId" className="form-label">
                        Category Name
                      </label>
                      <select
                        className="form-select"
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Search Category</option>
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
                    <div className="mb-3">
                      <label htmlFor="documentFile" className="form-label">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="documentFile"
                        onChange={handleFileChange}
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
                    <div className="mb-3">
                      
                      <input
                        type="text"
                        className="form-control"
                        id="createdBy"
                        value={createdBy}
                        disabled
                        hidden
                        readOnly
                      />
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
                      {loading ? "Adding..." : "Add Document"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Document</h5>
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
                      <label htmlFor="editCategoryId" className="form-label">
                        Category Name
                      </label>
                      <select
                        className="form-select"
                        id="editCategoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Category</option>
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
                    <div className="mb-3">
                      <label htmlFor="editDocumentFile" className="form-label">
                        Upload New Document (Optional)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="editDocumentFile"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                      <small className="text-muted">
                        Leave empty to keep current document
                      </small>
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
                      {loading ? "Updating..." : "Update Document"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </ProcessorSideBar>
    </>
  )
}

export default ProcessorDocuments