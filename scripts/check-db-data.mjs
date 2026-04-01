#!/usr/bin/env node
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function checkData() {
  try {
    console.log('=== LESSONS ===');
    const lessons = await sql`SELECT id, title, is_required FROM lessons ORDER BY id`;
    console.log(`Found ${lessons.length} lessons:`);
    lessons.forEach(l => {
      console.log(`  ${l.id}: ${l.title} (is_required: ${l.is_required})`);
    });

    console.log('\n=== CHALLENGES (SIDE QUESTS) ===');
    const challenges = await sql`SELECT id, title, is_required FROM side_quests ORDER BY id`;
    console.log(`Found ${challenges.length} challenges:`);
    challenges.forEach(c => {
      console.log(`  ${c.id}: ${c.title} (is_required: ${c.is_required})`);
    });

    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
    process.exit(1);
  }
}

checkData();

