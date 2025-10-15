import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

function ProcessorForgot() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!username || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/processor/forgot-password",
        {
          username: username,
          newPassword: newPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/oabps/processor/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
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
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle border border-4 login-logo">
                  <div className="logo-circle w-100 h-100">
                    <div className="logo-inner w-50 h-50"></div>
                  </div>
                </div>
                <h4 className="fw-semibold text-dark mb-1">Reset Password</h4>
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  Online Business Permit & Licensing System
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
                  
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={isLoading}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      style={{
                        border: "none",
                        background: "none",
                        padding: "0 10px",
                        color: "#6c757d",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                
                </div>

                <div className="mb-3">
                  
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      required
                      disabled={isLoading}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      style={{
                        border: "none",
                        background: "none",
                        padding: "0 10px",
                        color: "#6c757d",
                      }}
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
