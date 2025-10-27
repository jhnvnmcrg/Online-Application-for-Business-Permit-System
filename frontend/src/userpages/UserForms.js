import { useState, useEffect } from 'react';
import UserSideBAr from '../includes/UserSideBar';
import axios from 'axios';
import {
  FileText,
  Eye,
  AlertCircle,
  Loader,
  List,
  FileCheck,
} from 'lucide-react';

function UserForms() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const API_URL = 'https://oabs-f7by.onrender.com';
  // const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/api/category/all`);

      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        setError('Failed to fetch permit categories');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('An error occurred while fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFormPreview = async (category) => {
    try {
      setLoadingFields(true);
      setSelectedCategory(category);
      setShowPreviewModal(true);

      // Fetch form fields for this category
      const response = await axios.get(
        `${API_URL}/api/form/category/${category.category_id}`
      );

      if (response.data.success) {
        // Store form fields as array (will be grouped in render)
        setFormFields(response.data.forms || []);
      }
    } catch (err) {
      console.error('Fetch form fields error:', err);
      setError('Failed to load form fields');
    } finally {
      setLoadingFields(false);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedCategory(null);
    setFormFields([]);
  };

  // Group fields by group name
  const groupFieldsByGroup = (fields) => {
    const grouped = {};
    const ungrouped = [];

    fields.forEach((field) => {
      if (field.group_name) {
        if (!grouped[field.group_name]) {
          grouped[field.group_name] = [];
        }
        grouped[field.group_name].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    return { grouped, ungrouped };
  };

  // Render form field based on type (preview only - not functional)
  const renderPreviewField = (field) => {
    const commonProps = {
      className: 'form-control form-control-lg',
      placeholder: field.placeholder || '',
      disabled: true, // Preview only
    };

    switch (field.field_type?.toLowerCase()) {
      case 'text':
        return <input type="text" {...commonProps} />;
      case 'textarea':
        return <textarea {...commonProps} rows="3"></textarea>;
      case 'number':
        return <input type="number" {...commonProps} />;
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'email':
        return <input type="email" {...commonProps} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {(field.options || []).map((option, idx) => (
              <option key={idx} value={option.option_value}>
                {option.option_value}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div>
            {(field.options || []).map((option, idx) => (
              <div key={idx} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={`radio-${field.form_id}`}
                  id={`radio-${field.form_id}-${idx}`}
                  disabled
                />
                <label className="form-check-label" htmlFor={`radio-${field.form_id}-${idx}`}>
                  {option.option_value}
                </label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="form-check">
            <input className="form-check-input" type="checkbox" disabled />
            <label className="form-check-label">
              {field.placeholder || 'Checkbox option'}
            </label>
          </div>
        );
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  // Render fields in row with column layout
  const renderFieldsInRow = (fields) => {
    const rows = [];
    let currentRow = [];

    fields.forEach((field, index) => {
      const fieldWidth = field.field_width || 12;

      currentRow.push({ field, width: fieldWidth });

      const totalWidth = currentRow.reduce((sum, item) => sum + item.width, 0);

      if (totalWidth >= 12 || index === fields.length - 1) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="row mb-3 text-start">
        {row.map(({ field, width }) => (
          <div key={field.form_id} className={`col-md-${width}`}>
            <label className="form-label text-muted ">
              {field.field_label?.toUpperCase() || field.field_name?.toUpperCase()}
              {field.is_required && <span className="text-danger"> *</span>}
            </label>
            {renderPreviewField(field)}
            {field.validation_rule && (
              <small className="text-muted d-block mt-1">
                Validation: {field.validation_rule}
              </small>
            )}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      <UserSideBAr>
        <div className="mb-4">
          {/* Page Header */}
          <div className="bg-light p-3 border-bottom text-center mb-4">
            <h2 className="mb-1">Form Previews</h2>
            <small className="text-muted">
              View required forms for each business document category
            </small>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-5">
              <Loader size={48} className="text-primary mb-3 spinner-border" />
              <p className="text-muted">Loading permit categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={48} className="text-muted mb-3" />
              <p className="text-muted">No permit categories available</p>
            </div>
          ) : (
            /* Categories Grid */
            <div className="row g-4">
              {categories.map((category) => (
                <div key={category.category_id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow border-0 text-center">
                    <div className="card-body d-flex flex-column align-items-center py-5">
                      {/* Icon Circle */}
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundColor: '#dc3545',
                        }}
                      >
                        <FileText size={50} className="text-white" />
                      </div>

                      {/* Category Name */}
                      <h5 className="fw-bold text-uppercase mb-3">
                        {category.category_name}
                      </h5>

                      {/* Description */}
                      <p className="text-muted small mb-4 px-3">
                        {category.description ||
                          `View the requirements needed for ${category.category_name} and acquire online now.`}
                      </p>

                      {/* Proceed Button */}
                      <button
                        className="btn btn-danger px-5 py-2 fw-bold text-uppercase d-flex align-items-center gap-2"
                        onClick={() => handleViewFormPreview(category)}
                      >
                        <Eye size={18} />
                        PROCEED
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </UserSideBAr>

      {/* Form Preview Modal */}
      {showPreviewModal && selectedCategory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closePreviewModal}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: '#dc3545' }}
              >
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <List size={20} />
                  Form Preview: {selectedCategory.category_name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closePreviewModal}
                ></button>
              </div>
              <div className="modal-body">
                {loadingFields ? (
                  <div className="text-center py-5">
                    <Loader size={48} className="text-primary mb-3 spinner-border" />
                    <p className="text-muted">Loading form fields...</p>
                  </div>
                ) : formFields.length === 0 ? (
                  <div className="alert alert-info">
                    <AlertCircle size={20} className="me-2" />
                    No form fields configured for this category yet.
                  </div>
                ) : (
                  <>
                    {/* Category Description */}
                    {selectedCategory.description && (
                      <div className="alert alert-info mb-4">
                        <strong>About this permit:</strong> {selectedCategory.description}
                      </div>
                    )}

                    {/* Form Preview with Actual Fields */}
                    <div className="bg-white p-4 rounded border">
                      <h5 className="mb-4 text-primary">
                        {selectedCategory.category_name} - Dynamic Form Preview
                      </h5>

                      {(() => {
                        const { grouped, ungrouped } = groupFieldsByGroup(formFields);

                        return (
                          <>
                            {/* Ungrouped Fields */}
                            {ungrouped.length > 0 && (
                              <div className="mb-4">
                                {renderFieldsInRow(ungrouped)}
                              </div>
                            )}

                            {/* Grouped Fields */}
                            {Object.keys(grouped).length > 0 &&
                              Object.keys(grouped).map((groupName) => (
                                <div
                                  key={groupName}
                                  className="mb-4 border rounded p-3 bg-light"
                                >
                                  <h6 className="text-secondary mb-3 fw-bold">
                                    {groupName}
                                  </h6>
                                  {renderFieldsInRow(grouped[groupName])}
                                </div>
                              ))}
                          </>
                        );
                      })()}

                      
                    </div>

                    {/* Requirements */}
                    {selectedCategory.requirements && (
                      <div className="alert alert-warning mt-4">
                        <strong>Additional Requirements:</strong>
                        <p className="mb-0 mt-2">{selectedCategory.requirements}</p>
                      </div>
                    )}

                    {/* Info Note */}
                    <div className="alert alert-secondary mt-4 mb-0">
                      <small>
                        <strong>Note:</strong> This is a preview of the form fields you will need to fill when applying for this document.
                        All fields marked with <span className="text-danger">*</span> are required.
                      </small>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePreviewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserForms;