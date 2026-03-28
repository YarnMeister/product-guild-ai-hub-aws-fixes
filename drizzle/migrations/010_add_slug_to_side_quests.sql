-- Migration 010: Add slug column to side_quests table
-- This adds a unique slug identifier for frontend challenge lookups
-- The slug will store the frontend ID (e.g., "30-minute-prototype")

--> statement-breakpoint
ALTER TABLE "side_quests" ADD COLUMN "slug" VARCHAR(255);

--> statement-breakpoint
ALTER TABLE "side_quests" ADD CONSTRAINT "side_quests_slug_unique" UNIQUE("slug");

