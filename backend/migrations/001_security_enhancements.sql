-- ==============================================================================
-- MIGRATION: Security and Performance Enhancements
-- Date: 2025-10-28
-- Description: Add indexes, unique constraints, cascade rules, and new tables
-- ==============================================================================

-- ==============================================================================
-- PART 1: ADD PERFORMANCE INDEXES
-- ==============================================================================

-- Indexes for Requests table (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_requests_owner_id ON "Requests"(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON "Requests"(status);
CREATE INDEX IF NOT EXISTS idx_requests_tracking_code ON "Requests"(tracking_code);
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON "Requests"(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_processed_by ON "Requests"(processed_by);
CREATE INDEX IF NOT EXISTS idx_requests_date_requested ON "Requests"(date_requested);

-- Indexes for Payments table
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON "Payments"(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON "Payments"(status);
CREATE INDEX IF NOT EXISTS idx_payments_processed_by ON "Payments"(processed_by);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON "Payments"(payment_date);

-- Indexes for Notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON "Notifications"(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON "Notifications"(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON "Notifications"(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON "Notifications"(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_request_id ON "Notifications"(request_id);

-- Indexes for Assigned Roles table
CREATE INDEX IF NOT EXISTS idx_assigned_roles_admin_id ON "Assigned Roles"(admin_id);
CREATE INDEX IF NOT EXISTS idx_assigned_roles_category_id ON "Assigned Roles"(category_id);

-- Indexes for Admins table
CREATE INDEX IF NOT EXISTS idx_admins_email ON "Admins"(email);
CREATE INDEX IF NOT EXISTS idx_admins_username ON "Admins"(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON "Admins"(role);
CREATE INDEX IF NOT EXISTS idx_admins_status ON "Admins"(status);

-- Indexes for Owners table
CREATE INDEX IF NOT EXISTS idx_owners_email ON "Owners"(email);
CREATE INDEX IF NOT EXISTS idx_owners_username ON "Owners"(username);
CREATE INDEX IF NOT EXISTS idx_owners_status ON "Owners"(status);

-- Indexes for Request Form Data
CREATE INDEX IF NOT EXISTS idx_request_form_data_request_id ON "Request Form Data"(request_id);
CREATE INDEX IF NOT EXISTS idx_request_form_data_form_id ON "Request Form Data"(form_id);

-- Indexes for Document Forms
CREATE INDEX IF NOT EXISTS idx_document_forms_category_id ON "Document Forms"(category_id);
CREATE INDEX IF NOT EXISTS idx_document_forms_group_id ON "Document Forms"(group_id);

-- Indexes for history tables
CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON "Request History"(request_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_id ON "Payment History"(payment_id);

-- ==============================================================================
-- PART 2: ADD UNIQUE CONSTRAINTS
-- ==============================================================================

-- Prevent duplicate processor assignments to same category
ALTER TABLE "Assigned Roles"
  DROP CONSTRAINT IF EXISTS unique_category_admin;

ALTER TABLE "Assigned Roles"
  ADD CONSTRAINT unique_category_admin UNIQUE (category_id, admin_id);

-- Ensure unique tracking codes (already exists but ensure it's there)
-- This should already be in place, but we check just in case

-- ==============================================================================
-- PART 3: ADD CASCADE DELETE RULES
-- ==============================================================================

-- Update Document Forms foreign keys to cascade
ALTER TABLE "Document Forms"
  DROP CONSTRAINT IF EXISTS "Document Forms_category_id_fkey";

ALTER TABLE "Document Forms"
  ADD CONSTRAINT "Document Forms_category_id_fkey"
    FOREIGN KEY (category_id)
    REFERENCES "Document Categories"(category_id)
    ON DELETE CASCADE;

-- Update Form Field Groups to cascade
ALTER TABLE "Form Field Groups"
  DROP CONSTRAINT IF EXISTS "Form Field Groups_category_id_fkey";

ALTER TABLE "Form Field Groups"
  ADD CONSTRAINT "Form Field Groups_category_id_fkey"
    FOREIGN KEY (category_id)
    REFERENCES "Document Categories"(category_id)
    ON DELETE CASCADE;

-- Update Form Field Options to cascade
ALTER TABLE "Form Field Options"
  DROP CONSTRAINT IF EXISTS "Form Field Options_form_id_fkey";

ALTER TABLE "Form Field Options"
  ADD CONSTRAINT "Form Field Options_form_id_fkey"
    FOREIGN KEY (form_id)
    REFERENCES "Document Forms"(form_id)
    ON DELETE CASCADE;

-- Update Document Forms group_id to cascade
ALTER TABLE "Document Forms"
  DROP CONSTRAINT IF EXISTS "Document Forms_group_id_fkey";

ALTER TABLE "Document Forms"
  ADD CONSTRAINT "Document Forms_group_id_fkey"
    FOREIGN KEY (group_id)
    REFERENCES "Form Field Groups"(group_id)
    ON DELETE SET NULL;

-- Update Assigned Roles to cascade
ALTER TABLE "Assigned Roles"
  DROP CONSTRAINT IF EXISTS "Assigned Roles_category_id_fkey";

ALTER TABLE "Assigned Roles"
  ADD CONSTRAINT "Assigned Roles_category_id_fkey"
    FOREIGN KEY (category_id)
    REFERENCES "Document Categories"(category_id)
    ON DELETE CASCADE;

-- Update Documents to cascade
ALTER TABLE "Documents"
  DROP CONSTRAINT IF EXISTS "Documents_category_id_fkey";

ALTER TABLE "Documents"
  ADD CONSTRAINT "Documents_category_id_fkey"
    FOREIGN KEY (category_id)
    REFERENCES "Document Categories"(category_id)
    ON DELETE CASCADE;

-- ==============================================================================
-- PART 4: ADD NEW FIELDS FOR EMAIL VERIFICATION AND PASSWORD RESET
-- ==============================================================================

-- Add email verification fields to Admins table
ALTER TABLE "Admins"
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token text,
  ADD COLUMN IF NOT EXISTS verification_token_expires timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reset_token text,
  ADD COLUMN IF NOT EXISTS reset_token_expires timestamp with time zone;

-- Add email verification fields to Owners table
ALTER TABLE "Owners"
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token text,
  ADD COLUMN IF NOT EXISTS verification_token_expires timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reset_token text,
  ADD COLUMN IF NOT EXISTS reset_token_expires timestamp with time zone;

-- ==============================================================================
-- PART 5: ADD SOFT DELETE SUPPORT
-- ==============================================================================

-- Add deleted_at column for soft deletes
ALTER TABLE "Document Categories"
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE "Documents"
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE "Requests"
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE "Admins"
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

ALTER TABLE "Owners"
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- ==============================================================================
-- PART 6: IMPROVE LOGIN AUDITS
-- ==============================================================================

-- Add owner_id and user_type to Login Audits
ALTER TABLE "Login Audits"
  ADD COLUMN IF NOT EXISTS owner_id bigint REFERENCES "Owners"(owner_id),
  ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('Admin', 'Owner'));

-- Add index for login audits
CREATE INDEX IF NOT EXISTS idx_login_audits_admin_id ON "Login Audits"(admin_id);
CREATE INDEX IF NOT EXISTS idx_login_audits_owner_id ON "Login Audits"(owner_id);
CREATE INDEX IF NOT EXISTS idx_login_audits_datetime ON "Login Audits"(login_datetime);

-- ==============================================================================
-- PART 7: CREATE EMAIL QUEUE TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "Email_Queue" (
  email_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
  retry_count int DEFAULT 0,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON "Email_Queue"(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON "Email_Queue"(created_at);

-- ==============================================================================
-- PART 8: CREATE ACTIVITY LOGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "Activity_Logs" (
  log_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_type text CHECK (user_type IN ('Admin', 'Processor', 'Owner')),
  user_id bigint NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id bigint,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_id ON "Activity_Logs"(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON "Activity_Logs"(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON "Activity_Logs"(entity_type, entity_id);

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================

-- To apply this migration, run it in your Supabase SQL editor or using psql:
-- psql -h <host> -U <user> -d <database> -f 001_security_enhancements.sql
