-- SQL Script to Update Notifications Table with Proper Relationships
-- This script adds proper foreign key constraints and improves the schema

-- Step 1: Add new columns for specific user references
ALTER TABLE public."Notifications"
ADD COLUMN IF NOT EXISTS admin_id integer,
ADD COLUMN IF NOT EXISTS owner_id integer;

-- Step 2: Migrate existing data from user_id to appropriate column
-- For Admin type users (Main Admin and Processor)
UPDATE public."Notifications"
SET admin_id = user_id
WHERE user_type = 'Admin' AND admin_id IS NULL;

-- For User type users (Owners)
UPDATE public."Notifications"
SET owner_id = user_id
WHERE user_type = 'User' AND owner_id IS NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_admin_id_fkey"
  FOREIGN KEY (admin_id) REFERENCES public."Admins"(admin_id) ON DELETE CASCADE,
ADD CONSTRAINT "Notifications_owner_id_fkey"
  FOREIGN KEY (owner_id) REFERENCES public."Owners"(owner_id) ON DELETE CASCADE;

-- Step 4: Add CHECK constraint to ensure only one user type is set
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_user_check"
  CHECK (
    (admin_id IS NOT NULL AND owner_id IS NULL) OR
    (admin_id IS NULL AND owner_id IS NOT NULL)
  );

-- Step 5: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public."Notifications"(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON public."Notifications"(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public."Notifications"(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public."Notifications"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_request_id ON public."Notifications"(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_payment_id ON public."Notifications"(payment_id);

-- Step 6 (Optional): You can drop user_id and user_type columns after migration
-- Uncomment these lines only after updating backend code to use admin_id/owner_id
-- ALTER TABLE public."Notifications" DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public."Notifications" DROP COLUMN IF EXISTS user_type;

-- Final updated schema for reference:
COMMENT ON TABLE public."Notifications" IS 'Stores system notifications for admins and owners';
COMMENT ON COLUMN public."Notifications".admin_id IS 'References Admins table for admin/processor notifications';
COMMENT ON COLUMN public."Notifications".owner_id IS 'References Owners table for user/owner notifications';
COMMENT ON COLUMN public."Notifications".request_id IS 'References Requests table when notification is about a request';
COMMENT ON COLUMN public."Notifications".payment_id IS 'References Payments table when notification is about a payment';
COMMENT ON COLUMN public."Notifications".status IS 'Notification status: Pending, Read, Sent, Failed';
