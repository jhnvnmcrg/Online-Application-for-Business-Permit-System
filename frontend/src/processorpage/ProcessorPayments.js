import { useState, useEffect } from "react";
import ProcessorSideBar from "../includes/ProcessorSideBar";
import { Plus, Trash, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProcessorPayments() {
  const [searchName, setSearchName] = useState("");

  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/processor/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      // Set username from user data
      setUsername(user.username || user.fullname || "User");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/oabps/processor/login");
    }
  }, [navigate]);
  return (
    <>
      <ProcessorSideBar>
        <div className="container-fluid p-4">
          <h2 className="display-5 fw-bold text-dark mb-2">
            Welcome, {username}!
          </h2>
          {/* Header */}

          <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
            {/* Search and Filter Row */}
            <div className="row mb-4">
              <div className="col-md-4 d-flex">
                <h4 className="mb-0">Payment</h4>
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

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Request ID</th>
                    <th>Proof of Payment</th>
                    <th>Amount</th>
                    <th>Reference Number</th>
                    <th>Date of Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>0000-0000</td>
                    <td>Gcash</td>
                    <td>666</td>
                    <td>00-0000</td>
                    <td>00-00-0000</td>
                    <td>Paid</td>
                    <td>
                      <button className="btn btn-sm">
                        <Pencil className="text-primary" />
                      </button>
                      <button className="btn btn-sm">
                        <Trash className="text-danger" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>0000-0000</td>
                    <td>Cashier</td>
                    <td>999</td>
                    <td>00-0000</td>
                    <td>00-00-0000</td>
                    <td>Pending</td>
                    <td>
                      <button className="btn btn-sm">
                        <Pencil className="text-primary" />
                      </button>
                      <button className="btn btn-sm">
                        <Trash className="text-danger" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ProcessorSideBar>
    </>
  )
}

export default ProcessorPayments