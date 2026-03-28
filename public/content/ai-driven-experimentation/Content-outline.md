# AI Hub — Content Catalogue

> Source: Miro Board — Frame 49Guide: AUTHORING-GUIDE-v3.md · Migration: Implementing-track-based-content.md · Last updated: 2026-02-28

## Legend

| Field | Values / Notes |
| --- | --- |
| Code | L## = Lesson · C-slug = Challenge |
| Type | Lesson · Challenge |
| Track | prototyping · ai-workbench · productivity · hosting · measurement |
| Prerequisites | Track dependency: none = immediately available · track name(s) = must complete first |
| Approval | ✅ REA Approved · 🟡 REA Tolerated · 🔴 External · ⚗️ FlowLab |
| Diff | 1 Beginner · 2 Intermediate · 3 Advanced |
| Rank | Displayed rank at time of entry — for reference only. Ranks are count-based: min(completedTrackCount + 1, 5) |
| isRequired | true = must complete to finish track · false = optional (counts toward score, not gate) |
| Status | live = published · coming-soon = placeholder card shown on Learn page |
| Category | Progress page grouping: Velocity · Precision · Leverage · Impact · Range (orthogonal to track) |
| TS / EX / CO / PR | Archetype weights: Tool Specialist · Explorer · Completionist · Pragmatist (0.0–1.0) |

## Track Structure (v3 — Track-Based)

Content is organized by **learning tracks** with explicit dependencies. Ranks are awarded retrospectively when tracks are completed.

| Track | Prerequisites | What You Learn | Content |
| --- | --- | --- | --- |
| Prototyping | None | Rapid prototyping with Figma Make and visual design tools | L01 + prototyping challenges |
| AI-Workbench | None | AI-assisted development with VS Code, Copilot, Cline | L02 + IDE challenges |
| Productivity | AI-Workbench | Connect AI tools to enterprise systems via MCP | L05 + MCP challenges |
| Hosting | AI-Workbench | Deploy prototypes to cloud platforms | L03 + hosting challenges |
| Measurement | Hosting | Measure and evaluate AI system performance | L04 + measurement challenges |

> Count-Based Ranks: Ranks are no longer awarded per-track. Instead, rank = min(completedTrackCount + 1, 5). Completing ANY track levels you up. Completing 4 or more tracks caps you at Rank 5.

**Dependency Chain:**

```
[Prototyping]   [AI-Workbench]
    (no prereq)       (no prereq)
                          │
                ┌─────────┴──────────┐
                ↓                    ↓
         [Productivity]          [Hosting]
                                     │
                                     ↓
                               [Measurement]
```

> Key Changes from v2: Content access is gated by track prerequisites, not ranks. Completing a track increments your rank score (min(completedTrackCount + 1, 5)). Learners can start with any track that has no prerequisites.

## Content Catalogue

| Code | Type | Learning Track | Tool(s) | Approval | Diff | Rank | isRequired | Status | Category | Est. | TS | EX | CO | PR | Tool Tags | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L01 | Lesson | prototyping | Figma Make | ✅ REA Approved | 1 | →2 | true | live | — | 60 min | 0.7 | 0.8 | 1.0 | 0.8 | figma, figma-ai | Track: Prototyping (no prereq) — Guild talk: "Figma Make" masterclass |
| C-lovable-prototype | Challenge | prototyping | Lovable.dev | 🟡 REA Tolerated | 1 | →2 | false | live | Velocity | 30 min | 0.9 | 0.7 | 0.8 | 0.8 | lovable | Track: Prototyping — 30-min prototype challenge — ship a working app from a prompt |
| C-firebase-studio | Challenge | prototyping | Firebase Studio | 🟡 REA Tolerated | 1 | →2 | false | live | Velocity | 30 min | 0.9 | 0.5 | 0.8 | 0.7 | firebase-studio | Track: Prototyping — Build & preview a prototype in Firebase Studio |
| C-v0-components | Challenge | prototyping | v0 | 🔴 External | 2 | →2 | false | live | Range | 45 min | 0.8 | 0.5 | 0.8 | 0.6 | v0 | Track: Prototyping — Generate and iterate UI components with Vercel v0 |
| C-replit-prototype | Challenge | prototyping | Replit | 🔴 External | 2 | →2 | false | live | Range | 45 min | 0.7 | 0.6 | 0.7 | 0.6 | replit | Track: Prototyping — Browser-based full-stack prototyping with Replit AI |
| L02 | Lesson | ai-workbench | VS Code + Copilot | ✅ REA Approved | 1 | →2 | true | live | — | 60 min | 0.9 | 0.7 | 1.0 | 0.9 | vs-code, copilot, github-copilot | Track: AI-Workbench (no prereq) — Guild talk: "AI Workbench" |
| C-prove-omnia | Challenge | ai-workbench | Omnia | ✅ REA Approved | 1 | →2 | false | live | Velocity | 15 min | 0.6 | 0.8 | 0.7 | 0.9 | omnia | Track: AI-Workbench — On-ramp: "Prove you use Omnia" |
| C-prove-glean | Challenge | ai-workbench | Glean | ✅ REA Approved | 1 | →2 | false | live | Velocity | 15 min | 0.6 | 0.8 | 0.7 | 0.9 | glean | Track: AI-Workbench — On-ramp: "Prove you use Glean" |
| C-canvas-template | Challenge | ai-workbench | Canvas Template | ✅ REA Approved | 1 | →2 | false | live | Velocity | 20 min | 0.7 | 0.7 | 0.8 | 0.9 | mcp, ai-prompting | Track: AI-Workbench — Frame a problem with the AI canvas template and generate output |
| C-voicemode | Challenge | ai-workbench | VoiceMode | 🟡 REA Tolerated | 1 | →2 | false | live | Velocity | 20 min | 0.8 | 0.6 | 0.7 | 0.8 | voicemode | Track: AI-Workbench — Dictate and converse with your AI IDE using VoiceMode |
| C-vscode-copilot-setup | Challenge | ai-workbench | VS Code + Copilot | ✅ REA Approved | 1 | →2 | true | live | Precision | 30 min | 0.9 | 0.6 | 0.8 | 0.8 | vs-code, copilot, github-copilot | Track: AI-Workbench — Install, configure and use Copilot for the first time |
| C-cline-agent | Challenge | ai-workbench | Cline | 🟡 REA Tolerated | 2 | →2 | false | live | Precision | 45 min | 0.9 | 0.5 | 0.8 | 0.6 | cline, vs-code | Track: AI-Workbench — Agentic coding with Cline inside VS Code — automate a task end-to-end |
| C-claude-code | Challenge | ai-workbench | Claude Code | 🔴 External | 2 | →2 | false | live | Precision | 60 min | 0.9 | 0.5 | 0.8 | 0.6 | claude-code | Track: AI-Workbench — Terminal-first agentic coding with Claude Code |
| L05 | Lesson | productivity | MCP Glean, MCP Miro, MCP Atlassian | ✅ REA Approved | 1 | →3 | true | live | — | 60 min | 0.8 | 0.8 | 1.0 | 0.8 | mcp, mcp-glean, mcp-miro, mcp-atlassian | Track: Productivity (requires: AI-Workbench) — Guild talk: "MCP for Advanced Workflows" |
| C-mcp-glean | Challenge | productivity | MCP Glean | ✅ REA Approved | 1 | →3 | true | live | Leverage | 30 min | 0.9 | 0.6 | 0.8 | 0.7 | mcp, mcp-glean | Track: Productivity — Connect and query Glean via MCP in your AI IDE |
| C-mcp-miro | Challenge | productivity | MCP Miro | ✅ REA Approved | 1 | →3 | false | live | Leverage | 30 min | 0.9 | 0.6 | 0.8 | 0.7 | mcp, mcp-miro | Track: Productivity — Read and write Miro boards from your AI IDE via MCP |
| C-mcp-atlassian | Challenge | productivity | MCP Atlassian | ✅ REA Approved | 1 | →3 | false | live | Leverage | 30 min | 0.9 | 0.6 | 0.8 | 0.7 | mcp, mcp-atlassian | Track: Productivity — Manage Jira/Confluence from your AI IDE via MCP |
| L03 | Lesson | hosting | AWS, Google Cloud | ✅ REA Approved | 1 | →4 | true | live | — | 60 min | 0.7 | 0.7 | 1.0 | 0.8 | aws, gcp, firebase-hosting | Track: Hosting (requires: AI-Workbench) — Deployment fundamentals |
| C-deploy-vercel | Challenge | hosting | Vercel | 🔴 External | 1 | →4 | true | live | Velocity | 30 min | 0.7 | 0.6 | 0.8 | 0.8 | vercel | Track: Hosting — Ship a frontend to Vercel in under 30 mins |
| C-deploy-aws | Challenge | hosting | AWS | ✅ REA Approved | 2 | →4 | false | live | Leverage | 60 min | 0.7 | 0.5 | 0.8 | 0.7 | aws | Track: Hosting — Deploy a containerised prototype to AWS |
| C-deploy-gcp | Challenge | hosting | Google Cloud | ✅ REA Approved | 2 | →4 | false | live | Leverage | 60 min | 0.7 | 0.5 | 0.8 | 0.7 | gcp, firebase-hosting | Track: Hosting — Deploy to GCP / Cloud Run |
| L04 | Lesson | measurement | Arise | ✅ REA Approved | 1 | →5 | true | live | — | 60 min | 0.5 | 0.7 | 1.0 | 0.6 | arize | Track: Measurement (requires: Hosting) — Guild talk: "Measuring AI with Arize" |
| C-arise-eval | Challenge | measurement | Arise | ✅ REA Approved | 2 | →5 | true | live | Impact | 60 min | 0.8 | 0.4 | 0.9 | 0.5 | arize | Track: Measurement — Run a structured evaluation of an AI feature using Arise |
| C-whisperflow | Challenge | ai-workbench | WhisperFlow | ⚗️ FlowLab | 2 | →2 | false | live | Range | 30 min | 0.8 | 0.4 | 0.7 | 0.6 | whisperflow | Track: AI-Workbench — FlowLab: set up a local STT pipeline with WhisperFlow |
| C-openclaw | Challenge | ai-workbench | OpenClaw | ⚗️ FlowLab | 2 | →2 | false | live | Range | 30 min | 0.8 | 0.4 | 0.7 | 0.5 | openclaw | Track: AI-Workbench — FlowLab: explore OpenClaw for agentic tool use |

> Track-Based System (v3): Content is organized by learning tracks with explicit dependencies. The Rank column shows the rank at time of entry for reference — ranks are count-based: min(completedTrackCount + 1, 5).isRequired: true = must complete to finish track · false = optional. Track completion requires all isRequired: true content in that track.Dependencies: Prototyping (none), AI-Workbench (none), Productivity (requires AI-Workbench), Hosting (requires AI-Workbench), Measurement (requires Hosting).

## Track Summary (Track-Based System)

| Track | Prerequisites | Required Content | Optional Content | Access |
| --- | --- | --- | --- | --- |
| Prototyping | None | L01 (Figma Make) | C-lovable-prototype, C-firebase-studio, C-v0-components, C-replit-prototype | ✅ Available immediately |
| AI-Workbench | None | L02 (AI Workbench), C-vscode-copilot-setup | C-prove-omnia, C-prove-glean, C-canvas-template, C-voicemode, C-cline-agent, C-claude-code, C-whisperflow, C-openclaw | ✅ Available immediately |
| Productivity | AI-Workbench | L05 (MCP), C-mcp-glean | C-mcp-miro, C-mcp-atlassian | ⏳ Unlocks after AI-Workbench complete |
| Hosting | AI-Workbench | L03 (Deployment), C-deploy-vercel | C-deploy-aws, C-deploy-gcp | ⏳ Unlocks after AI-Workbench complete |
| Measurement | Hosting | L04 (Arize), C-arise-eval | (none) | ⏳ Unlocks after Hosting complete |

> Track Completion & Count-Based Ranks: Completing a track increments your rank: rank = min(completedTrackCount + 1, 5). Any track completion levels you up — there are no per-track rank assignments. Optional content counts toward overall progress and leaderboard score but is not required for track completion.Multiple Paths: Learners can complete Prototyping and AI-Workbench in any order (or in parallel). After completing AI-Workbench, both Productivity and Hosting tracks unlock and can be pursued in parallel.

## Category Distribution (Progress Page)

| Category | Challenges | Ranks Covered |
| --- | --- | --- |
| Velocity | C-prove-omnia, C-prove-glean, C-canvas-template, C-voicemode, C-lovable-prototype, C-firebase-studio, C-deploy-vercel | 1, 2, 4 |
| Precision | C-vscode-copilot-setup, C-cline-agent, C-claude-code | 2 |
| Leverage | C-mcp-glean, C-mcp-miro, C-mcp-atlassian, C-deploy-aws, C-deploy-gcp | 3, 4 |
| Impact | C-arise-eval | 5 |
| Range | C-v0-components, C-replit-prototype, C-whisperflow, C-openclaw | 4, 5 |

## To Refine

- [ ] **Confirm **`isRequired`** tags per rank with Jan before authoring begins** — proposed assignments are in the catalogue; rule is ≥1 required lesson + ≥1 required challenge per rank (Rank 1 exception: either on-ramp challenge)
- [ ] Confirm approval status of each tool with platform/security team (especially External & FlowLab tiers)
- [ ] Decide if L03 (Hosting/Deployment) is promoted to `isRequired: true` at Rank 4 (raises the Builder bar)
- [ ] Finalise lesson `id` numbers — L01–L05 are placeholders; must be sequential integers in the system
- [ ] Add `badgeName`, `badgeStatement`, and `icon` per challenge (see AUTHORING-GUIDE §10 Available Icons)
- [ ] Author `C-prove-omnia` and `C-prove-glean` challenge bodies — use AUTHORING-GUIDE Beginner template (target: <15 min, minimal setup)
- [ ] Add `status: coming-soon` rows for any content planned but not yet authored
- [ ] Write content bodies — use AUTHORING-GUIDE templates per difficulty level
- [ ] Add video embed URLs once Guild talks are recorded (lessons)
- [ ] Plan additional content for thin ranks/categories: Rank 3 (only 3 MCP challenges), Impact category (only 1 challenge)
- [ ] Resolve remaining open questions from migration doc §8: Q5 (is "AI Architect" right for PMs?) and Q6 (FlowLab tier for WhisperFlow/OpenClaw)
- [ ] Discuss A1 (track field vs rank field coexistence) before authoring new content