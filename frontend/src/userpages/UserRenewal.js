import React, { useState } from 'react';
import UserSideBAr from '../includes/UserSideBar';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function UserRenewal() {
    const [accountNumber, setAccountNumber] = useState('');
          const [businessPlate, setBusinessPlate] = useState('');
          const [messageModal, setMessageModal] = useState({ show: false, type: '', message: '' });

          const showMessage = (type, message) => {
            setMessageModal({ show: true, type, message });
          };

          const closeMessageModal = () => {
            setMessageModal({ show: false, type: '', message: '' });
          };

          const handleSearch = () => {
            if (!accountNumber.trim() || !businessPlate.trim()) {
              showMessage('error', 'Please fill in both Account Number and Business Plate fields.');
              return;
            }
            showMessage('info', `Searching for Account Number: ${accountNumber}, Business Plate: ${businessPlate}`);
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

        {/* Message Modal */}
        {messageModal.show && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={closeMessageModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className={`modal-header ${
                  messageModal.type === 'success' ? 'bg-success' :
                  messageModal.type === 'error' ? 'bg-danger' :
                  messageModal.type === 'warning' ? 'bg-warning' :
                  'bg-info'
                } text-white`}>
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    {messageModal.type === 'success' && <CheckCircle size={24} />}
                    {messageModal.type === 'error' && <XCircle size={24} />}
                    {messageModal.type === 'warning' && <AlertCircle size={24} />}
                    {messageModal.type === 'info' && <AlertCircle size={24} />}
                    {messageModal.type === 'success' ? 'Success' :
                     messageModal.type === 'error' ? 'Error' :
                     messageModal.type === 'warning' ? 'Warning' :
                     'Information'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeMessageModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">{messageModal.message}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeMessageModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default UserRenewal