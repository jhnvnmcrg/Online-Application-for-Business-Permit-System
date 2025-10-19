import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainUsers() {
  const [searchName, setSearchName] = useState("");
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // API Base URL
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000"; // For local development

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
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
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
                    <th>Contact Number</th>
                    <th>Business Name</th>
                    <th>Business Address</th>
                    <th>Username</th>
                    <th>Status</th>
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
                    filteredOwners.map((owner, index) => (
                      <tr key={owner.owner_id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{owner.fullname || "N/A"}</td>
                        <td>{owner.email || "N/A"}</td>
                        <td>{owner.phone_number || "N/A"}</td>
                        <td>{owner.business_name || "N/A"}</td>
                        <td>{owner.business_address || "N/A"}</td>
                        <td>{owner.username || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              owner.status === "Active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {owner.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Count */}
            {!loading && filteredOwners.length > 0 && (
              <div className="text-muted mt-3">
                Showing {filteredOwners.length} of {owners.length} owner(s)
              </div>
            )}
          </div>
        </div>
      </MainSideBar>
    </>
  )
}

export default MainUsers