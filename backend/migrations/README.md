# Database Migrations

This directory contains SQL migration scripts for the OABP database.

## How to Apply Migrations

### Option 1: Supabase Dashboard
1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file (e.g., `001_security_enhancements.sql`)
4. Paste into the SQL Editor
5. Click "Run" to execute

### Option 2: psql Command Line
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f backend/migrations/001_security_enhancements.sql
```

### Option 3: Node.js Script
Create a script to run migrations programmatically using the Supabase client.

## Migration Files

### 001_security_enhancements.sql
**Purpose:** Security and performance improvements
**Includes:**
- Performance indexes for frequently queried tables
- Unique constraints to prevent duplicate data
- Cascade delete rules for referential integrity
- Email verification and password reset fields
- Soft delete support
- Email queue table for async email sending
- Activity logs table for audit trail

## Important Notes

1. **Backup First:** Always backup your database before running migrations
2. **Test in Development:** Apply migrations to a development environment first
3. **Read-Only Mode:** Consider enabling read-only mode during migration
4. **Check Dependencies:** Ensure all foreign key dependencies exist
5. **Monitor Performance:** Check query performance after adding indexes

## Rollback

If you need to rollback a migration, you can:
1. Drop the added indexes
2. Remove new columns
3. Restore from backup (for complex changes)

Example rollback for indexes:
```sql
DROP INDEX IF EXISTS idx_requests_owner_id;
DROP INDEX IF EXISTS idx_requests_status;
-- ... etc
```

## Verification

After applying migrations, verify:
```sql
-- Check indexes
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- Check constraints
SELECT conname, contype FROM pg_constraint WHERE connamespace = 'public'::regnamespace;

-- Check new columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Admins';
```
