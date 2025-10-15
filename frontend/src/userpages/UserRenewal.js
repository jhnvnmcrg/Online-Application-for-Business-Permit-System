import React, { useState } from 'react';
import UserSideBAr from '../includes/UserSideBar';

function UserRenewal() {
    const [accountNumber, setAccountNumber] = useState('');
          const [businessPlate, setBusinessPlate] = useState('');
        
          const handleSearch = () => {
            if (!accountNumber.trim() || !businessPlate.trim()) {
              alert('Please fill in both Account Number and Business Plate fields.');
              return;
            }
            alert(`Searching for Account Number: ${accountNumber}, Business Plate: ${businessPlate}`);
          };
        
          const handleCancel = () => {
            setAccountNumber('');
            setBusinessPlate('');
          };
  return (
    <>
        <UserSideBAr>
          <div className="mb-4 text-center">
                <div className="bg-light p-3 border-bottom mb-4">
                  <h4 className="mb-1">Renewal of Business</h4>
                  <small className="text-muted">Application</small>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm">
                      {/* Card Header */}
                      <div className="card-header text-white text-center" style={{ backgroundColor: '#dc3545' }}>
                        <h5 className="mb-0">Search Business</h5>
                      </div>

                      {/* Card Body */}
                      <div className="card-body">
                        

                        {/* Search Form */}
                        <div className="row mx-5">
                          <div className="col-md-6 mt-3">
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              placeholder="Account Number*"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-6 mt-3">
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              placeholder="Business Plate*"
                              value={businessPlate}
                              onChange={(e) => setBusinessPlate(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-center gap-3 mt-4">
                          <button 
                            className="btn btn-success px-4"
                            onClick={handleSearch}
                          >
                            SEARCH
                          </button>
                      
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

export default UserRenewal