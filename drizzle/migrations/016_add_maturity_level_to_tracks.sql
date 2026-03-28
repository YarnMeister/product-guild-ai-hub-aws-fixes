-- Migration 016: Add maturity_level and rank_label to tracks table
-- Each track has a fixed maturity level (rank) unlocked by completing it.

--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "maturity_level" INTEGER NOT NULL DEFAULT 2;

--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "rank_label" TEXT NOT NULL DEFAULT 'AI Collaborator';

--> statement-breakpoint
UPDATE "tracks" SET "maturity_level" = 2, "rank_label" = 'AI Collaborator' WHERE "id" = 'prototyping';

--> statement-breakpoint
UPDATE "tracks" SET "maturity_level" = 2, "rank_label" = 'AI Collaborator' WHERE "id" = 'ai-workbench';

--> statement-breakpoint
UPDATE "tracks" SET "maturity_level" = 3, "rank_label" = 'AI Integrator' WHERE "id" = 'productivity';

--> statement-breakpoint
UPDATE "tracks" SET "maturity_level" = 4, "rank_label" = 'AI Builder' WHERE "id" = 'hosting';

--> statement-breakpoint
UPDATE "tracks" SET "maturity_level" = 5, "rank_label" = 'AI Architect' WHERE "id" = 'measurement';

