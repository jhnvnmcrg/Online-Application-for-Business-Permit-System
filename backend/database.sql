-- =====================================================
-- OABP Database Schema - Over-the-Counter Payment Model
-- =====================================================
-- This script can be run directly in Supabase SQL Editor
-- It will drop existing tables and recreate the schema
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (in reverse order of dependencies)
-- =====================================================

DROP TABLE IF EXISTS public."Activity_Logs" CASCADE;
DROP TABLE IF EXISTS public."Download_Logs" CASCADE;
DROP TABLE IF EXISTS public."Document Deliveries" CASCADE;
DROP TABLE IF EXISTS public."Login Audits" CASCADE;
DROP TABLE IF EXISTS public."Payment History" CASCADE;
DROP TABLE IF EXISTS public."Request History" CASCADE;
DROP TABLE IF EXISTS public."Request Form Data" CASCADE;
DROP TABLE IF EXISTS public."Request Attachments" CASCADE;
DROP TABLE IF EXISTS public."Form Field Options" CASCADE;
DROP TABLE IF EXISTS public."Document Forms" CASCADE;
DROP TABLE IF EXISTS public."Form Field Groups" CASCADE;
DROP TABLE IF EXISTS public."Notifications" CASCADE;
DROP TABLE IF EXISTS public."Payments" CASCADE;
DROP TABLE IF EXISTS public."Documents" CASCADE;
DROP TABLE IF EXISTS public."Requests" CASCADE;
DROP TABLE IF EXISTS public."Assigned Roles" CASCADE;
DROP TABLE IF EXISTS public."Document Categories" CASCADE;
DROP TABLE IF EXISTS public."Admins" CASCADE;
DROP TABLE IF EXISTS public."Owners" CASCADE;

-- Drop old tables that were removed in migration
DROP TABLE IF EXISTS public."System_Settings" CASCADE;
DROP TABLE IF EXISTS public."SLA_Breaches" CASCADE;
DROP TABLE IF EXISTS public."Notification_Templates" CASCADE;
DROP TABLE IF EXISTS public."Blacklist" CASCADE;

-- =====================================================
-- CREATE TABLES (in correct order of dependencies)
-- =====================================================

-- 1. Admins Table (Superadmin and Processors)
CREATE TABLE public."Admins" (
  admin_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Superadmin', 'Processor')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT "Admins_pkey" PRIMARY KEY (admin_id)
);

-- 2. Owners Table (Business Permit Applicants)
CREATE TABLE public."Owners" (
  owner_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  fullname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone_number VARCHAR(20),
  business_name TEXT,
  business_address TEXT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT "Owners_pkey" PRIMARY KEY (owner_id)
);

-- 3. Document Categories Table (Permit Types)
CREATE TABLE public."Document Categories" (
  category_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Document Categories_pkey" PRIMARY KEY (category_id)
);

-- 4. Assigned Roles Table (Processor-Category Assignment)
CREATE TABLE public."Assigned Roles" (
  assignment_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id BIGINT NOT NULL,
  admin_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Assigned Roles_pkey" PRIMARY KEY (assignment_id),
  CONSTRAINT "Assigned Roles_category_id_fkey" FOREIGN KEY (category_id)
    REFERENCES public."Document Categories"(category_id) ON DELETE CASCADE,
  CONSTRAINT "Assigned Roles_admin_id_fkey" FOREIGN KEY (admin_id)
    REFERENCES public."Admins"(admin_id) ON DELETE CASCADE
);

-- 5. Form Field Groups Table (Form Organization)
CREATE TABLE public."Form Field Groups" (
  group_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id BIGINT NOT NULL,
  group_name TEXT NOT NULL,
  group_order SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Form Field Groups_pkey" PRIMARY KEY (group_id),
  CONSTRAINT "Form Field Groups_category_id_fkey" FOREIGN KEY (category_id)
    REFERENCES public."Document Categories"(category_id) ON DELETE CASCADE
);

-- 6. Document Forms Table (Dynamic Form Fields)
CREATE TABLE public."Document Forms" (
  form_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id BIGINT NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'email', 'select', 'radio', 'checkbox')),
  is_required BOOLEAN DEFAULT false,
  field_order SMALLINT DEFAULT 0,
  placeholder TEXT,
  default_value TEXT,
  group_id BIGINT,
  validation_rule TEXT,
  field_width SMALLINT DEFAULT 12 CHECK (field_width IN (3, 4, 6, 12)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Document Forms_pkey" PRIMARY KEY (form_id),
  CONSTRAINT "Document Forms_category_id_fkey" FOREIGN KEY (category_id)
    REFERENCES public."Document Categories"(category_id) ON DELETE CASCADE,
  CONSTRAINT "Document Forms_group_id_fkey" FOREIGN KEY (group_id)
    REFERENCES public."Form Field Groups"(group_id) ON DELETE SET NULL
);

-- 7. Form Field Options Table (Select/Radio Options)
CREATE TABLE public."Form Field Options" (
  option_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  form_id BIGINT NOT NULL,
  option_value TEXT NOT NULL,
  option_order SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Form Field Options_pkey" PRIMARY KEY (option_id),
  CONSTRAINT "Form Field Options_form_id_fkey" FOREIGN KEY (form_id)
    REFERENCES public."Document Forms"(form_id) ON DELETE CASCADE
);

-- 8. Requests Table (Business Permit Applications)
CREATE TABLE public."Requests" (
  request_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  owner_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  tracking_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Cancelled', 'Completed')),
  date_requested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_release DATE,
  processed_by BIGINT,
  remarks TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITHOUT TIME ZONE,
  cancelled_at TIMESTAMP WITHOUT TIME ZONE,
  cancelled_by INTEGER,
  rejection_reason TEXT,
  payment_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Requests_pkey" PRIMARY KEY (request_id),
  CONSTRAINT "Requests_owner_id_fkey" FOREIGN KEY (owner_id)
    REFERENCES public."Owners"(owner_id) ON DELETE CASCADE,
  CONSTRAINT "Requests_category_id_fkey" FOREIGN KEY (category_id)
    REFERENCES public."Document Categories"(category_id) ON DELETE RESTRICT,
  CONSTRAINT "Requests_processed_by_fkey" FOREIGN KEY (processed_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL,
  CONSTRAINT "Requests_cancelled_by_fkey" FOREIGN KEY (cancelled_by)
    REFERENCES public."Owners"(owner_id) ON DELETE SET NULL
);

-- 9. Request Form Data Table (User Form Submissions)
CREATE TABLE public."Request Form Data" (
  data_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id BIGINT NOT NULL,
  form_id BIGINT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Request Form Data_pkey" PRIMARY KEY (data_id),
  CONSTRAINT "Request Form Data_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Request Form Data_form_id_fkey" FOREIGN KEY (form_id)
    REFERENCES public."Document Forms"(form_id) ON DELETE CASCADE
);

-- 10. Request Attachments Table (File Uploads)
CREATE TABLE public."Request Attachments" (
  attachment_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id BIGINT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  remarks TEXT,
  uploaded_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Request Attachments_pkey" PRIMARY KEY (attachment_id),
  CONSTRAINT "Request Attachments_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Request Attachments_uploaded_by_fkey" FOREIGN KEY (uploaded_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 11. Payments Table (OTC Payment Model - Simplified)
CREATE TABLE public."Payments" (
  payment_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id BIGINT NOT NULL,
  reference_number VARCHAR(100),
  amount DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  payment_type TEXT NOT NULL,
  description TEXT,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Check', 'Money Order')),
  payment_date TIMESTAMP WITH TIME ZONE,
  processed_by BIGINT,
  remarks TEXT,
  receipt_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Payments_pkey" PRIMARY KEY (payment_id),
  CONSTRAINT "Payments_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Payments_processed_by_fkey" FOREIGN KEY (processed_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 12. Request History Table (Status Change Audit Trail)
CREATE TABLE public."Request History" (
  history_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id BIGINT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by BIGINT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Request History_pkey" PRIMARY KEY (history_id),
  CONSTRAINT "Request History_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Request History_changed_by_fkey" FOREIGN KEY (changed_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 13. Payment History Table (Payment Status Change Audit Trail)
CREATE TABLE public."Payment History" (
  history_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  payment_id BIGINT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by BIGINT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Payment History_pkey" PRIMARY KEY (history_id),
  CONSTRAINT "Payment History_payment_id_fkey" FOREIGN KEY (payment_id)
    REFERENCES public."Payments"(payment_id) ON DELETE CASCADE,
  CONSTRAINT "Payment History_changed_by_fkey" FOREIGN KEY (changed_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 14. Notifications Table (System Notifications)
CREATE TABLE public."Notifications" (
  notification_id INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('Admin', 'Owner')),
  user_id INTEGER,
  type VARCHAR(50),
  template VARCHAR(100),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed', 'Read')),
  request_id INTEGER,
  payment_id INTEGER,
  admin_id INTEGER,
  owner_id INTEGER,
  sent_at TIMESTAMP WITHOUT TIME ZONE,
  read_at TIMESTAMP WITHOUT TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Notifications_pkey" PRIMARY KEY (notification_id),
  CONSTRAINT "Notifications_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Notifications_payment_id_fkey" FOREIGN KEY (payment_id)
    REFERENCES public."Payments"(payment_id) ON DELETE CASCADE,
  CONSTRAINT "Notifications_admin_id_fkey" FOREIGN KEY (admin_id)
    REFERENCES public."Admins"(admin_id) ON DELETE CASCADE,
  CONSTRAINT "Notifications_owner_id_fkey" FOREIGN KEY (owner_id)
    REFERENCES public."Owners"(owner_id) ON DELETE CASCADE
);

-- 15. Documents Table (Generated Permit Documents)
CREATE TABLE public."Documents" (
  document_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  category_id BIGINT NOT NULL,
  document_name TEXT NOT NULL,
  document_path TEXT NOT NULL,
  description TEXT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Documents_pkey" PRIMARY KEY (document_id),
  CONSTRAINT "Documents_category_id_fkey" FOREIGN KEY (category_id)
    REFERENCES public."Document Categories"(category_id) ON DELETE CASCADE,
  CONSTRAINT "Documents_created_by_fkey" FOREIGN KEY (created_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 16. Document Deliveries Table (Delivery Tracking)
CREATE TABLE public."Document Deliveries" (
  delivery_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id BIGINT NOT NULL,
  method TEXT CHECK (method IN ('Pickup', 'Delivery', 'Email', 'Portal Download')),
  delivered_by BIGINT,
  delivered_at DATE,
  remarks TEXT,
  CONSTRAINT "Document Deliveries_pkey" PRIMARY KEY (delivery_id),
  CONSTRAINT "Document Deliveries_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Document Deliveries_delivered_by_fkey" FOREIGN KEY (delivered_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- 17. Login Audits Table (Login Attempt Tracking)
CREATE TABLE public."Login Audits" (
  audit_id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  admin_id BIGINT,
  status TEXT CHECK (status IN ('Success', 'Failed')),
  login_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Login Audits_pkey" PRIMARY KEY (audit_id),
  CONSTRAINT "Login Audits_admin_id_fkey" FOREIGN KEY (admin_id)
    REFERENCES public."Admins"(admin_id) ON DELETE CASCADE
);

-- 18. Download Logs Table (File Download Tracking)
CREATE TABLE public."Download_Logs" (
  download_id INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
  request_id INTEGER,
  attachment_id INTEGER,
  downloaded_by INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  downloaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Download_Logs_pkey" PRIMARY KEY (download_id),
  CONSTRAINT "Download_Logs_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Download_Logs_attachment_id_fkey" FOREIGN KEY (attachment_id)
    REFERENCES public."Request Attachments"(attachment_id) ON DELETE CASCADE,
  CONSTRAINT "Download_Logs_downloaded_by_fkey" FOREIGN KEY (downloaded_by)
    REFERENCES public."Owners"(owner_id) ON DELETE SET NULL
);

-- 19. Activity Logs Table (System-wide Audit Trail)
CREATE TABLE public."Activity_Logs" (
  log_id INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('Admin', 'Owner', 'System')),
  user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  request_id INTEGER,
  payment_id INTEGER,
  performed_by INTEGER,
  ip_address VARCHAR(45),
  details JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Activity_Logs_pkey" PRIMARY KEY (log_id),
  CONSTRAINT "Activity_Logs_request_id_fkey" FOREIGN KEY (request_id)
    REFERENCES public."Requests"(request_id) ON DELETE CASCADE,
  CONSTRAINT "Activity_Logs_performed_by_fkey" FOREIGN KEY (performed_by)
    REFERENCES public."Admins"(admin_id) ON DELETE SET NULL
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Admins indexes
CREATE INDEX idx_admins_email ON public."Admins"(email);
CREATE INDEX idx_admins_username ON public."Admins"(username);
CREATE INDEX idx_admins_role ON public."Admins"(role);
CREATE INDEX idx_admins_status ON public."Admins"(status);

-- Owners indexes
CREATE INDEX idx_owners_email ON public."Owners"(email);
CREATE INDEX idx_owners_username ON public."Owners"(username);
CREATE INDEX idx_owners_status ON public."Owners"(status);

-- Requests indexes
CREATE INDEX idx_requests_owner_id ON public."Requests"(owner_id);
CREATE INDEX idx_requests_category_id ON public."Requests"(category_id);
CREATE INDEX idx_requests_tracking_code ON public."Requests"(tracking_code);
CREATE INDEX idx_requests_status ON public."Requests"(status);
CREATE INDEX idx_requests_processed_by ON public."Requests"(processed_by);
CREATE INDEX idx_requests_date_requested ON public."Requests"(date_requested DESC);
CREATE INDEX idx_requests_created_at ON public."Requests"(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_request_id ON public."Payments"(request_id);
CREATE INDEX idx_payments_status ON public."Payments"(status);
CREATE INDEX idx_payments_processed_by ON public."Payments"(processed_by);
CREATE INDEX idx_payments_receipt_number ON public."Payments"(receipt_number);
CREATE INDEX idx_payments_created_at ON public."Payments"(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_type_id ON public."Notifications"(user_type, user_id);
CREATE INDEX idx_notifications_status ON public."Notifications"(status);
CREATE INDEX idx_notifications_request_id ON public."Notifications"(request_id);
CREATE INDEX idx_notifications_payment_id ON public."Notifications"(payment_id);
CREATE INDEX idx_notifications_created_at ON public."Notifications"(created_at DESC);

-- Request Form Data indexes
CREATE INDEX idx_request_form_data_request_id ON public."Request Form Data"(request_id);
CREATE INDEX idx_request_form_data_form_id ON public."Request Form Data"(form_id);

-- Request Attachments indexes
CREATE INDEX idx_request_attachments_request_id ON public."Request Attachments"(request_id);

-- Document Forms indexes
CREATE INDEX idx_document_forms_category_id ON public."Document Forms"(category_id);
CREATE INDEX idx_document_forms_group_id ON public."Document Forms"(group_id);
CREATE INDEX idx_document_forms_field_order ON public."Document Forms"(field_order);

-- Assigned Roles indexes
CREATE INDEX idx_assigned_roles_category_id ON public."Assigned Roles"(category_id);
CREATE INDEX idx_assigned_roles_admin_id ON public."Assigned Roles"(admin_id);

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_user_type_id ON public."Activity_Logs"(user_type, user_id);
CREATE INDEX idx_activity_logs_action ON public."Activity_Logs"(action);
CREATE INDEX idx_activity_logs_created_at ON public."Activity_Logs"(created_at DESC);

-- =====================================================
-- CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for Requests table
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON public."Requests"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Payments table
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public."Payments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================
-- Uncomment if you want to enable RLS for security

-- ALTER TABLE public."Admins" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Owners" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Requests" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Payments" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public."Notifications" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant permissions to authenticated users (adjust as needed)

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- =====================================================
-- DATABASE MIGRATION COMPLETE
-- =====================================================
-- Schema Version: 2.0 (Over-the-Counter Payment Model)
-- Migration Date: 2025-10-24
-- Total Tables: 19 (removed 4 legacy tables)
-- Key Changes:
--   - Removed: System_Settings, SLA_Breaches, Notification_Templates, Blacklist
--   - Simplified Payments table (removed online payment fields)
--   - Simplified Requests table (removed SLA tracking fields)
--   - Consolidated created_by/verified_by into processed_by
-- =====================================================
