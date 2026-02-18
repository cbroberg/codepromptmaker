# MIGRATE-DB — SQLite to PostgreSQL (Supabase) Migration Plan

> **Status:** Planning
> **Version target:** v3 (Open Source SaaS)
> **Date:** 2025-02-18
> **Author:** Claude Code session with @cbroberg

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State (v1)](#2-current-state-v1)
3. [Target State (v3)](#3-target-state-v3)
4. [Hosting Decision](#4-hosting-decision)
5. [Migration Strategy](#5-migration-strategy)
6. [Schema Translation: SQLite to PostgreSQL](#6-schema-translation-sqlite-to-postgresql)
7. [Code Changes by Package](#7-code-changes-by-package)
8. [Dual-Mode Architecture](#8-dual-mode-architecture)
9. [Environment Variables](#9-environment-variables)
10. [Data Migration (Local to Cloud)](#10-data-migration-local-to-cloud)
11. [Embeddings: BLOB to pgvector](#11-embeddings-blob-to-pgvector)
12. [Auth Integration with Supabase](#12-auth-integration-with-supabase)
13. [Risk Register](#13-risk-register)
14. [Implementation Phases](#14-implementation-phases)
15. [Appendix: Supabase on Fly.io Analysis](#15-appendix-supabase-on-flyio-analysis)

---

## 1. Executive Summary

CPM v1 runs on **SQLite via better-sqlite3** — a single-file, synchronous, zero-config database ideal for local-first development. For v3 (SaaS), we need multi-user cloud persistence with auth.

**The plan:** Swap the `@cpm/db` internals from SQLite to PostgreSQL (Supabase Cloud) while keeping the Drizzle ORM query layer and all consumer packages (`@cpm/web`, `@cpm/cli`, `@cpm/runner`) unchanged.

**Key insight:** Drizzle ORM abstracts the database dialect. The schema file and connection module change; the 30+ query functions and all API routes stay the same.

---

## 2. Current State (v1)

### Database Stack

| Component | Technology |
|-----------|-----------|
| ORM | Drizzle ORM v0.45.1 |
| Driver | better-sqlite3 v12.6.2 |
| Dialect | SQLite |
| Migrations | Inline `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE` try/catch |
| Connection | Synchronous, single-file (`sqlite.db`) |
| WAL mode | Enabled via pragma |

### Schema (12 tables)

| Table | Purpose | SQLite-specific? |
|-------|---------|-----------------|
| `user` | Auth.js users | `integer` for `emailVerified` (timestamp_ms) |
| `account` | OAuth providers | Composite PK |
| `session` | Auth sessions | `integer` for `expires` (timestamp_ms) |
| `verificationToken` | Email verification | Composite PK |
| `developer_profiles` | User preferences | `text` mode JSON columns |
| `prompts` | Prompt Contracts | `blob` for embedding, `text` mode JSON |
| `prompt_tags` | Tag system | `integer` PK autoIncrement |
| `runner_sessions` | Ralph Wiggum loop | Standard columns |
| `api_tokens` | CLI/API auth | Standard columns |
| `organizations` | Multi-tenant orgs | `integer` mode boolean |
| `organization_members` | Org membership | Standard columns |
| `projects` | Future v4 | Standard columns |

### Current File Layout

```
packages/db/
├── drizzle.config.ts        # dialect: 'sqlite'
├── src/
│   ├── schema.ts            # sqliteTable definitions (143 lines)
│   ├── connection.ts        # better-sqlite3 + inline DDL (147 lines)
│   ├── index.ts             # Public exports
│   └── queries/
│       ├── profiles.ts      # 7 functions
│       ├── prompts.ts       # 14 functions
│       ├── runner.ts        # 3 functions
│       ├── tokens.ts        # 5 functions
│       └── organizations.ts # 12 functions
```

### SQLite-Specific Patterns Found

1. **`sqliteTable`** — All 12 tables use `sqliteTable()` from `drizzle-orm/sqlite-core`
2. **`integer({ mode: 'timestamp_ms' })`** — Auth.js tables for `emailVerified`, `expires`
3. **`integer({ mode: 'boolean' })`** — `organizations.isPersonal` (0/1 instead of true/false)
4. **`text({ mode: 'json' })`** — JSON arrays stored as TEXT (no native JSON type)
5. **`blob('embedding')`** — Binary embedding vectors as SQLite BLOB
6. **`integer('id').primaryKey({ autoIncrement: true })`** — `prompt_tags` uses AUTOINCREMENT
7. **`.run()` / `.get()` / `.all()`** — Synchronous better-sqlite3 execution methods
8. **`COLLATE NOCASE`** — Used in `findAllDistinctTags()` for case-insensitive tag sorting
9. **WAL pragma** — `sqlite.pragma('journal_mode = WAL')`
10. **Inline DDL** — All table creation in `connection.ts` (not Drizzle migrations)

---

## 3. Target State (v3)

### Database Stack

| Component | Technology |
|-----------|-----------|
| ORM | Drizzle ORM (same version) |
| Driver | `postgres` (postgres.js) or `@neondatabase/serverless` |
| Dialect | PostgreSQL 15+ |
| Hosting | Supabase Cloud (free tier → Pro as needed) |
| Migrations | Drizzle Kit generated SQL files |
| Connection | Async, connection pooling (Supabase pooler on port 6543) |
| Auth | NextAuth.js v5 + Supabase as session DB |

### What Changes

| Layer | Changes? | Details |
|-------|----------|---------|
| `schema.ts` | **Yes** | `sqliteTable` → `pgTable`, type adjustments |
| `connection.ts` | **Yes** | `better-sqlite3` → `postgres` driver, async init |
| `drizzle.config.ts` | **Yes** | `dialect: 'postgresql'`, new credentials |
| `package.json` | **Yes** | Swap `better-sqlite3` → `postgres` |
| `queries/*.ts` | **Minimal** | `.run()` → `.execute()`, `.get()` → `[0]`, sync → async |
| API routes | **No** | Already use query functions |
| `@cpm/web` | **No** | Imports from `@cpm/db` unchanged |
| `@cpm/cli` | **No** | Imports from `@cpm/db` unchanged |
| `@cpm/runner` | **No** | Imports from `@cpm/db` unchanged |

---

## 4. Hosting Decision

### Recommendation: Supabase Cloud + Vercel (or Fly.io for Next.js)

```
┌─────────────────────┐        ┌──────────────────────────┐
│  Vercel / Fly.io     │───────▶│  Supabase Cloud           │
│  @cpm/web (Next.js)  │        │  PostgreSQL + Studio      │
│                      │        │  + Auth (future option)   │
└─────────────────────┘        └──────────────────────────┘
```

### Why NOT self-host Supabase on Fly.io

See [Appendix: Supabase on Fly.io Analysis](#15-appendix-supabase-on-flyio-analysis) for the full breakdown. TL;DR:

- Supabase is ~10 services (PG, PostgREST, GoTrue, Studio, Realtime, etc.) — not one container
- Single-container hosting kills reliability (one crash = everything down)
- PostgreSQL in ephemeral containers = data loss on redeploy without Fly Volumes
- Supabase Cloud free tier (500 MB, 2 projects) is more than sufficient for CPM
- Zero ops overhead — Studio, backups, and connection pooling included

### Cost Comparison

| Option | Monthly Cost | Ops Burden |
|--------|-------------|------------|
| Supabase Cloud Free | $0 | None |
| Supabase Cloud Pro | $25 | None |
| Fly.io Postgres (managed) | ~$7–15 | Low (no Studio) |
| Fly.io + self-hosted Supabase | $30–60+ | High (multi-service) |

**Winner:** Supabase Cloud free tier for development and launch. Upgrade to Pro ($25/mo) if CPM exceeds 500 MB or needs more than 2 projects.

---

## 5. Migration Strategy

### Approach: Schema Rewrite, Not Data Migration Tool

Since CPM is pre-launch with only local development data, we do a **clean schema rewrite** rather than an automated SQLite-to-PG data dump.

### Three-Step Process

```
Step 1: Rewrite @cpm/db internals (schema + connection + queries)
Step 2: Generate Drizzle migrations → push to Supabase
Step 3: Verify all API routes + CLI work against PostgreSQL
```

### Keeping Local Mode (SQLite) Alive

v1 local mode (`CPM_LOCAL=1` or no `DATABASE_URL`) must continue working. This means `@cpm/db` needs a **dual-dialect architecture** — see [Section 8](#8-dual-mode-architecture).

---

## 6. Schema Translation: SQLite to PostgreSQL

### New file: `packages/db/src/schema-pg.ts`

Every `sqliteTable` becomes `pgTable`. Key type changes:

| SQLite (current) | PostgreSQL (target) | Notes |
|-------------------|---------------------|-------|
| `text('id').primaryKey()` | `text('id').primaryKey()` | Same |
| `integer('emailVerified', { mode: 'timestamp_ms' })` | `timestamp('emailVerified', { mode: 'date' })` | Native timestamp |
| `integer('expires', { mode: 'timestamp_ms' })` | `timestamp('expires', { mode: 'date' })` | Native timestamp |
| `integer('is_personal', { mode: 'boolean' })` | `boolean('is_personal')` | Native boolean |
| `text('stack', { mode: 'json' })` | `jsonb('stack')` | Native JSONB |
| `blob('embedding')` | `vector('embedding', { dimensions: 1536 })` | pgvector extension (v2) |
| `integer('id').primaryKey({ autoIncrement: true })` | `serial('id').primaryKey()` | PostgreSQL SERIAL |
| `text('created_at')` | `text('created_at')` | Keep as ISO strings for now* |

*\*We could use `timestamp` columns in PG, but keeping `text` ISO strings avoids query-layer changes. Revisit post-migration.*

### Auth.js Tables — Use `@auth/drizzle-adapter` PG Preset

The Auth.js tables (`user`, `account`, `session`, `verificationToken`) have official Drizzle schema definitions for PostgreSQL in `@auth/drizzle-adapter`. We should use those directly instead of hand-translating.

### COLLATE NOCASE Replacement

SQLite's `COLLATE NOCASE` in `findAllDistinctTags()` becomes:

```typescript
// SQLite:  .orderBy(sql`${promptTags.tag} COLLATE NOCASE`)
// PostgreSQL: .orderBy(sql`LOWER(${promptTags.tag})`)
```

---

## 7. Code Changes by Package

### `@cpm/db` — The Only Package That Changes Significantly

#### `schema.ts` → `schema-pg.ts` (new file)

```typescript
// packages/db/src/schema-pg.ts
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core';
// ... pgTable versions of all 12 tables
```

#### `connection.ts` → `connection-pg.ts` (new file)

```typescript
// packages/db/src/connection-pg.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema-pg';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

No inline DDL — migrations handled by Drizzle Kit.

#### `connection.ts` (existing) — Stays for local SQLite mode

#### `index.ts` — Conditional export based on dialect

```typescript
// packages/db/src/index.ts
const isPg = process.env.DATABASE_URL?.startsWith('postgres');
export const { db } = isPg
  ? await import('./connection-pg')
  : await import('./connection');
```

#### Query files — Sync to Async conversion

The biggest mechanical change. All better-sqlite3 calls are synchronous; postgres.js is async:

| SQLite (sync) | PostgreSQL (async) |
|---------------|--------------------|
| `.run()` | `await ...` (returns void/result) |
| `.get()` | `await ...` then `[0]` |
| `.all()` | `await ...` |
| `db.transaction((tx) => { ... })` | `await db.transaction(async (tx) => { ... })` |

**Every query function becomes `async` and returns a `Promise`.** This is the most pervasive change — all 41 query functions need `async/await`. However, callers (API routes) already use `await` on most calls or can be trivially updated.

### `@cpm/web` — Minimal Changes

- API route handlers may need `await` on query calls that were previously synchronous
- `DrizzleAdapter(db)` in `auth.ts` — works with both SQLite and PG adapters
- No new dependencies

### `@cpm/cli` — Minimal Changes

- Query calls need `await` (if not already)
- Local mode still uses SQLite directly

### `@cpm/runner` — Minimal Changes

- Same as CLI — add `await` where needed

### `@cpm/shared` — No Changes

- Types and services are database-agnostic

---

## 8. Dual-Mode Architecture

CPM must support both SQLite (local/self-hosted) and PostgreSQL (cloud SaaS). Two approaches:

### Option A: Runtime Dialect Detection (Recommended)

```
DATABASE_URL=sqlite.db          → SQLite mode (better-sqlite3)
DATABASE_URL=postgresql://...   → PostgreSQL mode (postgres.js)
```

**Implementation:**

```typescript
// packages/db/src/index.ts
const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');

// Dynamic import based on dialect
const connection = isPostgres
  ? await import('./connection-pg.js')
  : await import('./connection-sqlite.js');

export const db = connection.db;

// Schema re-export (both define same table names + column names)
export const schema = isPostgres
  ? await import('./schema-pg.js')
  : await import('./schema-sqlite.js');
```

**Pros:** Single `@cpm/db` package, runtime switching, Docker-friendly.
**Cons:** Both drivers bundled (tree-shaking mitigates), query return types need unification.

### Option B: Build-Time Dialect Selection

Use an env var at build time to pick which schema/connection to compile.

**Pros:** Smaller bundle, no dead code.
**Cons:** More complex build pipeline, can't switch at runtime.

### Unifying Sync vs Async

The biggest challenge is that SQLite queries are synchronous and PG queries are async. **Solution: Make all query functions async regardless of dialect.**

```typescript
// Even for SQLite, wrap in async:
export async function findAllPrompts(userId = 'local') {
  return db.select().from(prompts).where(eq(prompts.userId, userId)).orderBy(desc(prompts.createdAt)).all();
}
```

better-sqlite3 + Drizzle already returns values synchronously, but wrapping in `async` makes the return type `Promise<T>` which is compatible with the PG path. The overhead is negligible.

---

## 9. Environment Variables

### Current (.env.example)

```bash
DATABASE_URL=sqlite.db
ANTHROPIC_API_KEY=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
CPM_LOCAL=1
```

### v3 Additions

```bash
# PostgreSQL (Supabase) — replaces sqlite.db for cloud mode
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Supabase connection pooler (for serverless / edge functions)
# Use port 6543 for transaction-mode pooling
DATABASE_URL_POOLED=postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Direct connection (for migrations only — bypasses pooler)
DATABASE_URL_DIRECT=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Supabase-Specific Notes

- **Connection pooler (port 6543):** Required for serverless environments (Vercel Edge, Fly.io). Uses Supavisor (PgBouncer replacement).
- **Direct connection (port 5432):** Used only for Drizzle Kit migrations (`drizzle-kit push`).
- **SSL:** Supabase requires SSL. The `postgres` driver handles this with `?sslmode=require` in the URL.

---

## 10. Data Migration (Local to Cloud)

For users upgrading from v1 (local SQLite) to v3 (cloud PG):

### Strategy: `cpm push` Command

The existing planned `cpm push` command (from the CLI roadmap) handles this:

1. Read all prompts + profiles from local SQLite
2. POST to `/api/prompts/import` (new batch endpoint)
3. Server inserts into PostgreSQL, scoped to authenticated user
4. Conflict resolution: skip duplicates by `id`

### No Automated Schema Migration Needed

v1 users have local SQLite files. v3 cloud gets a fresh PostgreSQL database. Data flows via the API, not a database-level dump.

### Local Data Preservation

After `cpm push`, the local SQLite file is untouched. Users can continue using `CPM_LOCAL=1` or switch to cloud mode.

---

## 11. Embeddings: BLOB to pgvector

### Current (v1): Binary BLOB

```typescript
// schema.ts
embedding: blob('embedding'),  // Nullable Buffer
```

Embeddings are stored as raw binary BLOBs. Vector similarity is computed in-memory in `@cpm/shared` using cosine similarity.

### Target (v2/v3): pgvector Extension

```typescript
// schema-pg.ts
import { vector } from 'drizzle-orm/pg-core';
embedding: vector('embedding', { dimensions: 1536 }),  // OpenAI ada-002 dimensions
```

**Supabase includes pgvector** out of the box. Enable it:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Benefits

- **Native similarity search:** `ORDER BY embedding <=> query_vector LIMIT 10` — no in-memory compute
- **Indexing:** IVFFlat or HNSW indexes for sub-linear search on large datasets
- **Drizzle support:** `drizzle-orm/pg-core` has `vector()` column type

### Migration Path

1. v1 (SQLite BLOB) → v3 (pgvector column, nullable)
2. Backfill embeddings via existing `/api/prompts/backfill` endpoint
3. Replace in-memory cosine similarity with SQL `<=>` operator in `/api/prompts/search`

---

## 12. Auth Integration with Supabase

### Current Plan: NextAuth.js v5 + Supabase as Database Only

CPM uses **NextAuth.js for auth** and **Supabase only as a PostgreSQL host**. We do NOT use Supabase Auth (GoTrue) — this keeps the auth layer framework-native and avoids vendor lock-in.

```
User → NextAuth.js (GitHub/Google OAuth)
         ↓
       DrizzleAdapter → Supabase PostgreSQL
         ↓
       Sessions stored in `session` table
```

### Why Not Supabase Auth?

- NextAuth.js is already implemented and working
- Supabase Auth would add another service dependency
- DrizzleAdapter works identically with SQLite and PostgreSQL
- Self-hosted users can use any PG instance, not just Supabase

### Row Level Security (RLS)

Supabase enables RLS by default on new tables. Since CPM accesses PG via the **direct connection string** (not the Supabase client SDK), RLS is bypassed. This is intentional — our application layer handles access control via `userId` scoping in every query.

If we later use Supabase client SDK or Edge Functions, we'd need RLS policies. For now, **disable RLS on all CPM tables** or use the `service_role` key.

---

## 13. Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Sync→Async conversion breaks callers** | High | Make all query functions async first (standalone PR), test before adding PG |
| **Drizzle PG adapter quirks** | Medium | Test each query function against local PG (Docker) before Supabase |
| **Connection pooling in serverless** | Medium | Use Supabase pooler URL (port 6543) for all runtime connections |
| **SQLite local mode regression** | High | Keep SQLite tests running in CI; dual-mode smoke test |
| **`COLLATE NOCASE` and other SQLite-isms** | Low | Grep codebase for SQLite-specific SQL; replace with PG equivalents |
| **better-sqlite3 native build on CI** | Low | Already handled in `pnpm.onlyBuiltDependencies` |
| **Embedding dimension mismatch** | Low | Standardize on 1536 (ada-002); make configurable for future models |
| **Supabase free tier limits** | Low | 500 MB is generous for text data; monitor via dashboard |
| **Auth.js adapter compatibility** | Low | `@auth/drizzle-adapter` officially supports both SQLite and PG |

---

## 14. Implementation Phases

### Phase 1: Async Foundation (no PG yet)

**Goal:** Make all query functions async without changing the database.

1. Add `async` to all 41 query functions in `queries/*.ts`
2. Add `await` to all callers in `@cpm/web` API routes
3. Add `await` to all callers in `@cpm/cli` and `@cpm/runner`
4. Verify everything still works with SQLite

**Why first:** This is the riskiest change (touches every file). Isolating it makes debugging easier.

### Phase 2: PostgreSQL Schema + Connection

**Goal:** Add PG schema and connection alongside SQLite.

1. Create `schema-pg.ts` with `pgTable` definitions
2. Create `connection-pg.ts` with `postgres` driver
3. Update `drizzle.config.ts` to support PG dialect
4. Add `postgres` dependency to `@cpm/db/package.json`
5. Implement dialect detection in `index.ts`

### Phase 3: Supabase Project Setup

**Goal:** Create and configure the Supabase project.

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Enable `pgvector` extension
3. Run `drizzle-kit push` against Supabase direct URL
4. Verify tables in Supabase Studio
5. Configure connection pooler URL
6. Add Supabase env vars to Vercel/Fly.io

### Phase 4: Query Compatibility

**Goal:** Handle dialect differences in queries.

1. Replace `COLLATE NOCASE` with `LOWER()` for PG
2. Test all 41 query functions against PG
3. Verify transactions work with async PG driver
4. Test embedding operations (BLOB → vector)

### Phase 5: Integration Testing

**Goal:** End-to-end verification.

1. Run full API test suite against PostgreSQL
2. Test auth flow (NextAuth + DrizzleAdapter + PG)
3. Test CLI in both local (SQLite) and cloud (PG) modes
4. Test `cpm push` data migration flow
5. Verify Supabase Studio shows correct data

### Phase 6: Deployment

**Goal:** Ship v3 to production.

1. Deploy Next.js to Vercel (or Fly.io)
2. Configure production env vars
3. Run production Drizzle migrations
4. Smoke test all endpoints
5. Update `CLAUDE.md` with new database configuration
6. Update `.env.example` with PG variables

---

## 15. Appendix: Supabase on Fly.io Analysis

### Question: Can we run OSS Supabase in a Fly.io container alongside Next.js?

**Short answer:** Technically possible, practically a bad idea.

### Why It Doesn't Work Well

**Supabase is not one process.** A self-hosted Supabase stack includes:

| Service | Purpose | RAM |
|---------|---------|-----|
| PostgreSQL | Database | ~256 MB+ |
| PostgREST | Auto-generated REST API | ~50 MB |
| GoTrue | Auth service | ~50 MB |
| Realtime | WebSocket subscriptions | ~100 MB |
| Storage API | File uploads | ~50 MB |
| Studio | Admin dashboard | ~200 MB |
| Kong/Caddy | API gateway | ~50 MB |
| Meta | Metadata API for Studio | ~50 MB |
| **Total** | | **~800 MB minimum** |

Adding Next.js (~200 MB) pushes this to **1 GB+ in a single container**.

### Container Problems

1. **Process management:** Fly.io runs one entrypoint per machine. You'd need `supervisord` or similar to manage 8+ processes — fragile and hard to debug.
2. **Memory pressure:** All services compete for RAM. PostgreSQL alone wants 256 MB for `shared_buffers`. Under load, OOM kills are likely.
3. **Restart cascade:** One service crash kills the container, taking down all services. PostgreSQL crash = your auth is also down.
4. **No independent scaling:** Can't scale the web tier without duplicating the database.
5. **Data persistence:** Fly.io machines are ephemeral. PostgreSQL needs a Fly Volume, and volumes can only attach to one machine (no horizontal scaling).
6. **Upgrades:** Updating Next.js means redeploying PostgreSQL. Updating PostgreSQL means downtime for the web app.

### What Actually Works on Fly.io

**Option A: Fly.io Managed Postgres + Next.js app (separate machines)**

```bash
fly postgres create --name cpm-db
fly deploy  # deploys Next.js app
```

Cost: ~$7-15/mo. You get a dedicated PG instance with persistent volumes. No Studio, but you can use `fly proxy 5432` to connect any local PG admin tool.

**Option B: Supabase Cloud (free) + Fly.io for Next.js**

Best option for CPM. Zero database ops. Free Studio. Free 500 MB.

**Option C: Supabase Cloud (free) + Vercel for Next.js**

Even simpler. Both have generous free tiers. This is the recommended path.

### Bottom Line

Don't co-locate Supabase and Next.js in one container. Use Supabase Cloud as a managed service and deploy Next.js separately. The free tier covers CPM's needs, and you avoid all the ops complexity.

---

## References

- [Drizzle ORM: SQLite to PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Supabase: Database connection strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase: pgvector](https://supabase.com/docs/guides/ai/vector-columns)
- [@auth/drizzle-adapter: PostgreSQL](https://authjs.dev/getting-started/adapters/drizzle)
- [Fly.io: Managed Postgres](https://fly.io/docs/postgres/)
- [CPM v3 SaaS Plan](./v3-cpm-saas-design-plan-EN.md)
