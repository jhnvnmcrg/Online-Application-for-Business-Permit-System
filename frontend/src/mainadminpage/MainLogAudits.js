import MainSideBar from "../includes/MainSideBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import { SYSTEM_ROUTES } from "../config/routes";

function MainLogAudits() {
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchUserType, setSearchUserType] = useState("");
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("mainadmin");

    if (!userData) {
      // If no user data, redirect to login
      navigate(SYSTEM_ROUTES.AUTH);
      return;
    }

    try {
      JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate(SYSTEM_ROUTES.AUTH);
    }

    // Fetch audits
    fetchAudits();
  }, [navigate]);

  // Fetch all login audits
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/audit/all`);
      if (response.data.success) {
        setAudits(response.data.audits);
      }
    } catch (error) {
      console.error("Error fetching audits:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Filter audits based on search criteria
  const filteredAudits = audits.filter((audit) => {
    const matchesName =
      searchName === "" ||
      audit.user_fullname?.toLowerCase().includes(searchName.toLowerCase()) ||
      audit.user_username?.toLowerCase().includes(searchName.toLowerCase());

    const matchesStatus =
      searchStatus === "" || audit.status === searchStatus;

    const matchesUserType =
      searchUserType === "" || audit.user_type === searchUserType;

    return matchesName && matchesStatus && matchesUserType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAudits.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchStatus, searchUserType]);

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
            {/* Search and Filter Row */}
            <div className="row mb-4 d-flex justify-content-between">
              <div className="col-md-6 d-flex align-items-center">
                <h4 className="mb-0">Login Audit</h4>
              </div>
              <div className="col-md-6 d-flex">
                <input
                  type="text"
                  className="form-control mx-1"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <select
                  className="form-select mx-1"
                  value={searchUserType}
                  onChange={(e) => setSearchUserType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
                <select
                  className="form-select mx-1"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
                <select
                  className="form-select mx-1"
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
                    <th>Username</th>
                    <th>User Type</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Log Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((audit, index) => (
                      <tr key={audit.audit_id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{audit.user_fullname || "Unknown"}</td>
                        <td>{audit.user_username || "Unknown"}</td>
                        <td>
                          <span
                            className={`badge ${
                              audit.user_type === "Admin"
                                ? "bg-primary"
                                : "bg-info"
                            }`}
                          >
                            {audit.user_type || "Unknown"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              audit.user_role === "Superadmin"
                                ? "bg-danger"
                                : audit.user_role === "Processor"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {audit.user_role || "Unknown"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              audit.status === "Success"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {audit.status}
                          </span>
                        </td>
                        <td>{formatDateTime(audit.login_datetime)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredAudits.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAudits.length)} of {filteredAudits.length} audit log(s)
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
      </MainSideBar>
    </>
  );
}

export default MainLogAudits;
