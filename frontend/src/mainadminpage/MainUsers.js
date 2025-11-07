import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SYSTEM_ROUTES } from "../config/routes";

function MainUsers() {
  const [searchName, setSearchName] = useState("");
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API Base URL
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000"; // For local development

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

    // Fetch owners
    fetchOwners();
  }, [navigate]);

  // Fetch all owners from the database
  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/api/owners/all`);

      if (response.data.success) {
        setOwners(response.data.owners);
      } else {
        setError("Failed to fetch owners");
      }
    } catch (err) {
      console.error("Fetch owners error:", err);
      setError("An error occurred while fetching owners");
    } finally {
      setLoading(false);
    }
  };

  // Filter owners based on search
  const filteredOwners = owners.filter((owner) => {
    const searchTerm = searchName.toLowerCase();
    return (
      owner.fullname?.toLowerCase().includes(searchTerm) ||
      owner.username?.toLowerCase().includes(searchTerm) ||
      owner.email?.toLowerCase().includes(searchTerm) ||
      owner.business_name?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOwners.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName]);

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
            <div className="row mb-4">
              <div className="col-md-4 d-flex">
                <h4 className="mb-0">Owners</h4>
              </div>
              <div className="col-md-4"></div>
              <div className="col-md-4 d-flex gap-2">
                <input
                  type="text"
                  className="form-control "
                  placeholder="Search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <select
                  className="form-select "
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

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Contact Number</th>
                    <th>Business Name</th>
                    <th>Business Address</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOwners.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        {searchName
                          ? "No owners found matching your search"
                          : "No owners registered yet"}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((owner, index) => (
                      <tr key={owner.owner_id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td className="fw-semibold">{owner.fullname || "N/A"}</td>
                        <td>{owner.email || "N/A"}</td>
                        <td>{owner.username || "N/A"}</td>
                        <td>{owner.phone_number || "N/A"}</td>
                        <td>{owner.business_name || "N/A"}</td>
                        <td>{owner.business_address || "N/A"}</td>
                        
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredOwners.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOwners.length)} of {filteredOwners.length} owner(s)
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
  )
}

export default MainUsers