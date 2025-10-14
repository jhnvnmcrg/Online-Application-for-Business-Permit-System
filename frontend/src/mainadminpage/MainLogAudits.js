import MainSideBar from "../includes/MainSideBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainLogAudits() {
  const [searchName, setSearchName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [audits, setAudits] = useState([]);
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

    // Fetch audits
    fetchAudits();
  }, [navigate]);

  // Fetch all login audits
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/audit/all"
      );
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
      audit.admin_fullname?.toLowerCase().includes(searchName.toLowerCase()) ||
      audit.admin_username?.toLowerCase().includes(searchName.toLowerCase());

    const matchesStatus =
      searchStatus === "" || audit.status === searchStatus;

    return matchesName && matchesStatus;
  });

  return (
    <>
      <MainSideBar>
        <div className="container-fluid p-4">
          {/* Header */}

          <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
            {/* Search and Filter Row */}
            <div className="row mb-4">
              <div className="col-md-3 d-flex align-items-center">
                <h4 className="mb-0">Login Audit</h4>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select form-select-lg"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="col-md-3"></div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
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
                    <th>Status</th>
                    <th>Log Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((audit, index) => (
                      <tr key={audit.audit_id}>
                        <td>{index + 1}</td>
                        <td>{audit.admin_fullname || "Unknown"}</td>
                        <td>{audit.admin_username || "Unknown"}</td>
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

            {/* Results Count */}
            {!loading && filteredAudits.length > 0 && (
              <div className="text-muted mt-3">
                Showing {filteredAudits.length} of {audits.length} audit log(s)
              </div>
            )}
          </div>
        </div>
      </MainSideBar>
    </>
  );
}

export default MainLogAudits;
