# CLAUDE.md — CodePromptMaker (CPM)

> Read this file in full and confirm you understand the project constraints before doing anything.

## Project Overview

**CodePromptMaker** (codepromptmaker.com) transforms natural language descriptions into structured **Prompt Contracts** optimized for Claude Code (cc) terminal sessions. The app is inspired by the "Prompt Contracts" methodology (GOAL / CONSTRAINTS / FORMAT / FAILURE CONDITIONS) from [Phil/Rentier Digital's article](https://medium.com/@rentierdigital/i-stopped-vibe-coding-and-started-prompt-contracts-claude-code-went-from-gambling-to-shipping-4080ef23efac).

Every generated prompt is automatically prepended with a CLAUDE.md handshake:
`"Read CLAUDE.md and confirm you understand the project constraints before doing anything."`

**Short name:** CPM
**CLI command:** `cpm`
**Domain:** codepromptmaker.com

---

## Monorepo Structure

This is a **pnpm workspace monorepo** with Turbo. Five packages with strict dependency boundaries:

```
codepromptmaker/
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── shared/          # @cpm/shared — Types, services, prompt builder, Anthropic client
│   ├── db/              # @cpm/db     — Schema, queries, migrations (Drizzle + SQLite/PostgreSQL)
│   ├── runner/          # @cpm/runner — Autonomous loop engine, tool whitelist, progress tracking
│   ├── cli/             # @cpm/cli    — `cpm` terminal commands, display formatting
│   └── web/             # @cpm/web    — Next.js app, UI, API routes
```

### Dependency Graph

```
@cpm/shared (no deps)
    ↓
@cpm/db (→ @cpm/shared)
    ↓
@cpm/runner (→ @cpm/db, @cpm/shared)
    ↓
@cpm/cli (→ @cpm/db, @cpm/shared, @cpm/runner)

@cpm/web (→ @cpm/db, @cpm/shared)
```

### Build Pipeline (Turbo)

Build order: shared → db → runner → cli → web
- `turbo dev` runs only `@cpm/web` (the others are libraries)
- CLI is installed globally via `cd packages/cli && pnpm link --global`

---

## Hard Rules (Non-Negotiable)

### Import Rules
- Cross-package imports ONLY via workspace aliases: `@cpm/db`, `@cpm/shared`, etc.
- NEVER use relative paths across package boundaries
- `@cpm/cli` and `@cpm/runner` must NEVER import from `next/` or `@next/`
- Only `@cpm/web` has Next.js as a dependency

### Code Style
- **Always ES modules** — use `import` statements, never CommonJS `require`
- **DotEnv** for secrets — load from `.env.local`
- **Server-side components by default** in Next.js
- **TypeScript** throughout (`.ts` / `.tsx` for web, `.mjs` for CLI if needed)

### Minimum Versions (Critical — do not use lower)
- Next.js **16.1.6+**
- React **19.2.4+**
- Tailwind CSS **v4** (CSS-first config, NO `tailwind.config.js`)
- shadcn/ui (latest v4-compatible release)
- Node.js **20+**

### UI / Design
- Dark mode by default via `next-themes` with `defaultTheme="dark"`
- Theme toggle included (dark / light / system)
- shadcn/ui components + Tailwind CSS v4 for all UI
- Design inspiration: littlebird.ai (fresh, light) + supabase.com (technical weight)

---

## Version Roadmap

| Version | Scope | Database | Auth | CLI |
|---------|-------|----------|------|-----|
| **v1** | Local MVP — web + CLI + runner | SQLite (better-sqlite3) | None | `cpm generate/list/show/copy/run/status` |
| **v2** | RAG over prompt history | SQLite + embeddings | None | Unchanged |
| **v3** | Open Source SaaS | PostgreSQL (Supabase) | Supabase Auth | + `cpm login/logout/sync` |
| **v4** | Cloud-triggered autonomous runner | + runners/jobs tables | Token-based | + `cpm watch` |

**Ship order:** v1 → use daily → add v2 RAG → ship v3 SaaS → add v4 autonomous when v3 is stable.

---

## Database Strategy

- **v1:** SQLite via `better-sqlite3` (local-first, single user)
- **v3:** PostgreSQL via Supabase (cloud, multi-tenant)
- **Migration path:** Drizzle ORM abstracts the database. `@cpm/db` switches connection string; queries remain unchanged
- **Embedding column:** Nullable BLOB in v1, ready for pgvector in v2

### Schema Highlights
- `developer_profiles` — User stack, preferences, rules (injected into CONSTRAINTS)
- `prompts` — All inputs + generated Prompt Contracts (prompt bank)
- `prompts.language` — Tracks which language the prompt was generated in
- `runner_sessions` — Runner status tracking (started, iteration, completed)
- Embedding column prepared but nullable in v1

---

## Multi-Language Support

- `promptLanguage` field in Developer Profile: `'en' | 'da'` (default: `'en'`)
- Prompt Contract section headers always in English: `## GOAL`, `## CONSTRAINTS`, `## FORMAT`, `## FAILURE CONDITIONS`
- Prose content is translated to the selected language
- Technical terms always in English (code, files, CLI, variable names)
- Input language is free — output follows `promptLanguage`
- Architecture ready for more languages (string union type, select dropdown in UI)

---

## Prompt Contract Generation

CPM's Claude API call uses a system prompt that incorporates:

1. **Prompt Contract Framework** — GOAL / CONSTRAINTS / FORMAT / FAILURE CONDITIONS
2. **Anthropic's own best practices** — XML tags, role prompting, chain-of-thought
3. **Anti-patterns from research** — avoid "be concise", "do your best", positional bias
4. **User's Developer Profile** — stack, rules, patterns injected into CONSTRAINTS
5. **Language instruction** — generate output in `promptLanguage`, technical terms in English

Each generated prompt includes four enforceable clauses:
- **GOAL** — Testable success criterion (verifiable in <60 sec)
- **CONSTRAINTS** — Hard boundaries that must not be crossed
- **FORMAT** — Precise file structure and output expectations
- **FAILURE CONDITIONS** — Explicit anti-patterns

---

## Runner Engine — Ralph Wiggum Loop

Named after Ralph Wiggum ("I'm in danger!") — an iterative loop that restarts cc when context is exhausted:

1. **Iteration 1:** cc gets the full Prompt Contract + instruction to create Tasks
2. **Iteration 2+:** cc gets only "continue from your Tasks" — native Tasks handle state via disk
3. **Between iterations:** cooldown (default 10s), check for `.claude/COMPLETE` marker
4. **Stop condition:** `.claude/COMPLETE` file exists OR max iterations reached
5. **Tasks persistence:** `CLAUDE_CODE_ENABLE_TASKS=1` environment variable + `CLAUDE_CODE_TASK_LIST_ID` for sharing

### Allowed Tools Whitelist

```
Read, Write, Edit, MultiEdit
Bash(npm:*), Bash(npx:*), Bash(pnpm:*), Bash(node:*), Bash(git:*)
Bash(cat:*), Bash(ls:*), Bash(find:*), Bash(grep:*), Bash(mkdir:*)
TodoRead, TodoWrite
```

Explicitly excluded: `Bash(rm -rf:*)`, `Bash(sudo:*)`, network access.

### Three Autonomy Levels (v4)
1. `single` — One cc session, no loop (v3 basis)
2. `supervised` — Ralph Wiggum loop but pauses between iterations for approval (default, safe)
3. `full` — Runs to completion or max iterations, no intervention

---

## CLI Commands

### v1 Commands
```bash
cpm generate        # Generate a Prompt Contract from natural language
cpm list            # List prompts from the database
cpm show <id>       # Show prompt details
cpm copy <id>       # Copy prompt to clipboard
cpm run <id>        # Launch cc runner loop (Ralph Wiggum)
cpm status          # Show active runner status
```

### v3 Additions
```bash
cpm login           # Open browser, authenticate, get token
cpm logout          # Delete local token
cpm whoami          # Show current user + plan
cpm push            # Upload local prompts to cloud
cpm pull            # Download cloud prompts to local DB
```

### v4 Addition
```bash
cpm watch           # Poll cloud API for pending jobs (self-hosted runner)
```

### CLI Mode Detection
```javascript
const mode = existsSync(CONFIG_PATH) ? 'cloud' : 'local';
// local mode: Direct SQLite import from @cpm/db
// cloud mode: HTTP requests to codepromptmaker.com/api/*
// Override: CPM_LOCAL=1 forces local mode
```

---

## Authentication

- **v1:** No auth (single-user local app)
- **v3:** Supabase Auth with GitHub/Google social login
- `cpm login` uses device flow (OAuth-like, opens browser)
- Auth token stored in `~/.cpm/config.json`

---

## v4 — Cloud-Triggered Autonomous Runner

- User creates a prompt on codepromptmaker.com
- `cpm watch` CLI command polls cloud API for pending jobs (every 5 seconds)
- Spawns cc with Ralph Wiggum loop pattern
- Same pattern as GitHub Actions self-hosted runners

### Why Polling Over WebSocket
- WebSocket was considered but rejected (over-engineered, battery drain, connection drops)
- Polling every 5 seconds — simple, robust, battle-tested
- SSE also rejected (persistent connection overhead)

---

## Development Environment

- **Platform:** Mac M1 (Apple Silicon)
- **Shell config:** `~/.bashrc`
- **IDE:** VS Code
- **Package manager:** pnpm
- **Claude plan:** Claude Max (NOT API) — cost is always a critical factor
- **"cc"** = Claude Code terminal

### Cost Considerations
- Do NOT use API-heavy solutions like Agent SDK
- All cc execution runs on the Max plan — one instance at a time
- Sequential execution preferred over parallel (M1 MacBook constraints)
- Avoid solutions that require API keys for core functionality

---

## Design Workflow

For visual design iteration:
1. Use **v0.dev** for landing page variants and creative ideation
2. Iterate with **ChatGPT** for visual refinement
3. Hand to **cc** for production implementation (React/Tailwind/TypeScript)

Claude (cc) is strongest at implementation code, not creative visual ideation.

---

## Open Source SaaS Model (v3 Vision)

- **Freemium:** 25 free prompts, paid plan for unlimited
- **Self-hostable:** `git clone` + `docker-compose up` (everything unlimited)
- **CLI requires** `cpm login` → device flow authentication
- **Cloud sync** of prompts between web and CLI
- Hosted users pay for convenience + cloud sync + unlimited prompts

---

## API Specification

The API is documented in `openapi.yaml` at the project root (OpenAPI 3.1.0).

**Rule:** Whenever an API route is added, changed, or removed in `packages/web/src/app/api/`, you MUST update `openapi.yaml` to match. This includes new endpoints, changed request/response schemas, new status codes, and removed routes. The spec is the single source of truth for the API contract.

Current endpoints (v1):
- `POST /api/generate` — Generate a Prompt Contract via Claude API
- `GET /api/prompts` — List all prompts (newest first)
- `GET /api/prompts/{id}` — Get a single prompt
- `DELETE /api/prompts/{id}` — Delete a prompt
- `GET /api/profile` — Get developer profile
- `PUT /api/profile` — Create or update developer profile
- `GET /api/runner` — Runner status (stub, 501)
- `POST /api/runner` — Start runner (stub, 501)

---

## Key Patterns to Follow

1. Always read this CLAUDE.md before starting work
2. Use Prompt Contract format (GOAL/CONSTRAINTS/FORMAT/FAILURE CONDITIONS) for all task prompts
3. Server-side components by default, client components only when interactivity needed
4. Drizzle ORM for all database operations — never raw SQL
5. All cross-package imports via `@cpm/*` workspace aliases
6. Test after each change, lint before marking complete
7. Commit after each working milestone
8. Update `openapi.yaml` whenever API routes change

## Key Patterns to Avoid

- CommonJS `require()` statements
- Relative imports across package boundaries
- `tailwind.config.js` (use CSS-first Tailwind v4)
- Next.js imports in CLI or runner packages
- API-heavy solutions when Max plan suffices
- `Bash(rm -rf:*)` or `Bash(sudo:*)` in runner tool whitelist
