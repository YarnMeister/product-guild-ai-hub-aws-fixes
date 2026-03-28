#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testDb() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Database connection successful!');
    console.log('   User count:', result[0].count);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testDb();
