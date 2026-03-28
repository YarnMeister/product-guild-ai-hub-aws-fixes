import { db } from '../db';
import { users, lessons, challenges, userLessonProgress, userBadges, trackProgress } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getTrack } from '../data/tracks';

/**
 * Check if a track's prerequisites are all completed by the user.
 * Uses src/data/tracks.ts for prerequisite definitions.
 */
export async function isTrackUnlocked(userId: number, trackId: string): Promise<boolean> {
  const track = getTrack(trackId);
  if (!track) return false;

  // Tracks with no prerequisites are always unlocked
  if (track.prerequisiteTrackIds.length === 0) return true;

  // All prerequisite tracks must have completedAt set in trackProgress
  for (const prereqId of track.prerequisiteTrackIds) {
    const [prereqProgress] = await db
      .select({ completedAt: trackProgress.completedAt })
      .from(trackProgress)
      .where(and(eq(trackProgress.userId, userId), eq(trackProgress.trackId, prereqId)))
      .limit(1);

    if (!prereqProgress || !prereqProgress.completedAt) {
      return false;
    }
  }

  return true;
}

/**
 * Check if all isRequired lessons and side_quests in a track are completed by the user.
 * Uses batched queries to avoid N+1 database round-trips.
 */
export async function isTrackComplete(userId: number, trackId: string): Promise<boolean> {
  // Get all required lessons for this track (1 query)
  const requiredLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.trackId, trackId), eq(lessons.isRequired, true)));

  if (requiredLessons.length > 0) {
    const lessonIds = requiredLessons.map((l) => l.id);
    // Fetch all completed lessons in one batched query instead of N individual queries
    const completedLessons = await db
      .select({ lessonId: userLessonProgress.lessonId })
      .from(userLessonProgress)
      .where(and(eq(userLessonProgress.userId, userId), inArray(userLessonProgress.lessonId, lessonIds)));

    const completedLessonSet = new Set(completedLessons.map((r) => r.lessonId));
    if (!lessonIds.every((id) => completedLessonSet.has(id))) return false;
  }

  // Get all required challenges (side_quests) for this track (1 query)
  const requiredChallenges = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(and(eq(challenges.trackId, trackId), eq(challenges.isRequired, true)));

  if (requiredChallenges.length > 0) {
    const challengeIds = requiredChallenges.map((c) => c.id);
    // Fetch all earned badges in one batched query instead of M individual queries
    const earnedBadges = await db
      .select({ challengeId: userBadges.challengeId })
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), inArray(userBadges.challengeId, challengeIds)));

    const earnedBadgeSet = new Set(earnedBadges.map((r) => r.challengeId));
    if (!challengeIds.every((id) => earnedBadgeSet.has(id))) return false;
  }

  return true;
}

/**
 * After content completion, check if the track is now fully complete and award
 * the track's maturity-level rank if the user hasn't reached it yet.
 *
 * Steps:
 * 1. Load the track's maturityLevel from src/data/tracks.ts
 * 2. If user's currentRank >= track.maturityLevel, no rank change needed
 * 3. Check if ALL isRequired content for this track is completed
 * 4. If track complete, upsert trackProgress.completedAt
 * 5. Update users.currentRank = track.maturityLevel
 *
 * @returns { rankChanged, newRank } — newRank is always the user's rank after the call
 */
export async function checkTrackCompletion(
  userId: number,
  trackId: string,
): Promise<{ rankChanged: boolean; newRank: number }> {
  const track = getTrack(trackId);

  // Get current rank first — needed for fallback response and rank guard
  const [user] = await db
    .select({ currentRank: users.currentRank })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const currentRank = user?.currentRank ?? 1;

  if (!track) {
    return { rankChanged: false, newRank: currentRank };
  }

  // Check if all required content for this track is complete
  const trackComplete = await isTrackComplete(userId, trackId);

  if (!trackComplete) {
    return { rankChanged: false, newRank: currentRank };
  }

  // Track is complete — always record completion, but only update rank if needed
  const shouldUpdateRank = currentRank < track.maturityLevel;

  // Upsert trackProgress and conditionally award rank atomically
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ completedAt: trackProgress.completedAt })
      .from(trackProgress)
      .where(and(eq(trackProgress.userId, userId), eq(trackProgress.trackId, trackId)))
      .limit(1);

    if (!existing) {
      await tx.insert(trackProgress).values({
        userId,
        trackId,
        completedAt: new Date(),
      });
    } else if (!existing.completedAt) {
      await tx
        .update(trackProgress)
        .set({ completedAt: new Date() })
        .where(and(eq(trackProgress.userId, userId), eq(trackProgress.trackId, trackId)));
    }

    // Only update rank if this track's maturityLevel exceeds the user's current rank
    if (shouldUpdateRank) {
      await tx
        .update(users)
        .set({ currentRank: track.maturityLevel })
        .where(eq(users.id, userId));
    }
  });

  if (shouldUpdateRank) {
    return { rankChanged: true, newRank: track.maturityLevel };
  }

  return { rankChanged: false, newRank: currentRank };
}

