import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { API_URL, setAuthToken } from "../../config/api";

function UserLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username/email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/user/login`, {
        username: username,
        password: password,
      });

      if (response.data.success) {
        // Store user data in localStorage
        localStorage.setItem("owner", JSON.stringify(response.data.user));
        localStorage.setItem("userType", "Owner");

        // Redirect to dashboard
        navigate("/oabps/user/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
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
          <h4 className="fw-semibold text-dark mb-1">OWNER</h4>
          <div className="card shadow-lg login-card">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle border border-4 login-logo">
                  <div className="logo-circle w-100 h-100">
                    <div className="logo-inner w-50 h-50"></div>
                  </div>
                </div>
                <h4 className="fw-semibold text-dark mb-1">
                  Online Business Permit &
                </h4>
                <h4 className="fw-semibold text-dark mb-4">Licensing System</h4>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <User size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username or Email"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
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
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
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

                <div className="d-flex justify-content-between mb-4">
                  <Link
                    to="/oabps/user/register"
                    className="text-decoration-none"
                    style={{ color: "#dc3545" }}
                  >
                    Create a new account
                  </Link>
                  <Link
                    to="/oabps/user/forgot"
                    className="text-decoration-none"
                    style={{ color: "#dc3545" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white fw-medium"
                  style={{ backgroundColor: "#dc3545" }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#bb2d3b")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#dc3545")
                  }
                  disabled={isLoading}
                >
                  {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserLogin;