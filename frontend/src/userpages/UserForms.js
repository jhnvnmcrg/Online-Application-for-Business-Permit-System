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
        // Group fields by group_id
        const groupedFields = {};
        response.data.forms.forEach((field) => {
          const groupName = field.group_name || 'General Information';
          if (!groupedFields[groupName]) {
            groupedFields[groupName] = [];
          }
          groupedFields[groupName].push(field);
        });

        setFormFields(groupedFields);
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

  const getFieldTypeLabel = (type) => {
    const types = {
      text: 'Text Input',
      textarea: 'Long Text',
      number: 'Number',
      date: 'Date',
      email: 'Email',
      select: 'Dropdown',
      radio: 'Radio Button',
      checkbox: 'Checkbox',
    };
    return types[type] || type;
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
                ) : Object.keys(formFields).length === 0 ? (
                  <div className="alert alert-info">
                    <AlertCircle size={20} className="me-2" />
                    No form fields configured for this category yet.
                  </div>
                ) : (
                  <>
                    {/* Category Description */}
                    {selectedCategory.description && (
                      <div className="alert alert-secondary mb-4">
                        <strong>About this permit:</strong> {selectedCategory.description}
                      </div>
                    )}

                    {/* Form Field Groups */}
                    {Object.entries(formFields).map(([groupName, fields], index) => (
                      <div key={index} className="mb-4">
                        <h6 className="text-primary border-bottom pb-2 mb-3">
                          {groupName}
                        </h6>
                        <div className="row">
                          {fields
                            .sort((a, b) => a.field_order - b.field_order)
                            .map((field) => (
                              <div key={field.form_id} className="col-md-6 mb-3">
                                <div className="card border-0 bg-light">
                                  <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <label className="fw-bold mb-1">
                                        {field.field_label}
                                        {field.is_required && (
                                          <span className="text-danger ms-1">*</span>
                                        )}
                                      </label>
                                      <span className="badge bg-secondary small">
                                        {getFieldTypeLabel(field.field_type)}
                                      </span>
                                    </div>
                                    {field.placeholder && (
                                      <p className="text-muted small mb-2">
                                        <em>Placeholder: {field.placeholder}</em>
                                      </p>
                                    )}
                                    {field.field_type === 'select' && field.options && (
                                      <div className="mt-2">
                                        <small className="text-muted">Options:</small>
                                        <ul className="small mb-0 ps-3">
                                          {field.options.map((opt, idx) => (
                                            <li key={idx}>{opt.option_value}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {field.field_type === 'radio' && field.options && (
                                      <div className="mt-2">
                                        <small className="text-muted">Options:</small>
                                        <ul className="small mb-0 ps-3">
                                          {field.options.map((opt, idx) => (
                                            <li key={idx}>{opt.option_value}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="mt-2 d-flex align-items-center gap-2">
                                      {field.is_required ? (
                                        <span className="badge bg-danger small">Required</span>
                                      ) : (
                                        <span className="badge bg-secondary small">Optional</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}

                    {/* Requirements */}
                    {selectedCategory.requirements && (
                      <div className="alert alert-warning mt-4">
                        <strong>Additional Requirements:</strong>
                        <p className="mb-0 mt-2">{selectedCategory.requirements}</p>
                      </div>
                    )}
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