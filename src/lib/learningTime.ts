import type { ContentIndex } from "@/types/content";

/**
 * Sums estimatedMinutes for all completed lessons and challenges.
 *
 * @param completedIds - Array of completed content IDs (lesson IDs converted to
 *   string, or challenge string IDs)
 * @param content - The ContentIndex containing lessons and challenges
 * @returns Total estimated learning time in minutes
 */
export function getEstimatedLearningMinutes(
  completedIds: string[],
  content: ContentIndex
): number {
  const allItems = [...(content.lessons ?? []), ...(content.challenges ?? [])];
  return allItems
    .filter((item) => completedIds.includes(String(item.id)))
    .reduce((sum, item) => sum + (item.estimatedMinutes ?? 0), 0);
}

