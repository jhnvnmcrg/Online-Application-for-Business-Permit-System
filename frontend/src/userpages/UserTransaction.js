import React, { useState } from "react";
import UserSideBAr from "../includes/UserSideBar";

function UserTransaction() {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample transaction data
  const transactions = [
    {
      businessId: "A202500036",
      year: 2025,
      transactionType: "New",
      nameOfBusiness: "PENDING",
      status: "CANCELED",
      lastUpdatingDate: "May 20, 2025 01:31 PM",
    },
  ];

  const handleView = (businessId) => {
    console.log("View transaction:", businessId);
  };
  return (
    <>
      <UserSideBAr>
        <div className="mb-4 text-center">
          <div className="bg-light p-3 border-bottom mb-4">
            <h2 className="mb-1">Trasanctions</h2>
          </div>

          {/* Main Content Card */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                {/* Card Header */}
                <div
                  className="card-header text-white"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  <h5 className="mb-0">List of Transactions</h5>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Controls Row */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Show</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "80px" }}
                          value={entriesPerPage}
                          onChange={(e) =>
                            setEntriesPerPage(parseInt(e.target.value))
                          }
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="ms-2">entries</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-end align-items-center">
                        <label className="me-2">Search:</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ width: "200px" }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>TRACKING CODE</th>
                          <th>TRANSACTION TYPE</th>
                          <th>DATE REQUEST</th>
                          <th>DATE RELEASE</th>
                          <th>STATUS</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>0000-0000-0000-0000-0000</td>
                          <td>Barangay Clearance</td>
                          <td>00-00-0000</td>
                          <td>00-00-0000</td>
                          <td>Pending</td>
                          <td>
                            <button className="btn btn-warning btn-sm px-3">
                              VIEW
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>1234-5678-9098-0000-7654</td>
                          <td>Occupancy Permit</td>
                          <td>09-12-2025</td>
                          <td>09-15-2025</td>
                          <td>Received</td>
                          <td>
                            <button className="btn btn-warning btn-sm px-3">
                              VIEW
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Info and Pagination */}
                  <div className="row mt-3">
                    <div className="col-md-12">
                      <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm justify-content-end mb-0">
                          <li className="page-item">
                            <button className="page-link">Previous</button>
                          </li>
                          <li className="page-item">
                            <button className="page-link">Next</button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserSideBAr>
    </>
  );
}

export default UserTransaction;
