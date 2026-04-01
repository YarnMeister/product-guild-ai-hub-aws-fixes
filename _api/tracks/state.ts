import type { VercelRequest, VercelResponse } from '../_types';
import { db } from '../../src/db';
import { userLessonProgress, userBadges, challenges, lessons, trackProgress } from '../../src/db/schema';
import { verifyToken, getTokenFromHeader } from '../../src/lib/auth';
import { tracks } from '../../src/data/tracks';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = getTokenFromHeader(authHeader || null);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = payload.userId;

    const trackProgressRows = await db
      .select({ trackId: trackProgress.trackId, completedAt: trackProgress.completedAt })
      .from(trackProgress)
      .where(eq(trackProgress.userId, userId));

    const completedTrackIds = new Set(
      trackProgressRows.filter((r) => r.completedAt).map((r) => r.trackId)
    );

    const allRequiredLessons = await db
      .select({ id: lessons.id, trackId: lessons.trackId })
      .from(lessons)
      .where(eq(lessons.isRequired, true));

    const allRequiredChallenges = await db
      .select({ id: challenges.id, trackId: challenges.trackId })
      .from(challenges)
      .where(eq(challenges.isRequired, true));

    const completedLessonRows = await db
      .select({ lessonId: userLessonProgress.lessonId })
      .from(userLessonProgress)
      .where(eq(userLessonProgress.userId, userId));

    const completedLessonIds = new Set(completedLessonRows.map((r) => r.lessonId));

    const earnedBadgeRows = await db
      .select({ challengeId: userBadges.challengeId })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const completedChallengeIds = new Set(earnedBadgeRows.map((r) => r.challengeId));

    const result = tracks.map((track) => {
      const isUnlocked =
        track.prerequisiteTrackIds.length === 0 ||
        track.prerequisiteTrackIds.every((pid) => completedTrackIds.has(pid));

      const requiredLessons = allRequiredLessons.filter((l) => l.trackId === track.id);
      const requiredChallenges = allRequiredChallenges.filter((c) => c.trackId === track.id);
      const totalRequired = requiredLessons.length + requiredChallenges.length;

      const completedRequired =
        requiredLessons.filter((l) => completedLessonIds.has(l.id)).length +
        requiredChallenges.filter((c) => completedChallengeIds.has(c.id)).length;

      const isCompleted = totalRequired > 0 && completedRequired === totalRequired;
      const completionPercent =
        totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

      return {
        trackId: track.id,
        isUnlocked,
        isCompleted,
        completionPercent,
        maturityLevel: track.maturityLevel,
        rankLabel: track.rankLabel,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Tracks State API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

