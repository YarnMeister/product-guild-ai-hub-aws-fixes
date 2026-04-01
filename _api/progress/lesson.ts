import type { VercelRequest, VercelResponse } from '../_types';
import { db } from '../../src/db';
import { lessons, userLessonProgress } from '../../src/db/schema';
import { verifyToken, getTokenFromHeader } from '../../src/lib/auth';
import { checkTrackCompletion } from '../../src/lib/trackUnlock';
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
    const { lessonId } = req.body;

    if (!lessonId || typeof lessonId !== 'number') {
      console.error('[Lesson API] Invalid lessonId:', lessonId);
      return res.status(400).json({ error: 'lessonId is required and must be a number' });
    }

    // Check if lesson exists and get its trackId for rank logic
    const [lesson] = await db
      .select({
        id: lessons.id,
        trackId: lessons.trackId,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lesson) {
      console.error(`[Lesson API] Lesson ${lessonId} not found`);
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if user has already completed this lesson (idempotency).
    // Prefer uuid-based lookup for post-migration tokens; fall back to integer userId.
    const progressUserFilter = payload.uuid
      ? and(eq(userLessonProgress.userUuid, payload.uuid), eq(userLessonProgress.lessonId, lessonId))
      : and(eq(userLessonProgress.userId, payload.userId), eq(userLessonProgress.lessonId, lessonId));

    const [existingProgress] = await db
      .select()
      .from(userLessonProgress)
      .where(progressUserFilter)
      .limit(1);

    if (existingProgress) {
      // Already completed - return success without error
      return res.status(200).json({
        message: 'Lesson already completed',
        lessonId,
        completedAt: existingProgress.completedAt,
      });
    }

    // Insert progress record — write both integer userId (backward compat) and userUuid (new)
    const [progress] = await db
      .insert(userLessonProgress)
      .values({
        userId: payload.userId,
        userUuid: payload.uuid ?? null,
        lessonId,
      })
      .returning({
        id: userLessonProgress.id,
        completedAt: userLessonProgress.completedAt,
      });

    // Check track completion and award maturity-level rank if earned
    let rankUpdated = false;
    let newRank: number | null = null;

    if (lesson.trackId) {
      const result = await checkTrackCompletion(payload.userId, lesson.trackId);
      rankUpdated = result.rankChanged;
      newRank = result.newRank;
    }

    const response = {
      message: 'Lesson completed successfully',
      lessonId,
      completedAt: progress.completedAt,
      rankUpdated,
      newRank,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Complete lesson error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

