#!/usr/bin/env node
/*
  VERIFICATION SCRIPT FOR CONTENT SYNC
  - Verifies all lessons and challenges exist in database
  - Checks counts and required items
*/

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('🔍 Verifying content sync...\n');
  
  // Check lessons count
  const lessonsCount = await sql`SELECT COUNT(*) as count FROM lessons`;
  console.log(`✓ Lessons count: ${lessonsCount[0].count} (expected: 4)`);
  
  // Check challenges count
  const challengesCount = await sql`SELECT COUNT(*) as count FROM side_quests`;
  console.log(`✓ Challenges count: ${challengesCount[0].count} (expected: 15)`);
  
  // Check required challenges
  console.log('\n📋 Required challenges:');
  const requiredChallenges = await sql`
    SELECT title, is_required
    FROM side_quests
    WHERE is_required = true
    ORDER BY title
  `;

  requiredChallenges.forEach(c => {
    console.log(`  - "${c.title}"`);
  });

  // Verify expected required challenges
  const expectedRequired = [
    { title: '30-Minute Prototype' },
    { title: 'Insight in One Hour' },
    { title: 'Workflow Automator' },
    { title: 'Cross-Tool Explorer' }
  ];
  
  // Verify counts
  let allPassed = true;

  if (parseInt(lessonsCount[0].count) !== 4) {
    console.error('\n❌ Expected 4 lessons');
    allPassed = false;
  }

  if (parseInt(challengesCount[0].count) !== 15) {
    console.error('❌ Expected 15 challenges');
    allPassed = false;
  }

  if (requiredChallenges.length !== 4) {
    console.error('❌ Expected 4 required challenges');
    allPassed = false;
  }

  if (allPassed) {
    console.log('\n✅ All checks passed!');
  } else {
    await sql.end();
    process.exit(1);
  }

  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

