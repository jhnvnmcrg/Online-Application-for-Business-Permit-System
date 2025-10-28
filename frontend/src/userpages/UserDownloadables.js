import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import {
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";

function UserDownloadables() {
  const [downloadables, setDownloadables] = useState([]);
  const [filteredDownloadables, setFilteredDownloadables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000";

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("owner") || "{}");
  const ownerId = user.owner_id;

  // Fetch released documents on component mount
  useEffect(() => {
    if (ownerId) {
      fetchDownloadables();
    }
  }, [ownerId]);

  // Filter when search or category changes
  useEffect(() => {
    filterDownloadables();
  }, [searchTerm, categoryFilter, downloadables]);

  const fetchDownloadables = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all requests for this owner
      const response = await axios.get(
        `${API_URL}/api/request/owner/${ownerId}`
      );

      if (response.data.success) {
        const releasedRequests = response.data.requests.filter(
          (req) => req.status === "Completed"
        );

        // For each released request, fetch attachments
        const downloadablesData = [];
        for (const request of releasedRequests) {
          const attachmentsResponse = await axios.get(
            `${API_URL}/api/request/attachments/${request.request_id}`
          );

          if (
            attachmentsResponse.data.success &&
            attachmentsResponse.data.attachments.length > 0
          ) {
            attachmentsResponse.data.attachments.forEach((attachment) => {
              downloadablesData.push({
                ...attachment,
                tracking_code: request.tracking_code,
                category_name: request.category_name,
                date_release: request.date_release,
              });
            });
          }
        }

        setDownloadables(downloadablesData);
        setFilteredDownloadables(downloadablesData);
      } else {
        setError("Failed to fetch downloadable documents");
      }
    } catch (err) {
      console.error("Fetch downloadables error:", err);
      setError("An error occurred while fetching downloadable documents");
    } finally {
      setLoading(false);
    }
  };

  const filterDownloadables = () => {
    let filtered = [...downloadables];

    // Filter by category
    if (categoryFilter !== "All") {
      filtered = filtered.filter((doc) => doc.category_name === categoryFilter);
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.tracking_code.toLowerCase().includes(search) ||
          doc.file_name.toLowerCase().includes(search) ||
          doc.category_name?.toLowerCase().includes(search)
      );
    }

    setFilteredDownloadables(filtered);
    setCurrentPage(1);
  };

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = downloadables.map((doc) => doc.category_name);
    return ["All", ...new Set(categories)];
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredDownloadables.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredDownloadables.length / entriesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h2 className="mb-1">Downloadables</h2>
            <small className="text-muted">
              Download your released business permit documents
            </small>
          </div>

          {/* Main Content Card */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                {/* Card Header */}
                <div
                  className="card-header text-white d-flex align-items-center gap-2"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  <CheckCircle size={20} />
                  <h5 className="mb-0">Released Documents</h5>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  {/* Controls Row */}
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Show</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "80px" }}
                          value={entriesPerPage}
                          onChange={(e) =>
                            setEntriesPerPage(parseInt(e.target.value))
                          }
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="ms-2">entries</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        {getUniqueCategories().map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-end align-items-center">
                        <label className="me-2">Search:</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ width: "250px" }}
                          placeholder="Tracking code or file name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>TRACKING CODE</th>
                          <th>CATEGORY</th>
                          <th>FILE NAME</th>
                          <th>REMARKS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              <div
                                className="spinner-border text-success"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : currentEntries.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-muted py-4"
                            >
                              {searchTerm || categoryFilter !== "All" ? (
                                "No documents found matching your filters"
                              ) : (
                                <div>
                                  <FileText
                                    size={48}
                                    className="text-muted mb-2"
                                  />
                                  <p className="mb-0">
                                    No released documents yet. Documents will
                                    appear here once your requests are released.
                                  </p>
                                </div>
                              )}
                            </td>
                          </tr>
                        ) : (
                          currentEntries.map((doc, index) => (
                            <tr key={doc.attachment_id}>
                              <td>{indexOfFirstEntry + index + 1}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {doc.tracking_code}
                                </span>
                              </td>
                              <td>{doc.category_name || "N/A"}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <FileText size={16} className="text-primary" />
                                  <span>{doc.file_name}</span>
                                </div>
                                <small className="text-muted d-flex align-items-center gap-1 mt-1">
                                  <Calendar size={12} />
                                  Released: {formatDate(doc.date_release)}
                                </small>
                              </td>
                              <td>
                                {doc.remarks ? (
                                  <span className="text-muted small">
                                    {doc.remarks}
                                  </span>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>
                              <td>
                                <a
                                  href={doc.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                  download
                                  style={{ width: "fit-content" }}
                                >
                                  <Download size={14} />
                                  DOWNLOAD
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {!loading && filteredDownloadables.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted">
                        Showing {indexOfFirstEntry + 1} to{" "}
                        {Math.min(indexOfLastEntry, filteredDownloadables.length)}{" "}
                        of {filteredDownloadables.length} entries
                      </div>
                      <nav>
                        <ul className="pagination mb-0">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage - 1)}
                            >
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => (
                            <li
                              key={index + 1}
                              className={`page-item ${
                                currentPage === index + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => paginate(index + 1)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage + 1)}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserSideBAr>
    </>
  );
}

export default UserDownloadables;
