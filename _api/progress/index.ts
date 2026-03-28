import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db';
import { userLessonProgress, userBadges, challenges } from '../../src/db/schema';
import { verifyToken, getTokenFromHeader } from '../../src/lib/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = getTokenFromHeader(authHeader || null);

    if (!token) {
      console.error('[Progress API] No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      console.error('[Progress API] Invalid token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prefer uuid-based lookup when the token carries a uuid (post-migration tokens).
    // Fall back to integer userId for tokens issued before the uuid migration.
    const lessonFilter = payload.uuid
      ? eq(userLessonProgress.userUuid, payload.uuid)
      : eq(userLessonProgress.userId, payload.userId);

    const badgeFilter = payload.uuid
      ? eq(userBadges.userUuid, payload.uuid)
      : eq(userBadges.userId, payload.userId);

    // Fetch all completed lessons for this user
    const completedLessons = await db
      .select({
        lessonId: userLessonProgress.lessonId,
        completedAt: userLessonProgress.completedAt,
      })
      .from(userLessonProgress)
      .where(lessonFilter)
      .orderBy(userLessonProgress.completedAt);

    // Fetch user badges — rank_earned is stored at earn-time (not current rank)
    const userBadgesData = await db
      .select({
        id: challenges.slug,
        name: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        rankEarned: userBadges.rankEarned,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(challenges, eq(userBadges.challengeId, challenges.id))
      .where(badgeFilter);

    const response = {
      completedLessons: completedLessons.map(l => ({
        lessonId: l.lessonId,
        completedAt: l.completedAt,
      })),
      badges: userBadgesData.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        difficulty: b.difficulty,
        rankEarned: b.rankEarned,
        earnedAt: b.earnedAt,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Progress API] Get progress error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

