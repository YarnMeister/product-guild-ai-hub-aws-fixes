-- Migration 009: Add unique constraints on title columns
-- This enables ON CONFLICT upserts in the sync script

--> statement-breakpoint
ALTER TABLE "side_quests" ADD CONSTRAINT "side_quests_title_unique" UNIQUE("title");

