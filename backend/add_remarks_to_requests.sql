-- ============================================
-- Add Remarks Column to Requests Table
-- ============================================
-- Run this SQL statement in your Supabase SQL Editor to add remarks column

-- Add remarks column if it doesn't exist
ALTER TABLE "Requests"
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Verify the column was added
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'Requests';
