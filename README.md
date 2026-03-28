# REA AI Hub

A gamified learning platform that helps REA employees become AI-assisted practitioners. Users progress through five **learning tracks**, earning ranks as they complete tracks.

**Production:** `AI-Hub`](https://rea-ai-hub.vercel.app/)

**Full technical spec:** `@SPEC.md`

---

## Overview

REA AI Hub is an internal gamified learning platform that helps REA Group employees become AI-assisted practitioners. Employees progress through five themed **learning tracks** — Prototyping, AI Workbench, Productivity, Hosting, and Measurement — earning progressively higher **maturity ranks** (AI User → AI Architect) as they complete lessons and challenges.

|  |  |
| --- | --- |
| Audience | All REA Group employees (rea-group.com email required to register) |
| Goal | Drive adoption of AI tools across the organisation by providing structured, self-paced learning paths with gamification incentives |
| Content model | Markdown files with YAML frontmatter, served statically and indexed into a PostgreSQL database at build time |
| Auth model | Email/password registration with JWT sessions (migration target: Okta OIDC/OAuth) |
| Current hosting | Vercel (serverless functions + static CDN) — migration target: AWS |

## Core Features

- **Five learning tracks** with prerequisite chains (e.g. Productivity requires AI Workbench)
- **Lesson player** — renders Markdown content with custom directives (`::video`, `::copy-button`) via `react-markdown` + `remark-directive`
- **Challenge system** — optional mini-projects that award badges on completion
- **Maturity rank progression** (1–5) — completing all required content in a track awards that track's rank level
- **Track unlock gating** — tracks with prerequisites are locked until predecessor tracks are completed
- **Badge collection** — earned by completing challenges; stored with rank-at-earn-time
- **Content authoring pipeline** — Markdown files → `generate-content-index` → `content-index.json` → `sync-content-to-db`
- **Analytics event logging** — `analytics_events` table for tracking user activity
- **Vercel Analytics** — `@vercel/analytics/react` component embedded in `App.tsx` (Vercel-specific; needs replacement)

## Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend framework | React 18, TypeScript, Vite 6 | SPA with client-side routing |
| Styling | Tailwind CSS 3, shadcn/ui, Radix UI primitives | @tailwindcss/typography for markdown |
| Routing / State | React Router 6, TanStack Query 5 | Client-side routing; SPA fallback via Vercel rewrites |
| Backend | Vercel Serverless Functions (_api/*) | vite-plugin-vercel compiles _api/*.ts → .vercel/output/functions/ |
| API types | @vercel/node (VercelRequest, VercelResponse) | All 7 API handlers import these types |
| Database | Neon PostgreSQL (serverless HTTP driver) | @neondatabase/serverless + drizzle-orm/neon-http |
| ORM | Drizzle ORM 0.45 | Schema in src/db/schema.ts; custom migration runner (scripts/migrate-safe.mjs) |
| Auth | Custom JWT (jose HS256) + bcrypt (bcryptjs) | Tokens stored in localStorage; 7-day expiry |
| Content | Static Markdown + YAML frontmatter in public/content/ | Indexed at build time into public/content-index.json |
| Content rendering | react-markdown, remark-gfm, remark-directive | Custom directive registry in src/lib/directiveRegistry.ts |
| Analytics | @vercel/analytics React component | Vercel-proprietary; <Analytics /> in App.tsx |
| Build tools | Vite + vite-plugin-vercel, tsx for scripts | lovable-tagger dev plugin |
| Testing | Vitest + Testing Library + jsdom | Unit tests only |
| Linting | ESLint 9 + typescript-eslint | Flat config (eslint.config.js) |

## Local setup

### Prerequisites

- Node.js 22.x and npm
- A [Neon](https://neon.tech) PostgreSQL database (free tier is fine)
- A `JWT_SECRET` — any long random string

### 1 — Clone and install

```bash
git clone https://github.com/YarnMeister/rea-ai-hub.git
cd rea-ai-hub
npm install
```

### 2 — Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local` needs at minimum:

```env
DATABASE_URL=postgresql://...   # Neon connection string
JWT_SECRET=your-secret-key      # Any secure random string
TEST_USER=some-password          # Password for the test user seed (optional)
```

> .env.local is gitignored — never commit secrets.

### 3 — Run database migrations

```bash
npm run db:migrate
```

This runs all pending SQL migrations from `drizzle/migrations/` using the custom safe migration runner.

### 4 — (Optional) Seed the test user

A preconfigured test account (`test@rea-group.com`) is useful for checking completed-lesson and badge UI states:

```bash
npm run db:seed-test
```

Requires `DATABASE_URL` and `TEST_USER` to be set in `.env.local`.

### 5 — Start the dev server

```bash
npm run dev
```

Opens the app at [**http://localhost:8080**](http://localhost:8080).

> Note on local API routing: vite-plugin-vercel has a known bug where API routes are not automatically served by the Vite dev server. The project includes a workaround (scripts/dev-api-server.mjs) that starts a separate API server on port 3000. npm run dev runs both automatically via scripts/dev.mjs, proxying /api/* requests through Vite to the API server.

## Key npm scripts

| Script | Description |
| --- | --- |
| npm run prebuild | Validate directives → generate content index → run DB migrations → sync content to DB |
| npm run dev | Start dev server (port 8080) + API server (port 3000) |
| npm run build | Production build — triggers prebuild hook (validate directives, generate content index, DB migrations, content sync), then runs Vite + vite-plugin-vercel to produce .vercel/output/ |
| npm test | Run Vitest unit tests |
| npm run lint | Run ESLint |
| npm run db:migrate | Run pending DB migrations |
| npm run db:seed-test | Seed the test user account |
| npm run db:sync | Sync content index → database (upsert lessons + challenges) |
| npm run generate-content-index | Regenerate public/content-index.json from markdown frontmatter |
| npm run validate-directives | Validate markdown directive registry ↔ renderer sync |

## Project structure (key parts)

```
_api/               # Vercel serverless functions (mounted at /api/*)
  auth/             # login, register, me
  progress/         # lesson + challenge completion
  tracks/           # track state

public/content/     # Markdown lesson + challenge content (served statically)
public/content-index.json  # GENERATED — do not edit manually

drizzle/migrations/ # SQL migration files (001–025)
scripts/            # CLI scripts: migrations, seeding, content sync, validation, dev API server

src/
  pages/            # React pages (LessonPlayer, etc.)
  contexts/         # AuthContext (JWT + progress hydration)
  components/       # UI components including MarkdownRenderer, lesson components
  lib/              # Utilities: auth, contentLoader, scoring, trackUnlock
  db/               # Drizzle schema + Neon client (index.ts, schema.ts)
  data/             # Static data: track definitions, modules, lifecycle phases
  types/            # TypeScript types (content)
```

## Adding or editing content

Lesson and challenge content lives in `public/content/` as Markdown files with YAML frontmatter.

After editing any markdown files, regenerate the content index:

```bash
npm run generate-content-index
```

See `public/content/AUTHORING-GUIDE-v3.md` for the full authoring guide including supported markdown directives (`::video`, `::copy-button`).

## Deployment

The app deploys automatically to Vercel from the `main` branch.

- Environment variables are set in the Vercel dashboard (same keys as `.env.local` above)
- The `prebuild` step automatically runs migrations and syncs content to the database

## Vercel-Specific Implementation

> This is the critical section for migration planning. Every item below must be addressed before the app can run on AWS.

### API Handlers (`_api/` directory)

The backend consists of **7 serverless function handlers** in `_api/`:

| File | Route | Method | Purpose |
| --- | --- | --- | --- |
| _api/auth/login.ts | /api/auth/login | POST | Email/password login → JWT |
| _api/auth/register.ts | /api/auth/register | POST | New user registration |
| _api/auth/me.ts | /api/auth/me | GET | Validate JWT, return user |
| _api/progress/index.ts | /api/progress | GET | Fetch user's lesson + badge progress |
| _api/progress/lesson.ts | /api/progress/lesson | POST | Mark lesson complete |
| _api/progress/challenge.ts | /api/progress/challenge | POST | Mark challenge complete, award badge |
| _api/tracks/state.ts | /api/tracks/state | GET | Compute track unlock/completion state |

`vite-plugin-vercel` reads `_api/**/*.ts` at build time, bundles each into a standalone `.vercel/output/functions/api/<path>.func/index.mjs`, and writes route rules to `.vercel/output/config.json`.


### `@vercel/node` Request/Response API

All 7 handlers use this signature:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // req.method, req.body (auto-parsed JSON), req.headers
  // res.status(code).json(data)
}
```

**API surface used:** `req.method`, `req.body`, `req.headers['authorization']`, `res.status(code).json(data)`

**Migration impact: MEDIUM** — the API surface is nearly identical to Express. The existing dev server already proves the mapping works.

### `vite-plugin-vercel` Build Pipeline

`npm run build` triggers the `prebuild` npm lifecycle hook, then runs `vite build` with `vite-plugin-vercel`:

1. `prebuild`**:** `validate-directives` → `generate-content-index` → `migrate-safe` → `sync-content-to-db`
2. `vite build`**:** Compiles React SPA → `.vercel/output/static/`; bundles `_api/*.ts` → `.vercel/output/functions/`; generates `.vercel/output/config.json` (route rules, SPA rewrite)

**Migration impact: HIGH** — the entire `.vercel/output/` build artifact structure is Vercel-proprietary.

### `vercel.json`

```json
{
  "buildCommand": "npm run build && npm run db:migrate",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "outputDirectory": ".vercel/output"
}
```

`framework: null` tells Vercel not to auto-detect a framework; the app uses the Build Output API v3 directly via `vite-plugin-vercel`.

**Migration impact: HIGH** — replaced entirely by AWS deployment config (CDK/SAM/Terraform).

### Dev Server Simulation (`scripts/dev-api-server.mjs`)

An **Express server on port 3000** that simulates the Vercel serverless environment for local development:

- Dynamically imports `_api/*.ts` handlers at request time via `tsx`
- Creates shim `vercelReq`/`vercelRes` objects wrapping Express req/res
- Vite dev server (port 8080) proxies `/api/*` → `http://localhost:3000`
- `scripts/dev.mjs` starts both processes in parallel (`npm run dev`)

**Migration impact: LOW** — dev-only. Under Option B (ECS/Express), this dev server becomes the production server and the shim is no longer needed.

### `@vercel/analytics`

`src/App.tsx` renders `<Analytics />` from `@vercel/analytics/react`. This sends page-view and web-vital data to Vercel's analytics dashboard.

**Migration impact: LOW** — remove the import and component. Replace with CloudWatch RUM, Datadog, or similar.

### SPA Rewrite Rule

`vite.config.ts` defines a rewrite that `vite-plugin-vercel` compiles into `.vercel/output/config.json`:

```
source: "/((?!api|_api).*)"  →  destination: "/index.html"
```

Serves `index.html` for all non-API paths, enabling client-side routing.

**Migration impact: LOW** — equivalent to a CloudFront Function or S3 custom error page (`404 → /index.html`).

### Neon Database — Portability

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
```

The **Neon HTTP driver** sends SQL over HTTPS — it is not Vercel-native but is Neon-specific. Neon is an independent PostgreSQL service; the driver is what needs swapping, not the data.

**Drizzle ORM schema and all queries are 100% portable.** Only the driver initialisation in `src/db/index.ts` and the scripts that call `neon()` directly need updating.

**Migration impact: MEDIUM** — driver swap only; schema and migrations require no changes.

### Static File Serving

`public/` contents (SPA assets, `content-index.json`, Markdown files) are copied to `.vercel/output/static/` and served from Vercel's edge CDN. The frontend fetches content with `fetch("/content-index.json")`.

**Migration impact: LOW** — direct equivalent: S3 bucket + CloudFront distribution.

### No Edge Functions

All API handlers are standard Node.js serverless functions. **No Vercel Edge Functions are used.** There are no Edge Runtime compatibility concerns during migration.

## AWS Migration Considerations

### Architecture Mapping

| Vercel Component | AWS Equivalent | Swap Type |
| --- | --- | --- |
| Vercel Serverless Functions (_api/*) | Lambda + API Gateway (HTTP API) or Express on ECS/Fargate | Rearchitect (Lambda) or moderate refactor (ECS) |
| vite-plugin-vercel build | Standard vite build + separate Lambda packaging (SAM/CDK) or Docker build | Rearchitect |
| .vercel/output/static/ | S3 bucket + CloudFront distribution | Straight swap |
| SPA rewrite rules | CloudFront Function or S3 custom error page (404 → /index.html) | Straight swap |
| Vercel environment variables | AWS Systems Manager Parameter Store or Secrets Manager + Lambda env vars | Straight swap |
| Neon PostgreSQL | Amazon RDS PostgreSQL or Aurora Serverless v2 | Moderate refactor (driver swap) |
| @vercel/analytics | CloudWatch RUM, Datadog, or remove | Straight swap / remove |
| Vercel CDN | CloudFront | Straight swap |
| vercel.json | AWS CDK, SAM template, or Terraform | Rearchitect |


## Okta OAuth Migration

### Current Auth Implementation

| Component | File | Description |
| --- | --- | --- |
| Password hashing | src/lib/auth.ts | bcryptjs with cost factor 10 |
| JWT creation | src/lib/auth.ts | jose library, HS256, 7-day expiry |
| JWT verification | src/lib/auth.ts | jwtVerify() with shared JWT_SECRET |
| Token storage (client) | src/lib/apiClient.ts | localStorage key auth_token |
| Auth state (client) | src/contexts/AuthContext.tsx | React context: user, login(), register(), logout() |
| Login endpoint | _api/auth/login.ts | Validates credentials, returns JWT |
| Register endpoint | _api/auth/register.ts | Creates user (restricted to rea-group.com), returns JWT |
| Session check | _api/auth/me.ts | Validates JWT, returns user object |
| Token payload | src/lib/auth.ts | { userId: number, email: string, uuid?: string } |


## Environment Variables Reference

| Variable | Used In | Purpose | Required | Vercel-Specific? |
| --- | --- | --- | --- | --- |
| DATABASE_URL | src/db/index.ts, scripts/migrate-safe.mjs, scripts/sync-content-to-db.mjs, and all other scripts | PostgreSQL connection string (Neon format: postgresql://user:pass@ep-xxx.region.aws.neon.tech/db) | Yes | No — format changes if moving to RDS |
| JWT_SECRET | src/lib/auth.ts | HMAC key for signing/verifying JWT tokens (HS256) | Yes (current auth) | No — removed when switching to Okta |
| TEST_USER | scripts/seed-test-user.mjs | Password for the test account (test@rea-group.com) | Only for seeding | No |
| NODE_ENV | scripts/seed-test-user.mjs | Guards against running seed script in production | Implicit | No |

- `.env.local` is the local config file (loaded by `dotenv` in scripts and `dev-api-server.mjs`)
- No Vercel-proprietary environment variable names are used — all keys are portable


## Database

### Connection

| Property | Value |
| --- | --- |
| Provider | Neon PostgreSQL (serverless) |
| Driver | @neondatabase/serverless — HTTP driver; sends SQL over HTTPS (no persistent TCP connection) |
| ORM | Drizzle ORM (drizzle-orm/neon-http) |
| Connection pattern | Lazy-initialised proxy in src/db/index.ts — creates connection on first query |
| Migration runner | Custom script scripts/migrate-safe.mjs (NOT drizzle-kit migrate) |
| Migration tracking | __app_migrations table with file name + SHA-256 content hash |
| Schema file | src/db/schema.ts |

### Schema Overview (8 tables)

| Table | Purpose | Key Columns |
| --- | --- | --- |
| users | User accounts | id (serial PK), uuid, email (unique), password_hash, name, current_rank, joined_at, last_login_at |
| tracks | Learning track definitions | id (text PK), name, prerequisite_track_ids (text[]), maturity_level, rank_label, sort_order |
| lessons | Lesson metadata (synced from content) | id (serial PK), title, track_id (FK→tracks), is_required, estimated_time |
| side_quests | Challenge metadata (synced from content) | id (serial PK), slug (unique), title, track_id (FK→tracks), difficulty, is_required |
| user_lesson_progress | Lesson completion records | user_id (FK→users), user_uuid, lesson_id (FK→lessons), completed_at |
| user_badges | Challenge completion / badge records | user_id (FK→users), user_uuid, side_quest_id (FK→side_quests), rank_earned, earned_at |
| track_progress | Track-level completion | user_id (FK→users), track_id (FK→tracks), completed_at; unique on (user_id, track_id) |
| analytics_events | User activity events | user_id, user_uuid, event_type, event_data (JSONB), created_at |



## Full technical reference

See `@SPEC.md` for the complete technical reference including:

- Full architecture and data models
- All API endpoints and response shapes
- Database schema and migration history (001–025)
- Track-based rank progression (maturity-level driven)
- Known issues and gotchas
