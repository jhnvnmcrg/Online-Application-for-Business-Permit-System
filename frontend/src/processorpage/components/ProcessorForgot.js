import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, Building } from "lucide-react";
import { API_URL } from "../../config/api";
import { WORKFLOW_ROUTES } from "../../config/routes";

function ProcessorForgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/processor/reset-password`, {
        email: email,
        newPassword: newPassword,
      });

      if (response.data.success) {
        setSuccess("Password reset successfully! You can now log in with your new password.");
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate(WORKFLOW_ROUTES.AUTH);
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-vh-100 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
        <div className="position-relative d-flex align-items-center justify-content-center min-vh-100 px-4 login-container">
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

                <h4 className="fw-semibold text-dark mb-1">Reset Password</h4>
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  Enter your email and new password
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Mail size={20} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
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
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <Lock size={20} className="text-muted" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <Link
                    to="/oabps/processor/login"
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
                    BACK TO LOGIN
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
                    {isLoading ? "RESETTING..." : "RESET PASSWORD"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProcessorForgot;
