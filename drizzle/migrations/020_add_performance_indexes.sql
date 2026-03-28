-- Migration 020: Add performance indexes to core legacy tables
-- user_lesson_progress, user_badges, and analytics_events lack indexes
-- on the columns used in hot-path queries (user_id, user_uuid, lesson_id, event_type).

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_lesson_progress_user_id_idx" ON "user_lesson_progress" ("user_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_lesson_progress_user_uuid_idx" ON "user_lesson_progress" ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_lesson_progress_lesson_id_idx" ON "user_lesson_progress" ("lesson_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_badges_user_id_idx" ON "user_badges" ("user_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_badges_user_uuid_idx" ON "user_badges" ("user_uuid");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_user_id_idx" ON "analytics_events" ("user_id");

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_event_type_idx" ON "analytics_events" ("event_type");

