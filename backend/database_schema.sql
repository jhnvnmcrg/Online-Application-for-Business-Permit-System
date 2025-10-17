-- ============================================
-- OABP Database Schema - Requests System
-- ============================================
-- Run these SQL statements in your Supabase SQL Editor

-- ============================================
-- 1. REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Requests" (
    request_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES "Owners"(owner_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES "Document Categories"(category_id) ON DELETE CASCADE,
    tracking_code VARCHAR(50) UNIQUE NOT NULL,
    date_requested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_release TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Approved', 'Rejected', 'Released')),
    processed_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_requests_owner ON "Requests"(owner_id);
CREATE INDEX idx_requests_category ON "Requests"(category_id);
CREATE INDEX idx_requests_tracking ON "Requests"(tracking_code);
CREATE INDEX idx_requests_status ON "Requests"(status);
CREATE INDEX idx_requests_processed_by ON "Requests"(processed_by);

-- ============================================
-- 2. REQUEST FORM DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Request Form Data" (
    data_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES "Requests"(request_id) ON DELETE CASCADE,
    form_id INTEGER NOT NULL REFERENCES "Document Forms"(form_id) ON DELETE CASCADE,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_request_form_data_request ON "Request Form Data"(request_id);
CREATE INDEX idx_request_form_data_form ON "Request Form Data"(form_id);

-- ============================================
-- 3. REQUEST HISTORY TABLE (Optional - for tracking status changes)
-- ============================================
CREATE TABLE IF NOT EXISTS "Request History" (
    history_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES "Requests"(request_id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_request_history_request ON "Request History"(request_id);

-- ============================================
-- 4. TRACKING CODE SEQUENCE
-- ============================================
-- Create a sequence for tracking code generation
CREATE SEQUENCE IF NOT EXISTS tracking_code_seq START 1;

-- ============================================
-- 5. FUNCTION TO GENERATE TRACKING CODE
-- ============================================
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_part TEXT;
    tracking_code TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    seq_part := LPAD(nextval('tracking_code_seq')::TEXT, 5, '0');
    tracking_code := 'OABP-' || year_part || '-' || seq_part;
    RETURN tracking_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGER TO AUTO-GENERATE TRACKING CODE
-- ============================================
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
        NEW.tracking_code := generate_tracking_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_requests
BEFORE INSERT ON "Requests"
FOR EACH ROW
EXECUTE FUNCTION set_tracking_code();

-- ============================================
-- 7. GRANT PERMISSIONS (adjust as needed for your setup)
-- ============================================
-- Grant access to authenticated users
-- ALTER TABLE "Requests" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Request Form Data" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Request History" ENABLE ROW LEVEL SECURITY;

-- Note: Configure Row Level Security policies based on your security requirements
