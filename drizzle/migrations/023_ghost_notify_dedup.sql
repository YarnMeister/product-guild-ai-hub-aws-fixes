-- Migration 023: Deduplication constraint on content_demand_signals
-- The ghost-notify endpoint (POST /api/coordinator/ghost-notify) records demand signals
-- whenever a user clicks "Notify Me" for a ghost track card.  Without a unique constraint
-- a user can accumulate duplicate rows for the same (user_uuid, track) pair across sessions.
-- This migration removes any existing duplicates (keeping the earliest record) and then
-- adds a unique constraint so future inserts are idempotent via ON CONFLICT DO NOTHING.

--> statement-breakpoint
DELETE FROM "content_demand_signals"
WHERE "id" NOT IN (
  SELECT DISTINCT ON ("user_uuid", "track") "id"
  FROM "content_demand_signals"
  ORDER BY "user_uuid", "track", "notified_at" ASC
);

--> statement-breakpoint
ALTER TABLE "content_demand_signals"
  ADD CONSTRAINT "content_demand_signals_user_uuid_track_unique"
  UNIQUE ("user_uuid", "track");

