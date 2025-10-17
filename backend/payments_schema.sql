-- ============================================
-- OABP Payments System - Database Schema
-- ============================================
-- Run these SQL statements in your Supabase SQL Editor

-- ============================================
-- 1. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Payments" (
    payment_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES "Requests"(request_id) ON DELETE CASCADE,

    -- Payment Details (Set by Admin)
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'Permit Fee',
    description TEXT,

    -- Payment Instructions (Set by Admin)
    receiver_name VARCHAR(255),
    receiver_number VARCHAR(50),
    receiver_account VARCHAR(255),
    payment_method VARCHAR(50),

    -- Payment Proof (Submitted by Owner)
    sender_number VARCHAR(50),
    reference_number VARCHAR(100),
    proof_payment TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Verified', 'Rejected')),

    -- Tracking
    created_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    verified_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    remarks TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_payments_request ON "Payments"(request_id);
CREATE INDEX idx_payments_status ON "Payments"(status);
CREATE INDEX idx_payments_created_by ON "Payments"(created_by);

-- ============================================
-- 2. PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Payment History" (
    history_id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES "Payments"(payment_id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES "Admins"(admin_id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_payment_history_payment ON "Payment History"(payment_id);

-- ============================================
-- 3. UPDATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON "Payments"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TRIGGER TO LOG PAYMENT STATUS CHANGES
-- ============================================
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO "Payment History" (payment_id, previous_status, new_status, changed_by, remarks)
        VALUES (NEW.payment_id, OLD.status, NEW.status, NEW.verified_by, NEW.remarks);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_status_change_trigger
AFTER UPDATE ON "Payments"
FOR EACH ROW
EXECUTE FUNCTION log_payment_status_change();

-- ============================================
-- 5. SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to add sample payment methods

-- INSERT INTO "Payment Methods" (method_name, is_active) VALUES
-- ('GCash', true),
-- ('PayMaya', true),
-- ('Bank Transfer', true),
-- ('Over the Counter', true);

-- ============================================
-- 6. GRANT PERMISSIONS (adjust as needed)
-- ============================================
-- Note: Configure Row Level Security policies based on your requirements
-- ALTER TABLE "Payments" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Payment History" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. USEFUL QUERIES
-- ============================================

-- Get all payments for a request
-- SELECT * FROM "Payments" WHERE request_id = 1;

-- Get payment history
-- SELECT ph.*, a.fullname as changed_by_name
-- FROM "Payment History" ph
-- LEFT JOIN "Admins" a ON ph.changed_by = a.admin_id
-- WHERE ph.payment_id = 1
-- ORDER BY ph.created_at DESC;

-- Get pending payments
-- SELECT p.*, r.tracking_code, o.fullname as owner_name
-- FROM "Payments" p
-- JOIN "Requests" r ON p.request_id = r.request_id
-- JOIN "Owners" o ON r.owner_id = o.owner_id
-- WHERE p.status = 'Pending';
