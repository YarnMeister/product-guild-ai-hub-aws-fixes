#!/usr/bin/env node
/*
  BULLETPROOF MIGRATION RUNNER
  - Uses sql.begin() for true atomic migrations (postgres-js API)
  - Verifies success BEFORE marking complete
  - Uses SHA-256 content hashing
  - Idempotent: safe to re-run; already-applied migrations are skipped
*/

import postgres from 'postgres';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const MIGRATIONS_DIR = './drizzle/migrations';
const DRY_RUN = process.argv.includes('--dry-run');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function getMigrationTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS __app_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      hash TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

async function getExecutedMigrations() {
  const result = await sql`SELECT name FROM __app_migrations`;
  return new Set(result.map(r => r.name));
}

function parseSqlStatements(content) {
  return content
    .split(/-->\s*statement-breakpoint\s*/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}



async function runMigration(filename) {
  const filepath = join(MIGRATIONS_DIR, filename);
  const content = readFileSync(filepath, 'utf-8');
  const statements = parseSqlStatements(content);
  const name = filename.replace('.sql', '');
  const hash = hashContent(content);

  log(`\n→ ${name} (${statements.length} statements)`);

  if (DRY_RUN) {
    log(`  [DRY RUN] Would execute ${statements.length} statements`);
    return;
  }

  // Execute all statements + tracking insert atomically
  await sql.begin(async (tx) => {
    for (let i = 0; i < statements.length; i++) {
      log(`  Executing statement ${i + 1}/${statements.length}`);
      await tx.unsafe(statements[i]);
    }
    // Include migration tracking in the same transaction
    await tx`INSERT INTO __app_migrations (name, hash) VALUES (${name}, ${hash})
        ON CONFLICT (name) DO UPDATE SET hash = EXCLUDED.hash, executed_at = NOW()`;
  });
  log(`  ✓ Transaction committed: ${name} (${statements.length} statements)`);
}

async function main() {
  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No changes will be made');
  }

  // Note: For concurrent deploy protection, wrap this in an advisory lock or
  // rely on the deployment orchestrator (ECS task, CI) to serialise runs.

  await getMigrationTable();

  const executed = await getExecutedMigrations();
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pending = files.filter(f => !executed.has(f.replace('.sql', '')));

  if (pending.length === 0) {
    log('✓ All migrations up to date');
    return; // Exit naturally with code 0
  }

  log(`Found ${pending.length} pending migration(s)`);

  for (const file of pending) {
    await runMigration(file);
  }

  if (DRY_RUN) {
    log('\n✓ Dry run complete - no changes made');
  } else {
    log('\n✓ All migrations complete');
  }

  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
