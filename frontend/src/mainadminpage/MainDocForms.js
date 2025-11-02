import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainSideBar from "../includes/MainSideBar";
import { Plus, Trash, Pencil, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";

function MainDocForms() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [fieldOrder, setFieldOrder] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [groupId, setGroupId] = useState("");
  const [validationRule, setValidationRule] = useState("");
  const [fieldWidth, setFieldWidth] = useState("12");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState(null);

  // Group modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupOrder, setGroupOrder] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);

  // Option modal states
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showEditOptionModal, setShowEditOptionModal] = useState(false);
  const [optionFormId, setOptionFormId] = useState("");
  const [optionValue, setOptionValue] = useState("");
  const [optionOrder, setOptionOrder] = useState("");
  const [editingOption, setEditingOption] = useState(null);

  // Form Preview states
  const [previewCategoryId, setPreviewCategoryId] = useState("");
  const [previewFields, setPreviewFields] = useState([]);
  const [previewOptions, setPreviewOptions] = useState({});

  // Selected category for management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Groups for modal form (filtered by selected categoryId)
  const [availableGroups, setAvailableGroups] = useState([]);

  // Pagination states
  const [groupsPage, setGroupsPage] = useState(1);
  const [formsPage, setFormsPage] = useState(1);
  const [optionsPage, setOptionsPage] = useState(1);
  const itemsPerPage = 5;

  // Message modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Delete confirmation modal states
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [pendingDeleteGroupId, setPendingDeleteGroupId] = useState(null);
  const [showDeleteOptionConfirm, setShowDeleteOptionConfirm] = useState(false);
  const [pendingDeleteOptionId, setPendingDeleteOptionId] = useState(null);
  const [showDeleteFieldConfirm, setShowDeleteFieldConfirm] = useState(false);
  const [pendingDeleteFieldId, setPendingDeleteFieldId] = useState(null);

  const navigate = useNavigate();

  // Helper functions for message modal
  const showMessage = (message, type = "success") => {
    setMessageContent(message);
    setMessageType(type);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageContent("");
    setMessageType("success");
  };

  const handleCancelDeleteGroup = () => {
    setShowDeleteGroupConfirm(false);
    setPendingDeleteGroupId(null);
  };

  const handleCancelDeleteOption = () => {
    setShowDeleteOptionConfirm(false);
    setPendingDeleteOptionId(null);
  };

  const handleCancelDeleteField = () => {
    setShowDeleteFieldConfirm(false);
    setPendingDeleteFieldId(null);
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("mainadmin");

    if (!userData) {
      // If no user data, redirect to login
      navigate("/oabps/main/login");
      return;
    }

    // Fetch categories, groups, and form fields
    fetchCategories();
    fetchGroups();
    fetchFormFields();
  }, [navigate]);

  // Filter groups when categoryId changes
  useEffect(() => {
    if (categoryId) {
      const filtered = groups.filter(
        (group) => group.category_id === parseInt(categoryId)
      );
      setAvailableGroups(filtered);
    } else {
      setAvailableGroups([]);
    }
  }, [categoryId, groups]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/category/all"
      );
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/group/all"
      );
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchFormFields = async () => {
    try {
      const response = await axios.get(
        "https://oabs-f7by.onrender.com/api/form/all"
      );
      if (response.data.success) {
        setFormFields(response.data.formFields);
      }
    } catch (err) {
      console.error("Error fetching form fields:", err);
    }
  };

  const handleAddForm = () => {
    // Pre-select category if viewing a specific category
    if (selectedCategory) {
      setCategoryId(selectedCategory.category_id.toString());
    }
    setShowModal(true);
  };

  const handleAddGroup = () => {
    setShowGroupModal(true);
  };

  const handleAddOption = () => {
    setShowOptionModal(true);
  };

  // Group handlers
  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setGroupName("");
    setGroupOrder("");
    setError("");
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/group/add",
        {
          categoryId: selectedCategory.category_id,
          groupName,
          groupOrder: parseInt(groupOrder),
        }
      );

      if (response.data.success) {
        showMessage("Group added successfully!", "success");
        handleCloseGroupModal();
        await fetchGroups();
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        setError(response.data.message || "Failed to add group");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding group");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupName(group.group_name);
    setGroupOrder(group.group_order);
    setShowEditGroupModal(true);
  };

  const handleCloseEditGroupModal = () => {
    setShowEditGroupModal(false);
    setEditingGroup(null);
    setGroupName("");
    setGroupOrder("");
    setError("");
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/group/update/${editingGroup.group_id}`,
        {
          categoryId: selectedCategory.category_id,
          groupName,
          groupOrder: parseInt(groupOrder),
        }
      );

      if (response.data.success) {
        showMessage("Group updated successfully!", "success");
        handleCloseEditGroupModal();
        await fetchGroups();
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        setError(response.data.message || "Failed to update group");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = (groupId) => {
    setPendingDeleteGroupId(groupId);
    setShowDeleteGroupConfirm(true);
  };

  const handleConfirmDeleteGroup = async () => {
    setShowDeleteGroupConfirm(false);
    const groupId = pendingDeleteGroupId;
    setPendingDeleteGroupId(null);

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/group/delete/${groupId}`
      );

      if (response.data.success) {
        showMessage("Group deleted successfully!", "success");
        await fetchGroups();
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        showMessage(response.data.message || "Failed to delete group", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Error deleting group", "error");
    }
  };

  // Option handlers
  const handleCloseOptionModal = () => {
    setShowOptionModal(false);
    setOptionFormId("");
    setOptionValue("");
    setOptionOrder("");
    setError("");
  };

  const handleSubmitOption = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/option/add",
        {
          formId: optionFormId,
          optionValue,
          optionOrder: parseInt(optionOrder),
        }
      );

      if (response.data.success) {
        showMessage("Option added successfully!", "success");
        handleCloseOptionModal();
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        setError(response.data.message || "Failed to add option");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding option");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setOptionFormId(option.form_id);
    setOptionValue(option.option_value);
    setOptionOrder(option.option_order);
    setShowEditOptionModal(true);
  };

  const handleCloseEditOptionModal = () => {
    setShowEditOptionModal(false);
    setEditingOption(null);
    setOptionFormId("");
    setOptionValue("");
    setOptionOrder("");
    setError("");
  };

  const handleUpdateOption = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/option/update/${editingOption.option_id}`,
        {
          formId: optionFormId,
          optionValue,
          optionOrder: parseInt(optionOrder),
        }
      );

      if (response.data.success) {
        showMessage("Option updated successfully!", "success");
        handleCloseEditOptionModal();
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        setError(response.data.message || "Failed to update option");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating option");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = (optionId) => {
    setPendingDeleteOptionId(optionId);
    setShowDeleteOptionConfirm(true);
  };

  const handleConfirmDeleteOption = async () => {
    setShowDeleteOptionConfirm(false);
    const optionId = pendingDeleteOptionId;
    setPendingDeleteOptionId(null);

    try{
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/option/delete/${optionId}`
      );

      if (response.data.success) {
        showMessage("Option deleted successfully!", "success");
        await fetchFormFields();
        await filterDataByCategory(selectedCategory.category_id);
        await refreshFormPreview(selectedCategory.category_id);
      } else {
        showMessage(response.data.message || "Failed to delete option", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Error deleting option", "error");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCategoryId("");
    setFieldName("");
    setFieldType("");
    setIsRequired(true);
    setFieldOrder("");
    setPlaceholder("");
    setDefaultValue("");
    setGroupId("");
    setValidationRule("");
    setFieldWidth("12");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://oabs-f7by.onrender.com/api/form/add",
        {
          categoryId,
          fieldName,
          fieldType,
          isRequired,
          fieldOrder: parseInt(fieldOrder),
          placeholder,
          defaultValue,
          groupId: groupId || null,
          validationRule,
          fieldWidth: parseInt(fieldWidth),
        }
      );

      if (response.data.success) {
        showMessage("Form field added successfully!", "success");
        handleCloseModal();
        await fetchFormFields(); // Refresh the form fields list
        if (selectedCategory) {
          await filterDataByCategory(selectedCategory.category_id);
          await refreshFormPreview(selectedCategory.category_id);
        }
      } else {
        setError(response.data.message || "Failed to add form field");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding form field");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setCategoryId(field.category_id);
    setFieldName(field.field_name);
    setFieldType(field.field_type);
    setIsRequired(field.is_required);
    setFieldOrder(field.field_order);
    setPlaceholder(field.placeholder || "");
    setDefaultValue(field.default_value || "");
    setGroupId(field.group_id || "");
    setValidationRule(field.validation_rule || "");
    setFieldWidth(field.field_width ? field.field_width.toString() : "12");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingField(null);
    setCategoryId("");
    setFieldName("");
    setFieldType("");
    setIsRequired(true);
    setFieldOrder("");
    setPlaceholder("");
    setDefaultValue("");
    setGroupId("");
    setValidationRule("");
    setFieldWidth("12");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `https://oabs-f7by.onrender.com/api/form/update/${editingField.form_id}`,
        {
          categoryId,
          fieldName,
          fieldType,
          isRequired,
          fieldOrder: parseInt(fieldOrder),
          placeholder,
          defaultValue,
          groupId: groupId || null,
          validationRule,
          fieldWidth: parseInt(fieldWidth),
        }
      );

      if (response.data.success) {
        showMessage("Form field updated successfully!", "success");
        handleCloseEditModal();
        await fetchFormFields(); // Refresh the form fields list
        if (selectedCategory) {
          await filterDataByCategory(selectedCategory.category_id);
          await refreshFormPreview(selectedCategory.category_id);
        }
      } else {
        setError(response.data.message || "Failed to update form field");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating form field");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (formId) => {
    setPendingDeleteFieldId(formId);
    setShowDeleteFieldConfirm(true);
  };

  const handleConfirmDeleteField = async () => {
    setShowDeleteFieldConfirm(false);
    const formId = pendingDeleteFieldId;
    setPendingDeleteFieldId(null);

    try {
      const response = await axios.delete(
        `https://oabs-f7by.onrender.com/api/form/delete/${formId}`
      );

      if (response.data.success) {
        showMessage("Form field deleted successfully!", "success");
        await fetchFormFields(); // Refresh the form fields list
        if (selectedCategory) {
          await filterDataByCategory(selectedCategory.category_id);
          await refreshFormPreview(selectedCategory.category_id);
        }
      } else {
        showMessage(response.data.message || "Failed to delete form field", "error");
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Error deleting form field", "error");
    }
  };

  // Handle category selection for management
  const handleManageCategory = async (category) => {
    setSelectedCategory(category);
    setPreviewCategoryId(category.category_id.toString());
    await filterDataByCategory(category.category_id);
    // Trigger form preview
    await refreshFormPreview(category.category_id);
  };

  // Filter groups, forms, and options by category
  const filterDataByCategory = async (categoryId) => {
    try {
      // Fetch fresh groups data
      const groupsResponse = await axios.get(
        "https://oabs-f7by.onrender.com/api/group/all"
      );
      if (groupsResponse.data.success) {
        const categoryGroups = groupsResponse.data.groups.filter(
          (group) => group.category_id === categoryId
        );
        setFilteredGroups(categoryGroups);
      }

      // Fetch fresh forms data
      const formsResponse = await axios.get(
        "https://oabs-f7by.onrender.com/api/form/all"
      );
      if (formsResponse.data.success) {
        const categoryForms = formsResponse.data.formFields.filter(
          (field) => field.category_id === categoryId
        );
        setFilteredForms(categoryForms);

        // Fetch options for forms in this category
        const allOptions = [];
        for (const form of categoryForms) {
          try {
            const optionsResponse = await axios.get(
              `https://oabs-f7by.onrender.com/api/option/by-field/${form.form_id}`
            );
            if (optionsResponse.data.success) {
              allOptions.push(...optionsResponse.data.options);
            }
          } catch (err) {
            console.error(
              `Error fetching options for form ${form.form_id}:`,
              err
            );
          }
        }
        setFilteredOptions(allOptions);
      }
    } catch (err) {
      console.error("Error filtering data by category:", err);
    }
  };

  // Go back to category list
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPreviewCategoryId("");
    setFilteredGroups([]);
    setFilteredForms([]);
    setFilteredOptions([]);
  };

  // Refresh form preview for current category
  const refreshFormPreview = async (categoryId) => {
    if (!categoryId) {
      setPreviewFields([]);
      setPreviewOptions({});
      return;
    }

    try {
      // Fetch form fields for selected category
      const fieldsResponse = await axios.get(
        "https://oabs-f7by.onrender.com/api/form/all"
      );

      if (fieldsResponse.data.success) {
        // Filter fields by category and sort by field_order
        const categoryFields = fieldsResponse.data.formFields
          .filter((field) => field.category_id === parseInt(categoryId))
          .sort((a, b) => a.field_order - b.field_order);

        setPreviewFields(categoryFields);

        // Fetch options for SELECT fields
        const selectFields = categoryFields.filter(
          (field) => field.field_type === "SELECT"
        );
        const optionsMap = {};

        for (const field of selectFields) {
          try {
            const optionsResponse = await axios.get(
              `https://oabs-f7by.onrender.com/api/option/by-field/${field.form_id}`
            );
            if (optionsResponse.data.success) {
              optionsMap[field.form_id] = optionsResponse.data.options;
            }
          } catch (err) {
            console.error(
              `Error fetching options for field ${field.form_id}:`,
              err
            );
          }
        }

        setPreviewOptions(optionsMap);
      }
    } catch (err) {
      console.error("Error loading form preview:", err);
      showMessage("Error loading form preview", "error");
    }
  };

  // Handle category change for form preview
  const handlePreviewCategoryChange = async (e) => {
    const selectedCategoryId = e.target.value;
    setPreviewCategoryId(selectedCategoryId);
    await refreshFormPreview(selectedCategoryId);
  };

  // Group fields by group_id
  const groupFieldsByGroup = (fields) => {
    const grouped = {};
    const ungrouped = [];

    fields.forEach((field) => {
      if (field.group_id) {
        if (!grouped[field.group_id]) {
          grouped[field.group_id] = [];
        }
        grouped[field.group_id].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    return { grouped, ungrouped };
  };

  // Render form field based on type
  const renderPreviewField = (field) => {
    const commonProps = {
      className: "form-control form-control-lg",
      placeholder: field.placeholder || "",
      required: field.is_required,
      defaultValue: field.default_value || "",
    };

    switch (field.field_type) {
      case "TEXT":
        return <input type="text" {...commonProps} />;
      case "TEXTAREA":
        return <textarea {...commonProps} rows="3"></textarea>;
      case "NUMBER":
        return <input type="number" {...commonProps} />;
      case "DATE":
        return <input type="date" {...commonProps} />;
      case "SELECT":
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {(previewOptions[field.form_id] || []).map((option) => (
              <option key={option.option_id} value={option.option_value}>
                {option.option_value}
              </option>
            ))}
          </select>
        );
      case "FILE":
        return (
          <input
            type="file"
            className="form-control form-control-lg"
            required={field.is_required}
          />
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
      // Default to full width if no field_width specified
      const fieldWidth = field.field_width || 12;

      currentRow.push({ field, width: fieldWidth });

      // Calculate total width in current row
      const totalWidth = currentRow.reduce((sum, item) => sum + item.width, 0);

      // If row is full or last field, push to rows
      if (totalWidth >= 12 || index === fields.length - 1) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="row mb-3 text-start">
        {row.map(({ field, width }) => (
          <div key={field.form_id} className={`col-md-${width}`}>
            <label className="form-label text-muted">
              {field.field_name.toUpperCase()}
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
      <MainSideBar>
        <div className="container-fluid p-4">
          {!selectedCategory ? (
            // Category List View
            <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Document Categories</h4>
              </div>
              <hr className="my-0" />
              <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Category Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        categories.map((category, index) => (
                          <tr key={category.category_id}>
                            <td>{index + 1}</td>
                            <td>{category.category_name}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleManageCategory(category)}
                              >
                                Manage
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
          ) : (
            // Category Management View
            <>
              <div className="bg-light p-4 border-bottom text-center mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-outline-secondary me-3"
                      onClick={handleBackToCategories}
                    >
                      ← Back
                    </button>
                    <h4 className="mb-0">{selectedCategory.category_name}</h4>
                  </div>
                </div>
              </div>

              {/* Groups Table */}
              <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-start mb-3">Field Groups</h5>
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={handleAddGroup}
                  >
                    <Plus /> Add Group
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Group Name</th>
                        <th>Group Order</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No groups found
                          </td>
                        </tr>
                      ) : (
                        filteredGroups
                          .slice(
                            (groupsPage - 1) * itemsPerPage,
                            groupsPage * itemsPerPage
                          )
                          .map((group, index) => (
                            <tr key={group.group_id}>
                              <td>
                                {(groupsPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>{group.group_name}</td>
                              <td>{group.group_order}</td>
                              <td>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEditGroup(group)}
                                >
                                  <Pencil className="text-primary" />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleDeleteGroup(group.group_id)
                                  }
                                >
                                  <Trash className="text-danger" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Groups Pagination */}
                {filteredGroups.length > itemsPerPage && (
                  <div className="d-flex justify-content-end mt-3">
                    <nav>
                      <ul className="pagination pagination-sm">
                        <li
                          className={`page-item ${
                            groupsPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setGroupsPage(groupsPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        {[
                          ...Array(
                            Math.ceil(filteredGroups.length / itemsPerPage)
                          ),
                        ].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${
                              groupsPage === i + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setGroupsPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            groupsPage ===
                            Math.ceil(filteredGroups.length / itemsPerPage)
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setGroupsPage(groupsPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>

              {/* Forms Table */}
              <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-start mb-3">Form Fields</h5>
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={handleAddForm}
                  >
                    <Plus /> Add Form
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Field Name</th>
                        <th>Field Type</th>

                        <th>Order</th>

                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No form fields found
                          </td>
                        </tr>
                      ) : (
                        filteredForms
                          .slice(
                            (formsPage - 1) * itemsPerPage,
                            formsPage * itemsPerPage
                          )
                          .map((field, index) => (
                            <tr key={field.form_id}>
                              <td>
                                {(formsPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>{field.field_name}</td>
                              <td>{field.field_type}</td>

                              <td>{field.field_order}</td>

                              <td>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(field)}
                                >
                                  <Pencil className="text-primary" />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleDelete(field.form_id)}
                                >
                                  <Trash className="text-danger" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Forms Pagination */}
                {filteredForms.length > itemsPerPage && (
                  <div className="d-flex justify-content-end mt-3">
                    <nav>
                      <ul className="pagination pagination-sm">
                        <li
                          className={`page-item ${
                            formsPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setFormsPage(formsPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        {[
                          ...Array(
                            Math.ceil(filteredForms.length / itemsPerPage)
                          ),
                        ].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${
                              formsPage === i + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setFormsPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            formsPage ===
                            Math.ceil(filteredForms.length / itemsPerPage)
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setFormsPage(formsPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>

              {/* Options Table */}
              <div className="bg-light p-4 border-bottom mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="text-start mb-3">
                    Field Options (for SELECT fields)
                  </h5>

                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={handleAddOption}
                  >
                    <Plus /> Add Option
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Form Field</th>
                        <th>Option Value</th>
                        <th>Option Order</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOptions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No options found
                          </td>
                        </tr>
                      ) : (
                        filteredOptions
                          .slice(
                            (optionsPage - 1) * itemsPerPage,
                            optionsPage * itemsPerPage
                          )
                          .map((option, index) => (
                            <tr key={option.option_id}>
                              <td>
                                {(optionsPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>
                                {filteredForms.find(
                                  (f) => f.form_id === option.form_id
                                )?.field_name || "N/A"}
                              </td>
                              <td>{option.option_value}</td>
                              <td>{option.option_order}</td>
                              <td>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEditOption(option)}
                                >
                                  <Pencil className="text-primary" />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleDeleteOption(option.option_id)
                                  }
                                >
                                  <Trash className="text-danger" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Options Pagination */}
                {filteredOptions.length > itemsPerPage && (
                  <div className="d-flex justify-content-end mt-3">
                    <nav>
                      <ul className="pagination pagination-sm">
                        <li
                          className={`page-item ${
                            optionsPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setOptionsPage(optionsPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        {[
                          ...Array(
                            Math.ceil(filteredOptions.length / itemsPerPage)
                          ),
                        ].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${
                              optionsPage === i + 1 ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setOptionsPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            optionsPage ===
                            Math.ceil(filteredOptions.length / itemsPerPage)
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setOptionsPage(optionsPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Form Preview Section - Only show when category is selected */}
          {selectedCategory && (
            <div className="bg-light p-4 border-bottom text-center shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                  <Eye className="me-2" style={{ display: "inline" }} />
                  Form Preview Blueprint
                </h4>
              </div>
              <hr className="my-3" />

              {/* Form Preview */}
              {previewCategoryId && previewFields.length > 0 && (
                <div className="bg-white p-4 rounded shadow-sm">
                  <h5 className="mb-4 text-primary">
                    {categories.find(
                      (cat) => cat.category_id === parseInt(previewCategoryId)
                    )?.category_name || "Form"}{" "}
                    - Dynamic Form
                  </h5>

                  {(() => {
                    const { grouped, ungrouped } =
                      groupFieldsByGroup(previewFields);

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
                          Object.keys(grouped)
                            .sort((a, b) => {
                              const groupA = groups.find(
                                (g) => g.group_id === parseInt(a)
                              );
                              const groupB = groups.find(
                                (g) => g.group_id === parseInt(b)
                              );
                              return (
                                (groupA?.group_order || 0) -
                                (groupB?.group_order || 0)
                              );
                            })
                            .map((groupId) => {
                              const group = groups.find(
                                (g) => g.group_id === parseInt(groupId)
                              );
                              return (
                                <div
                                  key={groupId}
                                  className="mb-4 border rounded p-3 bg-light"
                                >
                                  <h6 className="text-secondary mb-3 fw-bold">
                                    {group?.group_name || `Group ${groupId}`}
                                  </h6>
                                  {renderFieldsInRow(grouped[groupId])}
                                </div>
                              );
                            })}
                      </>
                    );
                  })()}

                  <div className="mt-4 text-muted small">
                    <strong>Preview Details:</strong>
                    <ul className="text-start">
                      <li>Total Fields: {previewFields.length}</li>
                      <li>
                        Required Fields:{" "}
                        {previewFields.filter((f) => f.is_required).length}
                      </li>
                      <li>
                        Optional Fields:{" "}
                        {previewFields.filter((f) => !f.is_required).length}
                      </li>
                      <li>
                        Field Types:{" "}
                        {[
                          ...new Set(previewFields.map((f) => f.field_type)),
                        ].join(", ")}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {previewCategoryId && previewFields.length === 0 && (
                <div className="alert alert-info">
                  No form fields configured for this category. Add fields using
                  the "Add Form" button above.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Form Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Form Field</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="categoryId" className="form-label">
                        Category Name
                      </label>
                      <select
                        className="form-select"
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          setGroupId(""); // Reset group when category changes
                        }}
                        required
                        disabled={loading || selectedCategory}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fieldName" className="form-label">
                        Field Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fieldName"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder="e.g., Business Name"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fieldType" className="form-label">
                        Field Type
                      </label>
                      <select
                        className="form-select"
                        id="fieldType"
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Field Type</option>
                        <option value="TEXT">TEXT</option>
                        <option value="TEXTAREA">TEXTAREA</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="DATE">DATE</option>
                        <option value="SELECT">SELECT</option>
                        <option value="FILE">FILE</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Is Required</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isRequired"
                            id="requiredTrue"
                            value="true"
                            checked={isRequired === true}
                            onChange={() => setIsRequired(true)}
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="requiredTrue"
                          >
                            True
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isRequired"
                            id="requiredFalse"
                            value="false"
                            checked={isRequired === false}
                            onChange={() => setIsRequired(false)}
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="requiredFalse"
                          >
                            False
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fieldOrder" className="form-label">
                        Field Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="fieldOrder"
                        value={fieldOrder}
                        onChange={(e) => setFieldOrder(e.target.value)}
                        placeholder="e.g., 1"
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="placeholder" className="form-label">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="placeholder"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        placeholder="e.g., Enter your business name"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="groupId" className="form-label">
                        Field Group (Optional)
                      </label>
                      <select
                        className="form-select"
                        id="groupId"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        disabled={loading || !categoryId}
                      >
                        <option value="">No Group</option>
                        {availableGroups.map((group) => (
                          <option key={group.group_id} value={group.group_id}>
                            {group.group_name}
                          </option>
                        ))}
                      </select>
                      {!categoryId && (
                        <small className="text-muted">Select a category first to see available groups</small>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="fieldWidth" className="form-label">
                        Field Width
                      </label>
                      <select
                        className="form-select"
                        id="fieldWidth"
                        value={fieldWidth}
                        onChange={(e) => setFieldWidth(e.target.value)}
                        disabled={loading}
                      >
                        <option value="12">Full Width (12 columns)</option>
                        <option value="6">Half Width (6 columns)</option>
                        <option value="4">Third Width (4 columns)</option>
                        <option value="3">Quarter Width (3 columns)</option>
                      </select>
                      <small className="text-muted">
                        Controls how wide the field appears in the form layout
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Form Field"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Form Field</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseEditModal}
                  ></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="editCategoryId" className="form-label">
                        Category Name
                      </label>
                      <select
                        className="form-select"
                        id="editCategoryId"
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          setGroupId(""); // Reset group when category changes
                        }}
                        required
                        disabled={loading || selectedCategory}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option
                            key={category.category_id}
                            value={category.category_id}
                          >
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editFieldName" className="form-label">
                        Field Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editFieldName"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder="e.g., Business Name"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editFieldType" className="form-label">
                        Field Type
                      </label>
                      <select
                        className="form-select"
                        id="editFieldType"
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Field Type</option>
                        <option value="TEXT">TEXT</option>
                        <option value="TEXTAREA">TEXTAREA</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="DATE">DATE</option>
                        <option value="SELECT">SELECT</option>
                        <option value="FILE">FILE</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Is Required</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editIsRequired"
                            id="editRequiredTrue"
                            value="true"
                            checked={isRequired === true}
                            onChange={() => setIsRequired(true)}
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editRequiredTrue"
                          >
                            True
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editIsRequired"
                            id="editRequiredFalse"
                            value="false"
                            checked={isRequired === false}
                            onChange={() => setIsRequired(false)}
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editRequiredFalse"
                          >
                            False
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editFieldOrder" className="form-label">
                        Field Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="editFieldOrder"
                        value={fieldOrder}
                        onChange={(e) => setFieldOrder(e.target.value)}
                        placeholder="e.g., 1"
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editPlaceholder" className="form-label">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editPlaceholder"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        placeholder="e.g., Enter your business name"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="editGroupId" className="form-label">
                        Field Group (Optional)
                      </label>
                      <select
                        className="form-select"
                        id="editGroupId"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        disabled={loading || !categoryId}
                      >
                        <option value="">No Group</option>
                        {availableGroups.map((group) => (
                          <option key={group.group_id} value={group.group_id}>
                            {group.group_name}
                          </option>
                        ))}
                      </select>
                      {!categoryId && (
                        <small className="text-muted">Select a category first to see available groups</small>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="editFieldWidth" className="form-label">
                        Field Width
                      </label>
                      <select
                        className="form-select"
                        id="editFieldWidth"
                        value={fieldWidth}
                        onChange={(e) => setFieldWidth(e.target.value)}
                        disabled={loading}
                      >
                        <option value="12">Full Width (12 columns)</option>
                        <option value="6">Half Width (6 columns)</option>
                        <option value="4">Third Width (4 columns)</option>
                        <option value="3">Quarter Width (3 columns)</option>
                      </select>
                      <small className="text-muted">
                        Controls how wide the field appears in the form layout
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEditModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Form Field"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Add Group Modal */}
        {showGroupModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Field Group</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseGroupModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmitGroup}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                      <label htmlFor="groupName" className="form-label">
                        Group Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g., Business Information"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="groupOrder" className="form-label">
                        Group Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="groupOrder"
                        value={groupOrder}
                        onChange={(e) => setGroupOrder(e.target.value)}
                        placeholder="e.g., 1"
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseGroupModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Group"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditGroupModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Field Group</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseEditGroupModal}
                  ></button>
                </div>
                <form onSubmit={handleUpdateGroup}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                      <label htmlFor="editGroupName" className="form-label">
                        Group Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editGroupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editGroupOrder" className="form-label">
                        Group Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="editGroupOrder"
                        value={groupOrder}
                        onChange={(e) => setGroupOrder(e.target.value)}
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEditGroupModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Group"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Option Modal */}
        {showOptionModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Field Option</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseOptionModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmitOption}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                      <label htmlFor="optionFormId" className="form-label">
                        Form Field (SELECT type only)
                      </label>
                      <select
                        className="form-select"
                        id="optionFormId"
                        value={optionFormId}
                        onChange={(e) => setOptionFormId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Form Field</option>
                        {filteredForms
                          .filter((field) => field.field_type === "SELECT")
                          .map((field) => (
                            <option key={field.form_id} value={field.form_id}>
                              {field.field_name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="optionValue" className="form-label">
                        Option Value
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="optionValue"
                        value={optionValue}
                        onChange={(e) => setOptionValue(e.target.value)}
                        placeholder="e.g., 1st Year"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="optionOrder" className="form-label">
                        Option Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="optionOrder"
                        value={optionOrder}
                        onChange={(e) => setOptionOrder(e.target.value)}
                        placeholder="e.g., 1"
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseOptionModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Option"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Option Modal */}
        {showEditOptionModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Field Option</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseEditOptionModal}
                  ></button>
                </div>
                <form onSubmit={handleUpdateOption}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                      <label htmlFor="editOptionFormId" className="form-label">
                        Form Field (SELECT type only)
                      </label>
                      <select
                        className="form-select"
                        id="editOptionFormId"
                        value={optionFormId}
                        onChange={(e) => setOptionFormId(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Form Field</option>
                        {filteredForms
                          .filter((field) => field.field_type === "SELECT")
                          .map((field) => (
                            <option key={field.form_id} value={field.form_id}>
                              {field.field_name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editOptionValue" className="form-label">
                        Option Value
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editOptionValue"
                        value={optionValue}
                        onChange={(e) => setOptionValue(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editOptionOrder" className="form-label">
                        Option Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="editOptionOrder"
                        value={optionOrder}
                        onChange={(e) => setOptionOrder(e.target.value)}
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEditOptionModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Option"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={closeMessageModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
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
                    {messageType === "success" && (
                      <CheckCircle
                        size={64}
                        className="text-success"
                        strokeWidth={1.5}
                      />
                    )}
                    {messageType === "error" && (
                      <XCircle
                        size={64}
                        className="text-danger"
                        strokeWidth={1.5}
                      />
                    )}
                    {messageType === "info" && (
                      <AlertCircle
                        size={64}
                        className="text-info"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <h5 className="mb-3">
                    {messageType === "success" && "Success"}
                    {messageType === "error" && "Error"}
                    {messageType === "info" && "Information"}
                  </h5>
                  <p className="text-muted mb-4">{messageContent}</p>
                  <button
                    className="btn btn-primary"
                    onClick={closeMessageModal}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteGroupConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCancelDeleteGroup}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  Confirm Group Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelDeleteGroup}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  Are you sure you want to delete this group?
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
                  onClick={handleCancelDeleteGroup}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDeleteGroup}
                >
                  <Trash size={16} className="me-1" />
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Option Confirmation Modal */}
      {showDeleteOptionConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCancelDeleteOption}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  Confirm Option Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelDeleteOption}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  Are you sure you want to delete this option?
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
                  onClick={handleCancelDeleteOption}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDeleteOption}
                >
                  <Trash size={16} className="me-1" />
                  Delete Option
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Field Confirmation Modal */}
      {showDeleteFieldConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCancelDeleteField}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  Confirm Field Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCancelDeleteField}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  Are you sure you want to delete this form field?
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
                  onClick={handleCancelDeleteField}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDeleteField}
                >
                  <Trash size={16} className="me-1" />
                  Delete Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </MainSideBar>
    </>
  );
}

export default MainDocForms;