#!/usr/bin/env tsx
/**
 * Verify rank progression requirements
 * 
 * This script checks that each rank has at least one required challenge
 * to enable progression from Rank 0 → 1 → 2 → 3 → 4
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

interface Challenge {
  id: string;
  title: string;
  requiredRank: number;
  isRequired: boolean;
}

interface ContentIndex {
  lessons: any[];
  challenges: Challenge[];
}

async function verifyRankProgression() {
  console.log('🔍 Verifying rank progression requirements...\n');

  // Load content index
  const indexPath = join(process.cwd(), 'public', 'content-index.json');
  const indexData = await readFile(indexPath, 'utf-8');
  const contentIndex: ContentIndex = JSON.parse(indexData);

  const results: Record<number, Challenge[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  // Group required challenges by rank
  for (const challenge of contentIndex.challenges) {
    if (challenge.isRequired && challenge.requiredRank >= 0 && challenge.requiredRank <= 3) {
      results[challenge.requiredRank].push(challenge);
    }
  }

  // Check each rank
  let allPassed = true;
  for (let rank = 0; rank <= 3; rank++) {
    const nextRank = rank + 1;
    const requiredChallenges = results[rank];
    
    if (requiredChallenges.length === 0) {
      console.log(`❌ Rank ${rank}→${nextRank}: NO required challenges found`);
      console.log(`   Users will be stuck at Rank ${rank}\n`);
      allPassed = false;
    } else {
      console.log(`✅ Rank ${rank}→${nextRank}: ${requiredChallenges.length} required challenge(s)`);
      for (const challenge of requiredChallenges) {
        console.log(`   - "${challenge.title}" (${challenge.id})`);
      }
      console.log('');
    }
  }

  // Summary
  console.log('─'.repeat(60));
  if (allPassed) {
    console.log('✅ All rank progressions have required challenges!');
    console.log('   Users can progress: Rank 0 → 1 → 2 → 3 → 4');
    process.exit(0);
  } else {
    console.log('❌ Some rank progressions are blocked!');
    console.log('   Fix by marking challenges as isRequired: true');
    process.exit(1);
  }
}

verifyRankProgression().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

