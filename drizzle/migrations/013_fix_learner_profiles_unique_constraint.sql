-- Migration 013: Fix missing unique constraint on learner_profiles.user_uuid
-- 
-- Root cause: Migration 012 created the table and then added the UNIQUE constraint
-- in a separate statement. If the table already existed (IF NOT EXISTS was a no-op),
-- the ALTER TABLE ADD CONSTRAINT may have been skipped or failed silently, leaving
-- the table without a UNIQUE constraint on user_uuid.
--
-- Without this constraint, the ON CONFLICT ("user_uuid") DO UPDATE upsert in
-- _api/coordinator/profile.ts throws error 42P10:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"

--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'learner_profiles_user_uuid_unique'
      AND conrelid = 'learner_profiles'::regclass
  ) THEN
    ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_uuid_unique" UNIQUE ("user_uuid");
  END IF;
END $$;
