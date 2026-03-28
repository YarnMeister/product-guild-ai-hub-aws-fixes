-- Migration 006: Populate is_required fields based on content index
--
-- This migration populates the is_required boolean fields in lessons and side_quests
-- tables based on the content defined in public/content-index.json
--
-- Lessons: All lessons are required (they unlock ranks)
-- Challenges: Only specific challenges are required for rank progression
--
-- This migration is idempotent and can be run multiple times safely.

--> statement-breakpoint
UPDATE "lessons" SET "is_required" = true;
--> statement-breakpoint
UPDATE "side_quests"
SET "is_required" = true
WHERE "title" IN (
  '30-Minute Prototype',
  'Insight in One Hour'
);
--> statement-breakpoint
UPDATE "side_quests"
SET "is_required" = false
WHERE "title" NOT IN (
  '30-Minute Prototype',
  'Insight in One Hour'
);

