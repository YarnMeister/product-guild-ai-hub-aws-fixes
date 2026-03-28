#!/usr/bin/env node
import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { parse as parseYAML } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Frontmatter {
  [key: string]: any;
}

type TrackId = "prototyping" | "ai-workbench" | "productivity" | "hosting" | "measurement";
type ContentStatus = "live" | "coming-soon";

interface Lesson {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  /** @deprecated Legacy rank field — kept for backwards compat */
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

interface Challenge {
  id: string;
  title: string;
  description: string;
  badgeName: string;
  badgeStatement: string;
  difficulty: number;
  estimatedTime: string;
  /** @deprecated Legacy rank field — kept for backwards compat */
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

interface ContentIndex {
  lessons: Lesson[];
  challenges: Challenge[];
}

/**
 * Parse YAML frontmatter from markdown content
 * Uses a proper YAML parser to handle multiline strings, arrays, and nested objects
 */
function parseFrontmatter(content: string): Frontmatter {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatterBlock = match[1];

  try {
    // Use proper YAML parser to handle complex YAML features
    const metadata = parseYAML(frontmatterBlock) || {};
    return metadata;
  } catch (error) {
    // Fallback to empty metadata if YAML parsing fails
    console.error('Failed to parse frontmatter YAML:', error);
    return {};
  }
}

/**
 * Recursively scan directory for markdown files
 */
async function scanMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Compute content path (URL path relative to public root)
 */
function computeContentPath(filePath: string, publicDir: string): string {
  const relativePath = relative(publicDir, filePath);
  return "/" + relativePath.replace(/\\/g, "/");
}

const VALID_TRACKS: readonly TrackId[] = ["prototyping", "ai-workbench", "productivity", "hosting", "measurement"];
const VALID_STATUSES: readonly ContentStatus[] = ["live", "coming-soon"];
type ApprovalStatus = "REA Approved" | "REA Tolerated" | "External" | "FlowLab";
const VALID_APPROVALS: readonly ApprovalStatus[] = ["REA Approved", "REA Tolerated", "External", "FlowLab"];

/**
 * Validate required fields for a lesson
 */
function validateLesson(frontmatter: Frontmatter, filePath: string): boolean {
  const required = [
    "id",
    "title",
    "description",
    "estimatedTime",
    "order",
    "module",
    "isRequired",
    "track",
    "status",
    "estimatedMinutes",
  ];
  const missing = required.filter((field) => !(field in frontmatter));

  if (missing.length > 0) {
    console.error(
      `❌ Missing required lesson fields in ${filePath}: ${missing.join(", ")}`
    );
    return false;
  }

  if (!VALID_TRACKS.includes(frontmatter.track as TrackId)) {
    console.error(
      `❌ Invalid track value "${frontmatter.track}" in ${filePath}. Valid tracks: ${VALID_TRACKS.join(", ")}`
    );
    return false;
  }

  if (!VALID_STATUSES.includes(frontmatter.status as ContentStatus)) {
    console.error(
      `❌ Invalid status value "${frontmatter.status}" in ${filePath}. Valid values: ${VALID_STATUSES.join(", ")}`
    );
    return false;
  }

  return true;
}

/**
 * Validate required fields for a challenge
 */
function validateChallenge(
  frontmatter: Frontmatter,
  filePath: string
): boolean {
  const required = [
    "id",
    "title",
    "description",
    "badgeName",
    "badgeStatement",
    "difficulty",
    "estimatedTime",
    "icon",
    "category",
    "module",
    "isRequired",
    "track",
    "status",
    "estimatedMinutes",
  ];
  const missing = required.filter((field) => !(field in frontmatter));

  if (missing.length > 0) {
    console.error(
      `❌ Missing required challenge fields in ${filePath}: ${missing.join(", ")}`
    );
    return false;
  }

  if (!VALID_TRACKS.includes(frontmatter.track as TrackId)) {
    console.error(
      `❌ Invalid track value "${frontmatter.track}" in ${filePath}. Valid tracks: ${VALID_TRACKS.join(", ")}`
    );
    return false;
  }

  if (!VALID_STATUSES.includes(frontmatter.status as ContentStatus)) {
    console.error(
      `❌ Invalid status value "${frontmatter.status}" in ${filePath}. Valid values: ${VALID_STATUSES.join(", ")}`
    );
    return false;
  }

  return true;
}

/**
 * Warn if optional coordinator fields are missing from a content item
 */
function warnMissingCoordinatorFields(frontmatter: Frontmatter, filePath: string): void {
  const coordinatorFields = ["toolTags", "recommendedFor", "trackPrereqs"];
  const missing = coordinatorFields.filter((field) => !(field in frontmatter));
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing coordinator fields in ${filePath}: ${missing.join(", ")}`
    );
  }
}

/**
 * Main function to generate content index
 */
async function generateContentIndex() {
  const rootDir = join(__dirname, "..");
  const publicDir = join(rootDir, "public");
  const contentDir = join(publicDir, "content");
  const outputPath = join(publicDir, "content-index.json");

  console.log("🔍 Scanning for markdown files in:", contentDir);

  const markdownFiles = await scanMarkdownFiles(contentDir);
  console.log(`📄 Found ${markdownFiles.length} markdown files`);

  const lessons: Lesson[] = [];
  const challenges: Challenge[] = [];
  let hasErrors = false;

  for (const filePath of markdownFiles) {
    const content = await readFile(filePath, "utf-8");
    const frontmatter = parseFrontmatter(content);

    if (Object.keys(frontmatter).length === 0) {
      console.warn(`⚠️  No frontmatter found in ${filePath}`);
      continue;
    }

    const contentPath = computeContentPath(filePath, publicDir);
    const type = frontmatter.type;

    if (type === "lesson") {
      if (!validateLesson(frontmatter, filePath)) {
        hasErrors = true;
        continue;
      }
      warnMissingCoordinatorFields(frontmatter, filePath);

      lessons.push({
        id: frontmatter.id,
        title: frontmatter.title,
        description: frontmatter.description,
        estimatedTime: frontmatter.estimatedTime,
        // Legacy field — optional for backwards compat
        ...(frontmatter.unlocksRank !== undefined && { unlocksRank: frontmatter.unlocksRank }),
        order: frontmatter.order,
        type: "lesson",
        module: frontmatter.module,
        isRequired: frontmatter.isRequired,
        discoveryPhase: frontmatter.discoveryPhase,
        badgeName: frontmatter.badgeName,
        unlockMessage: frontmatter.unlockMessage,
        contentPath,
        track: frontmatter.track as TrackId,
        status: frontmatter.status as ContentStatus,
        estimatedMinutes: frontmatter.estimatedMinutes,
        toolTags: frontmatter.toolTags,
        recommendedFor: frontmatter.recommendedFor,
        trackPrereqs: frontmatter.trackPrereqs,
        approval: frontmatter.approval as ApprovalStatus | undefined,
      });
    } else if (type === "challenge") {
      if (!validateChallenge(frontmatter, filePath)) {
        hasErrors = true;
        continue;
      }
      warnMissingCoordinatorFields(frontmatter, filePath);

      challenges.push({
        id: frontmatter.id,
        title: frontmatter.title,
        description: frontmatter.description,
        badgeName: frontmatter.badgeName,
        badgeStatement: frontmatter.badgeStatement,
        difficulty: frontmatter.difficulty,
        estimatedTime: frontmatter.estimatedTime,
        // Legacy field — optional for backwards compat
        ...(frontmatter.requiredRank !== undefined && { requiredRank: frontmatter.requiredRank }),
        icon: frontmatter.icon,
        category: frontmatter.category,
        type: "challenge",
        module: frontmatter.module,
        isRequired: frontmatter.isRequired,
        contentPath,
        track: frontmatter.track as TrackId,
        status: frontmatter.status as ContentStatus,
        estimatedMinutes: frontmatter.estimatedMinutes,
        toolTags: frontmatter.toolTags,
        recommendedFor: frontmatter.recommendedFor,
        trackPrereqs: frontmatter.trackPrereqs,
        approval: frontmatter.approval as ApprovalStatus | undefined,
      });
    } else if (type) {
      console.warn(`⚠️  Unknown type "${type}" in ${filePath}`);
    }
  }

  // Sort lessons by order
  lessons.sort((a, b) => a.order - b.order);

  // Sort challenges by track alphabetically, then by difficulty
  challenges.sort((a, b) => {
    if (a.track !== b.track) {
      return a.track.localeCompare(b.track);
    }
    return a.difficulty - b.difficulty;
  });

  const index: ContentIndex = { lessons, challenges };

  console.log(`✅ Processed ${lessons.length} lessons`);
  console.log(`✅ Processed ${challenges.length} challenges`);

  await writeFile(outputPath, JSON.stringify(index, null, 2), "utf-8");
  console.log(`📝 Content index written to ${outputPath}`);

  if (hasErrors) {
    console.error("\n❌ Errors found during generation. Exiting with error code.");
    process.exit(1);
  }

  console.log("\n✨ Content index generation complete!");
}

// Run the script
generateContentIndex().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
