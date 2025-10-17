import { useState, useEffect } from "react";
import UserSideBAr from "../includes/UserSideBar";
import axios from "axios";
import { AlertCircle, CheckCircle, Upload, FileText } from "lucide-react";

function UserChecklist() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({});
  const [fileFields, setFileFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Select Category, 2: Fill Form, 3: Success
  const [trackingCode, setTrackingCode] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // API Base URL
  const API_URL = "https://oabs-f7by.onrender.com";
  // const API_URL = "http://localhost:3000"; // For local development

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ownerId = user.owner_id;

  // Fetch all document categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/category/all`);
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError("An error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch form fields when a category is selected
  const handleCategorySelect = async (categoryId) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_URL}/api/request/form-fields/${categoryId}`
      );

      if (response.data.success) {
        const category = categories.find((c) => c.category_id === categoryId);
        setSelectedCategory(category);
        setFormFields(response.data.formFields);
        setGroups(response.data.groups);
        setStep(2);

        // Initialize form data with default values
        const initialFormData = {};
        response.data.formFields.forEach((field) => {
          initialFormData[field.field_name] = field.default_value || "";
        });
        setFormData(initialFormData);
      } else {
        setError("Failed to fetch form fields");
      }
    } catch (err) {
      console.error("Fetch form fields error:", err);
      setError("An error occurred while fetching form fields");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Handle file uploads
  const handleFileChange = (fieldName, file) => {
    setFileFields((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Validate form based on field requirements and validation rules
  const validateForm = () => {
    const errors = {};

    formFields.forEach((field) => {
      const value = formData[field.field_name];
      const file = fileFields[field.field_name];

      // Check if required field is empty
      if (field.is_required) {
        if (field.field_type === "FILE") {
          if (!file) {
            errors[field.field_name] = `${field.field_name} is required`;
          }
        } else if (!value || value.trim() === "") {
          errors[field.field_name] = `${field.field_name} is required`;
        }
      }

      // Apply validation rules if present
      if (value && field.validation_rule) {
        try {
          const rule = JSON.parse(field.validation_rule);

          // Validate min/max for numbers
          if (field.field_type === "NUMBER") {
            const numValue = parseFloat(value);
            if (rule.min !== undefined && numValue < rule.min) {
              errors[field.field_name] = `Value must be at least ${rule.min}`;
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors[field.field_name] = `Value must not exceed ${rule.max}`;
            }
          }

          // Validate pattern (regex)
          if (rule.pattern) {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(value)) {
              errors[field.field_name] =
                rule.message || `Invalid format for ${field.field_name}`;
            }
          }
        } catch (e) {
          console.error("Invalid validation rule:", e);
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("ownerId", ownerId);
      submitData.append("categoryId", selectedCategory.category_id);
      submitData.append("formData", JSON.stringify(formData));

      // Append files
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        submitData.append(fieldName, file);
      });

      const response = await axios.post(
        `${API_URL}/api/request/submit`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setTrackingCode(response.data.request.tracking_code);
        setStep(3);
      } else {
        setError(response.data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Submit request error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while submitting request"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset and start over
  const handleStartOver = () => {
    setSelectedCategory(null);
    setFormFields([]);
    setGroups([]);
    setFormData({});
    setFileFields({});
    setError("");
    setSuccess("");
    setStep(1);
    setTrackingCode("");
    setValidationErrors({});
  };

  // Render form field based on type
  const renderField = (field) => {
    const fieldValue = formData[field.field_name] || "";
    const hasError = validationErrors[field.field_name];

    switch (field.field_type) {
      case "TEXT":
        return (
          <input
            type="text"
            className={`form-control ${hasError ? "is-invalid" : ""}`}
            placeholder={field.placeholder || ""}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            className={`form-control ${hasError ? "is-invalid" : ""}`}
            placeholder={field.placeholder || ""}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
            rows={4}
          />
        );

      case "NUMBER":
        return (
          <input
            type="number"
            className={`form-control ${hasError ? "is-invalid" : ""}`}
            placeholder={field.placeholder || ""}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            className={`form-control ${hasError ? "is-invalid" : ""}`}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );

      case "SELECT":
        return (
          <select
            className={`form-select ${hasError ? "is-invalid" : ""}`}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          >
            <option value="">
              {field.placeholder || "-- Select an option --"}
            </option>
            {field.options &&
              field.options.map((option) => (
                <option key={option.option_id} value={option.option_value}>
                  {option.option_value}
                </option>
              ))}
          </select>
        );

      case "FILE":
        return (
          <div>
            <input
              type="file"
              className={`form-control ${hasError ? "is-invalid" : ""}`}
              onChange={(e) =>
                handleFileChange(field.field_name, e.target.files[0])
              }
              required={field.is_required}
            />
            {fileFields[field.field_name] && (
              <small className="text-muted d-flex align-items-center gap-1 mt-1">
                <FileText size={14} />
                {fileFields[field.field_name].name}
              </small>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className={`form-control ${hasError ? "is-invalid" : ""}`}
            placeholder={field.placeholder || ""}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            required={field.is_required}
          />
        );
    }
  };

  // Group fields by group_id
  const groupedFields = () => {
    const grouped = {};

    // Fields with groups
    formFields.forEach((field) => {
      if (field.group_id) {
        if (!grouped[field.group_id]) {
          grouped[field.group_id] = [];
        }
        grouped[field.group_id].push(field);
      }
    });

    // Fields without groups (ungrouped)
    const ungrouped = formFields.filter((field) => !field.group_id);
    if (ungrouped.length > 0) {
      grouped["ungrouped"] = ungrouped;
    }

    return grouped;
  };

  // Render Step 1: Category Selection
  const renderCategorySelection = () => (
    <div className="card shadow-sm">
      <div
        className="card-header text-white text-center"
        style={{ backgroundColor: "#dc3545" }}
      >
        <h5 className="mb-0">Select Document Category</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: "40%" }}>
                  CATEGORY NAME
                </th>
                <th className="text-center" style={{ width: "40%" }}>
                  DESCRIPTION
                </th>
                <th className="text-center" style={{ width: "20%" }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No categories available
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.category_id}>
                    <td className="fw-bold">{category.category_name}</td>
                    <td className="text-muted">{category.description}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          handleCategorySelect(category.category_id)
                        }
                        disabled={loading}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Step 2: Dynamic Form
  const renderDynamicForm = () => {
    const fieldGroups = groupedFields();

    return (
      <div className="card shadow-sm">
        <div
          className="card-header text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#dc3545" }}
        >
          <h5 className="mb-0">Application Form: {selectedCategory?.category_name}</h5>
          <button
            className="btn btn-sm btn-light"
            onClick={handleStartOver}
            disabled={loading}
          >
            Back
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Render groups */}
            {groups
              .sort((a, b) => a.group_order - b.group_order)
              .map((group) => (
                <div key={group.group_id} className="mb-4">
                  <h6 className="text-primary border-bottom pb-2 mb-3">
                    {group.group_name}
                  </h6>
                  <div className="row">
                    {fieldGroups[group.group_id]?.map((field) => (
                      <div
                        key={field.form_id}
                        className={`col-md-${field.field_width || 12} mb-3`}
                      >
                        <label className="form-label">
                          {field.field_name}
                          {field.is_required && (
                            <span className="text-danger">*</span>
                          )}
                        </label>
                        {renderField(field)}
                        {validationErrors[field.field_name] && (
                          <div className="invalid-feedback d-block">
                            {validationErrors[field.field_name]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Render ungrouped fields */}
            {fieldGroups["ungrouped"] && (
              <div className="mb-4">
                <div className="row">
                  {fieldGroups["ungrouped"].map((field) => (
                    <div
                      key={field.form_id}
                      className={`col-md-${field.field_width || 12} mb-3`}
                    >
                      <label className="form-label">
                        {field.field_name}
                        {field.is_required && (
                          <span className="text-danger">*</span>
                        )}
                      </label>
                      {renderField(field)}
                      {validationErrors[field.field_name] && (
                        <div className="invalid-feedback d-block">
                          {validationErrors[field.field_name]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={handleStartOver}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="me-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render Step 3: Success
  const renderSuccess = () => (
    <div className="card shadow-sm">
      <div
        className="card-header text-white text-center"
        style={{ backgroundColor: "#28a745" }}
      >
        <h5 className="mb-0 d-flex align-items-center justify-content-center gap-2">
          <CheckCircle size={24} />
          Request Submitted Successfully!
        </h5>
      </div>
      <div className="card-body text-center py-5">
        <CheckCircle size={80} className="text-success mb-4" />
        <h4 className="mb-3">Your request has been submitted</h4>
        <p className="text-muted mb-4">
          Your application for <strong>{selectedCategory?.category_name}</strong> has
          been successfully submitted.
        </p>

        <div className="alert alert-info d-inline-block">
          <h6 className="mb-2">Tracking Code:</h6>
          <h3 className="mb-0 text-primary">{trackingCode}</h3>
        </div>

        <p className="text-muted mt-4 mb-4">
          Please save this tracking code to monitor your application status.
        </p>

        <button
          className="btn btn-primary px-4"
          onClick={handleStartOver}
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );

  return (
    <UserSideBAr>
      <div className="mb-4">
        <div className="row">
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h4 className="mb-1">Application Checklist</h4>
            <small className="text-muted">
              {step === 1
                ? "Select a document category to proceed"
                : step === 2
                ? "Fill out the application form"
                : "Application submitted"}
            </small>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {step === 1 && renderCategorySelection()}
            {step === 2 && renderDynamicForm()}
            {step === 3 && renderSuccess()}
          </div>
        </div>
      </div>
    </UserSideBAr>
  );
}

export default UserChecklist;
