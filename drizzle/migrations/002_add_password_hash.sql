-- Migration 002: Add password_hash column to users table
--
-- PRECONDITION:
--   The users table must be empty. If it contains rows, this migration will
--   abort with an error so that no data is silently destroyed.
--
--   If you have existing users, do NOT run this migration as-is. Instead:
--     a) ALTER TABLE "users" ADD COLUMN "password_hash" text;        -- nullable
--     b) Deploy code that requires password_hash for new registrations
--     c) Implement a password-reset flow to backfill existing users
--     d) ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;

--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "users" LIMIT 1) THEN
    RAISE EXCEPTION 'Migration 002 requires the users table to be empty. Found existing rows. Aborting to prevent data loss. See migration comments for manual steps.';
  END IF;
END
$$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;
