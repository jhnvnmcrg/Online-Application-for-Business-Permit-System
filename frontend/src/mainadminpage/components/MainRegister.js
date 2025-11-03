import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Building } from "lucide-react";
import { API_URL } from "../../config/api";

function MainRegister() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: "",
    retypePassword: "",
    email: "",
  });
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showMessage = (message, type = "info") => {
    setMessageModal({ isOpen: true, message, type });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, message: "", type: "info" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.fullname ||
      !formData.username ||
      !formData.password ||
      !formData.email
    ) {
      setError("All fields are required!");
      return;
    }

    if (formData.password !== formData.retypePassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    if (!agreeToPolicy) {
      setError("Please agree to the Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/main/register`, {
        fullname: formData.fullname,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      if (response.data.success) {
        showMessage("Account created successfully! You can now log in.", "success");
        setTimeout(() => {
          navigate("/oabps/main/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="min-vh-100 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
        <div className="position-relative d-flex flex-column align-items-center justify-content-center min-vh-100 px-4 login-container">
          
          <div className="card shadow-lg login-card">
            <div className="card-body p-4">
              

              <div className="text-center mb-4">
                {/* Logo */}
                <div className="d-flex justify-content-center mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: "80px", height: "80px", backgroundColor: "#fbbf24" }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: "52px", height: "52px", backgroundColor: "#dc3545" }}
                    >
                      <Building size={28} className="text-white" />
                    </div>
                  </div>
                </div>

                <h4 className="fw-semibold text-dark mb-1">
                  Create a new Account
                </h4>
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  Online Business Permit & Licensing System
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAccount}>
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <User size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="fullname"
                      placeholder="Fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Mail size={20} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <User size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Lock size={20} className="text-muted" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Lock size={20} className="text-muted" />
                    </span>
                    <input
                      type={showRetypePassword ? "text" : "password"}
                      className="form-control"
                      name="retypePassword"
                      placeholder="Retype Password"
                      value={formData.retypePassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      disabled={isLoading}
                    >
                      {showRetypePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="agreePolicy"
                    checked={agreeToPolicy}
                    onChange={(e) => setAgreeToPolicy(e.target.checked)}
                    disabled={isLoading}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="agreePolicy"
                    style={{ fontSize: "14px" }}
                  >
                    I agree and accept to the{" "}
                    <a
                      href="#"
                      className="text-decoration-none fw-bold"
                      style={{ color: "#dc3545" }}
                      onClick={(e) => {
                        e.preventDefault();
                        showMessage("Privacy Policy would be displayed here.", "info");
                      }}
                    >
                      PRIVACY POLICY
                    </a>
                  </label>
                </div>
                <div className="d-flex gap-3">
                  <Link
                    to="/oabps/main/login"
                    className="btn border flex-fill"
                    style={{
                      color: "#dc3545",
                      borderColor: "#dc3545",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#dc3545";
                      e.target.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#dc3545";
                    }}
                  >
                    CANCEL
                  </Link>
                  <button
                    type="submit"
                    className="btn text-white flex-fill"
                    style={{ backgroundColor: "#dc3545" }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#bb2d3b")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#dc3545")
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {messageModal.isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
          onClick={closeMessageModal}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex flex-column align-items-center text-center">
              {messageModal.type === "success" && (
                <CheckCircle size={48} className="text-success mb-3" />
              )}
              {messageModal.type === "error" && (
                <XCircle size={48} className="text-danger mb-3" />
              )}
              {messageModal.type === "info" && (
                <AlertCircle size={48} className="text-primary mb-3" />
              )}
              <p className="mb-4">{messageModal.message}</p>
              <button
                className="btn text-white px-4"
                style={{ backgroundColor: "#dc3545" }}
                onClick={closeMessageModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MainRegister