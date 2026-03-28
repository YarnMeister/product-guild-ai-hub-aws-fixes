# AI Hub — Technical Reference (@SPEC.md)

> **Canonical technical reference.**
>
> - **Operational spec / current milestone / tasks:** Spec note in the Intent workspace.
> - **Deployments:** Deployment Log note (one-line summary may be referenced in the Spec note).
> - **Production:** https://rea-ai-hub.vercel.app
> - **Content authoring guide:** `public/content/AUTHORING-GUIDE-v3.md` (served at `/content/AUTHORING-GUIDE-v3.md`)

**Last updated:** 2026-03-23
**Audit applied:** Codebase Audit Report 2026-03-01 (all findings incorporated)

## Technical Changelog (recent, selected)

- 2026-03-23 — **UX Sprint — DEPLOYED**: shipped consistent Explore/Track interaction pattern: **"Peek inside" is the only popover trigger** (read-only popover); primary actions are **direct navigation buttons** (TrackPathfinder: **Explore →**; FindContentPanel: **Start Lesson / Start Challenge**). Row clicks are inert. Header nav behavior unchanged.
- 2026-03-17 — **Code quality sprint (Waves 1–4) — COMPLETE / verified**: DB migrations **020–025** (performance indexes, drop dead columns, store `rank_earned` on badges, ghost-notify dedupe constraint, drop coordinator tables); removed Coordinator AI feature + related API/routes/types; removed dead code + root planning docs; UI fixes (LessonSidebar unlock summary removed; `ProtectedRoute` spinner); API handlers cleaned (console noise removed); data correctness fix (`modules.ts` challenge count 20); authoring-guide references standardized to v3.
- 2026-03-11 — **Sidebar clipping fix (LessonPlayer + ChallengePlayer)**: ensure the main content flex item can shrink (`min-w-0`), and keep the sidebar from shrinking (`shrink-0`). Root cause: Radix `ScrollArea` injects a wrapper with `display: table; min-width: 100%`, which can force intrinsic width and push siblings off-screen if the flex item isn't allowed to shrink.
- 2026-03-11 — **CopyButton visible label fix**: `CopyButton` now renders only icon + `label`; the `text` prop is clipboard payload only (prevents giant nowrap buttons when copying long snippets).
- 2026-03-10 — **Lesson UI fixes**: "Unlock Summary" rank card only renders when `unlocksRank` is defined (prevents "Rank undefined").
- 2026-03-02 — **Content authoring guide v3**: AUTHORING-GUIDE-v3.md (253 lines, down from 1,037) — AI-optimised with preamble/interview flow, correct track IDs (`ai-workbench` not `ai-ide`), accurate icon list (matches `iconResolver.ts`), correct `copy-button` attrs; ContentStudio wired to v3; `figma-make-basics` challenge removed (redundant with L01 Figma Make lesson); 5 challenge icons fixed (`Link` → `Workflow`/`Route`).
- 2026-03-01 — **Rank model + track state APIs**: track-specific `maturityLevel` (2–5) replaces count-based rank; completing all `isRequired` content in a track awards that track's rank if higher than the user's current rank; `GET /api/tracks/state` for per-track `{ isUnlocked, isCompleted, completionPercent, maturityLevel, rankLabel }`; server enforces locked tracks (Challenge completion returns 403); migrations 016–019 (maturity fields, rank default fix, difficulty int, drop `is_unlocked`).
- 2026-02-28 — **Track-based content pivot**: introduced canonical track definitions (`src/data/tracks.ts`), `track_progress`, and track-aware rank progression (`src/lib/trackUnlock.ts`).
- 2026-02-25 — **Coordinator UX fixes**: confirmation screen always shows after profile generation; orphan path redirect loop fixed; debug logging stripped; migrations 013 + 014 applied.
- 2026-02-24 — **Course Coordinator V2**: learner profiling (OpenRouter → Claude Sonnet 4.5), deterministic scoring + personalised learning paths.
- 2026-02-23 — **Lobby → module redirect**: `/` now redirects to `/module/ai-driven-experimentation` (lobby removed); successful registration navigates to module overview.
- 2026-02-20 — **Content Studio**: screenshot/image authoring support.
- 2026-02-18 — **Markdown directives**: remark-directive migration; build-time directive validation.
- 2026-02-18 — **Content→Database Sync**: build-time upsert from `public/content-index.json` into Postgres.

---

## 0) Content System Summary

- **PR #9** — Content refactor (markdown-first, `public/content/*`, generated `public/content-index.json`, runtime loader)
- **PR #10** — Frontmatter hotfix
- **PR #11** — Legacy cleanup

Content metadata lives in markdown frontmatter (single source of truth). Progress persists server-side and hydrates on reload.

### 0.1 Content→Database Sync (deployed 2026-02-18)

Idempotent sync script runs during Vercel builds:
- Script: `scripts/sync-content-to-db.mjs`
- Verification: `scripts/verify-content-sync.mjs`

### 0.2 Markdown Directives

AST-based via `remark-directive`.

- **Syntax:** `::video{url="..." title="..."}` and `::copy-button{text="..." label="..."}`
- **Docs:** `public/content/AUTHORING-GUIDE-v3.md`
- **Build validation:** `npm run validate-directives` (runs in `prebuild`)

---

## 1) System Overview

AI Hub is a gamified learning platform. Users progress through **learning tracks** earning **ranks** and **badges**.

**Key terms:**
- **Lesson**: Track-based content item (DB: `lessons`). Each lesson belongs to a track (`trackId`).
- **Challenge**: Badge-earning content item (DB: `side_quests`). Each challenge belongs to a track.
- **Badge**: A completed `side_quests` record for a user (DB: `user_badges`).
- **Rank**: `users.current_rank` (1–5). Rank 1 ("AI User") is the starting rank. Rank is **track-driven**: completing all `isRequired` content in a track awards that track's `maturityLevel` if higher than current rank.
- **Track**: Named learning path grouping lessons + challenges. Defined in `src/data/tracks.ts`.

---

## 2) Architecture

**Hosting:** Vercel — React SPA (Vite) + Vercel serverless functions (`_api/*` → `/api/*`) + static content (`public/content/*` → `/content/*`)

**Database:** Neon serverless Postgres via `@neondatabase/serverless` + Drizzle ORM

---

## 3) Project Structure

```text
_api/
  auth/
    login.ts              # POST /api/auth/login
    register.ts           # POST /api/auth/register
    me.ts                 # GET /api/auth/me
  tracks/
    state.ts              # GET /api/tracks/state
  progress/
    index.ts              # GET /api/progress
    lesson.ts             # POST /api/progress/lesson
    challenge.ts          # POST /api/progress/challenge

public/
  content/
    AUTHORING-GUIDE-v3.md
    AUTHORING-GUIDE-v2.md   # historical reference (v3 is canonical)
    ai-driven-experimentation/
      lessons/            # /content/ai-driven-experimentation/lessons/*
      challenges/         # /content/ai-driven-experimentation/challenges/*
  content-index.json      # GENERATED at build time

src/
  contexts/
    AuthContext.tsx       # JWT + progress hydration + completion calls
  components/
    layout/Header.tsx     # Nav: Overview | Explore | Progress (module-scoped)
    tracks/
      TrackPathfinder.tsx # Track overview cards + actions (Explore / Peek inside)
    lesson/MarkdownRenderer.tsx
    lesson/MarkdownErrorBoundary.tsx
    explore/
      ConstellationKeywords.tsx   # Orbital keyword canvas (extracted component)
      FindContentPanel.tsx
    progress/
      LearningTracksPanel.tsx
      ProgressLearningList.tsx
      RankLadder.tsx
  pages/
    ModulesHub.tsx              # /modules — module selection
    ModuleOverview.tsx          # /module/:moduleId
    Explore.tsx                 # /module/:moduleId/explore (canonical learning hub)
    LessonPlayer.tsx
    ChallengePlayer.tsx
    Progress.tsx
    Login.tsx
    Register.tsx
    NotFound.tsx
    ContentStudio.tsx           # /content-studio
  data/
    tracks.ts             # 5 canonical track definitions
    modules.ts            # Module catalogue

  lib/
    auth.ts               # JWT (jose) + bcrypt
    apiClient.ts          # Auth token helpers + fetch wrapper
    trackUnlock.ts        # Track-governed rank progression
    contentLoader.ts      # Client runtime loader for content-index.json
    directiveRegistry.ts
    parseFrontmatter.ts
  db/
    schema.ts             # Drizzle schema
    index.ts              # Lazy DB init (safe for serverless)
  types/
    content.ts            # ContentIndex / Lesson / Challenge types
```

---

## 4) Static Content System

### 4.1 Content Paths

| Content | Repo path | URL path |
|---|---|---|
| Lessons | `public/content/ai-driven-experimentation/lessons/*.md` | `/content/ai-driven-experimentation/lessons/*.md` |
| Challenges | `public/content/ai-driven-experimentation/challenges/*.md` | `/content/ai-driven-experimentation/challenges/*.md` |
| Content index | `public/content-index.json` | `/content-index.json` |
| Authoring guide | `public/content/AUTHORING-GUIDE-v3.md` | `/content/AUTHORING-GUIDE-v3.md` |

> Note: `AUTHORING-GUIDE-v3.md` is canonical. `AUTHORING-GUIDE-v2.md` remains in-repo for historical reference.

### 4.2 Build Pipeline

`npm run prebuild` runs in order:
1. `npm run validate-directives`
2. `npm run generate-content-index`
3. `node scripts/migrate-safe.mjs`
4. `node scripts/sync-content-to-db.mjs`

`vercel.json` also runs `npm run db:migrate` (redundant but safe — migrations are tracked in `__app_migrations`).

### 4.3 Markdown Directives

Rendered client-side via `react-markdown` + `remark-directive` in `MarkdownRenderer.tsx`.

Supported directives:
- `::video{url="..." title="..."}` — `VideoEmbed`
- `::copy-button{text="..." label="..."}` — `CopyButton` (renders icon + label; `text` is clipboard payload only)

`directiveRegistry.ts` drives the Content Studio component library. Must stay aligned with `MarkdownRenderer` handlers (enforced by `validate-directives`).

### 4.4 Content Metadata (v3)

Fields in `content-index.json` (typed in `src/types/content.ts`):
- `track: TrackId`
- `status: "live" | "coming-soon"`
- `isRequired: boolean` — defines track completion
- `estimatedMinutes: number`
- `toolTags?: string[]`
- `recommendedFor?: Record<string, number>`
- `trackPrereqs?: string[]` — reserved

---

## 5) Frontend (React)

### 5.1 Routing

| Route | Page | Notes |
|---|---|---|
| `/` | (redirect) | → `/module/ai-driven-experimentation` |
| `/modules` | `ModulesHub` | Module catalogue |
| `/module/:moduleId` | `ModuleOverview` | Module landing |
| `/module/:moduleId/explore` | `Explore` | Canonical learning hub |
| `/module/:moduleId/explore/lesson/:lessonId` | `LessonPlayer` | |
| `/module/:moduleId/explore/challenge/:challengeId` | `ChallengePlayer` | |
| `/module/:moduleId/progress` | `Progress` | Badges + lesson completion |
| `/content-studio` | `ContentStudio` | Protected; authoring tooling |

**Legacy redirects:** `/module/:moduleId/learn` → `/module/:moduleId/explore` (and sub-routes).

> Note: There is **no `/overview` route** and **no `/lobby` route**.

### 5.2 Auth + Progress Hydration

`src/contexts/AuthContext.tsx`:
- Stores JWT in `localStorage` under key `auth_token` (via `src/lib/apiClient.ts`).
- On init and login: `GET /api/auth/me` → then `GET /api/progress` to hydrate `lessonsCompleted`, `lessonCompletions`, `badges`.

Redirect behavior:
- **Register** → navigates to `/module/ai-driven-experimentation` after success.
- **Login** → navigates to `location.state.from.pathname` defaulting to `/` → `/module/ai-driven-experimentation`.

### 5.3 Completing Items (Client)

- **Lesson:** `completeLesson(lessonId)` → `POST /api/progress/lesson`
- **Challenge:** `completeChallenge(challengeId, ...)` → `POST /api/progress/challenge`

Client-side idempotency: short-circuits if already completed.

Celebration UX: confetti/celebration fires **after** API success; failures show an error toast and the completion button is re-enabled.

### 5.4 Challenge Lock Gating

Track lock authority lives on the server: `_api/progress/challenge.ts` returns **403** when a track is locked. Client-side `requiredRank` gating has been removed; the client handles 403 responses.

### 5.5 Content Studio (`/content-studio`)

Protected authoring helper. Key files:
- `src/pages/ContentStudio.tsx`
- `src/components/lesson/MarkdownRenderer.tsx`
- `src/components/lesson/MarkdownErrorBoundary.tsx`
- `src/lib/parseFrontmatter.ts`, `src/lib/clipboard.ts`, `src/lib/directiveRegistry.ts`

### 5.6 ConstellationKeywords

**Location:** `src/components/explore/ConstellationKeywords.tsx` (extracted component — not inside LearningLobby, which was removed).

Canvas-based orbital keyword visualization. Consumes `loadContentIndex()` and `TRACK_COLORS` from `src/data/tracks.ts`. Used on the Explore page via `FindContentPanel`.

### 5.7 Explore / Track UX Interaction Pattern (shipped)

**Canonical behavior (do not reintroduce row-click navigation or multiple popover triggers):**

- **Track cards** (`src/components/tracks/TrackPathfinder.tsx`)
  - **Explore →** is a direct navigation button.
  - **Peek inside** (label button) is the **sole** popover trigger.
  - Popover content is **read-only**.
- **Content rows** (`src/components/explore/FindContentPanel.tsx`)
  - Inline **Start Lesson / Start Challenge** buttons are direct navigation.
  - **Peek inside** (eye icon + label) opens the popover.
  - Row click is **inert** (no navigation; no popover).
- **Header** (`src/components/layout/Header.tsx`) uses standard active-page highlighting (unchanged).

## 6) Backend API (Vercel Serverless)

All endpoints require `Authorization: Bearer <JWT>` unless noted.

### 6.1 Auth

| Method | Endpoint | Notes |
|---|---|---|
| `POST` | `/api/auth/register` | Creates user (rank 1); validates `@rea-group.com` email |
| `POST` | `/api/auth/login` | Returns JWT; updates `last_login_at` |
| `GET` | `/api/auth/me` | Returns user from token |

### 6.2 `GET /api/tracks/state`

Returns per-track state for Explore/Dashboard.

**Response:** array of `{ trackId, isUnlocked, isCompleted, completionPercent, maturityLevel, rankLabel }`

### 6.3 `GET /api/progress`

Returns progress to hydrate the UI.

```json
{
  "completedLessons": [{ "lessonId": 1, "completedAt": "..." }],
  "badges": [{ "id": "slug", "name": "...", "difficulty": 1, "rankEarned": 1, "earnedAt": "..." }]
}
```

> `rankEarned` is stored at earn-time on `user_badges.rank_earned` and returned directly.

### 6.4 `POST /api/progress/lesson`

**Request:** `{ "lessonId": number }`
- Idempotent (200 if already done, 201 on insert)
- Calls `checkTrackCompletion` and updates rank if earned

**Response (201):** `{ lessonId, completedAt, rankUpdated, newRank }`

### 6.5 `POST /api/progress/challenge`

**Request:** `{ "challengeId": string }` (slug)
- Looks up by `side_quests.slug`
- Returns **403** if track is locked
- Idempotent; calls `checkTrackCompletion`

**Response (201):** `{ challengeId, badge: { id, name, description, difficulty, earnedAt }, rankUpdated, newRank }`

---

## 7) Database (Drizzle + Neon)

### 7.1 Tables

Core:
- `users` — `current_rank` (1–5, default 1), `uuid`
- `lessons` — `track_id` FK → `tracks.id`; `unlocks_rank` column removed; `is_required` deprecated
- `side_quests` (challenges) — `track_id`; `required_rank` column removed; `is_required` deprecated; `slug` used as API identifier

Tracks:
- `tracks` — `id`, `name`, `description`, `prerequisite_track_ids` (text[]), `sort_order`, `maturity_level` (int), `rank_label`
- `track_progress` — `(user_id, track_id)`, `completed_at`; unlock computed from prerequisite completion

Progress:
- `user_lesson_progress` — `(user_id, lesson_id)`, `completed_at`
- `user_badges` — `(user_id, side_quest_id)`, `earned_at`, `rank_earned`



### 7.2 Migrations (001–025)

| File | Description |
|---|---|
| `001` | Initial schema |
| `002` | Add `password_hash` |
| `003` | Create remaining tables |
| `004` | Add `last_login_at` |
| `005` | Add `is_required` to lessons + side_quests |
| `006` | Populate `is_required` |
| `007` | Fix required fields |
| `008` | Seed all challenges |
| `009` | Unique constraint on `side_quests.title` |
| `010` | Add `side_quests.slug` |
| `011` | Add `users.uuid`; backfill; add `user_uuid` to progress |
| `012` | Coordinator V2 tables + indexes |
| `013` | Fix `learner_profiles` unique constraint |
| `014` | Add `completed_at` to `learning_path_items` |
| `015` | Add `tracks` + `track_progress`; add `track_id` to lessons/side_quests |
| `016` | Add `tracks.maturity_level` + `tracks.rank_label` |
| `017` | Fix `users.current_rank` default to 1; backfill 0/null → 1 |
| `018` | Convert `side_quests.difficulty` to integer |
| `019` | Drop `track_progress.is_unlocked` |
| `020` | Add performance indexes |
| `021` | Drop dead columns (`lessons.unlocks_rank`, `side_quests.required_rank`) |
| `022` | Add `user_badges.rank_earned` and persist badge rank at earn-time |
| `023` | Ghost-notify dedup constraint |
| `024` | Add missing indexes |
| `025` | Drop Coordinator tables (`learner_profiles`, `learning_paths`, `learning_path_items`, `content_demand_signals`, `path_events`) |

---

## 8) Track-Governed Rank Progression

Implemented in `src/lib/trackUnlock.ts`.

**Design:**
- Each track has `maturityLevel` (2–5) and `rankLabel`.
- Completing all `isRequired` lessons + challenges in a track marks it complete.
- If `currentRank < track.maturityLevel`, the user is awarded that rank.
- Rank never decreases.

**Rank names:**

| Rank | Name |
|---|---|
| 1 | AI User |
| 2 | AI Collaborator |
| 3 | AI Integrator |
| 4 | AI Builder |
| 5 | AI Architect |

**Canonical Tracks:**

| ID | Name | Maturity Level → Rank | Prerequisites |
|---|---|---|---|
| `prototyping` | Prototyping | 2 → AI Collaborator | — |
| `ai-workbench` | AI Workbench | 2 → AI Collaborator | — |
| `productivity` | Productivity | 3 → AI Integrator | `ai-workbench` |
| `hosting` | Hosting | 4 → AI Builder | `ai-workbench` |
| `measurement` | Measurement | 5 → AI Architect | `hosting` |

**Key functions:**
- `isTrackUnlocked(userId, trackId)` — all prerequisites completed
- `isTrackComplete(userId, trackId)` — all required content completed
- `checkTrackCompletion(userId, trackId)` — upserts `track_progress` + updates `users.current_rank`

  Querying is batched (no per-item N+1) and rank writes are wrapped in a transaction.

---

## 9) Scripts & Seeding

| Script | Command | Notes |
|---|---|---|
| Migrate | `npm run db:migrate` | `scripts/migrate-safe.mjs` |
| Sync content | `npm run db:sync` | `scripts/sync-content-to-db.mjs` |
| Seed test user | `npm run db:seed-test` | `scripts/seed-test-user.mjs` |

`scripts/seed-test-user.mjs`:
- Reads from `.env.local` (not `.env`)
- Requires `DATABASE_URL` and `TEST_USER` (test password); includes a production safety guard.

---

## 10) Known Issues / Gotchas

**Resolved — Code quality sprint (Verified 2026-03-17):**
- Removed Coordinator AI feature (API/routes/types/UI) and dropped its DB tables
- Stored `rankEarned` at earn-time (`user_badges.rank_earned`) and returned it from `GET /api/progress`
- Removed deprecated `unlocksRank` UI card from `LessonSidebar`
- Removed ghost-notify feature + added dedupe constraint during deprecation window
- Corrected module challenge count to 20
- Deleted root planning docs and orphaned/unused source files

| # | Issue | Severity |
|---|---|---|
| 5 | `AUTHORING-GUIDE-v3.md` is canonical; any references to v2 / legacy authoring guide filenames are stale | 🟡 Medium |
| 17 | Auth tokens: must include `uuid` — pre-migration tokens may 401 | 🟢 Low |

---

## 11) Verification (Safe Checks)

```bash
npm test                          # Vitest
npm run build                     # TypeScript + Vite build
npm run db:migrate                # Runs migrate-safe.mjs
npm run db:sync                   # Runs sync-content-to-db.mjs
node scripts/verify-content-sync.mjs   # Verifies DB has expected lessons/challenges
node scripts/test-db.mjs          # DB connectivity
```

Manual smoke test (key user journey):
1. Register with `@rea-group.com` email → lands on `/module/ai-driven-experimentation`
2. Navigate to `/module/ai-driven-experimentation/explore`
3. Open a lesson → read → mark complete → confirm celebration + rank check
4. Navigate to a challenge → mark complete → confirm badge + rank check
5. Check `/module/ai-driven-experimentation/progress` for updated stats

