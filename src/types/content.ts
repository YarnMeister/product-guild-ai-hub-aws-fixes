export type TrackId = "prototyping" | "ai-workbench" | "productivity" | "hosting" | "measurement";

export type ContentStatus = "live" | "coming-soon";
export type ApprovalStatus = "REA Approved" | "REA Tolerated" | "External" | "FlowLab";

export interface Lesson {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  /** @deprecated Legacy rank field — kept for backwards compat, not used in track-based logic */
  unlocksRank?: number;
  order: number;
  type: "lesson";
  module: string;
  isRequired: boolean;
  discoveryPhase?: string;
  badgeName?: string;
  unlockMessage?: string;
  contentPath: string;
  // V3 track-based fields
  track: TrackId;
  status: ContentStatus;
  estimatedMinutes: number;
  toolTags?: string[];
  recommendedFor?: Record<string, number>;
  trackPrereqs?: string[];
  approval?: ApprovalStatus;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  badgeName: string;
  badgeStatement: string;
  difficulty: number;
  estimatedTime: string;
  /** @deprecated Legacy rank field — kept for backwards compat, not used in track-based logic */
  requiredRank?: number;
  icon: string;
  category: string;
  type: "challenge";
  module: string;
  isRequired: boolean;
  contentPath: string;
  // V3 track-based fields
  track: TrackId;
  status: ContentStatus;
  estimatedMinutes: number;
  toolTags?: string[];
  recommendedFor?: Record<string, number>;
  trackPrereqs?: string[];
  approval?: ApprovalStatus;
}

export interface ContentIndex {
  lessons: Lesson[];
  challenges: Challenge[];
}

export type Difficulty = 1 | 2 | 3;

export interface DifficultyInfo {
  label: string;
  color: string;
}

export const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  1: { label: "Easy", color: "badge-easy" },
  2: { label: "Medium", color: "badge-medium" },
  3: { label: "Hard", color: "badge-hard" },
};

