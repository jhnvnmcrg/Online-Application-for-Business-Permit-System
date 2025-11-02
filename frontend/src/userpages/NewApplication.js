  import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";
import UserTopBar from "../includes/UserTopBar";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

function NewApplication() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };
  const [uploadStatus, setUploadStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const handleUpload = (documentNumber) => {
    // Simulate file upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.png";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showMessage("error", "File size exceeds 5MB limit");
          return;
        }
        // Simulate successful upload
        setUploadStatus((prev) => ({
          ...prev,
          [documentNumber]: true,
        }));
        showMessage("success", `${file.name} uploaded successfully`);
      }
    };
    input.click();
  };
  const documents = [
    { id: 1, name: "CERTIFICATE OF REGISTRATION" },
    { id: 2, name: "CONTRACT OF LEASE / OTHER RELATED LEGAL DOCUMENTS" },
    { id: 3, name: "MAP OF BUSINESS LOCATION" },
    { id: 4, name: "CERTIFICATE OF OCCUPANCY" },
  ];
  const [otherDocuments, setOtherDocuments] = useState([]);

  const handleOtherDocumentUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.png";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showMessage("error", "File size exceeds 5MB limit");
          return;
        }
        const newDocument = {
          id: Date.now(),
          name: file.name,
          file: file,
        };
        setOtherDocuments((prev) => [...prev, newDocument]);
        showMessage("success", `${file.name} uploaded successfully`);
      }
    };
    input.click();
  };

  const handleViewDocument = (doc) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      window.open(url, "_blank");
    } else {
      showMessage("info", `Viewing ${doc.name}`);
    }
  };

  const handleDeleteDocument = (docId) => {
    setPendingDeleteDocId(docId);
    setShowDeleteDocConfirm(true);
  };

  const handleConfirmDeleteDoc = () => {
    setShowDeleteDocConfirm(false);
    const docId = pendingDeleteDocId;
    setPendingDeleteDocId(null);
    setOtherDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };
  const [formData, setFormData] = useState({
    businessType: "SINGLE PROPRIETORSHIP",
    registrationNumber: "",
    registrationDate: "",
    taxId: "",
    taxIncentives: "NO",
    specifyEntity: "",
    lastName: "",
    firstName: "",
    middleName: "",
    businessName: "",
    tradeName: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const [businessActivities, setBusinessActivities] = useState([
    {
      id: 1,
      lineOfBusiness: "BADMINTON",
      noOfUnits: "N/A",
      mainLine: "YES",
      capital: "50,000.00",
      currentDeclaration: "0.00",
    },
  ]);

  const [showEntries, setShowEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteBusiness = (id) => {
    setPendingDeleteBusinessId(id);
    setShowDeleteBusinessConfirm(true);
  };

  const handleConfirmDeleteBusiness = () => {
    setShowDeleteBusinessConfirm(false);
    const id = pendingDeleteBusinessId;
    setPendingDeleteBusinessId(null);
    setBusinessActivities((prev) =>
      prev.filter((activity) => activity.id !== id)
    );
  };

  const filteredActivities = businessActivities.filter((activity) =>
    activity.lineOfBusiness.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [capitalAmount, setCapitalAmount] = useState("0.00");
  const [isMainLine, setIsMainLine] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);

  // Message modal state
  const [messageModal, setMessageModal] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Delete confirmation modal states
  const [showDeleteDocConfirm, setShowDeleteDocConfirm] = useState(false);
  const [pendingDeleteDocId, setPendingDeleteDocId] = useState(null);
  const [showDeleteBusinessConfirm, setShowDeleteBusinessConfirm] = useState(false);
  const [pendingDeleteBusinessId, setPendingDeleteBusinessId] = useState(null);

  // Helper functions for message modal
  const showMessage = (type, message) => {
    setMessageModal({ show: true, type, message });
  };

  const closeMessageModal = () => {
    setMessageModal({ show: false, type: "", message: "" });
  };

  const handleCancelDeleteDoc = () => {
    setShowDeleteDocConfirm(false);
    setPendingDeleteDocId(null);
  };

  const handleCancelDeleteBusiness = () => {
    setShowDeleteBusinessConfirm(false);
    setPendingDeleteBusinessId(null);
  };

  const businessOptions = [
    { nature: "", line: "DEALER OF COMPUTER & ACCESSORIES", unitBased: "NO" },
    { nature: "", line: "DEALER OF COMPUTER & ACCESSORIES", unitBased: "NO" },
    { nature: "", line: "DEALER OF COMPUTER & ACCESSORIES", unitBased: "NO" },
    { nature: "", line: "DEALER OF COMPUTER & ACCESSORIES", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "AMUSEMENT-DART", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "AMUSEMENT-DART", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "BADMINTON", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "BADMINTON", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "BILLIARD", unitBased: "NO" },
    { nature: "AMUSEMENT", line: "BILLIARD", unitBased: "NO" },
  ];

  const handleAddBusiness = () => {
    setEditingActivityId(null);
    setShowBusinessModal(true);
  };

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    setShowBusinessModal(false);
    setShowCapitalModal(true);
    if (!editingActivityId) {
      setCapitalAmount("0.00");
      setIsMainLine(false);
    }
  };

  const handleEditBusiness = (id) => {
    const activity = businessActivities.find((act) => act.id === id);
    if (activity) {
      setEditingActivityId(id);
      setSelectedBusiness({ line: activity.lineOfBusiness });
      setCapitalAmount(activity.capital.replace(/,/g, ""));
      setIsMainLine(activity.mainLine === "YES");
      setShowCapitalModal(true);
    }
  };

  const handleSaveBusinessActivity = () => {
    if (selectedBusiness && parseFloat(capitalAmount) >= 50000) {
      if (editingActivityId) {
        // Edit existing activity
        setBusinessActivities((prev) =>
          prev.map((activity) =>
            activity.id === editingActivityId
              ? {
                  ...activity,
                  capital: parseFloat(capitalAmount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  }),
                  mainLine: isMainLine ? "YES" : "NO",
                }
              : activity
          )
        );
      } else {
        // Add new activity
        const newActivity = {
          id: Date.now(),
          lineOfBusiness: selectedBusiness.line,
          noOfUnits: "N/A",
          mainLine: isMainLine ? "YES" : "NO",
          capital: parseFloat(capitalAmount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          currentDeclaration: "0.00",
        };
        setBusinessActivities((prev) => [...prev, newActivity]);
      }

      setShowCapitalModal(false);
      setSelectedBusiness(null);
      setCapitalAmount("0.00");
      setIsMainLine(false);
      setEditingActivityId(null);
    } else {
      showMessage("error", "Capital should be greater than or equal to 50,000.00");
    }
  };

  const handleCloseModal = () => {
    setShowBusinessModal(false);
    setShowCapitalModal(false);
    setSelectedBusiness(null);
    setCapitalAmount("0.00");
    setIsMainLine(false);
    setEditingActivityId(null);
  };
  return (
    <>
      <UserTopBar>
        
            <div className="bg-light p-3 border-bottom text-center mb-4">
              <h4 className="mb-1">New Business</h4>
              <small className="text-muted">Application</small>
            </div>
            <div className="p-4">
              {/* Instruction */}
              <div className="mb-4">
                <p
                  className="text-danger fw-bold mb-0"
                  style={{ fontSize: "14px" }}
                >
                  INSTRUCTION: FILL IN ALL FIELDS. PUT "NA" IF IT IS NOT
                  APPLICABLE OR NOT AVAILABLE.
                </p>
              </div>

              {/* Red Header Section */}
              <div className="bg-danger text-white p-3 mb-0 rounded-top">
                <h5 className="mb-0 text-uppercase">
                  Documentary Requirements
                </h5>
              </div>

              {/* Requirements Table */}
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "8%" }} className="text-center">
                        NO.
                      </th>
                      <th style={{ width: "60%" }} className="text-center">
                        DOCUMENT NAME
                      </th>
                      <th style={{ width: "16%" }} className="text-center">
                        UPLOAD STATUS
                      </th>
                      <th style={{ width: "16%" }} className="text-center">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, index) => (
                      <tr
                        key={doc.id}
                        className={index % 2 === 1 ? "table-light" : ""}
                      >
                        <td className="text-center align-middle">{doc.id}</td>
                        <td className="align-middle">{doc.name}</td>
                        <td className="text-center align-middle">
                          {uploadStatus[doc.id] ? (
                            <span className="text-success">✓</span>
                          ) : (
                            <span
                              className="text-danger"
                              style={{ fontSize: "18px" }}
                            >
                              ✕
                            </span>
                          )}
                        </td>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-danger btn-sm px-3"
                            onClick={() => handleUpload(doc.id)}
                            style={{ fontSize: "12px", fontWeight: "bold" }}
                          >
                            UPLOAD
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* File Requirements */}
              <div className="mt-3">
                <p
                  className="text-danger mb-1"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                >
                  MAXIMUM FILE SIZE IS 5 MB
                </p>
                <p
                  className="text-danger mb-0"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                >
                  ALLOWED FILE TYPE: PDF | JPG | PNG
                </p>
              </div>
            </div>

            <div className="bg-danger text-white p-3 mb-0 rounded-top d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-uppercase">Other Documents</h5>
              <button
                className="btn btn-warning btn-sm px-3"
                style={{ fontSize: "12px", fontWeight: "bold" }}
                onClick={handleOtherDocumentUpload}
              >
                UPLOAD
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered mb-4">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "8%" }} className="text-center">
                      NO
                    </th>
                    <th style={{ width: "70%" }} className="text-center">
                      DOCUMENT NAME
                    </th>
                    <th style={{ width: "22%" }} className="text-center">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {otherDocuments.map((doc, index) => (
                    <tr key={doc.id}>
                      <td className="text-center align-middle">{index + 1}</td>
                      <td className="align-middle">{doc.name}</td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-warning btn-sm me-2"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                          onClick={() => handleViewDocument(doc)}
                        >
                          VIEW
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mb-4">
                <p
                  className="text-danger mb-1"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                >
                  MAXIMUM FILE SIZE IS 5 MB
                </p>
                <p
                  className="text-danger mb-0"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                >
                  ALLOWED FILE TYPE: PDF | JPG | PNG
                </p>
              </div>
            </div>

            <div className="bg-danger text-white p-3 mb-3 rounded-top">
              <h5 className="mb-0 text-uppercase">Basic Information</h5>
            </div>

            <form>
              {/* First Row */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    TYPE OF BUSINESS
                  </label>
                  <select
                    className="form-select"
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                  >
                    <option value="SINGLE PROPRIETORSHIP">
                      SINGLE PROPRIETORSHIP
                    </option>
                    <option value="PARTNERSHIP">PARTNERSHIP</option>
                    <option value="CORPORATION">CORPORATION</option>
                    <option value="COOPERATIVE">COOPERATIVE</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    DTI/SEC/CDA REGISTRATION NU...
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="DTI/SEC/CDA REGISTRATION NU..."
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleInputChange("registrationNumber", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    DTI/SEC/CDA DATE OF REGISTRATION
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="DD/MM/YYYY"
                    value={formData.registrationDate}
                    onChange={(e) =>
                      handleInputChange("registrationDate", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    TAX IDENTIFICATION NUMBER
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label
                    className="form-label text-muted fonts-size"
                    
                  >
                    ARE YOU ENJOYING TAX INCENTIVES FROM ANY GOVERNMENT ENTITY?
                  </label>
                  <select
                    className="form-select"
                    value={formData.taxIncentives}
                    onChange={(e) =>
                      handleInputChange("taxIncentives", e.target.value)
                    }
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    ENTITY
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="SPECIFY ENTITY"
                    value={formData.specifyEntity}
                    onChange={(e) =>
                      handleInputChange("specifyEntity", e.target.value)
                    }
                    disabled={formData.taxIncentives === "NO"}
                    style={
                      formData.taxIncentives === "NO"
                        ? { backgroundColor: "#f8f9fa" }
                        : {}
                    }
                  />
                </div>
              </div>

              {/* Tax Payer/Registrant Section */}
              <div className="mb-3">
                <h6 className="text-danger mb-3">TAX PAYER/REGISTRANT</h6>

                {formData.businessType === "SINGLE PROPRIETORSHIP" ? (
                  // Individual Name Fields for Single Proprietorship
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="LAST NAME"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="FIRST NAME"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MIDDLE NAME"
                        value={formData.middleName}
                        onChange={(e) =>
                          handleInputChange("middleName", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  // Company Name Field for Corporation/Partnership/Cooperative
                  <div className="row">
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="COMPANY/CORPORATE NAME"
                        value={formData.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Business Information */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    BUSINESS NAME
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="PENDING"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    TRADE NAME
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="TRADE NAME"
                    value={formData.tradeName}
                    onChange={(e) =>
                      handleInputChange("tradeName", e.target.value)
                    }
                  />
                </div>
              </div>
            </form>
            
            {/* Other Information Section */}
            <div className="bg-danger text-white p-3 mb-3 rounded-top">
              <h5 className="mb-0 text-uppercase">Other Information</h5>
            </div>

            {/* Business Details */}
            <div className="mb-4">
              <h6 className="text-danger mb-3">BUSINESS DETAILS</h6>

              {/* First Row */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    SELECT BARANGAY
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="BARANGAY"
                  />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    SELECT SUBDIVISION
                  </label>
                  <select className="form-select">
                    <option>SUBDIVISION</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    SELECT STREET
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="STREET"
                  />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    SELECT BUILDING
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="BUILDING"
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="HOUSE/BLDG NO"
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    value="CITY OF KORONADAL"
                    readOnly
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    value="SOUTH COTABATO"
                    readOnly
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    value="9506"
                    readOnly
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CONTACT NUMBER"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="EMAIL ADDRESS"
                  />
                </div>
              </div>
            </div>

            {/* Owner's Details */}
            <div className="mb-4">
              <h6 className="text-danger mb-3">OWNER'S DETAILS</h6>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="OWNER'S ADDRESS"
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CONTACT NUMBER"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="EMAIL ADDRESS"
                  />
                </div>
              </div>

              {/* Vehicle Information Row 1 */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (2 WHEELS & BELOW)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    TOTAL NO. OF EMPLOYEES IN ESTABLISHMENT
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (3 WHEELS & UP)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (TRICYCLES UP)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
              </div>

              {/* Vehicle Information Row 2 */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (2 WHEELS & BELOW)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    GROSS RECEIPTS/INCOME (MONTHLY)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (3 WHEELS & UP)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    NO.DELIVERY VEHICLE (TRICYCLES UP)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
              </div>

              {/* Bottom Row */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "12px" }}
                  >
                    FACILITY TYPE
                  </label>
                  <select className="form-select">
                    <option>OTHERS</option>
                    <option>OWNED</option>
                    <option>RENTED</option>
                    <option>LEASED</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    GROSS RECEIPTS/INCOME (MONTHLY)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    CAPITALIZATION (FOR CORPORATIONS)
                  </label>
                  <input type="number" className="form-control" value="0" />
                </div>
                <div className="col-md-3">
                  <label
                    className="form-label text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    WITH BRANCH ESTABLISHMENT (YES/NO)
                  </label>
                  <select className="form-select">
                    <option>NO</option>
                    <option>YES</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Person Details */}
            <div className="mb-4">
              <h6 className="text-danger mb-3">
                CONTACT PERSON IN CASE OF EMERGENCY
              </h6>

              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="FULL NAME"
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MOBILE/TELEPHONE NO"
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ADDRESS (250 MAX CHARACTERS)"
                  />
                </div>
              </div>
            </div>

            {/* Authorized Representative */}
            <div className="mb-4">
              <h6 className="text-danger mb-3">AUTHORIZED REPRESENTATIVE</h6>

              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="FULLNAME (FIRSTNAME, MI, LASTNAME)"
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="DESIGNATION"
                  />
                </div>
              </div>
            </div>

            {/* Business Activity Section */}
            <div className="bg-danger text-white p-3 mb-3 rounded-top d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-uppercase">Business Activity</h5>
              <button
                className="btn btn-warning btn-sm px-3"
                style={{ fontSize: "12px", fontWeight: "bold" }}
                onClick={handleAddBusiness}
              >
                ADD BUSINESS
              </button>
            </div>

            {/* Controls Row */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <span className="me-2" style={{ fontSize: "14px" }}>
                  SHOW
                </span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={showEntries}
                  onChange={(e) => setShowEntries(parseInt(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="ms-2" style={{ fontSize: "14px" }}>
                  ENTRIES
                </span>
              </div>

              <div className="d-flex align-items-center">
                <span className="me-2" style={{ fontSize: "14px" }}>
                  SEARCH
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: "200px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Business Activity Table */}
            <div className="table-responsive mb-3">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">LINE OF BUSINESS</th>
                    <th className="text-center">NO. OF UNITS</th>
                    <th className="text-center">MAIN LINE</th>
                    <th className="text-center">CAPITAL</th>
                    <th className="text-center">
                      CURRENT DECLARATION
                      <br />
                      (GROSS)
                    </th>
                    <th className="text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="align-middle">
                        {activity.lineOfBusiness}
                      </td>
                      <td className="text-center align-middle">
                        {activity.noOfUnits}
                      </td>
                      <td className="text-center align-middle">
                        {activity.mainLine}
                      </td>
                      <td className="text-end align-middle">
                        {activity.capital}
                      </td>
                      <td className="text-end align-middle">
                        {activity.currentDeclaration}
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="btn btn-warning btn-sm me-2"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                          onClick={() => handleEditBusiness(activity.id)}
                        >
                          EDIT
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                          onClick={() => handleDeleteBusiness(activity.id)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <small className="text-muted">
                  SHOWING 1 TO 1 OF 1 ENTRIES (FILTERED FROM 0 TOTAL ENTRIES)
                </small>
                <br />
                <small className="text-danger fst-italic">
                  NOTE: MAIN BUSINESS LINE (MAIN LINE) SHOULD BE ONLY ONE
                </small>
              </div>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <span className="page-link">PREVIOUS</span>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">1</span>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">NEXT</span>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-danger px-4">SAVE FOR LATER</button>
              <button className="btn btn-secondary px-4">CANCEL</button>
              <button className="btn btn-success px-4">SUBMIT TO BPLO</button>
            </div>
            {/* Business Selection Modal */}
            {showBusinessModal && (
              <div
                className="modal d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-xl">
                  <div className="modal-content">
                    <div className="modal-header bg-light">
                      <h5 className="modal-title">
                        ADD BUSINESS LINE TO BUSINESS
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCloseModal}
                      ></button>
                    </div>
                    <div className="modal-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>BUSINESS NATURE</th>
                              <th>BUSINESS LINE</th>
                              <th>UNIT BASED</th>
                              <th className="text-center">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businessOptions.map((business, index) => (
                              <tr
                                key={index}
                                className={index % 2 === 1 ? "table-light" : ""}
                              >
                                <td className="align-middle">
                                  {business.nature}
                                </td>
                                <td className="align-middle">
                                  {business.line}
                                </td>
                                <td className="text-center align-middle">
                                  {business.unitBased}
                                </td>
                                <td className="text-center align-middle">
                                  <button
                                    className="btn btn-danger btn-sm"
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                    onClick={() =>
                                      handleSelectBusiness(business)
                                    }
                                  >
                                    SELECT
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="d-flex justify-content-between align-items-center p-3">
                        <span></span>
                        <nav>
                          <ul className="pagination pagination-sm mb-0">
                            <li className="page-item disabled">
                              <span className="page-link">PREVIOUS</span>
                            </li>
                            <li className="page-item active">
                              <span className="page-link">1</span>
                            </li>
                            <li className="page-item">
                              <a className="page-link" href="#">
                                2
                              </a>
                            </li>
                            <li className="page-item">
                              <a className="page-link" href="#">
                                3
                              </a>
                            </li>
                            <li className="page-item">
                              <a className="page-link" href="#">
                                4
                              </a>
                            </li>
                            <li className="page-item">
                              <a className="page-link" href="#">
                                5
                              </a>
                            </li>
                            <li className="page-item">
                              <span className="page-link">...</span>
                            </li>
                            <li className="page-item">
                              <a className="page-link" href="#">
                                212
                              </a>
                            </li>
                            <li className="page-item">
                              <span className="page-link">NEXT</span>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Capital Modal */}
            {showCapitalModal && (
              <div
                className="modal d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header bg-light">
                      <h5 className="modal-title">
                        {selectedBusiness?.line || "BUSINESS LINE"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCloseModal}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label text-muted">CAPITAL</label>
                        <input
                          type="number"
                          className="form-control"
                          value={capitalAmount}
                          onChange={(e) => setCapitalAmount(e.target.value)}
                          step="0.01"
                        />
                        <small className="text-danger">
                          CAPITAL SHOULD BE GREATER THAN OR EQUAL TO 50,000.00
                        </small>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="mainBusinessLine"
                          checked={isMainLine}
                          onChange={(e) => setIsMainLine(e.target.checked)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="mainBusinessLine"
                        >
                          MAIN BUSINESS LINE
                        </label>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                      >
                        CLOSE
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleSaveBusinessActivity}
                      >
                        {editingActivityId ? "UPDATE" : "ADD"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Modal */}
            {messageModal.show && (
              <div
                className="modal d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header border-0 pb-0">
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeMessageModal}
                      ></button>
                    </div>
                    <div className="modal-body text-center pt-0">
                      <div className="mb-3">
                        {messageModal.type === "success" && (
                          <CheckCircle
                            size={64}
                            className="text-success"
                            strokeWidth={1.5}
                          />
                        )}
                        {messageModal.type === "error" && (
                          <XCircle
                            size={64}
                            className="text-danger"
                            strokeWidth={1.5}
                          />
                        )}
                        {messageModal.type === "info" && (
                          <AlertCircle
                            size={64}
                            className="text-primary"
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <h5 className="mb-3">
                        {messageModal.type === "success" && "Success"}
                        {messageModal.type === "error" && "Error"}
                        {messageModal.type === "info" && "Information"}
                      </h5>
                      <p className="text-muted mb-4">{messageModal.message}</p>
                      <button
                        className="btn btn-primary px-4"
                        onClick={closeMessageModal}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

        {/* Delete Document Confirmation Modal */}
        {showDeleteDocConfirm && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={handleCancelDeleteDoc}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <AlertCircle size={20} />
                    Confirm Document Deletion
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCancelDeleteDoc}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Are you sure you want to delete this document?
                  </p>
                  <p className="text-danger fw-bold mb-0">
                    <AlertCircle size={16} className="me-1" />
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelDeleteDoc}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDeleteDoc}
                  >
                    <XCircle size={16} className="me-1" />
                    Delete Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Business Activity Confirmation Modal */}
        {showDeleteBusinessConfirm && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={handleCancelDeleteBusiness}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <AlertCircle size={20} />
                    Confirm Business Activity Deletion
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCancelDeleteBusiness}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Are you sure you want to delete this business activity?
                  </p>
                  <p className="text-danger fw-bold mb-0">
                    <AlertCircle size={16} className="me-1" />
                    This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelDeleteBusiness}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDeleteBusiness}
                  >
                    <XCircle size={16} className="me-1" />
                    Delete Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </UserTopBar>
    </>
  );
}

export default NewApplication;