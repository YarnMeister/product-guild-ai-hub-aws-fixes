-- Migration 022: Add rank_earned to user_badges
-- Fixes issue #10: rankEarned in GET /api/progress returned current rank at query time,
-- not the user's rank at the time they earned the badge.
-- Backfill existing rows from users.current_rank (best-effort approximation).

--> statement-breakpoint
ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "rank_earned" integer;

--> statement-breakpoint
UPDATE "user_badges"
SET "rank_earned" = (
  SELECT "current_rank"
  FROM "users"
  WHERE "users"."id" = "user_badges"."user_id"
)
WHERE "rank_earned" IS NULL;

