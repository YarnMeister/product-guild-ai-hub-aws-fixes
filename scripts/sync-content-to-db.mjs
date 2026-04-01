#!/usr/bin/env node
/*
  CONTENT-TO-DATABASE SYNC SCRIPT
  - Reads public/content-index.json
  - Syncs all lessons and challenges to database
  - Uses ON CONFLICT for idempotent upserts
  - Run after migrations in build process
*/

import postgres from 'postgres';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function parseEstimatedTime(timeStr) {
  // Parse strings like "1 hour", "30 mins", "60 mins", "4 hrs" to minutes
  const match = timeStr.match(/(\d+)\s*(hour|hrs?|mins?)/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit.startsWith('hour') || unit.startsWith('hr')) {
    return value * 60;
  }
  return value; // already in minutes
}

const TRACKS = [
  { id: "prototyping", name: "Prototyping", description: "Build and iterate on AI-assisted prototypes rapidly using modern no-code and low-code tools.", prerequisiteTrackIds: [], sortOrder: 1, maturityLevel: 2, rankLabel: "AI Collaborator" },
  { id: "ai-workbench", name: "AI Workbench", description: "Master AI-native development environments and coding assistants to accelerate your workflow.", prerequisiteTrackIds: [], sortOrder: 2, maturityLevel: 2, rankLabel: "AI Collaborator" },
  { id: "productivity", name: "Productivity", description: "Amplify your daily output using AI tools for writing, research, and task automation.", prerequisiteTrackIds: ["ai-workbench"], sortOrder: 3, maturityLevel: 3, rankLabel: "AI Integrator" },
  { id: "hosting", name: "Hosting", description: "Deploy and scale AI-powered applications with modern cloud hosting and infrastructure tools.", prerequisiteTrackIds: ["ai-workbench"], sortOrder: 4, maturityLevel: 4, rankLabel: "AI Builder" },
  { id: "measurement", name: "Measurement", description: "Evaluate and improve AI outputs using analytics, evals, and observability best practices.", prerequisiteTrackIds: ["hosting"], sortOrder: 5, maturityLevel: 5, rankLabel: "AI Architect" },
];

async function syncTracks() {
  log(`\nSyncing ${TRACKS.length} tracks...`);

  for (const track of TRACKS) {
    await sql`
      INSERT INTO tracks (id, name, description, prerequisite_track_ids, sort_order, maturity_level, rank_label)
      VALUES (
        ${track.id},
        ${track.name},
        ${track.description},
        ${track.prerequisiteTrackIds},
        ${track.sortOrder},
        ${track.maturityLevel},
        ${track.rankLabel}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        prerequisite_track_ids = EXCLUDED.prerequisite_track_ids,
        sort_order = EXCLUDED.sort_order,
        maturity_level = EXCLUDED.maturity_level,
        rank_label = EXCLUDED.rank_label
    `;

    log(`  ✓ ${track.name} (maturityLevel: ${track.maturityLevel}, rankLabel: ${track.rankLabel})`);
  }

  log(`✓ ${TRACKS.length} tracks synced`);
}

async function syncLessons(lessons) {
  log(`\nSyncing ${lessons.length} lessons...`);

  for (const lesson of lessons) {
    const estimatedTime = parseEstimatedTime(lesson.estimatedTime);
    const trackId = lesson.track ?? null;

    await sql`
      INSERT INTO lessons (id, title, description, estimated_time, is_required, track_id)
      VALUES (
        ${lesson.id},
        ${lesson.title},
        ${lesson.description},
        ${estimatedTime},
        ${lesson.isRequired},
        ${trackId}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        estimated_time = EXCLUDED.estimated_time,
        is_required = EXCLUDED.is_required,
        track_id = EXCLUDED.track_id
    `;

    log(`  ✓ ${lesson.title} (id: ${lesson.id}, track: ${trackId})`);
  }

  log(`✓ ${lessons.length} lessons synced`);
}

async function syncChallenges(challenges) {
  log(`\nSyncing ${challenges.length} challenges...`);

  for (const challenge of challenges) {
    const estimatedTime = parseEstimatedTime(challenge.estimatedTime);
    const trackId = challenge.track ?? null;

    await sql`
      INSERT INTO side_quests (slug, title, description, difficulty, is_required, estimated_time, track_id)
      VALUES (
        ${challenge.id},
        ${challenge.title},
        ${challenge.description},
        ${parseInt(challenge.difficulty)},
        ${challenge.isRequired},
        ${estimatedTime},
        ${trackId}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        difficulty = EXCLUDED.difficulty,
        is_required = EXCLUDED.is_required,
        estimated_time = EXCLUDED.estimated_time,
        track_id = EXCLUDED.track_id
    `;

    log(`  ✓ ${challenge.title} (slug: ${challenge.id}, track: ${trackId})`);
  }

  log(`✓ ${challenges.length} challenges synced`);
}

async function main() {
  log('🔄 Starting content-to-database sync...');
  
  // Read content-index.json
  const contentIndexPath = './public/content-index.json';
  const contentIndex = JSON.parse(readFileSync(contentIndexPath, 'utf-8'));
  
  log(`Loaded content index: ${contentIndex.lessons.length} lessons, ${contentIndex.challenges.length} challenges`);
  
  // Sync tracks first (lessons and challenges reference tracks)
  await syncTracks();

  // Sync lessons
  await syncLessons(contentIndex.lessons);

  // Sync challenges
  await syncChallenges(contentIndex.challenges);
  
  log('\n✅ Content sync complete!');

  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

