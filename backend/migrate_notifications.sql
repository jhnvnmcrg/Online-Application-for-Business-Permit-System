-- Migration: Update Notifications table to use proper foreign keys
-- Run this in Supabase SQL Editor

-- Step 1: Add admin_id and owner_id columns
ALTER TABLE public."Notifications"
ADD COLUMN IF NOT EXISTS admin_id BIGINT,
ADD COLUMN IF NOT EXISTS owner_id BIGINT;

-- Step 2: Migrate existing data from user_id to appropriate column
-- For Admin users (includes Main Admin and Processor)
UPDATE public."Notifications"
SET admin_id = user_id
WHERE user_type = 'Admin' AND admin_id IS NULL;

-- For regular Users (Owners)
UPDATE public."Notifications"
SET owner_id = user_id
WHERE user_type = 'User' AND owner_id IS NULL;

-- Step 3: Add foreign key constraints
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_admin_id_fkey"
  FOREIGN KEY (admin_id) REFERENCES public."Admins"(admin_id) ON DELETE CASCADE;

ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_owner_id_fkey"
  FOREIGN KEY (owner_id) REFERENCES public."Owners"(owner_id) ON DELETE CASCADE;

-- Step 4: Add CHECK constraint to ensure only one user type is set
ALTER TABLE public."Notifications"
ADD CONSTRAINT "Notifications_user_check"
  CHECK (
    (admin_id IS NOT NULL AND owner_id IS NULL) OR
    (admin_id IS NULL AND owner_id IS NOT NULL)
  );

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public."Notifications"(admin_id) WHERE admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON public."Notifications"(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public."Notifications"(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public."Notifications"(created_at DESC);

-- Step 6 (OPTIONAL): Drop old columns after verifying everything works
-- UNCOMMENT THESE LINES ONLY AFTER TESTING:
-- ALTER TABLE public."Notifications" DROP COLUMN IF EXISTS user_type;
-- ALTER TABLE public."Notifications" DROP COLUMN IF EXISTS user_id;

-- Verify the migration
SELECT
  COUNT(*) as total_notifications,
  COUNT(admin_id) as admin_notifications,
  COUNT(owner_id) as owner_notifications
FROM public."Notifications";
