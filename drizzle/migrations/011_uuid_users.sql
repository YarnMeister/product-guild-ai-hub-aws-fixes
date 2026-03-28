-- Phase 1: Add UUID support alongside existing integer PKs
-- DO NOT drop integer id or user_id columns (Phase 2 task)

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "uuid" uuid;
--> statement-breakpoint
UPDATE "users" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "uuid" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_uuid_unique" UNIQUE ("uuid");
--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN IF NOT EXISTS "user_uuid" uuid REFERENCES "users"("uuid") ON DELETE CASCADE;
--> statement-breakpoint
UPDATE "user_lesson_progress" ulp SET "user_uuid" = u."uuid" FROM "users" u WHERE ulp."user_id" = u."id";
--> statement-breakpoint
ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "user_uuid" uuid REFERENCES "users"("uuid") ON DELETE CASCADE;
--> statement-breakpoint
UPDATE "user_badges" ub SET "user_uuid" = u."uuid" FROM "users" u WHERE ub."user_id" = u."id";
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "user_uuid" uuid REFERENCES "users"("uuid") ON DELETE SET NULL;
--> statement-breakpoint
UPDATE "analytics_events" ae SET "user_uuid" = u."uuid" FROM "users" u WHERE ae."user_id" = u."id";

