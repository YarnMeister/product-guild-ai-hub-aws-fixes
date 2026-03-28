-- Migration 016: Drop is_unlocked column from track_progress
-- Unlock state is now computed dynamically from completedAt on prerequisite tracks.

--> statement-breakpoint
ALTER TABLE "track_progress" DROP COLUMN IF EXISTS "is_unlocked";

