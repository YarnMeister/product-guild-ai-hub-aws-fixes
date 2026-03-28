-- Migration 021: Drop deprecated columns from lessons and side_quests
-- lessons.unlocks_rank — superseded by track-governed rank progression (maturity_level on tracks)
-- side_quests.required_rank — superseded by track lock enforcement (isTrackUnlocked in trackUnlock.ts)
-- NOTE: is_required is intentionally retained on both tables — it is still used by isTrackComplete().

--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "unlocks_rank";

--> statement-breakpoint
ALTER TABLE "side_quests" DROP COLUMN IF EXISTS "required_rank";

