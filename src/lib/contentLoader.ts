import type { ContentIndex, Lesson, Challenge } from "@/types/content";

export type { Lesson, Challenge } from "@/types/content";

let cachedIndex: ContentIndex | null = null;

export async function loadContentIndex(): Promise<ContentIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }

  const response = await fetch("/content-index.json");
  if (!response.ok) {
    throw new Error(`Failed to load content index: ${response.statusText}`);
  }

  cachedIndex = await response.json();
  return cachedIndex;
}

/**
 * Gets all lessons for a specific module, sorted by order
 */
export async function getLessons(moduleId: string): Promise<Lesson[]> {
  const index = await loadContentIndex();
  return index.lessons
    .filter((lesson) => lesson.module === moduleId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Gets all challenges for a specific module
 */
export async function getChallenges(moduleId: string): Promise<Challenge[]> {
  const index = await loadContentIndex();
  return index.challenges.filter((challenge) => challenge.module === moduleId);
}

/**
 * Gets a single lesson by ID
 */
export async function getLesson(id: number): Promise<Lesson | undefined> {
  const index = await loadContentIndex();
  return index.lessons.find((lesson) => lesson.id === id);
}

/**
 * Gets a single challenge by ID
 */
export async function getChallenge(id: string): Promise<Challenge | undefined> {
  const index = await loadContentIndex();
  return index.challenges.find((challenge) => challenge.id === id);
}

/**
 * Gets the next lesson in sequence for a given module
 */
export async function getNextLesson(
  currentId: number,
  moduleId: string
): Promise<Lesson | undefined> {
  const lessons = await getLessons(moduleId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentId);
  
  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return undefined;
  }
  
  return lessons[currentIndex + 1];
}

/**
 * Gets the previous lesson in sequence for a given module
 */
export async function getPreviousLesson(
  currentId: number,
  moduleId: string
): Promise<Lesson | undefined> {
  const lessons = await getLessons(moduleId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentId);
  
  if (currentIndex <= 0) {
    return undefined;
  }
  
  return lessons[currentIndex - 1];
}

