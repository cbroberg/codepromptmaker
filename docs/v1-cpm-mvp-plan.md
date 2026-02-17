# CodePromptMaker (CPM) — codepromptmaker.com

## Kort navn: CPM

## Project Vision

**Domain**: codepromptmaker.com
**Short name**: CPM
**Platforms**: Web app + CLI (v1) → RAG (v2) → Open Source SaaS med freemium + CLI login (v3) → Cloud-triggered autonomous runner (v4)
**Architecture**: pnpm workspace monorepo with Turbo

En pnpm monorepo der indeholder alle CPM-pakker: web-app, CLI, autonomous runner engine, database layer og shared types. Turbo håndterer build-rækkefølge og caching på tværs af pakker. Hver pakke har et klart ansvar og kan bruges uafhængigt.

### Monorepo Pakker

| Pakke | Navn | Ansvar |
|-------|------|--------|
| `packages/web` | `@cpm/web` | Next.js app — UI, API routes, pages |
| `packages/cli` | `@cpm/cli` | `cpm` kommando — terminal interface |
| `packages/runner` | `@cpm/runner` | Autonom loop engine — genbrugelig af CLI, watch, og andre projekter |
| `packages/db` | `@cpm/db` | Database schema, queries, migrations — single source of truth |
| `packages/shared` | `@cpm/shared` | Types, constants, languages, Prompt Contract builder |

### Monorepo Regler
- Pakker importerer via workspace alias: `import { getPrompt } from '@cpm/db'`
- Ingen relativ import på tværs af pakke-grænser (aldrig `../../packages/db`)
- `@cpm/cli` og `@cpm/runner` må ALDRIG importere fra `next/` eller `@next/`
- `@cpm/db` og `@cpm/shared` er pure TypeScript/Node — ingen framework-dependency
- `@cpm/web` er den eneste pakke med Next.js dependency
- Turbo `build` pipeline respekterer dependency-grafen: shared → db → runner → cli → web

**Tre lag der spiller sammen:**
1. **Web UI** (`@cpm/web` — codepromptmaker.com) → skriv prompts, generér Prompt Contracts, se prompt-bank
2. **"Launch in cc" knap** på prompt detail page → genererer `cpm run <id> --dir ~/projects/myapp` kommando til kopiering
3. **CLI** (`@cpm/cli` → `cpm` kommando) → terminal interface der bruger `@cpm/db` for data og `@cpm/runner` for autonomous execution

### CLI Commands (`@cpm/cli`)

Installeres globalt via `pnpm link --global` fra `packages/cli/`, eller via `npm install -g codepromptmaker` i v3.

- Entry point: `packages/cli/bin/cpm.mjs` med `commander` CLI framework
- CLI importerer fra `@cpm/db` (queries) og `@cpm/shared` (types, constants) via workspace alias
- CLI bruger `@cpm/runner` for autonomous execution (`cpm run`)
- CLI must NOT import anything from Next.js (`next/server`, etc.) or from `@cpm/web`

**CLI kommandoer:**
```bash
cpm generate "Tilføj Stripe subscription med 3 tiers"  # Generér Prompt Contract
cpm list                                                 # Vis prompt-bank
cpm show <id>                                           # Vis prompt detaljer
cpm run <id> --dir ~/projects/myapp                     # Start cc runner med Prompt Contract
cpm run <id> --dry-run                                  # Preview uden at starte cc
cpm status                                              # Vis kørende runner sessions
cpm copy <id>                                           # Kopiér prompt direkte til clipboard (pbcopy)
```

**Teknisk:**
- Entry point: `packages/cli/bin/cpm.mjs` med `commander` CLI framework
- CLI importerer fra `@cpm/db` og `@cpm/shared` via pnpm workspace alias — ingen duplikering
- CLI og runner må ALDRIG importere fra `next/` eller `@next/` — kun `@cpm/web` har Next.js dependency
- Runner engine (`@cpm/runner`) bruger `CLAUDE_CODE_ENABLE_TASKS=1` for native Tasks
- Alle runner sessions trackes i `runner_sessions` DB tabel via `@cpm/db`
- Output formateret med `chalk` til terminal

---

## Initial Prompt til Claude Code (cc)

Kopiér nedenstående direkte ind i en cc-session for at bootstrappe projektet:

---

```
Read CLAUDE.md and confirm you understand the project constraints before doing anything.

## GOAL

Build "CodePromptMaker" (CPM) — a web application at codepromptmaker.com that takes natural language descriptions of coding tasks and transforms them into structured, high-quality "Prompt Contracts" optimized for Claude Code terminal sessions.

Success criteria:
1. A user can type a natural language coding request (e.g. "I need a Stripe subscription system with 3 tiers") and receive a fully structured Prompt Contract containing: GOAL with testable success metric, CONSTRAINTS referencing the user's saved stack, FORMAT with file structure expectations, and FAILURE CONDITIONS with explicit anti-patterns.
2. The generated prompt includes a CLAUDE.md handshake instruction ("Read CLAUDE.md and confirm you understand the project constraints before doing anything.") prepended automatically.
3. All user inputs and generated prompts are persisted in a database with timestamps, tags, and searchability.
4. The user can configure and save their personal "Developer Profile" (preferred stack, hard rules, patterns, env conventions) which is injected into every generated prompt.
5. A user can copy the generated prompt to clipboard with one click, ready to paste into a cc terminal session.
6. The prompt bank is browsable, searchable, and filterable by tag/date/project.
7. The project is a pnpm workspace monorepo with Turbo. The `cpm` CLI (`@cpm/cli`) imports from `@cpm/db` and `@cpm/shared` via workspace aliases — zero duplicated logic. The runner engine (`@cpm/runner`) is a separate reusable package. Installable globally via `pnpm link --global` from `packages/cli/`.

## CONSTRAINTS

### Stack (non-negotiable)
- Framework: Next.js 16.1.6+ App Router with React 19.2.4+ and TypeScript strict mode
- Styling: Tailwind CSS v4 (latest — uses the new CSS-first configuration, no tailwind.config.js) + shadcn/ui (latest v4-compatible release with updated CLI)
- Database: SQLite via better-sqlite3 for local-first development (easy to migrate to PostgreSQL later)
- ORM: Drizzle ORM with typed schemas
- State management: React server components by default, client components only when interactivity required
- Package manager: pnpm
- Runtime: Node.js with ES modules (import/export syntax, never CommonJS require)
- Environment: DotEnv for secrets via .env.local
- LLM Integration: Anthropic SDK (@anthropic-ai/sdk) for prompt generation via Claude API
- No authentication needed for v1 (single-user local app)

### Hard Rules
- Never install a new dependency without asking first
- Never use CSS modules or styled-components — Tailwind only
- All environment variables go in .env.local, never hardcoded
- Use server components by default, client components only for interactive UI
- Every API route must have Zod input validation
- All database operations go through Drizzle ORM, never raw SQL from components
- Keep component files under 150 lines — split into smaller components if needed
- Use semantic HTML and accessible shadcn/ui components
- All text content in English (UI), code comments in English
- Dark mode is the DEFAULT theme — app must launch in dark mode. Implement theme toggle (dark/light/system) using next-themes. shadcn/ui's dark mode support must be configured from the start
- Tailwind CSS v4 uses CSS-first configuration (@theme, @plugin directives in CSS) — do NOT create a tailwind.config.js file. Use the new @import "tailwindcss" syntax in globals.css
- Pin minimum versions: Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.x (latest), shadcn/ui (latest v4-compatible)
- CLI files in packages/cli/ and packages/runner/ must NEVER import from next/ or @next/ — only @cpm/web has Next.js dependency
- Cross-package imports MUST use workspace aliases (@cpm/db, @cpm/shared, @cpm/runner) — never relative paths across package boundaries
- Database queries must live in packages/db/src/queries/ and be shared via @cpm/db — never duplicate query logic
- Root package.json defines the pnpm workspace. Each package has its own package.json with correct dependencies

### Architecture Patterns
- pnpm workspace monorepo with Turbo build pipeline
- App Router with /app directory structure in packages/web/
- Server Actions for mutations
- API routes only where Server Actions aren't sufficient
- Drizzle schema in packages/db/src/schema.ts
- Database migrations in packages/db/src/migrations/
- Shared types in packages/shared/src/types/
- Reusable components in packages/web/src/components/
- LLM prompt templates in packages/shared/src/prompts/ as TypeScript template functions
- Service layer in packages/shared/src/services/ — platform-agnostic business logic
- Runner engine in packages/runner/ — autonomous loop, tool whitelist, progress tracking
- Cross-package imports via workspace aliases (@cpm/db, @cpm/shared, @cpm/runner)

## FORMAT

### Directory Structure
```
codepromptmaker/
├── CLAUDE.md                          # Root project constraints for cc sessions
├── .env.local                         # ANTHROPIC_API_KEY (root level, shared)
├── package.json                       # Root — workspaces config, shared scripts
├── pnpm-workspace.yaml                # packages: ["packages/*"]
├── turbo.json                         # Build pipeline: shared → db → runner → cli → web
│
├── packages/
│   ├── shared/                        # @cpm/shared — Types, constants, services
│   │   ├── package.json               # { "name": "@cpm/shared" }
│   │   └── src/
│   │       ├── types/
│   │       │   ├── prompt.ts          # Prompt and PromptContract types
│   │       │   ├── profile.ts         # DeveloperProfile type
│   │       │   ├── runner.ts          # Runner session types
│   │       │   └── languages.ts       # Supported languages config (extensible)
│   │       ├── services/              # Platform-agnostic business logic
│   │       │   ├── prompt-service.ts  # Prompt generation + persistence
│   │       │   ├── profile-service.ts # Profile management
│   │       │   └── runner-service.ts  # Runner session management
│   │       ├── prompts/               # LLM prompt engineering
│   │       │   ├── system-prompt.ts   # System prompt for the Claude API call
│   │       │   ├── contract-builder.ts # Assembles the Prompt Contract structure
│   │       │   └── templates.ts       # Reusable prompt fragments/patterns
│   │       ├── anthropic.ts           # Anthropic SDK client setup
│   │       ├── utils.ts               # Shared utilities
│   │       └── index.ts               # Public API exports
│   │
│   ├── db/                            # @cpm/db — Database schema, queries, migrations
│   │   ├── package.json               # { "name": "@cpm/db", deps: ["@cpm/shared"] }
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts               # Database connection + public API exports
│   │       ├── schema.ts              # Drizzle schema (all tables incl. runner_sessions)
│   │       ├── queries/               # Shared query layer
│   │       │   ├── prompts.ts         # Prompt CRUD queries
│   │       │   ├── profiles.ts        # Profile queries
│   │       │   └── runner.ts          # Runner session queries
│   │       └── migrations/            # Generated Drizzle migrations
│   │
│   ├── runner/                        # @cpm/runner — Autonomous loop engine (reusable)
│   │   ├── package.json               # { "name": "@cpm/runner", deps: ["@cpm/db", "@cpm/shared"] }
│   │   └── src/
│   │       ├── index.ts               # Public API exports
│   │       ├── loop.ts                # Ralph Wiggum loop with native Tasks
│   │       ├── allowed-tools.ts       # Tool whitelist for cc runner
│   │       └── progress.ts            # Progress file parser (.claude/progress.md)
│   │
│   ├── cli/                           # @cpm/cli — Terminal interface
│   │   ├── package.json               # { "name": "@cpm/cli", "bin": { "cpm": "./bin/cpm.mjs" }, deps: ["@cpm/db", "@cpm/shared", "@cpm/runner"] }
│   │   ├── bin/
│   │   │   └── cpm.mjs                # Entry point with commander setup
│   │   ├── commands/
│   │   │   ├── generate.mjs           # Generate Prompt Contract from natural language
│   │   │   ├── list.mjs               # List prompts from bank
│   │   │   ├── show.mjs               # Show prompt detail
│   │   │   ├── copy.mjs               # Copy prompt to clipboard (pbcopy)
│   │   │   ├── run.mjs                # Launch cc runner with Prompt Contract (uses @cpm/runner)
│   │   │   └── status.mjs             # Show runner session status
│   │   └── lib/
│   │       └── display.mjs            # Terminal formatting helpers (chalk)
│   │
│   └── web/                           # @cpm/web — Next.js app
│       ├── package.json               # { "name": "@cpm/web", deps: ["@cpm/db", "@cpm/shared"] }
│       ├── next.config.ts             # transpilePackages: ["@cpm/db", "@cpm/shared"]
│       └── src/
│           ├── app/
│           │   ├── layout.tsx         # Root layout with ThemeProvider (next-themes), dark mode default
│           │   ├── page.tsx           # Main prompt generator page
│           │   ├── prompts/
│           │   │   ├── page.tsx       # Prompts/history (list view)
│           │   │   └── [id]/page.tsx  # Single prompt detail view + "Launch in cc" button
│           │   ├── profile/
│           │   │   └── page.tsx       # Developer profile settings
│           │   └── api/
│           │       ├── generate/route.ts  # POST: generate prompt via Claude API
│           │       ├── prompts/route.ts   # GET/POST: CRUD for prompt history
│           │       └── runner/route.ts    # GET/POST: runner session status
│           ├── components/
│           │   ├── prompt-generator.tsx   # Main input form (client component)
│           │   ├── prompt-output.tsx      # Rendered prompt with copy button
│           │   ├── prompt-card.tsx        # Card for prompts list
│           │   ├── launch-in-cc.tsx       # "Launch in cc" button
│           │   ├── profile-form.tsx       # Developer profile editor
│           │   ├── sidebar.tsx            # Navigation sidebar
│           │   └── ui/                    # shadcn/ui components
│           └── lib/
│               └── utils.ts              # Web-specific utilities (cn(), etc.)
│
└── public/                            # Static assets (served by Next.js from packages/web/)
```

### Root Configuration Files

**pnpm-workspace.yaml:**
```yaml
packages:
  - "packages/*"
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "dev": "turbo dev --filter=@cpm/web",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:migrate": "turbo db:migrate --filter=@cpm/db",
    "cli:link": "cd packages/cli && pnpm link --global"
  }
}
```

### Database Schema (Drizzle)

Three core tables + runner tracking:

1. `developer_profiles` — single row for v1, stores user's stack preferences, hard rules, patterns, and custom instructions as structured JSON
2. `prompts` — stores every natural language input with its generated Prompt Contract output, timestamp, optional tags, and optional project name
3. `prompt_tags` — many-to-many relationship for tagging/categorization
4. `runner_sessions` — tracks CLI runner executions: which prompt was run, target directory, status (pending/running/completed/failed), start/end timestamps, exit code, log output. Readable from both CLI and web UI

Schema must include:
- `prompts.input_text` (text) — the user's natural language request
- `prompts.generated_prompt` (text) — the full Prompt Contract output
- `prompts.model_used` (text) — which Claude model was used
- `prompts.tokens_used` (integer) — input + output tokens for cost tracking
- `prompts.project_name` (text, nullable) — optional project grouping
- `prompts.created_at` (timestamp)
- `prompts.rating` (integer, nullable) — user can rate quality 1-5
- `prompts.notes` (text, nullable) — user notes on how the prompt performed
- `prompts.language` (text) — the language used for output generation ('en' | 'da'), copied from profile at generation time

### Prompt Contract Output Format

Every generated prompt MUST follow this exact structure:

```
Read CLAUDE.md and confirm you understand the project constraints before doing anything.

## GOAL
[Specific, testable objective with measurable success criteria]
Success = [concrete verification the user can perform in under 60 seconds]

## CONSTRAINTS
[Injected from user's Developer Profile + task-specific additions]
### Stack (non-negotiable)
- [from profile]
### Hard Rules
- [from profile + task-specific]
### Patterns
- [from profile]

## FORMAT
[Specific file structure, naming conventions, return types]
1. [file path and purpose]
2. [file path and purpose]
...

## FAILURE CONDITIONS
- [Specific anti-pattern that makes output unacceptable]
- [Wrong library/framework usage]
- [Missing error/loading states]
- [Type safety violations]
- [File size violations]
- [Any deviation from CONSTRAINTS]
```

## FAILURE CONDITIONS
- Generated prompts that lack any of the 4 Prompt Contract components (GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS)
- CONSTRAINTS section that doesn't incorporate the user's saved Developer Profile
- GOAL without a testable success metric ("Success = ...")
- Missing the CLAUDE.md handshake instruction at the top
- Using useState for data that should be server-side
- Any component exceeding 150 lines
- Missing loading and error states on async operations
- Missing TypeScript types on any function parameter or return value
- Raw SQL queries outside of Drizzle ORM
- Hardcoded API keys or secrets
- Missing Zod validation on any API route or Server Action
- Using require() instead of import
- Missing copy-to-clipboard functionality on generated prompts
- Database schema without proper indexes on searchable fields (created_at, project_name)
- App defaulting to light mode instead of dark mode
- Creating a tailwind.config.js or tailwind.config.ts file — Tailwind v4 uses CSS-first config only
- Using deprecated Tailwind v3 patterns (e.g. darkMode config key, theme.extend in JS)
- Not wrapping app in ThemeProvider from next-themes with defaultTheme="dark"
- CLI files (cli/) that import from next/ or @next/ packages
- Duplicated database queries between packages (must use @cpm/db)
- Cross-package imports using relative paths instead of @cpm/* workspace aliases
- CLI runner that doesn't use CLAUDE_CODE_ENABLE_TASKS=1
- Missing --dry-run option on run command
- CLI that doesn't work after `cd packages/cli && pnpm link --global`
- Missing pnpm-workspace.yaml or turbo.json at project root
```

---

## Prompt Engineering Intelligence — Hvad Appen Skal Vide

CodePromptMaker (CPM)'s Claude API-kald skal bruge et system prompt der inkorporerer følgende state-of-the-art principper. Disse regler definerer HVORDAN appen genererer prompts:

### 1. Prompt Contract Framework (fra artiklen)
- **GOAL**: Altid med testbar succeskriterium. "Success = [handling en bruger kan verificere på under 60 sekunder]"
- **CONSTRAINTS**: Hårde grænser der ikke må krydses. Inkluderer altid brugerens gemte stak og regler
- **FORMAT**: Præcis filstruktur og output-forventninger. Ingen "surprise me"
- **FAILURE CONDITIONS**: Negativ targeting — definer hvad der er uacceptabelt

### 2. Anthropic Officielle Best Practices (Claude 4.x)
- **Vær eksplicit**: Claude 4.x tager instruktioner bogstaveligt. Sig præcis hvad du vil have — modellen infererer IKKE udover hvad du beder om
- **Strukturerede prompts med XML-tags**: Brug `<goal>`, `<constraints>`, `<format>`, `<failure_conditions>` tags internt i systemprompten
- **Negative eksempler er kritisk vigtige**: De definerer grænserne for featuren og sikrer den ikke over-trigger
- **Specifitet over kreativitet**: "Design a Mediterranean diet meal plan for pre-diabetic management, 1800 cal" slår "Make a healthy meal plan"
- **Step-by-step reasoning**: For komplekse tasks, bed Claude om at tænke trinvist
- **Undgå over-engineering**: "Don't add features, refactor code, or make improvements beyond what was asked"

### 3. CLAUDE.md Handshake Pattern
- Første linje i ENHVER genereret prompt: `Read CLAUDE.md and confirm you understand the project constraints before doing anything.`
- Dette tvinger Claude Code til at ekko constraints tilbage, skaber en "Miranda rights" for kodbasen
- Appen genererer OGSÅ et forslag til CLAUDE.md-indhold baseret på brugerens profil

### 4. Context Engineering Principper
- Hold prompts fokuserede og relevante — for mange instrukser giver dårligere resultater
- ~150-200 instruktioner er max for frontier thinking-modeller
- Hvert stykke information skal "justify its existence" i prompten
- Brug progressiv disclosure: kun inkluder det der er relevant for den specifikke task

### 5. Plan-Before-Execute Pattern
- Inkluder instruktion om at Claude skal lave en plan først og afvente godkendelse
- "Before coding: propose plan in bullets; wait for OK"
- Forhindrer at Claude bygger i den forkerte retning

---

## Developer Profile — Felter der skal gemmes

Profilen er kernen i personalisering. Disse felter injiceres automatisk i alle genererede prompts:

```typescript
interface DeveloperProfile {
  // Identity
  name: string;
  
  // Stack preferences (injected into CONSTRAINTS)
  stack: {
    framework: string;        // e.g. "Next.js 16.1.6+ App Router"
    language: string;         // e.g. "TypeScript strict mode"
    styling: string;          // e.g. "Tailwind CSS v4 + shadcn/ui (dark mode default)"
    database: string;         // e.g. "Supabase / PostgreSQL"
    orm: string;              // e.g. "Drizzle ORM"
    auth: string;             // e.g. "Clerk" or "Supabase Auth"
    stateManagement: string;  // e.g. "React server components default"
    packageManager: string;   // e.g. "pnpm"
    runtime: string;          // e.g. "Node.js with ES modules"
    testing: string;          // e.g. "Vitest + Playwright"
    other: string[];          // Additional stack items
  };
  
  // Hard rules (injected into CONSTRAINTS)
  hardRules: string[];
  // e.g. ["Never install a new dependency without asking first",
  //        "Never modify database schema without showing migration plan",
  //        "Environment variables in .env.local, never hardcoded"]
  
  // Patterns (injected into CONSTRAINTS)
  patterns: string[];
  // e.g. ["Server components by default",
  //        "Zod validation on every user input",
  //        "Error boundaries on every route segment"]
  
  // Default failure conditions (always included)
  defaultFailureConditions: string[];
  // e.g. ["Missing TypeScript types on any function parameter",
  //        "Missing loading and error states",
  //        "Using require() instead of import"]
  
  // CLAUDE.md template content
  claudeMdTemplate: string;
  
  // Prompt output language
  // Architecture supports adding more languages later, but v1 ships with EN and DA only
  promptLanguage: 'en' | 'da';  // Default: 'en'
  // Controls the language of generated Prompt Contract prose content.
  // Section headers (GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS) are ALWAYS English
  // regardless of this setting — they are framework terms, not translatable labels.
  // Technical terms, code references, and file paths remain in English.
  // Only descriptive prose within each section is translated.
  
  // Custom instructions for the prompt generator
  customInstructions: string;
  // e.g. "I prefer concise prompts. Always suggest test commands."
}
```

---

## Fremtidig RAG-Udvidelse — Forbered Arkitekturen

Databasen og arkitekturen skal designes så RAG kan tilføjes i v2:

### Forberedelser i v1
1. **Structured data fra dag ét**: Alle prompts gemmes med rig metadata (tags, project, rating, notes, tokens)
2. **Separate content-felter**: `input_text` og `generated_prompt` er separate kolonner — gør det nemt at embedde begge uafhængigt
3. **Shared query layer**: `@cpm/db` bruges af BÅDE `@cpm/web` og `@cpm/cli` — én sandhed for al data access
4. **Service layer abstraction**: `@cpm/shared/services/` indeholder business logic der er platform-agnostisk
5. **Runner tracking**: `runner_sessions` tabel giver historik over CLI-executions der kan korreleres med prompt-kvalitet
6. **Embedding-ready schema**: Nullable `embedding` kolonne (BLOB) i prompts-tabellen — ubrugt i v1 men klar til pgvector migration
7. **Notes-felt**: Brugerens egne noter om hvad der virkede/ikke virkede bliver værdifuldt RAG-context
8. **Monorepo-struktur**: `@cpm/runner` er allerede isoleret som separat pakke — kan udvides med RAG-informed prompt enhancement

### V2 Roadmap (fremtidig)
- Migrer SQLite → PostgreSQL med pgvector extension
- Embed alle prompts (input + output + notes) via Anthropic/OpenAI embedding model
- Semantic search: "Find prompts der ligner min nuværende task"
- Auto-suggest fra prompt-historik baseret på lighed
- Kontekstuel forbedring: RAG-retrieve relevante tidligere prompts og injicér som few-shot examples
- Tanke-journal: Fritekst notesfelt der embeddes og kan søges semantisk
- Runner dashboard i web UI med live status fra runner_sessions

### V3 Roadmap — Open Source SaaS (codepromptmaker.com live)

**Vision**: CPM bliver et open source projekt der kører live på codepromptmaker.com som en SaaS — men kan også clones og køres lokalt for fuld selvhosting.

**Forretningsmodel — Freemium:**
- **Free tier**: Op til 25 gemte prompts, 10 generationer/dag, fuld CLI adgang
- **Pro tier** (betalt): Ubegrænset prompts og generationer, RAG semantic search, prioriteret API, team-deling af profiler og prompt-banker
- Alternativt: Clone repo og kør lokalt med egen Anthropic API key — ingen begrænsninger

**Authentication & Multi-tenancy:**
- Auth via NextAuth.js eller Clerk (evalueres i v3)
- Hver bruger har sin egen Developer Profile, prompt-bank og runner_sessions
- Database migreres fra single-user SQLite til multi-tenant PostgreSQL
- Row-level data isolation per bruger

**CLI ↔ Cloud Login Flow:**
```bash
cpm login
```
- Åbner browser på `codepromptmaker.com/cli/authorize`
- Bruger logger ind (eller opretter konto)
- Website genererer en kort-levet auth code
- CLI poller eller modtager callback med token
- Token gemmes i `~/.cpm/config.json`
- Alle efterfølgende `cpm` kommandoer syncer med cloud

**CLI Dual Mode:**
```bash
cpm login                    # Forbind til codepromptmaker.com cloud
cpm logout                   # Disconnect fra cloud, brug kun lokal DB
cpm sync                     # Manuel sync af prompts mellem lokal og cloud
cpm generate "tekst"         # Bruger cloud API hvis logget ind, ellers lokal
```

**Open Source Strategi:**
- Repo er public på GitHub med MIT eller Apache 2.0 licens
- Self-hosting dokumentation i README
- Cloud-hosted version på codepromptmaker.com er "the easy path"
- Community contributions via PR's
- Betalt tier er udelukkende cloud-features (hosting, managed DB, team features)

**Arkitektur-forberedelser der allerede er i v1:**
- Monorepo med pnpm workspaces — trivielt at tilføje auth middleware og tenant-scoping som nyt lag
- `@cpm/shared/services/` gør det nemt at skifte mellem lokal SQLite og cloud PostgreSQL
- `@cpm/cli` kan udvides med login/sync commands uden at røre `@cpm/web`
- API routes i `@cpm/web` er rent JSON og kan eksponeres som public API med auth middleware
- `@cpm/db/queries/` kan udvides med tenant-scoping uden refactoring
- `@cpm/runner` kan genbruges direkte af v4's `cpm watch` (cloud-triggered autonomous runner)
- No auth i v1 er bevidst — det er single-user local-first. Auth tilføjes som et lag i v3 uden at røre forretningslogik

---

## Pages og User Flow

### 1. Hovedside — Prompt Generator (`/`)
- Stort tekstfelt til naturligt sprog input
- Valgfrit: project name, tags
- "Generate Prompt" knap → kalder Claude API
- Output vises i formateret Prompt Contract med syntax highlighting
- Copy-to-clipboard knap (kopierer hele prompten)
- "Save to Bank" knap (gemmer automatisk, men kan tilføje rating/notes)
- Viser token-forbrug og model info

### 2. Prompt (`/prompts`)
- Liste af alle gemte prompts, nyeste først
- Søgefelt (full-text search i input og output)
- Filtrér på: project name, tags, rating, dato-range
- Klik for at se detaljer og re-kopiere

### 3. Prompt Detail (`/prompts/[id]`)
- Fuld visning af input + genereret prompt
- Editerbar rating (1-5 stjerner)
- Notes-felt for brugerens observationer
- "Regenerate" knap (sender same input igen)
- "Use as Template" knap (kopierer input til generator)
- **"Launch in cc" knap** — genererer `cpm run <id> --dir <path>` kommando med directory picker, kopierer til clipboard
- Runner status hvis prompten er blevet kørt via CLI (fra `runner_sessions`)

### 4. Developer Profile (`/profile`)
- Formular med alle Developer Profile felter
- **Prompt Language** selector (dropdown: English / Dansk) — default English
- Stack konfiguration med forudfyldte forslag
- Hard Rules editor (add/remove/reorder)
- Patterns editor
- Default Failure Conditions editor
- CLAUDE.md template editor med preview
- Custom instructions fritekst

---

## Tekniske Implementeringsnoter

### Claude API System Prompt
Det system prompt der bruges når appen kalder Claude API'et til at generere Prompt Contracts skal selv være et velstruktureret prompt der instruerer Claude i at:

1. Analysere brugerens naturlige sprog-input
2. Identificere den underliggende coding-task og dens kompleksitet
3. Generere en testbar GOAL med success metric
4. Injicere brugerens profil i CONSTRAINTS
5. Foreslå en specifik FORMAT med fil-stier baseret på task-typen
6. Generere relevante FAILURE CONDITIONS baseret på task + stack
7. Prepende CLAUDE.md handshake-instruktion
8. Inkludere plan-before-execute instruktion for komplekse tasks
9. Respektere brugerens `promptLanguage` setting fra Developer Profile

### Prompt Language Handling

Brugerens `promptLanguage` setting styrer sproget i det genererede output. Systemprompten til Claude API-kaldet skal inkludere:

```
Generate all descriptive prose in the Prompt Contract in ${language}.
Section headers (## GOAL, ## CONSTRAINTS, ## FORMAT, ## FAILURE CONDITIONS) 
MUST always remain in English — they are Prompt Contract framework terms.
Technical terms, code references, variable names, file paths, and CLI commands 
remain in English regardless of language setting.
Only the descriptive prose within each section should be in ${language}.
```

**Eksempel — dansk output:**
```markdown
## GOAL
Implementér et Stripe subscription system med 3 tiers.
Success = `pnpm test:stripe` kører grønt og checkout-flow kan gennemføres i browser.

## CONSTRAINTS
### Stack (non-negotiable)
- Next.js 16.1.6+ App Router med TypeScript strict
...
```

**Eksempel — engelsk output:**
```markdown
## GOAL
Implement a Stripe subscription system with 3 tiers.
Success = `pnpm test:stripe` passes and checkout flow completes in browser.

## CONSTRAINTS
### Stack (non-negotiable)
- Next.js 16.1.6+ App Router with TypeScript strict
...
```

Bemærk: Brugerens `input_text` kan være på ethvert sprog — CPM accepterer input på alle sprog og genererer output på det valgte `promptLanguage`. CLI-kommandoen `cpm generate` respekterer samme setting.

### Vigtigt om Token-Økonomi
- System prompten til generering bør holdes under 2000 tokens
- Brugerens profil serialiseres kompakt (ikke verbose prose)
- Output bør targetere 300-800 tokens for en typisk Prompt Contract
- Vis altid token-forbrug til brugeren for cost-awareness

---

## Definition of Done — MVP

- [ ] pnpm workspace monorepo med Turbo er konfigureret og `turbo build` kører hele pipeline
- [ ] Developer Profile kan oprettes og redigeres, gemmes i SQLite via `@cpm/db`
- [ ] Natural language input → struktureret Prompt Contract via Claude API
- [ ] Alle 4 Prompt Contract-sektioner genereres korrekt (GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS)
- [ ] Profil-data injiceres automatisk i CONSTRAINTS
- [ ] CLAUDE.md handshake prepended automatisk
- [ ] Copy-to-clipboard fungerer med ét klik
- [ ] Alle prompts gemmes i database med metadata
- [ ] Prompts med søgning og filtrering fungerer
- [ ] Rating og notes kan tilføjes til gemte prompts
- [ ] App kører lokalt med `pnpm dev` (Turbo starter @cpm/web)
- [ ] Responsive UI with Tailwind CSS v4 (CSS-first config) + shadcn/ui, dark mode default with theme toggle
- [ ] Alle API routes har Zod validation
- [ ] TypeScript strict mode, ingen `any` types
- [ ] API routes returnerer rent JSON (CLI + web kompatibelt)
- [ ] `@cpm/db` queries bruges af både `@cpm/web` og `@cpm/cli` — ingen duplikering
- [ ] `@cpm/shared` services er platform-agnostisk (ingen Next.js imports)
- [ ] `@cpm/runner` loop engine er isoleret og importerer kun fra `@cpm/db` og `@cpm/shared`
- [ ] Alle cross-package imports bruger workspace aliases (@cpm/*)
- [ ] CLI installeres globalt via `cd packages/cli && pnpm link --global` og `cpm --help` virker
- [ ] `cpm generate "tekst"` genererer Prompt Contract i terminalen
- [ ] `cpm list` og `cpm show <id>` viser prompt-bank
- [ ] `cpm copy <id>` kopierer prompt til clipboard via pbcopy
- [ ] `cpm run <id> --dry-run` viser preview uden at starte cc
- [ ] runner_sessions tabel tracker CLI-executions
- [ ] "Launch in cc" knap på prompt detail page genererer korrekt cpm kommando
- [ ] Developer Profile includes `promptLanguage` selector with EN and DA options (default: EN)
- [ ] Generated Prompt Contracts respect `promptLanguage` — prose in selected language, headers always English
- [ ] Language architecture supports future additions (type uses string union, UI uses select dropdown)
- [ ] Each saved prompt stores the language it was generated in (`prompts.language` column)
- [ ] `cpm generate` respects the profile's `promptLanguage` setting
