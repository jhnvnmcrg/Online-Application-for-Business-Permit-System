const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://oabsfront.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const PORT = process.env.PORT || 3000;

// Configure multer for memory storage (files stored in memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Register main admin endpoint
app.post("/api/main/register", async (req, res) => {
  try {
    const { fullname, email, username, password, role, status } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("Admins")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("Admins")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const { data, error } = await supabase
      .from("Admins")
      .insert([
        {
          fullname,
          email,
          username,
          password: hashedPassword,
          role: role || "Processor",
          status: status || "active",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create account. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        admin_id: data[0].id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});

// Login main admin endpoint
app.post("/api/main/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find user by username or email
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
        admin_id: user.admin_id, // Include admin_id for audit logging
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        admin_id: user.admin_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Get all admins endpoint
app.get("/api/admin/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Admins")
      .select("admin_id, fullname, email, username, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admins",
      });
    }

    res.status(200).json({
      success: true,
      admins: data,
    });
  } catch (err) {
    console.error("Fetch admins error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching admins",
    });
  }
});

// Update admin endpoint
app.put("/api/admin/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, username, role, status, password } = req.body;

    // Validation
    if (!fullname || !email || !username) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Check if username already exists (excluding current admin)
    const { data: existingUsername } = await supabase
      .from("Admins")
      .select("admin_id")
      .eq("username", username)
      .neq("admin_id", id)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists (excluding current admin)
    const { data: existingEmail } = await supabase
      .from("Admins")
      .select("admin_id")
      .eq("email", email)
      .neq("admin_id", id)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Prepare update data
    const updateData = {
      fullname,
      email,
      username,
      role: role || "Processor",
      status: status || "active",
    };

    // If password is provided, hash it and include in update
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Update admin in database
    const { data, error } = await supabase
      .from("Admins")
      .update(updateData)
      .eq("admin_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update admin. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        admin_id: data[0].admin_id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
        role: data[0].role,
        status: data[0].status,
      },
    });
  } catch (err) {
    console.error("Update admin error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while updating admin",
    });
  }
});

// Delete admin endpoint
app.delete("/api/admin/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete admin from database
    const { data, error } = await supabase
      .from("Admins")
      .delete()
      .eq("admin_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete admin. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting admin",
    });
  }
});

// Register user endpoint
app.post("/api/user/register", async (req, res) => {
  try {
    const { fullname, email, username, password } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("Owners")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("Owners")
      .select("email")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const { data, error } = await supabase
      .from("Owners")
      .insert([
        {
          fullname,
          email,
          username,
          password: hashedPassword,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create account. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        owner_id: data[0].id,
        fullname: data[0].fullname,
        email: data[0].email,
        username: data[0].username,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during registration",
    });
  }
});

// Login user endpoint
app.post("/api/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find user by username or email
    const { data: user, error } = await supabase
      .from("Owners")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        owner_id: user.owner_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Login processor endpoint
app.post("/api/processor/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/Email and password are required",
      });
    }

    // Find processor by username or email and verify role is Processor
    const { data: user, error } = await supabase
      .from("Admins")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .eq("role", "Processor")
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password, or you are not a processor",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        error: "Your account is inactive. Please contact the administrator.",
        admin_id: user.admin_id,
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password",
        admin_id: user.admin_id, // Include admin_id for audit logging
      });
    }

    // Generate a simple token (you can use JWT for better security)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    // Return user data (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        admin_id: user.admin_id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Processor login error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred during login",
    });
  }
});

// Add category endpoint
app.post("/api/category/add", async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    // Validation
    if (!categoryName || !description) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are required",
      });
    }

    // Check if category name already exists
    const { data: existingCategory } = await supabase
      .from("Document Categories")
      .select("category_name")
      .eq("category_name", categoryName)
      .single();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Insert category into database
    const { data, error } = await supabase
      .from("Document Categories")
      .insert([
        {
          category_name: categoryName,
          description: description,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add category. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: data[0],
    });
  } catch (err) {
    console.error("Add category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding category",
    });
  }
});

// Get all categories endpoint
app.get("/api/category/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Document Categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }

    res.status(200).json({
      success: true,
      categories: data,
    });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories",
    });
  }
});

// Update category endpoint
app.put("/api/category/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    // Validation
    if (!categoryName || !description) {
      return res.status(400).json({
        success: false,
        message: "Category name and description are required",
      });
    }

    // Check if category name already exists (excluding current category)
    const { data: existingCategory } = await supabase
      .from("Document Categories")
      .select("category_id")
      .eq("category_name", categoryName)
      .neq("category_id", id)
      .single();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Update category in database
    const { data, error } = await supabase
      .from("Document Categories")
      .update({
        category_name: categoryName,
        description: description,
      })
      .eq("category_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update category. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: data[0],
    });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating category",
    });
  }
});

// Delete category endpoint
app.delete("/api/category/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete category from database
    const { data, error } = await supabase
      .from("Document Categories")
      .delete()
      .eq("category_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete category. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting category",
    });
  }
});

// Add document endpoint with file upload
app.post("/api/document/add", upload.single("document"), async (req, res) => {
  try {
    const { categoryId, description, adminId } = req.body;
    const file = req.file;

    // Validation
    if (!categoryId || !description || !adminId || !file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Generate unique filename
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload document. Please try again.",
      });
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Insert document metadata into database
    const { data, error } = await supabase
      .from("Documents")
      .insert([
        {
          category_id: categoryId,
          document_name: file.originalname,
          document_path: publicUrlData.publicUrl,
          description: description,
          created_by: adminId, // Foreign key to Admins table
        },
      ])
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      // Delete uploaded file if database insert fails
      await supabase.storage.from("documents").remove([filePath]);
      return res.status(500).json({
        success: false,
        message: "Failed to add document. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Document added successfully",
      document: data[0],
    });
  } catch (err) {
    console.error("Add document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding document",
    });
  }
});

// Get all documents endpoint
app.get("/api/document/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Documents")
      .select(`
        *,
        Admins (
          username,
          fullname
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents",
      });
    }

    // Transform data to include admin username
    const transformedData = data.map((doc) => ({
      ...doc,
      created_by_name: doc.Admins?.username || doc.Admins?.fullname || "Unknown",
    }));

    res.status(200).json({
      success: true,
      documents: transformedData,
    });
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching documents",
    });
  }
});

// Update document endpoint
app.put("/api/document/update/:id", upload.single("document"), async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, description } = req.body;
    const file = req.file;

    // Validation
    if (!categoryId || !description) {
      return res.status(400).json({
        success: false,
        message: "Category and description are required",
      });
    }

    let documentPath;

    // If new file is uploaded, upload to Supabase Storage
    if (file) {
      // Get old document to delete from storage
      const { data: oldDoc } = await supabase
        .from("Documents")
        .select("document_path")
        .eq("document_id", id)
        .single();

      // Generate unique filename
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload new file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload document. Please try again.",
        });
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      documentPath = publicUrlData.publicUrl;

      // Delete old file from storage if exists
      if (oldDoc && oldDoc.document_path) {
        const oldFilePath = oldDoc.document_path.split("/documents/")[1];
        if (oldFilePath) {
          await supabase.storage.from("documents").remove([`documents/${oldFilePath}`]);
        }
      }
    }

    // Update document in database
    const updateData = {
      category_id: categoryId,
      description: description,
    };

    if (documentPath) {
      updateData.document_path = documentPath;
      if (file) {
        updateData.document_name = file.originalname;
      }
    }

    const { data, error } = await supabase
      .from("Documents")
      .update(updateData)
      .eq("document_id", id)
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update document. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document: data[0],
    });
  } catch (err) {
    console.error("Update document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating document",
    });
  }
});

// Delete document endpoint
app.delete("/api/document/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { documentPath } = req.body;

    // Delete document from database
    const { data, error } = await supabase
      .from("Documents")
      .delete()
      .eq("document_id", id)
      .select();

    if (error) {
      console.error("Supabase database error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete document. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete file from Supabase Storage
    if (documentPath) {
      const filePath = documentPath.split("/documents/")[1];
      if (filePath) {
        await supabase.storage.from("documents").remove([`documents/${filePath}`]);
      }
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting document",
    });
  }
});

// Add form field endpoint
app.post("/api/form/add", async (req, res) => {
  try {
    const { categoryId, fieldName, fieldType, isRequired, fieldOrder, placeholder, defaultValue, groupId, validationRule, fieldWidth } = req.body;

    // Validation
    if (!categoryId || !fieldName || !fieldType || isRequired === undefined || !fieldOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate field type
    const validFieldTypes = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "FILE"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field type",
      });
    }

    // Insert form field into database
    const { data, error } = await supabase
      .from("Document Forms")
      .insert([
        {
          category_id: categoryId,
          field_name: fieldName,
          field_type: fieldType,
          is_required: isRequired,
          field_order: fieldOrder,
          placeholder: placeholder || null,
          default_value: defaultValue || null,
          group_id: groupId || null,
          validation_rule: validationRule || null,
          field_width: fieldWidth || 12,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add form field. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Form field added successfully",
      formField: data[0],
    });
  } catch (err) {
    console.error("Add form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding form field",
    });
  }
});

// Get all form fields endpoint
app.get("/api/form/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Document Forms")
      .select("*")
      .order("field_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch form fields",
      });
    }

    res.status(200).json({
      success: true,
      formFields: data,
    });
  } catch (err) {
    console.error("Fetch form fields error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching form fields",
    });
  }
});

// Update form field endpoint
app.put("/api/form/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, fieldName, fieldType, isRequired, fieldOrder, placeholder, defaultValue, groupId, validationRule, fieldWidth } = req.body;

    // Validation
    if (!categoryId || !fieldName || !fieldType || isRequired === undefined || !fieldOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate field type
    const validFieldTypes = ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "FILE"];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field type",
      });
    }

    // Update form field in database
    const { data, error } = await supabase
      .from("Document Forms")
      .update({
        category_id: categoryId,
        field_name: fieldName,
        field_type: fieldType,
        is_required: isRequired,
        field_order: fieldOrder,
        placeholder: placeholder || null,
        default_value: defaultValue || null,
        group_id: groupId || null,
        validation_rule: validationRule || null,
        field_width: fieldWidth || 12,
      })
      .eq("form_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update form field. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Form field not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form field updated successfully",
      formField: data[0],
    });
  } catch (err) {
    console.error("Update form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating form field",
    });
  }
});

// Delete form field endpoint
app.delete("/api/form/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete form field from database
    const { data, error } = await supabase
      .from("Document Forms")
      .delete()
      .eq("form_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete form field. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Form field not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form field deleted successfully",
    });
  } catch (err) {
    console.error("Delete form field error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting form field",
    });
  }
});

// Get all field groups endpoint
app.get("/api/group/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Form Field Groups")
      .select("*")
      .order("group_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field groups",
      });
    }

    res.status(200).json({
      success: true,
      groups: data,
    });
  } catch (err) {
    console.error("Fetch field groups error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field groups",
    });
  }
});

// Add field group endpoint
app.post("/api/group/add", async (req, res) => {
  try {
    const { categoryId, groupName, groupOrder } = req.body;

    // Validation
    if (!categoryId || !groupName || !groupOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Insert field group into database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .insert([
        {
          category_id: categoryId,
          group_name: groupName,
          group_order: groupOrder,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add field group. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Field group added successfully",
      group: data[0],
    });
  } catch (err) {
    console.error("Add field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding field group",
    });
  }
});

// Update field group endpoint
app.put("/api/group/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, groupName, groupOrder } = req.body;

    // Validation
    if (!categoryId || !groupName || !groupOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Update field group in database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .update({
        category_id: categoryId,
        group_name: groupName,
        group_order: groupOrder,
      })
      .eq("group_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update field group. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field group updated successfully",
      group: data[0],
    });
  } catch (err) {
    console.error("Update field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating field group",
    });
  }
});

// Delete field group endpoint
app.delete("/api/group/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete field group from database
    const { data, error } = await supabase
      .from("Form Field Groups")
      .delete()
      .eq("group_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete field group. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field group deleted successfully",
    });
  } catch (err) {
    console.error("Delete field group error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting field group",
    });
  }
});

// Get all field options endpoint
app.get("/api/option/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Form Field Options")
      .select("*")
      .order("option_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field options",
      });
    }

    res.status(200).json({
      success: true,
      options: data,
    });
  } catch (err) {
    console.error("Fetch field options error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field options",
    });
  }
});

// Get options by form field ID
app.get("/api/option/by-field/:formId", async (req, res) => {
  try {
    const { formId } = req.params;

    const { data, error } = await supabase
      .from("Form Field Options")
      .select("*")
      .eq("form_id", formId)
      .order("option_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch field options",
      });
    }

    res.status(200).json({
      success: true,
      options: data,
    });
  } catch (err) {
    console.error("Fetch field options error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching field options",
    });
  }
});

// Add field option endpoint
app.post("/api/option/add", async (req, res) => {
  try {
    const { formId, optionValue, optionOrder } = req.body;

    // Validation
    if (!formId || !optionValue || !optionOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Insert field option into database
    const { data, error } = await supabase
      .from("Form Field Options")
      .insert([
        {
          form_id: formId,
          option_value: optionValue,
          option_order: optionOrder,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add field option. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Field option added successfully",
      option: data[0],
    });
  } catch (err) {
    console.error("Add field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding field option",
    });
  }
});

// Update field option endpoint
app.put("/api/option/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { formId, optionValue, optionOrder } = req.body;

    // Validation
    if (!formId || !optionValue || !optionOrder) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Update field option in database
    const { data, error } = await supabase
      .from("Form Field Options")
      .update({
        form_id: formId,
        option_value: optionValue,
        option_order: optionOrder,
      })
      .eq("option_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update field option. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field option not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field option updated successfully",
      option: data[0],
    });
  } catch (err) {
    console.error("Update field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating field option",
    });
  }
});

// Delete field option endpoint
app.delete("/api/option/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete field option from database
    const { data, error } = await supabase
      .from("Form Field Options")
      .delete()
      .eq("option_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete field option. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Field option not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Field option deleted successfully",
    });
  } catch (err) {
    console.error("Delete field option error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting field option",
    });
  }
});

// Get all assignments endpoint with joined data
app.get("/api/assignment/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Assigned Roles")
      .select(`
        *,
        Admins (
          fullname,
          username
        ),
        DocumentCategories:category_id (
          category_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
      });
    }

    // Transform data to include admin and category names
    const transformedData = data.map((assignment) => ({
      ...assignment,
      admin_fullname: assignment.Admins?.fullname || "Unknown",
      admin_username: assignment.Admins?.username || "Unknown",
      category_name: assignment.DocumentCategories?.category_name || "N/A",
    }));

    res.status(200).json({
      success: true,
      assignments: transformedData,
    });
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching assignments",
    });
  }
});

// Add assignment endpoint
app.post("/api/assignment/add", async (req, res) => {
  try {
    const { admin_id, category_id } = req.body;

    // Validation
    if (!admin_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Admin and category are required",
      });
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from("Assigned Roles")
      .select("*")
      .eq("admin_id", admin_id)
      .eq("category_id", category_id)
      .single();

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "This admin is already assigned to this category",
      });
    }

    // Insert assignment into database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .insert([
        {
          admin_id,
          category_id,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add assignment. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Assignment added successfully",
      assignment: data[0],
    });
  } catch (err) {
    console.error("Add assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding assignment",
    });
  }
});

// Update assignment endpoint
app.put("/api/assignment/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, category_id } = req.body;

    // Validation
    if (!admin_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Admin and category are required",
      });
    }

    // Check if assignment already exists (excluding current assignment)
    const { data: existingAssignment } = await supabase
      .from("Assigned Roles")
      .select("*")
      .eq("admin_id", admin_id)
      .eq("category_id", category_id)
      .neq("assignment_id", id)
      .single();

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "This admin is already assigned to this category",
      });
    }

    // Update assignment in database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .update({
        admin_id,
        category_id,
      })
      .eq("assignment_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update assignment. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: data[0],
    });
  } catch (err) {
    console.error("Update assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating assignment",
    });
  }
});

// Delete assignment endpoint
app.delete("/api/assignment/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete assignment from database
    const { data, error } = await supabase
      .from("Assigned Roles")
      .delete()
      .eq("assignment_id", id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete assignment. Please try again.",
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    console.error("Delete assignment error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting assignment",
    });
  }
});

// Get all login audits endpoint with joined data
app.get("/api/audit/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Login Audits")
      .select(`
        *,
        Admins (
          fullname,
          username
        )
      `)
      .order("login_datetime", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch audits",
      });
    }

    // Transform data to include admin details
    const transformedData = data.map((audit) => ({
      ...audit,
      admin_fullname: audit.Admins?.fullname || "Unknown",
      admin_username: audit.Admins?.username || "Unknown",
    }));

    res.status(200).json({
      success: true,
      audits: transformedData,
    });
  } catch (err) {
    console.error("Fetch audits error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching audits",
    });
  }
});

// Add login audit endpoint
app.post("/api/audit/login", async (req, res) => {
  try {
    const { admin_id, status } = req.body;

    // Validation
    if (!admin_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and status are required",
      });
    }

    // Validate status
    if (status !== "Success" && status !== "Failed") {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Success' or 'Failed'",
      });
    }

    // Insert audit log into database
    const { data, error } = await supabase
      .from("Login Audits")
      .insert([
        {
          admin_id,
          status,
          login_datetime: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to log audit. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Audit logged successfully",
      audit: data[0],
    });
  } catch (err) {
    console.error("Log audit error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while logging audit",
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
