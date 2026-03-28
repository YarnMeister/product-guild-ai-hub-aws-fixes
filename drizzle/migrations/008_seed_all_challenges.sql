-- Migration 008: Seed all 15 challenges and fix is_required flags
-- This migration ensures all challenges from content-index.json exist in the database
-- and have correct is_required and required_rank values

-- Insert all 15 challenges (idempotent - skip if title already exists)
INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT '30-Minute Prototype', 'Design and deploy a working prototype within 30 minutes using AI-assisted tools.', 1, 0, true
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = '30-Minute Prototype');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Structured Hypothesis Builder', 'Convert an ambiguous problem statement into a structured, testable hypothesis using AI.', 1, 0, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Structured Hypothesis Builder');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Insight in One Hour', 'Use AI to synthesize research inputs into a clear summary with key themes in under 60 minutes.', 1, 1, true
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Insight in One Hour');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Clarity Refactor', 'Use AI to improve the clarity and structure of an existing document without changing its intent.', 2, 1, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Clarity Refactor');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Prompt Architect', 'Design a reusable prompt framework that consistently generates high-quality outputs.', 2, 1, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Prompt Architect');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Same-Day Validation', 'Formulate a hypothesis, design an experiment, and gather directional signal within a single day.', 2, 1, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Same-Day Validation');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Signal Extractor', 'Distill a long research artifact into concise insights, separating signal from noise.', 2, 1, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Signal Extractor');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Workflow Automator', 'Create a lightweight AI-assisted workflow that removes at least one manual step from your process.', 2, 2, true
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Workflow Automator');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Decision Driver', 'Use AI-generated evidence to influence a real team decision.', 3, 2, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Decision Driver');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Experiment Template Builder', 'Develop a repeatable template for running structured experiments using AI.', 3, 2, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Experiment Template Builder');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Cross-Tool Explorer', 'Apply AI tools across at least two different contexts (e.g., research + prototyping).', 2, 3, true
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Cross-Tool Explorer');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Metric Designer', 'Define clear success metrics for an experiment and align stakeholders around them.', 2, 3, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Metric Designer');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Experiment Evangelist', 'Share a documented AI-assisted experiment with your team and drive adoption.', 3, 3, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Experiment Evangelist');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'Context Switcher', 'Use AI to solve the same problem from two different functional perspectives.', 3, 4, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'Context Switcher');
-->  statement-breakpoint

INSERT INTO side_quests (title, description, difficulty, required_rank, is_required)
SELECT 'End-to-End Operator', 'Execute the full experimentation cycle — from research to evaluation — independently.', 3, 4, false
WHERE NOT EXISTS (SELECT 1 FROM side_quests WHERE title = 'End-to-End Operator');
-->  statement-breakpoint

-- Update is_required and required_rank for all challenges to match content-index.json
-- This overrides any incorrect values from previous migrations
UPDATE side_quests SET is_required = true, required_rank = 0 WHERE title = '30-Minute Prototype';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 0 WHERE title = 'Structured Hypothesis Builder';
-->  statement-breakpoint

UPDATE side_quests SET is_required = true, required_rank = 1 WHERE title = 'Insight in One Hour';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 1 WHERE title = 'Clarity Refactor';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 1 WHERE title = 'Prompt Architect';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 1 WHERE title = 'Same-Day Validation';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 1 WHERE title = 'Signal Extractor';
-->  statement-breakpoint

UPDATE side_quests SET is_required = true, required_rank = 2 WHERE title = 'Workflow Automator';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 2 WHERE title = 'Decision Driver';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 2 WHERE title = 'Experiment Template Builder';
-->  statement-breakpoint

UPDATE side_quests SET is_required = true, required_rank = 3 WHERE title = 'Cross-Tool Explorer';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 3 WHERE title = 'Metric Designer';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 3 WHERE title = 'Experiment Evangelist';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 4 WHERE title = 'Context Switcher';
-->  statement-breakpoint

UPDATE side_quests SET is_required = false, required_rank = 4 WHERE title = 'End-to-End Operator';

