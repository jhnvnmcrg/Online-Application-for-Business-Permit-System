import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

function ProcessorLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <div className="min-vh-100 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
        <div className="position-relative d-flex flex-column align-items-center justify-content-center min-vh-100 px-4 login-container">
          <h4 className="fw-semibold text-dark mb-1">PROCESSOR</h4>
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

              <form>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username or Email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
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

                <div className="d-flex justify-content-center mt-3">
                  <Link
                    to="/oabps/processor/forgot"
                    className="text-decoration-none"
                    style={{ color: "#dc3545" }}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProcessorLogin;
