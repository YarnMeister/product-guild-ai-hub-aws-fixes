-- Migration 012: Add coordinator tables
-- Adds learner_profiles, learning_paths, learning_path_items,
-- content_demand_signals, and path_events tables.
-- user_uuid columns reference the uuid added by Wave 1 migration (011)
-- but no FK constraint to users.id since the PK swap is not complete yet.

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"lobby_input_text" text,
	"profile_json" jsonb NOT NULL,
	"confidence" numeric(4, 3),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"generated_at" timestamp DEFAULT now(),
	"archived_at" timestamp
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_path_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path_id" uuid NOT NULL,
	"content_id" TEXT,
	"content_type" text NOT NULL,
	"sequence_order" integer NOT NULL,
	"is_pre_completed" boolean DEFAULT false,
	"rationale" text,
	"completed_at" TIMESTAMP,
	FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_demand_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"track" text NOT NULL,
	"notified_at" timestamp DEFAULT now()
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "path_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path_id" uuid,
	"user_uuid" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"occurred_at" timestamp DEFAULT now(),
	FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id")
);

--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_uuid_unique" UNIQUE ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learner_profiles_user_uuid_idx" ON "learner_profiles" ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_paths_user_uuid_idx" ON "learning_paths" ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_paths_status_idx" ON "learning_paths" ("status");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learning_path_items_path_id_idx" ON "learning_path_items" ("path_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_demand_signals_user_uuid_idx" ON "content_demand_signals" ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "path_events_path_id_idx" ON "path_events" ("path_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "path_events_user_uuid_idx" ON "path_events" ("user_uuid");

