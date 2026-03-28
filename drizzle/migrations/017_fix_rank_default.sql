--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "current_rank" SET DEFAULT 1;
--> statement-breakpoint
UPDATE "users" SET "current_rank" = 1 WHERE "current_rank" = 0 OR "current_rank" IS NULL;

