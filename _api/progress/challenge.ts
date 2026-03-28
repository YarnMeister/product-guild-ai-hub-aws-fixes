import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db';
import { challenges, userBadges, users } from '../../src/db/schema';
import { verifyToken, getTokenFromHeader } from '../../src/lib/auth';
import { checkTrackCompletion, isTrackUnlocked } from '../../src/lib/trackUnlock';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = getTokenFromHeader(authHeader || null);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const { challengeId } = req.body;

    if (!challengeId || typeof challengeId !== 'string') {
      console.error('[Challenge API] Invalid challengeId:', challengeId);
      return res.status(400).json({ error: 'challengeId is required and must be a string' });
    }

    // Look up challenge in database by slug
    const [challenge] = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        trackId: challenges.trackId,
      })
      .from(challenges)
      .where(eq(challenges.slug, challengeId))
      .limit(1);

    if (!challenge) {
      console.error(`[Challenge API] Challenge "${challengeId}" not found in database`);
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if user has already completed this challenge (idempotency).
    // Prefer uuid-based lookup for post-migration tokens; fall back to integer userId.
    const badgeUserFilter = payload.uuid
      ? and(eq(userBadges.userUuid, payload.uuid), eq(userBadges.challengeId, challenge.id))
      : and(eq(userBadges.userId, payload.userId), eq(userBadges.challengeId, challenge.id));

    const [existingBadge] = await db
      .select()
      .from(userBadges)
      .where(badgeUserFilter)
      .limit(1);

    if (existingBadge) {
      // Already completed - return success without error
      return res.status(200).json({
        message: 'Challenge already completed',
        challengeId,
        badge: {
          id: challengeId,
          name: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          earnedAt: existingBadge.earnedAt,
        },
      });
    }

    // G5: Enforce track eligibility — reject if the challenge's track is locked
    if (challenge.trackId) {
      const unlocked = await isTrackUnlocked(payload.userId, challenge.trackId);
      if (!unlocked) {
        console.warn(`[Challenge API] Track ${challenge.trackId} is locked for user ${payload.userId}`);
        return res.status(403).json({ error: 'Track is locked. Complete prerequisite tracks first.' });
      }
    }

    // Snapshot the user's current rank before inserting the badge so rank_earned
    // records the rank at earn-time rather than the rank at query-time (issue #10).
    const [userRow] = await db
      .select({ currentRank: users.currentRank })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);
    const rankAtEarnTime = userRow?.currentRank ?? 1;

    // Insert badge record — write both integer userId (backward compat) and userUuid (new)
    const [badge] = await db
      .insert(userBadges)
      .values({
        userId: payload.userId,
        userUuid: payload.uuid ?? null,
        challengeId: challenge.id,
        rankEarned: rankAtEarnTime,
      })
      .returning({
        id: userBadges.id,
        earnedAt: userBadges.earnedAt,
      });

    // Check track completion and award maturity-level rank if earned
    let rankUpdated = false;
    let newRank: number | null = null;

    if (challenge.trackId) {
      const result = await checkTrackCompletion(payload.userId, challenge.trackId);
      rankUpdated = result.rankChanged;
      newRank = result.newRank;
    }

    const response = {
      message: 'Challenge completed successfully',
      challengeId,
      badge: {
        id: challengeId,
        name: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        earnedAt: badge.earnedAt,
      },
      rankUpdated,
      newRank,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Complete challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

