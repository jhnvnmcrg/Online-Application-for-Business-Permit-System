import React, { useState } from "react";
import UserSideBAr from "../includes/UserSideBar";
import { Link, useLocation } from "react-router-dom";

function UserChecklist() {
    const handleProceed = () => {
    alert("Proceeding with application...");
  };

  const handleCancel = () => {
    alert("Application cancelled");
  };
    
  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          <div className="row">
            <div className="bg-light p-3 border-bottom text-center mb-4">
              <h4 className="mb-1">Checklist</h4>
              <small className="text-muted">New Business</small>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                {/* Card Header */}
                <div
                  className="card-header text-white text-center"
                  style={{ backgroundColor: "#dc3545" }}
                >
                  <h5 className="mb-0">Checklist Before Proceeding</h5>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40%" }} className="text-center">
                            DOCUMENT NAME
                          </th>
                          <th style={{ width: "45%" }} className="text-center">
                            CONCERNED ENTITY
                          </th>
                          <th style={{ width: "15%" }} className="text-center">
                            LINK
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Certificate of Registration */}
                        <tr>
                          <td className="fw-bold">
                            1. Certificate of Registration
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr className="table-light">
                          <td className="ps-4">A. Single Proprietorship</td>
                          <td>Department of Trade and Industry</td>
                          <td className="text-center">
                            <Link
                              to="/requirements/singlesole"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="ps-4">
                            B. Partnership / Corporation (incl. Article of
                            Incorporation & By-Laws)
                          </td>
                          <td>Securities and Exchange Commission</td>
                          <td className="text-center">
                            <Link
                              to="/requirements/partnership"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>
                        <tr className="table-light">
                          <td className="ps-4">
                            C. Cooperatives (incl. Article of Cooperation and
                            By-Laws)
                          </td>
                          <td>Cooperative Development Authority</td>
                          <td className="text-center">
                            <Link
                              to="/requirements/cooperatives"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="ps-4">
                            D. Foundation / Association (incl. By-Laws)
                          </td>
                          <td>Regulating Government Agency</td>
                          <td className="text-center">
                            <Link
                              to="/requirements/foundation"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>

                        {/* Other Requirements */}
                        <tr className="table-light">
                          <td className="fw-bold">
                            2. Occupancy Permit / Building Permit
                          </td>
                          <td>
                            Office of the Building Official / Lessor (If place
                            is rented.)
                          </td>
                          <td className="text-center">
                            <Link
                              to="/requirements/occupancy"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>

                        <tr className="table-light">
                          <td className="fw-bold">3. Barangay Clearance</td>
                          <td>Barangay</td>
                          <td className="text-center">
                            <Link
                              to="/requirements/brgyclearance"
                              className="text-primary"
                            >
                              Click Here
                            </Link>
                          </td>
                        </tr>

                        <tr className="table-light">
                          <td className="fw-bold">
                            4. Contract of Lease (If place is rented.)
                          </td>
                          <td>Lessor</td>
                          <td className="text-center">
                            
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Info and Pagination */}
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <Link
                      to="/business/new-application/new"
                      className="btn btn-success px-4"
                    >
                      PROCEED
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserSideBAr>
    </>
  )
}

export default UserChecklist