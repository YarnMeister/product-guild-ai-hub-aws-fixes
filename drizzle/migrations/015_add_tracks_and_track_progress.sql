-- Migration 015: Add tracks and track_progress tables; add track_id to lessons and side_quests

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracks" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "prerequisite_track_ids" text[] NOT NULL DEFAULT '{}',
  "sort_order" integer NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "track_id" text NOT NULL REFERENCES "tracks"("id"),
  "is_unlocked" boolean NOT NULL DEFAULT false,
  "completed_at" timestamp,
  CONSTRAINT "track_progress_user_id_track_id_unique" UNIQUE("user_id", "track_id")
);

--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "track_id" text REFERENCES "tracks"("id");

--> statement-breakpoint
ALTER TABLE "side_quests" ADD COLUMN IF NOT EXISTS "track_id" text REFERENCES "tracks"("id");

