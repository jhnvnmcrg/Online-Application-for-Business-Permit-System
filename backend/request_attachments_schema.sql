-- ============================================
-- OABP Database Schema - Request Attachments
-- ============================================
-- Run this SQL statement in your Supabase SQL Editor

-- ============================================
-- REQUEST ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Request Attachments" (
    attachment_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES "Requests"(request_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_request_attachments_request ON "Request Attachments"(request_id);
CREATE INDEX IF NOT EXISTS idx_request_attachments_uploaded_by ON "Request Attachments"(uploaded_by);

-- ============================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================
-- ALTER TABLE "Request Attachments" ENABLE ROW LEVEL SECURITY;

-- Note: Configure Row Level Security policies based on your security requirements
