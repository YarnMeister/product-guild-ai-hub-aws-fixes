import { parse as parseYAML } from 'yaml';

export interface FrontmatterMetadata {
  // Known fields with explicit types for IDE autocomplete
  type?: string;
  title?: string;
  description?: string;
  estimatedTime?: string;
  unlocksRank?: number;

  // Challenge-specific fields
  badgeId?: string;
  badgeName?: string;
  badgeStatement?: string;
  difficulty?: number;
  requiredRank?: number;
  category?: string;
  icon?: string;
  approval?: string;

  // Lesson-specific fields
  module?: string;
  order?: number;
  isRequired?: boolean;
  discoveryPhase?: string;
  unlockMessage?: string;

  // Allow any additional fields
  [key: string]: any;
}

export interface ParsedMarkdown {
  metadata: FrontmatterMetadata;
  content: string;
}

/**
 * Parse frontmatter from markdown content
 * Supports YAML frontmatter between --- delimiters
 * Uses a proper YAML parser to handle multiline strings, arrays, and nested objects
 */
export function parseFrontmatter(fileContent: string): ParsedMarkdown {
  // Normalize: strip invisible Unicode chars from start, normalize line endings
  fileContent = fileContent.replace(/^[\u200B\u200C\u200D\u2060\u200E\u200F\uFEFF]+/, '');
  fileContent = fileContent.replace(/\r\n?/g, '\n');
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: fileContent };
  }

  const frontmatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, '').trim();

  try {
    // Use proper YAML parser to handle complex YAML features
    const metadata = parseYAML(frontmatterBlock) || {};
    return { metadata, content };
  } catch (error) {
    // Fallback to empty metadata if YAML parsing fails
    console.error('Failed to parse frontmatter YAML:', error);
    return { metadata: {}, content };
  }
}

