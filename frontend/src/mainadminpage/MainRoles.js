import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MainRoles() {
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  // Add Role Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  // Data Lists
  const [categories, setCategories] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);

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

    // Fetch initial data
    fetchCategories();
    fetchAdmins();
    fetchRoles();
  }, [navigate]);

  // Fetch Document Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://oabs-f7by.onrender.com/api/category/all");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Admins
  const fetchAdmins = async () => {
    try {
      const response = await axios.get("https://oabs-f7by.onrender.com/api/admin/all");
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get("https://oabs-f7by.onrender.com/api/role/all");
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Handle Add Role Modal Open
  const handleAddModalOpen = () => {
    setRoleName("");
    setAdminId("");
    setCategoryId("");
    setShowAddModal(true);
  };

  // Handle Add Role Modal Close
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setRoleName("");
    setAdminId("");
    setCategoryId("");
  };

  // Handle role name change - reset category if Superadmin
  const handleRoleNameChange = (value) => {
    setRoleName(value);
    if (value === "Superadmin") {
      setCategoryId("all");
    } else {
      setCategoryId("");
    }
  };

  // Handle Add Role Submit
  const handleAddRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/role/add",
        {
          category_id: categoryId,
          admin_id: adminId,
          role_name: roleName,
        }
      );

      if (response.data.success) {
        alert("Role added successfully!");
        handleAddModalClose();
        fetchRoles(); // Refresh roles list
      } else {
        alert(response.data.message || "Failed to add role");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      alert(error.response?.data?.error || "Error adding role");
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
              <h4 className="mb-0">Roles</h4>
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={handleAddModalOpen}
                >
                  <Plus /> Add Role
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
                    <th>Assigned Document</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    roles.map((role, index) => (
                      <tr key={role.role_id}>
                        <td>{index + 1}</td>
                        <td>{role.admin_fullname || "N/A"}</td>
                        <td>{role.category_name || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              role.role_name === "Superadmin"
                                ? "bg-primary"
                                : "bg-info"
                            }`}
                          >
                            {role.role_name}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm">
                            <Pencil className="text-primary" />
                          </button>
                          <button className="btn btn-sm">
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

        {/* Add Role Modal */}
        {showAddModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Role</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleAddModalClose}
                    disabled={loading}
                  ></button>
                </div>
                <form onSubmit={handleAddRole}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="roleName" className="form-label">
                        Role Name
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="roleName"
                        value={roleName}
                        onChange={(e) => handleRoleNameChange(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Role</option>
                        <option value="Superadmin">Superadmin</option>
                        <option value="Processor">Processor</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="adminId" className="form-label">
                        Admin
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="adminId"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Admin</option>
                        {admins.map((admin) => (
                          <option key={admin.admin_id} value={admin.admin_id}>
                            {admin.fullname} ({admin.username})
                          </option>
                        ))}
                      </select>
                    </div>

                    {roleName === "Processor" && (
                      <div className="mb-3">
                        <label htmlFor="categoryId" className="form-label">
                          Document Category
                        </label>
                        <select
                          className="form-select form-select-lg"
                          id="categoryId"
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
                    )}

                    {roleName === "Superadmin" && (
                      <div className="mb-3">
                        
                      </div>
                    )}
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
                      {loading ? "Adding..." : "Add Role"}
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

export default MainRoles;
