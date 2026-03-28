-- Migration 014: Add missing completed_at column to learning_path_items
--
-- Root cause: Migration 012 used CREATE TABLE IF NOT EXISTS. The table
-- already existed without this column, so the CREATE was a no-op and
-- completed_at was never added. This caused error 42703 on any INSERT
-- into learning_path_items from _api/coordinator/generate-path.ts.

--> statement-breakpoint
ALTER TABLE "learning_path_items" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP;
