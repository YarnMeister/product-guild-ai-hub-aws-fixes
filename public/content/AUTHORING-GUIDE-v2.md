Read the "AI Content Authoring Guide" below for full context on the REA AI Hub content system, then help me create a new piece of learning content.

Start by asking me these questions (one message, numbered list — I'll reply with short answers):

1. **Working title** — What should this content be called?
2. **Lesson or Challenge?**

- *Lesson* = Standalone masterclass suitable to be video-recorded as a Guild talk. Teaches a foundational concept end-to-end.
- *Challenge* = Side-quest that deepens skills for a specific track. Hands-on, self-paced, earns a badge.

1. **Time estimate** — Roughly how long should it take to complete? (e.g., 30 mins, 1 hour, 2 hours)
2. **What tools or platforms does it cover?** (e.g., Cursor, Vercel, Figma, Mixpanel — list all that apply)
3. **Brief description** — In 1-2 sentences, what will the learner be able to do after completing this? (This becomes the `description` and, for challenges, the `badgeStatement`.)

Once I answer, do the following **without asking me further questions** — derive everything from my answers, the content body, and the AUTHORING-GUIDE:

- Assign the correct `track` (prototyping, ai-ide, hosting, or measurement)
- Set `trackPrereqs` (usually `[]` — only add if the content genuinely requires another track)
- Generate `toolTags` from the tools I listed + any others mentioned in the content
- Propose `recommendedFor` archetype weights using §5 Weight Derivation Reference — show your brief reasoning
- Set `difficulty` (1/2/3) based on the depth and assumed prior knowledge
- Set `requiredRank` based on difficulty (0 for beginner, 3 for intermediate, 5 for advanced)
- Choose an appropriate `icon` from the Available Icons table (challenges only)
- Assign `category` (challenges only)
- Generate the `id` (kebab-case from title for challenges, next sequential number for lessons)
- Set `estimatedMinutes` to match my time estimate
- Generate the complete YAML frontmatter block (standard + coordinator fields)
- Scaffold the markdown content body using the appropriate template from the AUTHORING-GUIDE

Present the result as a single, complete .md file I can review — frontmatter + content skeleton. Flag anything you're uncertain about with a `<!-- REVIEW: ... -->` comment inline so I can spot-check quickly.AI Content Authoring Guide

**Version:** 2.0**Last Updated:** February 2026**Supersedes:** AUTHORING-GUIDE v1.0

This guide explains how to create new lessons and challenges for the REA AI Hub using the markdown-based content system. It covers both the standard content fields and the **Course Coordinator fields** that power personalized learning paths.

Whether you're an AI assistant or a human content author, this document provides everything you need to publish content that automatically integrates with the AI Course Coordinator — no code changes required.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Skill Tracks & Prerequisites](#skill-tracks--prerequisites)
3. [User Archetypes (Reference)](#user-archetypes-reference)
4. [Frontmatter Schema Reference](#frontmatter-schema-reference)
5. [Weight Derivation Reference (AI-Assisted)](#weight-derivation-reference-ai-assisted)
6. [Available Markdown Components](#available-markdown-components)
7. [Content File Templates](#content-file-templates)
8. [Step-by-Step: Adding a New Lesson](#step-by-step-adding-a-new-lesson)
9. [Step-by-Step: Adding a New Challenge](#step-by-step-adding-a-new-challenge)
10. [Naming Conventions & Controlled Vocabularies](#naming-conventions--controlled-vocabularies)
11. [Validation & Testing](#validation--testing)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

## Architecture Overview

The REA AI Hub uses a markdown-based content system that separates content from code. Content flows through the system in three phases — and the **AI Course Coordinator** uses the metadata at runtime to build personalized learning paths.

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. AUTHORING PHASE                                              │
│    Content authors create .md files with YAML frontmatter       │
│    Location: public/content/{module}/lessons/ or /challenges/   │
│                                                                  │
│    Frontmatter includes:                                         │
│    • Standard fields (type, id, title, difficulty, etc.)        │
│    • Coordinator fields (track, trackPrereqs, toolTags,         │
│      recommendedFor, estimatedMinutes)                           │
│                                                                  │
│    AI assistants use this guide (especially §5 Weight            │
│    Derivation Reference) to propose recommendedFor weights.      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BUILD PHASE                                                  │
│    npm run generate-content-index                               │
│    Script: scripts/generate-content-index.ts                    │
│    - Scans all .md files in public/content/                     │
│    - Parses YAML frontmatter                                    │
│    - Validates required fields (including coordinator fields)   │
│    - Validates track values, toolTags, and recommendedFor keys  │
│    - Generates public/content-index.json                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. RUNTIME PHASE                                                │
│    Application loads content-index.json at startup              │
│    - contentLoader.ts reads the index                           │
│    - React pages fetch markdown content on demand               │
│    - MarkdownRenderer.tsx renders content with custom directives│
│                                                                  │
│    AI Course Coordinator uses coordinator fields to:             │
│    • Score and rank content for each user's learning path       │
│    • Resolve track-based prerequisites                           │
│    • Generate the Visual Discovery Poster from toolTags/tracks  │
│    • Identify content gaps and insert Ghost Path placeholders   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**

- Content is stored as markdown files with YAML frontmatter
- The build script creates an index for fast lookups **and validates coordinator fields**
- Content is rendered at runtime using React components
- The Course Coordinator discovers and sequences content **automatically** from whatever exists in the catalog — no hardcoded content lists
- Adding new content updates the Visual Discovery Poster, personalized paths, and Ghost Path coverage automatically
- No code changes needed to add new content

## Skill Tracks & Prerequisites

All content belongs to a **skill track** — a capability area that groups related content and defines prerequisite relationships. Tracks are the backbone of how the Course Coordinator organizes and sequences content.

### Available Tracks

| Track ID | Name | What It Covers | Example Tools |
| --- | --- | --- | --- |
| prototyping | UI/Concept Prototyping | Building visual prototypes with AI assistance | Lovable, Figma Make, Firebase Studio |
| ai-ide | AI-Assisted Development | Coding and building with AI IDEs | VS Code + Copilot, Cursor, Claude Code |
| hosting | Deployment & Hosting | Getting prototypes live on the web | Vercel, AWS, Google Cloud Platform |
| measurement | Analytics & Evaluation | Measuring outcomes and running evaluations | Mixpanel, custom evals, A/B testing |

### Track Prerequisites

```
  ┌──────────────┐     ┌──────────────┐
  │ prototyping   │     │ measurement  │
  │ (standalone)  │     │ (standalone) │
  └──────────────┘     └──────────────┘

  ┌──────────────┐     ┌──────────────┐
  │   ai-ide     │────→│   hosting    │
  │ (standalone)  │     │ (requires    │
  │               │     │  ai-ide)     │
  └──────────────┘     └──────────────┘
```

**Rules:**

- **Every track can be pursued standalone** — there are no mandatory entry points
- `hosting`** is the only track with a prerequisite:** it assumes `ai-ide` (you need something to deploy). Even this can be bypassed by users who self-declare IDE experience in the Lobby
- Every combination of tracks is valid (any single track, any pair, any trio, all four)

### What This Means for Authors

When you set `track` and `trackPrereqs` on your content:

- Set `track` to the **single track** your content primarily belongs to
- Set `trackPrereqs` to the tracks a user should have completed **before** this content makes sense
- For most content, `trackPrereqs` will be `[]` (empty) — prereqs are handled at the track level, not per-item
- Only use `trackPrereqs` when your specific content genuinely assumes knowledge from another track (e.g., a challenge about deploying a Cursor project might set `trackPrereqs: ["ai-ide"]`)

## User Archetypes (Reference)

The Course Coordinator uses four **reference archetypes** as anchor points for scoring content relevance. These are **not** user-facing categories — they're internal labels that the LLM maps user intent to as a blend.

Understanding these archetypes helps you assign accurate `recommendedFor` weights.

### The Four Archetypes

| Archetype Key | Persona | Goal | Time Budget | Typical Path Shape |
| --- | --- | --- | --- | --- |
| tool_specialist | "I want to master a specific AI tool" | Deep skill in one tool/track | 2-4 hours | 1 track deep, targeted challenges |
| explorer | "I want a broad understanding" | Sample everything, discover interests | 5-8 hours | Wide across all tracks, 1 item per area |
| completionist | "Show me the optimal path to 100%" | Every badge, top rank | 12-15 hours | All tracks, all content, optimized sequence |
| pragmatist | "Least content, maximum proficiency" | Core competency fast | 4-6 hours | Foundation lessons + required challenges only |

### How Archetypes Affect Scoring

The Course Coordinator calculates content relevance using a dot product:

```
content_relevance = Σ (content.recommendedFor[archetype] × user.archetype_blend[archetype])
```

A challenge tagged `{ tool_specialist: 0.9, explorer: 0.3, completionist: 0.8, pragmatist: 0.5 }` scores differently depending on who's asking:

| User Profile | Calculation | Score |
| --- | --- | --- |
| Pure Tool Specialist (1.0/0.0/0.0/0.0) | 0.9×1.0 + 0.3×0.0 + 0.8×0.0 + 0.5×0.0 | 0.90 |
| 60/30 blend (0.6/0.3/0.0/0.1) | 0.9×0.6 + 0.3×0.3 + 0.8×0.0 + 0.5×0.1 | 0.68 |
| Pure Explorer (0.0/1.0/0.0/0.0) | 0.9×0.0 + 0.3×1.0 + 0.8×0.0 + 0.5×0.0 | 0.30 |

Your weight assignments directly determine which users see your content first. Getting them roughly right is more important than getting them perfect — the algorithm is forgiving with a small catalog.

## Frontmatter Schema Reference

Every content file has two categories of frontmatter fields:

1. **Standard fields** — control how content appears in the UI (title, description, icons, etc.)
2. **Coordinator fields** — control how the Course Coordinator discovers, scores, and sequences content

Both are required. The build script validates all fields.

### Lesson Fields

| Field | Type | Required | Category | Description | Example |
| --- | --- | --- | --- | --- | --- |
| type | string | ✅ | Standard | Must be "lesson" | "lesson" |
| id | number | ✅ | Standard | Unique numeric identifier | 1 |
| title | string | ✅ | Standard | Lesson title (displayed in UI) | "Prototyping with Figma" |
| description | string | ✅ | Standard | Brief summary (1-2 sentences) | "Learn to create prototypes..." |
| estimatedTime | string | ✅ | Standard | Human-readable time estimate | "1 hour" |
| unlocksRank | number | ✅ | Standard | Rank unlocked upon completion | 1 |
| order | number | ✅ | Standard | Display order in lesson list | 1 |
| module | string | ✅ | Standard | Module identifier | "ai-driven-experimentation" |
| badgeName | string | ❌ | Standard | Badge awarded on completion | "AI Apprentice" |
| unlockMessage | string | ❌ | Standard | Message shown when rank unlocked | "You've unlocked Rank 1!" |
| discoveryPhase | string | ❌ | Standard | Discovery phase category | "observe" |
| isRequired | boolean | ❌ | Standard | Whether lesson is mandatory | true |
| track | string | ✅ | Coordinator | Skill track (see §2) | "ai-ide" |
| trackPrereqs | string[] | ✅ | Coordinator | Prerequisite tracks (can be []) | [] |
| toolTags | string[] | ✅ | Coordinator | Specific tools covered (1+) | ["cursor", "vs-code"] |
| recommendedFor | object | ✅ | Coordinator | Archetype weights (see §5) | { tool_specialist: 0.9, ... } |
| estimatedMinutes | number | ✅ | Coordinator | Numeric minutes for scoring | 60 |

**Example Lesson Frontmatter:**

```yaml
---
type: "lesson"
id: 2
title: "AI Workbench"
description: "Set up your AI-powered development environment with Cursor and VS Code."
estimatedTime: "1 hour"
unlocksRank: 2
order: 2
module: "ai-driven-experimentation"
badgeName: "AI Practitioner"
unlockMessage: "You've unlocked Rank 2: AI Practitioner!"

# Course Coordinator fields
track: "ai-ide"
trackPrereqs: []
toolTags: ["cursor", "copilot", "vs-code"]
recommendedFor:
  tool_specialist: 0.9
  explorer: 0.7
  completionist: 1.0
  pragmatist: 0.9
estimatedMinutes: 60
---
```

### Challenge Fields

| Field | Type | Required | Category | Description | Example |
| --- | --- | --- | --- | --- | --- |
| type | string | ✅ | Standard | Must be "challenge" | "challenge" |
| id | string | ✅ | Standard | Unique kebab-case identifier | "30-minute-prototype" |
| title | string | ✅ | Standard | Challenge title | "30-Minute Prototype" |
| description | string | ✅ | Standard | Brief summary | "Build a prototype in 30 mins..." |
| badgeName | string | ✅ | Standard | Badge name | "30-Minute Prototype" |
| badgeStatement | string | ✅ | Standard | First-person achievement statement | "I can now build a prototype..." |
| difficulty | number | ✅ | Standard | Difficulty level (1-3) | 1 |
| estimatedTime | string | ✅ | Standard | Human-readable time estimate | "30 mins" |
| requiredRank | number | ✅ | Standard | Minimum rank to unlock | 0 |
| icon | string | ✅ | Standard | Lucide icon name | "Zap" |
| category | string | ✅ | Standard | Challenge category | "Velocity" |
| module | string | ✅ | Standard | Module identifier | "ai-driven-experimentation" |
| isRequired | boolean | ✅ | Standard | Whether challenge is mandatory | false |
| track | string | ✅ | Coordinator | Skill track (see §2) | "prototyping" |
| trackPrereqs | string[] | ✅ | Coordinator | Prerequisite tracks (can be []) | [] |
| toolTags | string[] | ✅ | Coordinator | Specific tools covered (1+) | ["lovable", "figma"] |
| recommendedFor | object | ✅ | Coordinator | Archetype weights (see §5) | { tool_specialist: 0.5, ... } |
| estimatedMinutes | number | ✅ | Coordinator | Numeric minutes for scoring | 30 |

**Difficulty Levels:**

- `1` = Beginner (foundational skills, clear step-by-step instructions)
- `2` = Intermediate (requires some experience, less guidance)
- `3` = Advanced (complex, requires mastery of multiple skills)

**Example Challenge Frontmatter:**

```yaml
---
type: "challenge"
id: "cursor-setup"
title: "Setting Up Cursor as Your AI IDE"
badgeName: "Cursor Setup"
badgeStatement: "I can now configure and use Cursor as my primary AI IDE"
description: "Install, configure, and master the basics of Cursor IDE."
difficulty: 1
estimatedTime: "45 mins"
requiredRank: 0
icon: "Terminal"
category: "Velocity"
module: "ai-driven-experimentation"
isRequired: false

# Course Coordinator fields
track: "ai-ide"
trackPrereqs: []
toolTags: ["cursor", "vs-code"]
recommendedFor:
  tool_specialist: 0.9
  explorer: 0.6
  completionist: 0.8
  pragmatist: 0.7
estimatedMinutes: 45
---
```

## Weight Derivation Reference (AI-Assisted)

Content authors do **not** need to calculate `recommendedFor` archetype weights manually. This section is designed to be consumed by AI assistants alongside the content body to propose consistent, well-calibrated weights.

### Workflow

1. Author writes content body and fills in `track`, `trackPrereqs`, `toolTags`, `difficulty`
2. Author provides draft to an AI assistant along with this guide
3. AI assistant reads this section (weight scale + calibration examples + heuristics) and the content body
4. AI assistant proposes `recommendedFor` weights with brief reasoning
5. Author reviews and adjusts if needed

### Weight Scale

| Weight | Meaning | When to Assign |
| --- | --- | --- |
| 0.9–1.0 | Core content for this archetype | Content that a user with this archetype would consider essential. It directly serves their primary goal. |
| 0.7–0.8 | Highly relevant, not essential | Content that strongly supports the archetype's goals but isn't the first thing they'd reach for. |
| 0.4–0.6 | Tangentially useful | Content that provides some value but isn't aligned with the archetype's primary motivation. |
| 0.1–0.3 | Minimal relevance | Content that's mostly about a different focus area but has a small crossover benefit. |
| 0.0 | Not relevant at all | Rare. Most content has at least marginal relevance to every archetype. |

### Heuristic Rules

Use these rules to quickly estimate weights before fine-tuning:

| Heuristic | Rule |
| --- | --- |
| Single-tool deep dive | tool_specialist: 0.9, others lower. The more focused on one tool, the higher TS weight. |
| Covers multiple tools or tracks | explorer: 0.7+. Breadth = explorer value. |
| Required for rank progression | completionist: 0.8+, pragmatist: 0.7+. Required content is core for completionists (who want everything) and pragmatists (who want efficient paths to rank). |
| Quick win (difficulty 1, <30 min) | pragmatist: 0.7+. Fast return on time. |
| Advanced / time-intensive | completionist: 0.8+, pragmatist: 0.3–0.5. Completionists love depth; pragmatists may skip it. |
| Foundational / setup content | All archetypes 0.6+. Everyone needs foundations. |
| Niche / specialized | tool_specialist: 0.8+, explorer: 0.3–0.5. Specialists want depth; explorers may sample. |

### Calibration Examples

These are reference examples from the existing catalog. AI assistants should use them as anchors when proposing weights for new content — new weights should be **consistent relative to these examples**.

| Content | Track | Difficulty | tool_specialist | explorer | completionist | pragmatist | Reasoning |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lesson: Prototyping with Figma | prototyping | 1 | 0.7 | 0.8 | 1.0 | 0.8 | Foundation lesson. Specialists in prototyping need it. Broad appeal for explorers. Required for rank, so high for completionist/pragmatist. |
| Lesson: AI Workbench | ai-ide | 1 | 0.9 | 0.7 | 1.0 | 0.9 | Core IDE setup. Essential for tool specialists targeting any IDE tool. Required path, high across the board. |
| Lesson: AI Evaluations | measurement | 1 | 0.5 | 0.7 | 1.0 | 0.6 | Measurement foundation. Specialists in evals want it (0.5 because it's a lesson not a tool challenge). Completionists need it. Pragmatists get moderate value. |
| Challenge: 30-Minute Prototype | prototyping | 1 | 0.5 | 0.7 | 0.8 | 0.8 | Quick win challenge. Not deep enough for a tool specialist to call core. Great for explorers (fast sample). Pragmatists love the speed. |
| Challenge: Prompt Architect | ai-ide | 2 | 0.9 | 0.5 | 0.8 | 0.6 | Intermediate prompt engineering. Core for IDE specialists. Explorers may skip (intermediate). Completionists want it. Pragmatists see moderate value. |
| Challenge: Experiment Evangelist | measurement | 3 | 0.4 | 0.3 | 0.9 | 0.3 | Advanced challenge requiring deep engagement. Low relevance for specialists unless they're measurement-focused. Completionists need it for rank. Pragmatists likely skip. |
| Challenge: Cursor IDE Configuration | ai-ide | 1 | 0.9 | 0.6 | 0.8 | 0.7 | Single-tool deep dive (Cursor). Core for tool specialists. Moderate for explorers (good sample of IDE work). Solid for pragmatists (quick setup). |
| Challenge: Deploy to Vercel | hosting | 1 | 0.7 | 0.6 | 0.8 | 0.8 | Deployment fundamentals. Specialists wanting deployment need it. Pragmatists value it (ship fast). Completionists need all hosting content. |

> Note to AI assistants: When proposing weights for new content, compare your draft to the closest row(s) above. If your content is more specialist-focused than "Prompt Architect," its tool_specialist weight should be ≥0.9. If it's broader than "30-Minute Prototype," its explorer weight should be ≥0.7. Use relative positioning, not absolute rules.

### Example: Deriving Weights for New Content

**Scenario:** An author has written a new challenge called "Firebase Studio Prototype" — a beginner-level challenge in the `prototyping` track covering Firebase Studio, estimated at 30 minutes.

**AI assistant reasoning:**

> This is a single-tool challenge (Firebase Studio) at beginner difficulty in the prototyping track. Let me compare to calibration examples:Similar to "Cursor IDE Configuration" (single-tool, beginner, setup-focused) → tool_specialist should be high (~0.9)Broader than "Prompt Architect" (which is intermediate) but narrower than "30-Minute Prototype" (which is tool-agnostic) → explorer around 0.5–0.6Beginner difficulty, contributes to prototyping track completion → completionist: 0.8Quick (30 min), practical → pragmatist: 0.7

**Proposed weights:**

```yaml
recommendedFor:
  tool_specialist: 0.9
  explorer: 0.5
  completionist: 0.8
  pragmatist: 0.7
```

## Available Markdown Components

The MarkdownRenderer supports standard markdown plus custom directives for rich content.

**For an interactive visual reference of all available components, visit the **[**Content Studio**](/content-studio)**.**

### Standard Markdown

#### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
```

**Note:** Use `##` (H2) for main sections, `###` (H3) for subsections. Avoid `#` (H1) as it's reserved for the page title.

#### Text Formatting

```markdown
**Bold text**
*Italic text*
`inline code`
```

#### Lists

```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item
3. Third item
```

#### Code Blocks

```markdown
```javascript
const example = "Code blocks include automatic copy button";
console.log(example);
```

```

**Features:**

- Syntax highlighting based on language tag
- Automatic copy-to-clipboard button
- Language label displayed in header

#### Links

**CODE_BLOCK_11**

**Note:** External links automatically open in new tab.

#### Images & Screenshots

**Standard syntax:****CODE_BLOCK_12**

**Placeholder keyword** — renders a labelled text-box instead of a broken-image icon; use during drafting when the real URL is not yet available:**CODE_BLOCK_13**

**Sample image for preview** — `/sample-screenshot.svg` is a sample image file served by the app. Use it when you want a visual placeholder that renders as an actual image rather than a text-box:**CODE_BLOCK_14**

**Best practices:**

- **Descriptive alt text** — always write meaningful alt text (e.g. `![Dashboard showing active listings]`). It improves accessibility for screen-reader users and serves as the fallback when an image cannot load.
- **Captions** — add a caption as the plain paragraph immediately below the image line:**CODE_BLOCK_15**
- **Replace before publishing** — swap every `placeholder` or `/sample-screenshot.svg` URL with a real hosted image URL before the article goes live.
- **Hosting screenshots** — upload screenshots to SharePoint (or any publicly accessible URL) and paste the direct link into the image tag.

#### Blockquotes

**CODE_BLOCK_16**

#### Horizontal Rules

**CODE_BLOCK_17**

### GitHub Flavored Markdown (GFM)

#### Tables

**CODE_BLOCK_18**

#### Strikethrough

**CODE_BLOCK_19**

#### Task Lists

**CODE_BLOCK_20**

### Custom Directives

**Important: Use **`::`** (leaf directive), not **`:::`** (container directive)**

- `::directive{...}` — Leaf directive (correct) — renders as a single component
- `:::directive{...}` — Container directive (wrong) — consumes all following content as children

Always use `::` (2 colons) for video and copy-button directives.

#### Video Embed

Embeds video players with controls. Supports SharePoint iframe embeds and direct .mp4 URLs.

**Syntax:****CODE_BLOCK_21**

**SharePoint Example:****CODE_BLOCK_22**

**Direct MP4 Example:****CODE_BLOCK_23**

**Features:**

- SharePoint embeds render as iframes
- Direct .mp4 files render with custom video player
- Play/pause, mute, fullscreen controls
- Error handling with fallback message

**Getting SharePoint Embed URL:**

1. Open video in SharePoint
2. Click "..." menu → "Embed"
3. Copy **ONLY** the iframe `src` URL (not the entire `&lt;iframe&gt;` tag)
4. Use that URL in the `url` parameter

**⚠️ Common Mistake**: Do NOT paste the entire `&lt;iframe&gt;` tag as the URL value. Extract only the `src` attribute value.

❌ Wrong: `url="&lt;iframe src=\"https://...\" ...&gt;&lt;/iframe&gt;"`✅ Correct: `url="https://..."`

#### Copy Button

Creates a button that copies text to clipboard.

**Syntax:****CODE_BLOCK_24**

**Example:****CODE_BLOCK_25**

**Features:**

- Displays text in monospace font
- Shows "Copied!" confirmation for 2 seconds
- Optional custom label (defaults to "Copy")

### Adding New Directives

The `remark-directive` plugin makes it easy to add new directive types in the future. Update the `remarkCustomDirectives` plugin in `MarkdownRenderer.tsx` to handle new directive names.

## Content File Templates

### New Lesson Template

**File:** `public/content/ai-driven-experimentation/lessons/XX-lesson-title.md`

`ai-ide`javascript// Code exampleconst example = "Show practical code when relevant";**CODE_BLOCK_27**

### New Challenge Template (Beginner — Difficulty 1)

**File:** `public/content/ai-driven-experimentation/challenges/challenge-id.md`

**CODE_BLOCK_28**

### New Challenge Template (Intermediate — Difficulty 2)

**CODE_BLOCK_29**

### New Challenge Template (Advanced — Difficulty 3)

**CODE_BLOCK_30**

## Step-by-Step: Adding a New Lesson

### 1. Create the Markdown File

**Location:** `public/content/ai-driven-experimentation/lessons/`

**Naming Convention:** `XX-lesson-title.md`

- `XX` = Two-digit number matching the lesson `id` and `order`
- `lesson-title` = Kebab-case version of the title
- Example: `06-advanced-prototyping.md`

### 2. Add Frontmatter

Copy the [lesson template](#new-lesson-template) and fill in **all** fields:

**Standard fields:**

- Set `id` and `order` to the next available number
- Set `unlocksRank` to match `id` (or appropriate rank)
- Choose a descriptive `title` and `description`
- Set realistic `estimatedTime`
- Add `badgeName` and `unlockMessage` if this lesson unlocks a rank

**Coordinator fields:**

- Set `track` to the primary skill track (see §2)
- Set `trackPrereqs` — usually `[]` for lessons (track-level prereqs are handled by the Coordinator)
- Set `toolTags` with every tool/platform mentioned in the content (1+ required)
- Set `estimatedMinutes` to match `estimatedTime` numerically
- For `recommendedFor` weights — see step 3

### 3. Derive Archetype Weights

**Option A — AI-assisted (recommended):**Share your draft content + this guide with an AI assistant and ask it to propose `recommendedFor` weights. It will use the Weight Derivation Reference (§5) to calibrate against existing content. Review and adjust.

**Option B — Manual:**Use the heuristic rules and weight scale in §5 to assign weights yourself. Compare against the calibration examples table.

### 4. Write Content

- Use `##` for main sections
- Include practical examples and code snippets
- Add videos or copy buttons where helpful
- Keep paragraphs concise and scannable
- Use lists for key points

### 5. Regenerate Content Index

**CODE_BLOCK_31**

**Expected output:****CODE_BLOCK_32**

If you see validation errors related to coordinator fields, see [Troubleshooting](#troubleshooting).

### 6. Verify Locally

**CODE_BLOCK_33**

Navigate to your lesson in the browser and verify:

- Frontmatter fields display correctly
- Content renders properly
- Videos and interactive elements work
- Links open correctly
- Code blocks have copy buttons

**Also verify coordinator integration:**

- Open the Learning Lobby and generate a path that should include your content
- Confirm your lesson appears in the generated path with correct track and ordering
- Check `content-index.json` to confirm coordinator fields are present

### 7. Build and Test

**CODE_BLOCK_34**

If the build succeeds, your lesson is ready to commit.

### 8. Commit and Push

**CODE_BLOCK_35**

## Step-by-Step: Adding a New Challenge

### 1. Create the Markdown File

**Location:** `public/content/ai-driven-experimentation/challenges/`

**Naming Convention:** `challenge-id.md`

- Use kebab-case
- Keep it short but descriptive
- Must match the `id` field in frontmatter
- Example: `rapid-iteration-master.md`

### 2. Add Frontmatter

Copy the appropriate [challenge template](#new-challenge-template-beginner--difficulty-1) based on difficulty:

- Beginner (difficulty: 1) — Clear step-by-step instructions
- Intermediate (difficulty: 2) — Guidelines and suggestions
- Advanced (difficulty: 3) — High-level objectives only

Fill in **all** fields:

**Standard fields:**

- Set unique `id` (must match filename without `.md`)
- Choose appropriate `difficulty` (1-3)
- Set `requiredRank` (minimum rank to unlock)
- Select an `icon` from [available icons](#available-icons)
- Write a first-person `badgeStatement`

**Coordinator fields:**

- Set `track` to the primary skill track
- Set `trackPrereqs` — usually `[]` unless the challenge specifically requires another track's knowledge
- Set `toolTags` with every tool/platform the challenge involves
- Set `estimatedMinutes` to match `estimatedTime` numerically
- Derive `recommendedFor` weights using §5

### 3. Derive Archetype Weights

Same as for lessons — use AI-assisted derivation (recommended) or the heuristic rules in §5.

### 4. Write Content

Structure based on difficulty:

**Beginner (1):** Detailed steps, clear completion criteria, specific examples**Intermediate (2):** Guidelines rather than steps, multiple valid approaches, quality standards**Advanced (3):** Context and constraints, success criteria, minimal prescriptive guidance

### 5. Regenerate, Verify, Build, Commit

Follow the same verification flow as lessons (steps 5-8 in the lesson guide above).

## Naming Conventions & Controlled Vocabularies

### File Naming

**Lessons:**

- Format: `XX-lesson-title.md`
- `XX` = Two-digit number (01, 02, 03, ...)
- `lesson-title` = Kebab-case, descriptive
- Examples: `01-prototyping-with-figma.md`, `12-advanced-ai-workflows.md`

**Challenges:**

- Format: `challenge-id.md`
- Use kebab-case
- Must match the `id` field in frontmatter
- Examples: `30-minute-prototype.md`, `experiment-evangelist.md`

### ID Format

**Lessons:** `number` — Sequential integers starting from 1 (e.g., `1`, `2`, `3`)**Challenges:** `string` — Kebab-case, must match filename without `.md` (e.g., `"30-minute-prototype"`)

### Tracks (Controlled — Do Not Invent New Values)

**CODE_BLOCK_36**

> ⚠️ These four tracks are the only valid values for the track field. If you're creating content that doesn't fit any track, raise this with the team — a new track may need to be added to the Coordinator configuration.

### Tool Tags (Extensible — Authors Can Add New Tags)

Tool tags are **lowercase, kebab-case** identifiers for specific tools and platforms. New tags can be added by content authors — the build script does not validate individual tag values, only that the `toolTags` array is non-empty.

**Current tags in use:**

| Category | Tags |
| --- | --- |
| Prototyping tools | figma, figma-ai, lovable, firebase-studio |
| AI IDEs | cursor, copilot, github-copilot, claude-code, vs-code |
| Hosting platforms | vercel, aws, gcp, firebase-hosting |
| Measurement tools | mixpanel, arize, analytics |
| General | mcp, api-integration, ai-prompting |

**When adding a new tag:**

- Use lowercase kebab-case (e.g., `windsurf`, `replit`, `amplitude`)
- Be specific — prefer `github-copilot` over `copilot` if disambiguation is needed
- Check the table above first to avoid duplicates or inconsistencies
- New tags automatically appear in the Visual Discovery Poster once content is deployed

### Archetype Keys (Controlled — Do Not Invent New Values)

**CODE_BLOCK_37**

> All four keys must appear in every recommendedFor object. Missing keys will cause a build validation error.

### Available Icons

All challenges must use one of these Lucide icon names:

| Icon Name | Use Case |
| --- | --- |
| Zap | Speed, velocity, quick actions |
| Clock | Time management, scheduling |
| CalendarCheck | Planning, milestones |
| FlaskConical | Experimentation, testing |
| FileEdit | Documentation, writing |
| Filter | Data analysis, refinement |
| Blocks | Building, construction |
| Workflow | Processes, automation |
| LayoutTemplate | Design, templates |
| Megaphone | Communication, evangelism |
| Users | Collaboration, teamwork |
| BarChart3 | Analytics, metrics |
| Shuffle | Iteration, variation |
| RefreshCw | Continuous improvement |
| Route | Navigation, pathfinding |
| Terminal | IDE, command-line, development setup |

**Note:** Icon names are case-sensitive. If you specify an invalid icon name, the system will display a fallback `HelpCircle` icon.

## Validation & Testing

### Running the Content Index Generator

The build script validates **all** content — including coordinator fields — and generates the index:

**CODE_BLOCK_38**

### Understanding Output

**Success:****CODE_BLOCK_39**

**Validation Errors:****CODE_BLOCK_40**

### Common Validation Errors

| Error Message | Cause | Solution |
| --- | --- | --- |
| Missing required lesson fields: track, toolTags | Coordinator fields missing from frontmatter | Add all coordinator fields (track, trackPrereqs, toolTags, recommendedFor, estimatedMinutes) |
| Invalid track value "design" | Track value not in controlled vocabulary | Use one of: prototyping, ai-ide, hosting, measurement |
| Missing archetype key "pragmatist" in recommendedFor | Not all 4 archetype keys present in weights | Ensure all 4 keys appear: tool_specialist, explorer, completionist, pragmatist |
| toolTags must have at least 1 entry | Empty toolTags array | Add at least one tool tag |
| estimatedMinutes must be a positive number | Missing or invalid estimatedMinutes | Set a numeric value matching your estimatedTime |
| Invalid trackPrereqs value "coding" | Invalid track ID in prereqs array | Only use valid track IDs in trackPrereqs |
| Missing required lesson fields: id, title | Standard frontmatter fields missing | Add all required standard fields from the schema |
| No frontmatter found in file.md | Missing --- delimiters | Add YAML frontmatter block at top of file |

### Checking Generated Index

The generated `public/content-index.json` now includes coordinator fields:

**CODE_BLOCK_41**

**Verify:**

- Your content appears in the appropriate array
- All standard **and** coordinator fields are present
- `track` is a valid track ID
- `recommendedFor` has all 4 archetype keys with values between 0.0 and 1.0
- `toolTags` is non-empty

### Local Development Testing

1. **Start dev server:****CODE_BLOCK_42**
2. **Test content rendering:**
  - Lessons: `http://localhost:5173/lessons/{id}`
  - Challenges: `http://localhost:5173/challenges/{id}`
3. **Test Coordinator integration:**
  - Visit the Learning Lobby
  - Enter a free-text description that should match your content's track/tools
  - Confirm your content appears in the generated path
  - Check path ordering respects track prerequisites
4. **Content rendering checklist:**
  - [ ] Content renders without errors
  - [ ] Frontmatter fields display correctly
  - [ ] Videos play (if included)
  - [ ] Copy buttons work (if included)
  - [ ] Code blocks have syntax highlighting
  - [ ] Links open in new tabs
  - [ ] Images load correctly
  - [ ] Responsive layout works on mobile
5. **Coordinator integration checklist:**
  - [ ] Content appears in `content-index.json` with coordinator fields
  - [ ] Content's `toolTags` appear in the Visual Discovery Poster
  - [ ] Content is included in relevant generated paths
  - [ ] Track prerequisite ordering is correct

### Production Build Testing

Always run a production build before committing:

**CODE_BLOCK_43**

## Best Practices

### Content Quality

1. **Focus on one concept per lesson**
  - Don't try to teach everything at once
  - Break complex topics into multiple lessons
  - Each lesson should have a clear learning objective
2. **Use clear, concise language**
  - Write at an accessible level
  - Avoid jargon unless necessary (and define it)
  - Use active voice
  - Keep sentences short
3. **Include practical examples**
  - Show, don't just tell
  - Use real-world scenarios
  - Provide code examples where relevant
  - Include screenshots or videos for visual concepts
4. **Structure content logically**
  - Start with context and motivation
  - Build from simple to complex
  - Use headings to create clear sections
  - End with summary and next steps

### Coordinator Metadata Best Practices

1. **Be precise with **`track`** assignment**
  - Each content item belongs to exactly one track
  - If content spans multiple tracks, assign it to the **primary** track — the one a user would associate this content with
  - Example: A challenge about "deploying a Cursor project to Vercel" → `track: "hosting"` (deployment is the primary skill), with `trackPrereqs: ["ai-ide"]`
2. **Be generous with **`toolTags`
  - Tag every tool, platform, or framework mentioned in the content
  - More tags = better discoverability in the Visual Discovery Poster
  - More tags = better tool-interest matching in the scoring algorithm
  - It's better to over-tag than under-tag
3. **Keep **`trackPrereqs`** minimal**
  - The Coordinator handles track-level prerequisites automatically
  - Only add `trackPrereqs` when your specific content assumes hands-on experience from another track
  - Most content should have `trackPrereqs: []`
4. **Ensure **`estimatedMinutes`** matches **`estimatedTime`
  - `estimatedTime: "1 hour"` → `estimatedMinutes: 60`
  - `estimatedTime: "30 mins"` → `estimatedMinutes: 30`
  - `estimatedTime: "1.5 hours"` → `estimatedMinutes: 90`
  - The algorithm uses `estimatedMinutes` for time-budget fitting; inconsistency leads to bad path estimates
5. **Calibrate **`recommendedFor`** weights against existing content**
  - Always compare your weights to the calibration examples in §5
  - Relative consistency matters more than absolute precision
  - When in doubt, use AI-assisted derivation — it's faster and more consistent

### Technical Best Practices

1. **Test all links and videos**
  - Verify URLs before committing
  - Test SharePoint embeds in browser
  - Check that external links are still valid
2. **Use consistent formatting**
  - Follow the templates provided
  - Use the same heading levels for similar content
  - Maintain consistent code block formatting
3. **Validate before committing**
  - Always run `npm run generate-content-index`
  - Fix all validation errors (standard **and** coordinator fields)
  - Run `npm run build` to catch build issues
  - Test locally in dev server
4. **Keep frontmatter accurate**
  - Set realistic `estimatedTime` and matching `estimatedMinutes`
  - Choose appropriate `difficulty` levels
  - Use descriptive `title` and `description`
  - Ensure `id` values are unique

### Writing for AI Assistants

Since AI assistants may use this guide to create content:

1. **Share this entire guide** as context when asking an AI to create content
2. **The Weight Derivation Reference (§5) is designed for AI consumption** — it contains calibration examples, heuristic rules, and a worked example
3. **Ask the AI to show its reasoning** when proposing weights — this makes review easier
4. **Provide the existing **`content-index.json` as additional context so the AI can see the current catalog and calibrate accordingly

## Troubleshooting

### Coordinator Field Errors

**Problem:** `Missing required lesson fields: track, toolTags`

**Solution:** Add all coordinator fields to your frontmatter:**CODE_BLOCK_44**

**Problem:** `Invalid track value "design"`

**Solution:** Use one of the four valid track IDs:**CODE_BLOCK_45**

**Problem:** `Missing archetype key "pragmatist" in recommendedFor`

**Solution:** All four archetype keys must be present:**CODE_BLOCK_46**

**Problem:** `toolTags must have at least 1 entry`

**Solution:** Add at least one tool tag:**CODE_BLOCK_47**

### Content Not Appearing in Paths

**Problem:** New content doesn't show up in generated learning paths

**Checklist:**

1. Did you run `npm run generate-content-index`?
2. Is your content in `content-index.json` with coordinator fields?
3. Is the `track` value correct for the path you're testing?
4. Are the `recommendedFor` weights high enough for the archetype you're testing? (Low weights = content may be excluded for that archetype)
5. Does the path's time budget have room for your content? (Check `estimatedMinutes`)
6. Are `trackPrereqs` satisfied in the test path?

### Content Not Appearing in Visual Poster

**Problem:** New tool tags don't show up in the Learning Lobby poster

**Checklist:**

1. Did you run `npm run generate-content-index` after adding new `toolTags`?
2. Is the tag spelled correctly in your frontmatter?
3. Did you redeploy? (The poster is generated from the deployed `content-index.json`)

### Build Script Errors

**Problem:** `No frontmatter found in file.md`

**Solution:** Ensure your file starts with `---` and ends the frontmatter block with `---`:**CODE_BLOCK_48**

### Video Not Loading

**Problem:** Video shows error message

**Possible causes:**

1. Invalid URL — Check that the URL is correct
2. SharePoint permissions — Ensure video is publicly accessible
3. Wrong embed format — Use the iframe `src` URL, not the page URL
4. CORS issues — Some video hosts block embedding

**Solution for SharePoint:**

1. Open video in SharePoint → Click "..." → "Embed"
2. Copy the `src` attribute from the iframe code
3. Use that URL in `::video{url="..."}`

### Invalid Icon Name

**Problem:** Challenge shows question mark icon instead of intended icon

**Solution:** Check that your icon name exactly matches one from the [Available Icons](#available-icons) table. Icon names are case-sensitive:

- ✅ Correct: `icon: "Zap"`
- ❌ Wrong: `icon: "zap"`
- ❌ Wrong: `icon: "Lightning"`

## Author Checklist (Quick Reference)

Use this checklist every time you create or update content:

**Standard Content:**

- [ ] Created `.md` file in correct directory with correct naming convention
- [ ] All required standard frontmatter fields present (`type`, `id`, `title`, etc.)
- [ ] Content body written with proper markdown formatting
- [ ] Videos, code blocks, and interactive elements tested

**Course Coordinator Fields:**

- [ ] `track` — set to one of: `prototyping`, `ai-ide`, `hosting`, `measurement`
- [ ] `trackPrereqs` — set (usually `[]`)
- [ ] `toolTags` — at least 1 tag, lowercase kebab-case
- [ ] `recommendedFor` — all 4 archetype keys present, values between 0.0 and 1.0
- [ ] `estimatedMinutes` — positive number matching `estimatedTime`

**Weight Calibration:**

- [ ] Weights derived using §5 (AI-assisted or manual with heuristic rules)
- [ ] Weights compared against calibration examples for consistency

**Validation:**

- [ ] `npm run generate-content-index` runs without errors
- [ ] Content appears in `content-index.json` with all fields
- [ ] `npm run build` succeeds
- [ ] Tested locally in dev server (content rendering + Coordinator integration)

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the generated index:** Look at `public/content-index.json` to see if your content was indexed correctly with all coordinator fields
2. **Review existing content:** Look at working examples in `public/content/ai-driven-experimentation/`
3. **Check the console:** Browser console and terminal output often show helpful error messages
4. **Validate your YAML:** Use a YAML validator to check frontmatter syntax
5. **Test incrementally:** Add content in small pieces and test frequently
6. **Reference the Feature Spec:** For deeper understanding of how the Coordinator uses metadata, see `AI-Course-Coordinator-Feature-Spec-v2.md`

**End of Guide**

This guide is maintained alongside the codebase. If you find errors or have suggestions for improvement, please update this document.
```