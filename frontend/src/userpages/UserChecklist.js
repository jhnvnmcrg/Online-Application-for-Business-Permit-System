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
                            CATEGORY NAME
                          </th>

                          <th style={{ width: "15%" }} className="text-center">
                            LINK
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Certificate of Registration */}
                        <tr>
                          <td className="fw-bold"></td>
                          <td></td>
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
  );
}

export default UserChecklist;
