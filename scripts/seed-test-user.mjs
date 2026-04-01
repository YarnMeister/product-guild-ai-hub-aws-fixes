#!/usr/bin/env node
/*
  TEST USER SEED SCRIPT
  - Creates/updates permanent test user account
  - Seeds side quests if needed
  - Adds lesson progress and badges
  - Password read from process.env.TEST_USER
*/

import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;

// Safety guard: refuse to run in production or against a non-dev Neon database
if (NODE_ENV === 'production') {
  console.error('❌ This script cannot run in production (NODE_ENV=production). Aborting.');
  process.exit(1);
}
if (DATABASE_URL && DATABASE_URL.includes('neon.tech') && NODE_ENV !== 'development') {
  console.error('❌ DATABASE_URL points to neon.tech but NODE_ENV is not "development". Set NODE_ENV=development to proceed. Aborting.');
  process.exit(1);
}

const TEST_PASSWORD = process.env.TEST_USER;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

if (!TEST_PASSWORD) {
  console.error('❌ TEST_USER environment variable required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function seedLessons() {
  log('Checking lessons table...');

  const existingLessons = await sql`SELECT COUNT(*) as count FROM lessons`;

  if (existingLessons[0].count > 0) {
    log(`✓ Lessons already exist (${existingLessons[0].count} lessons)`);
    return;
  }

  log('Seeding lessons table...');

  // Insert the 4 golden path lessons
  await sql`
    INSERT INTO lessons (id, title, description, estimated_time)
    VALUES
      (1, 'Prototyping with Figma', 'Learn to create high-fidelity prototypes using AI-assisted design tools in Figma.', 60),
      (2, 'AI Workbench', 'Discover how to leverage AI workbench tools to accelerate your workflow.', 60),
      (3, 'AI Evaluations', 'Learn to design rigorous experiments and measure the impact of AI-assisted workflows.', 60),
      (4, 'MCP Connections', 'Master MCP (Model Context Protocol) connections to integrate AI seamlessly into your workflows.', 60)
  `;

  log('✓ Lessons seeded');
}

async function seedSideQuests() {
  log('Checking side_quests table...');

  const existingQuests = await sql`SELECT COUNT(*) as count FROM side_quests`;

  if (existingQuests[0].count > 0) {
    log(`✓ Side quests already exist (${existingQuests[0].count} quests)`);

    // Update is_required flags for existing quests
    log('Updating is_required flags...');
    await sql`
      UPDATE side_quests
      SET is_required = true
      WHERE title = '30-Minute Prototype'
    `;
    await sql`
      UPDATE side_quests
      SET is_required = false
      WHERE title = 'Structured Hypothesis Builder'
    `;
    log('✓ is_required flags updated');
    return;
  }

  log('Seeding side_quests table...');

  // Insert the 2 side quests for rank 0
  // "30-Minute Prototype" is required for rank unlock
  await sql`
    INSERT INTO side_quests (title, description, difficulty, is_required)
    VALUES
      ('30-Minute Prototype', 'Design and deploy a working prototype within 30 minutes using AI-assisted tools.', '1', true),
      ('Structured Hypothesis Builder', 'Convert an ambiguous problem statement into a structured, testable hypothesis using AI.', '1', false)
  `;

  log('✓ Side quests seeded');
}

async function seedTestUser() {
  log('Creating/updating test user...');

  const passwordHash = await hashPassword(TEST_PASSWORD);

  // Upsert test user - start at Rank 0
  const result = await sql`
    INSERT INTO users (email, password_hash, name, current_rank)
    VALUES ('test@rea-group.com', ${passwordHash}, 'Test User', 0)
    ON CONFLICT (email) DO UPDATE SET
      current_rank = 0,
      name = 'Test User',
      password_hash = EXCLUDED.password_hash
    RETURNING id, uuid
  `;

  const userId = result[0].id;
  const userUuid = result[0].uuid;
  log(`✓ Test user created/updated (ID: ${userId}, UUID: ${userUuid}, Rank: 0)`);

  // Clear existing progress for clean state
  log('Clearing existing progress...');
  await sql`DELETE FROM user_badges WHERE user_id = ${userId}`;
  await sql`DELETE FROM user_lesson_progress WHERE user_id = ${userId}`;
  log('✓ Existing progress cleared');

  return { userId, userUuid };
}



async function seedChallengeCompletion(userId, userUuid) {
  log('Completing Rank 0 required challenge...');

  // Complete only the required challenge: "30-Minute Prototype"
  // Write both user_id (integer, backward compat) and user_uuid (new authoritative ID)
  await sql`
    INSERT INTO user_badges (user_id, user_uuid, side_quest_id)
    SELECT ${userId}, ${userUuid}, id FROM side_quests
    WHERE title = '30-Minute Prototype'
    ON CONFLICT DO NOTHING
  `;

  log('✓ Challenge "30-Minute Prototype" completed (badge earned)');
}

async function unlockRank(userId) {
  log('Checking rank unlock...');

  // After completing the required Rank 0 challenge, user should unlock Rank 1
  // This simulates the rank unlock logic from checkRankUnlock
  await sql`
    UPDATE users
    SET current_rank = 1
    WHERE id = ${userId} AND current_rank = 0
  `;

  log('✓ Rank 1 unlocked (required Rank 0 challenge completed)');
}

async function main() {
  log('🌱 Starting test user seed...');

  try {
    // Step 1: Seed lessons if needed
    await seedLessons();

    // Step 2: Seed side quests if needed (with is_required flags)
    await seedSideQuests();

    // Step 3: Create/update test user (starts at Rank 0)
    const { userId, userUuid } = await seedTestUser();

    // Step 4: Complete Rank 0 required challenge
    await seedChallengeCompletion(userId, userUuid);

    // Step 5: Unlock Rank 1 (via rank unlock logic)
    await unlockRank(userId);

    log('✅ Test user seed complete!');
    log('');
    log('Test user credentials:');
    log('  Email: test@rea-group.com');
    log('  Password: (from TEST_USER env variable)');
    log('  Current Rank: 1 (unlocked via required challenge)');
    log('  Challenges completed: 1 ("30-Minute Prototype")');
    log('  Badges earned: 1');
    log('  Lesson 1: Accessible (Rank 1 unlocked)');
    log('  Rank 2+: Locked (no Rank 1 requirements completed)');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
}

main();

