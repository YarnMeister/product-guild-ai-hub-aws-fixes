#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifyIsRequired() {
  console.log('🔍 Verifying is_required fields...\n');

  try {
    // Check lessons
    const lessons = await sql`SELECT title, is_required FROM lessons ORDER BY id`;
    console.log('=== LESSONS ===');
    lessons.forEach(l => {
      const status = l.is_required ? '✓ Required' : '✗ Not Required';
      console.log(`${status}: ${l.title}`);
    });

    // Check challenges
    const challenges = await sql`SELECT title, is_required FROM side_quests ORDER BY id`;
    console.log('\n=== CHALLENGES (SIDE QUESTS) ===');
    challenges.forEach(c => {
      const status = c.is_required ? '✓ Required' : '✗ Not Required';
      console.log(`${status}: ${c.title}`);
    });

    // Verify expected values
    console.log('\n=== VERIFICATION ===');

    // Verify all lessons are required
    const allLessonsRequired = lessons.every(l => l.is_required === true);
    console.log(`All lessons required: ${allLessonsRequired ? '✓ PASS' : '✗ FAIL'}`);

    // Verify required challenges
    const requiredChallenges = challenges.filter(c => c.is_required);
    const expectedRequired = ['30-Minute Prototype'];
    const hasCorrectRequired = expectedRequired.every(title =>
      requiredChallenges.some(c => c.title === title)
    ) && requiredChallenges.length === expectedRequired.length;
    console.log(`Required challenges correct: ${hasCorrectRequired ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Expected: ${expectedRequired.join(', ')}`);
    console.log(`  Found: ${requiredChallenges.map(c => c.title).join(', ')}`);

    const notRequiredChallenges = challenges.filter(c => !c.is_required);
    console.log(`\nNot required challenges: ${notRequiredChallenges.length}`);

    if (allLessonsRequired && hasCorrectRequired) {
      console.log('\n✅ All verifications passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some verifications failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyIsRequired();

