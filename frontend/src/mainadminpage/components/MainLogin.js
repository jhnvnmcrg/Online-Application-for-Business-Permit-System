import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

function MainLogin() {
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
      const response = await axios.post("https://oabs-f7by.onrender.com/api/main/login", {
        username: username,
        password: password,
      });

      if (response.data.success) {
        // Verify user role is Superadmin
        if (response.data.user.role !== "Superadmin") {
          setError("Access denied. Only Superadmins can login here.");
          return;
        }

        // Store user data in localStorage
        localStorage.setItem("mainadmin", JSON.stringify(response.data.user));
        localStorage.setItem("mainadminToken", response.data.token);
        localStorage.setItem("userType", "Admin"); // For notification system (not JWT)

        // Log successful login audit
        try {
          await axios.post("https://oabs-f7by.onrender.com/api/audit/login", {
            admin_id: response.data.user.admin_id,
            status: "Success",
          });
        } catch (auditError) {
          console.error("Failed to log audit:", auditError);
          // Continue with login even if audit fails
        }

        // Redirect to dashboard
        navigate("/oabps/main/dashboard");
      }
    } catch (err) {
      // Log failed login audit
      if (err.response?.data?.admin_id) {
        try {
          await axios.post("https://oabs-f7by.onrender.com/api/audit/login", {
            admin_id: err.response.data.admin_id,
            status: "Failed",
          });
        } catch (auditError) {
          console.error("Failed to log audit:", auditError);
        }
      }

      if (err.response?.data?.error) {
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
          <h4 className="fw-semibold text-dark mb-1">SUPERADMIN</h4>
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
                <div className="mb-3 position-relative">
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

export default MainLogin;
