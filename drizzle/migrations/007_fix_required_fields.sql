-- Migration 007: Fix required fields and populate unlocks_rank/required_rank
--
-- This migration corrects data mismatches from migration 006:
-- 1. Populates lessons.unlocks_rank from content-index.json
-- 2. Populates side_quests.required_rank from content-index.json
-- 3. Fixes "Insight in One Hour" to is_required=false (was incorrectly set to true)
--
-- This migration is idempotent and can be run multiple times safely.

--> statement-breakpoint
-- Update lessons.unlocks_rank based on content-index.json
UPDATE "lessons"
SET "unlocks_rank" = 1
WHERE "title" = 'Prototyping with Figma';

--> statement-breakpoint
UPDATE "lessons"
SET "unlocks_rank" = 2
WHERE "title" = 'AI Workbench';

--> statement-breakpoint
UPDATE "lessons"
SET "unlocks_rank" = 3
WHERE "title" = 'AI Evaluations';

--> statement-breakpoint
UPDATE "lessons"
SET "unlocks_rank" = 4
WHERE "title" = 'MCP Connections';

--> statement-breakpoint
-- Update side_quests.required_rank based on content-index.json
UPDATE "side_quests"
SET "required_rank" = 0
WHERE "title" IN (
  '30-Minute Prototype',
  'Structured Hypothesis Builder'
);

--> statement-breakpoint
UPDATE "side_quests"
SET "required_rank" = 1
WHERE "title" IN (
  'Insight in One Hour',
  'Clarity Refactor',
  'Prompt Architect',
  'Same-Day Validation',
  'Signal Extractor'
);

--> statement-breakpoint
UPDATE "side_quests"
SET "required_rank" = 2
WHERE "title" IN (
  'Workflow Automator',
  'Decision Driver',
  'Experiment Template Builder'
);

--> statement-breakpoint
UPDATE "side_quests"
SET "required_rank" = 3
WHERE "title" IN (
  'Cross-Tool Explorer',
  'Metric Designer',
  'Experiment Evangelist'
);

--> statement-breakpoint
UPDATE "side_quests"
SET "required_rank" = 4
WHERE "title" IN (
  'Context Switcher',
  'End-to-End Operator'
);

--> statement-breakpoint
-- Fix "Insight in One Hour" to is_required=false (was incorrectly set to true in migration 006)
UPDATE "side_quests"
SET "is_required" = false
WHERE "title" = 'Insight in One Hour';

