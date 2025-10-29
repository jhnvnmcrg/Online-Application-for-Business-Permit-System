import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail } from "lucide-react";
import { API_URL } from "../../config/api";

function MainForgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/main/forgot-password`, {
        email: email,
      });

      if (response.data.success) {
        setSuccess("Password reset link has been sent to your email! Please check your inbox.");
        setEmail("");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to send reset link. Please try again.");
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
                <h4 className="fw-semibold text-dark mb-1">Forgot Password</h4>
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  Enter your email to receive a password reset link
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

              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
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
                    {isLoading ? "SENDING..." : "SEND RESET LINK"}
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

export default MainForgot;
