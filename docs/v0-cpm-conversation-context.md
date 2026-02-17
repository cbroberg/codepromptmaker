# CPM — Conversation Context & Decision Log

> **Formål:** Dette dokument opsummerer alle arkitektur-beslutninger, design-valg og strategiske overvejelser fra planlægningsfasen af CodePromptMaker (CPM). Brug det som kontekst når du arbejder med v1-v4 planerne.
>
> **Oprindelse:** Destilleret fra 3 Claude-sessioner (feb 2026) mellem Christian (CEO, WebHouse ApS) og Claude.

---

## 1. Projektets Oprindelse

Christian identificerede et gentagende problem: naturlige sprog-prompts til Claude Code (cc) producerer inkonsistente resultater. Inspireret af artiklen ["I Stopped Vibe Coding and Started Prompt Contracts"](https://medium.com/@rentierdigital/i-stopped-vibe-coding-and-started-prompt-contracts-claude-code-went-from-gambling-to-shipping-4080ef23efac) af Phil/Rentier Digital, opstod idéen til en app der automatiserer Prompt Contract-generering.

**Kerneinsight fra artiklen:** Prompts skal behandles som kontrakter med 4 håndhævbare klausuler:
1. **GOAL** — testbar succeskriterium (verificérbar på <60 sek)
2. **CONSTRAINTS** — hårde grænser der ikke må krydses
3. **FORMAT** — præcis filstruktur og output-forventninger
4. **FAILURE CONDITIONS** — eksplicitte anti-patterns

**Christians tilføjelse:** CLAUDE.md handshake ("Read CLAUDE.md and confirm you understand the project constraints before doing anything.") prepended automatisk til alle genererede prompts.

---

## 2. Kronologisk Beslutningslog

### Session 1 — Projekt-inception og v1 plan (16. feb 2026)

**Beslutning: App-koncept**
- Naturligt sprog input → struktureret Prompt Contract output via Claude API
- Brugerens stak, præferencer og regler gemmes som "Developer Profile"
- Alle inputs og genererede prompts gemmes i database (prompt-bank)
- Forberedt til RAG-udvidelse over prompt-historik

**Beslutning: Minimum versioner (kritisk)**
- Next.js 16.1.6+ (ikke lavere — upgrade-cost er for høj)
- React 19.2.4+
- Tailwind CSS v4 (CSS-first config, INGEN tailwind.config.js)
- shadcn/ui (seneste v4-kompatible release)

**Beslutning: Dark mode default**
- App launcher i dark mode via next-themes med defaultTheme="dark"
- Theme toggle (dark/light/system) inkluderet

**Beslutning: Domæne og navn**
- Domain: codepromptmaker.com
- Kort navn: CPM
- CLI kommando: `cpm`

**Beslutning: CLI merger med web-projekt**
- Oprindeligt var CLI (pf-runner) et separat projekt
- Besluttet at merge CLI ind i CPM-projektet for at dele database og queries
- CLI skal kunne spawnes direkte fra web UI ("Launch in cc" knap)
- CLI skal også fungere standalone

**Beslutning: Open source SaaS-model (v3 vision)**
- Freemium: 25 gratis prompts, betalt plan for ubegrænset
- Self-hostable via `git clone` + `docker-compose up`
- CLI kræver `cpm login` → device flow authentication
- Cloud sync af prompts mellem web og CLI

### Session 2 — Design, sprog og v4 autonom runner (17. feb 2026)

**Beslutning: Design-strategi**
- Claude er stærkest til implementation (React/Tailwind/TypeScript code)
- v0.dev og ChatGPT er bedre til kreativ visual ideation
- Anbefaling: Brug v0.dev til landing page varianter → iterér med ChatGPT → hand til cc for produktion
- Design-inspiration: littlebird.ai (frisk lys stil) + supabase.com (teknisk tyngde)

**Beslutning: Multi-sprog support fra dag ét**
- `promptLanguage` felt i Developer Profile: `'en' | 'da'` (default: 'en')
- Prompt Contract section headers altid på engelsk (## GOAL, ## CONSTRAINTS, etc.)
- Prose-indhold oversættes til valgt sprog
- Tekniske termer altid på engelsk (kode, filer, CLI, variabelnavne)
- Input-sprog er frit — output følger `promptLanguage`
- Arkitektur klar til flere sprog (string union type, select dropdown i UI)
- Hvert gemt prompt gemmer hvilket sprog det blev genereret i (`prompts.language` kolonne)

**Beslutning: Dansk vs engelsk i cc**
- Dansk fungerer i cc, men engelsk producerer mere præcis teknisk output
- CPM's default er derfor `promptLanguage: 'en'`
- Brugeren kan skifte til dansk hvis foretrukket

**Beslutning: v4 — Cloud-triggered autonomous runner**
- Bruger opretter prompt på codepromptmaker.com
- `cpm watch` CLI-kommando poller cloud API for pending jobs
- Spawner cc med Ralph Wiggum loop pattern (iterativ autonomous execution)
- Samme mønster som GitHub Actions self-hosted runners

**Beslutning: Polling over WebSocket**
- WebSocket overvejet men afvist (over-engineered, battery drain, connection drops)
- Polling hvert 5. sekund valgt — simpelt, robust, battle-tested
- SSE også afvist (persistent connection)

**Beslutning: Tre autonomi-niveauer**
1. `single` — Én cc session, ingen loop (v3 basis)
2. `supervised` — Ralph Wiggum loop men pauser mellem iterationer for godkendelse (default, sikkert)
3. `full` — Kører til completion eller max iterations, ingen intervention
- Free tier: kun `single`. Pro tier: alle niveauer

### Session 3 — Monorepo refaktorering (17. feb 2026, fortsat)

**Beslutning: pnpm workspace monorepo med Turbo**
- Alle fire planer opdateret til monorepo-struktur
- Runner engine (`@cpm/runner`) isoleret som selvstændig genbrugelig pakke
- Database layer (`@cpm/db`) deles af web og CLI uden relative imports

**Beslutning: 5 workspace-pakker**

| Pakke | Ansvar | Deps |
|-------|--------|------|
| `@cpm/shared` | Types, services, prompt builder, Anthropic client | ingen |
| `@cpm/db` | Schema, queries, migrations (Drizzle + SQLite/PostgreSQL) | `@cpm/shared` |
| `@cpm/runner` | Autonom loop engine, tool whitelist, progress tracking | `@cpm/db`, `@cpm/shared` |
| `@cpm/cli` | `cpm` terminal commands, display formatting | `@cpm/db`, `@cpm/shared`, `@cpm/runner` |
| `@cpm/web` | Next.js app, UI, API routes | `@cpm/db`, `@cpm/shared` |

**Beslutning: Turbo build pipeline**
- Dependency-rækkefølge: shared → db → runner → cli → web
- `turbo dev` kører kun `@cpm/web` (de andre er libraries)
- CLI installeres globalt via `cd packages/cli && pnpm link --global`

**Beslutning: Import-regler (hårde)**
- Cross-package imports KUN via workspace aliases (`@cpm/db`, `@cpm/shared`, etc.)
- Aldrig relative paths på tværs af pakke-grænser
- `@cpm/cli` og `@cpm/runner` må ALDRIG importere fra `next/` eller `@next/`
- Kun `@cpm/web` har Next.js som dependency

---

## 3. Arkitektur-beslutninger der påvirker implementation

### Database-strategi
- **v1:** SQLite via better-sqlite3 (local-first, single user)
- **v3:** PostgreSQL via Supabase (cloud, multi-tenant)
- **Migration path:** Drizzle ORM abstraherer databasen. `@cpm/db` skifter connection string, queries forbliver uændrede
- **Embedding-kolonne:** Nullable BLOB i v1, klar til pgvector i v2

### Authentication
- **v1:** Ingen auth (single-user local app)
- **v3:** Supabase Auth med GitHub/Google social login
- `cpm login` bruger device flow (OAuth-agtigt, åbner browser)
- Auth-token gemmes i `~/.cpm/config.json`

### CLI Mode Detection
```javascript
// packages/cli/lib/config.mjs
const mode = existsSync(CONFIG_PATH) ? 'cloud' : 'local';
// local mode: Direkte SQLite import fra @cpm/db
// cloud mode: HTTP requests til codepromptmaker.com/api/*
```

### Ralph Wiggum Loop — Kernepattern
Navngivet efter Ralph Wiggum ("I'm in danger!") — et iterativt loop der genstarter cc når context er opbrugt:

1. **Iteration 1:** cc får det fulde Prompt Contract + instruktion om at oprette Tasks
2. **Iteration 2+:** cc får kun "fortsæt fra dine Tasks" — native Tasks håndterer state via disk
3. **Mellem iterationer:** cooldown (default 10s), tjek for `.claude/COMPLETE` marker
4. **Stop-betingelse:** `.claude/COMPLETE` fil eksisterer ELLER max iterations nået
5. **Tasks persistens:** `CLAUDE_CODE_ENABLE_TASKS=1` environment variable + `CLAUDE_CODE_TASK_LIST_ID` for deling

### Allowed Tools Whitelist (Runner)
```
Read, Write, Edit, MultiEdit
Bash(npm:*), Bash(npx:*), Bash(pnpm:*), Bash(node:*), Bash(git:*)
Bash(cat:*), Bash(ls:*), Bash(find:*), Bash(grep:*), Bash(mkdir:*)
TodoRead, TodoWrite
```
Eksplicit ekskluderet: `Bash(rm -rf:*)`, `Bash(sudo:*)`, netværksadgang

### Prompt Contract Generation — Systemet bag
CPM's Claude API-kald bruger et system prompt der inkorporerer:
1. **Prompt Contract Framework** — GOAL/CONSTRAINTS/FORMAT/FAILURE CONDITIONS
2. **Anthropics egne best practices** — XML-tags, rolle-prompting, chain-of-thought
3. **Anti-patterns fra research** — undgå "be concise", "do your best", positional bias
4. **Brugerens Developer Profile** — stak, regler, patterns injiceres i CONSTRAINTS
5. **Sprog-instruktion** — generér output i `promptLanguage` med tekniske termer på engelsk

---

## 4. Versionsoversigt med scope

| Version | Scope | Database | Auth | CLI |
|---------|-------|----------|------|-----|
| **v1** | Local MVP — web + CLI + runner | SQLite | Ingen | `cpm generate/list/show/copy/run/status` |
| **v2** | RAG over prompt-historik | SQLite + pgvector | Ingen | Uændret |
| **v3** | Open Source SaaS | PostgreSQL (Supabase) | Supabase Auth | + `cpm login/logout/sync` |
| **v4** | Cloud-triggered autonomous runner | + runners/jobs tables | Token-baseret | + `cpm watch` |

### Implementation rækkefølge
Ship v1 → brug dagligt → tilføj v2 RAG → ship v3 SaaS → tilføj v4 autonomous når v3 er stabil

---

## 5. Christians Tekniske Præferencer (CLAUDE.md kontekst)

- **Monorepo:** pnpm workspaces + Turbo
- **Frontend:** Next.js 16.1.6+, React 19.2.4+, Tailwind CSS v4, shadcn/ui, next-themes
- **Kodesprog:** JavaScript/Node.js (primært), TypeScript, React
- **Moduler:** Altid ES modules med import (aldrig CommonJS require)
- **Secrets:** DotEnv → .env.local
- **Komponenter:** Server-side components by default
- **IDE:** VS Code
- **Platform:** Mac M1 (Apple Silicon), ~/.bashrc
- **Claude plan:** Claude Max (ikke API) — cost er kritisk faktor
- **"cc"** = Claude Code terminal

---

## 6. Relaterede Sessions (reference)

- **[Autonomt AI coding agent setup med Claude](https://claude.ai/chat/abc12f8a-393d-4e8f-a2ea-c04664e14f92)** — Original Ralph Wiggum loop design, native Tasks, Agent Teams research
- **[CPM CLI](https://claude.ai/chat/284d70b8-4fad-40ff-85c4-a1f94cd90039)** — pf-runner prototype (selvstændig Node.js CLI der læser fra PromptForge SQLite), nu porteret til `@cpm/runner` i monorepo

---

## 7. Plan-filer (rækkefølge for cc)

1. **v1-cpm-mvp-plan.md** — Komplet v1 MVP plan med monorepo-struktur, CLI, runner, sprog-support. **Start her.**
2. **v3-cpm-saas-design-plan-DA.md** — SaaS + design vision (dansk)
3. **v3-cpm-saas-design-plan-EN.md** — Samme indhold, engelsk (til v0.dev / ChatGPT design-iteration)
4. **v4-cpm-autonomous-runner-plan.md** — Cloud-triggered autonomous runner med `cpm watch`

---

## 8. Open Spørgsmål og Fremtidige Overvejelser

- **v2 RAG:** Ingen selvstændig plan endnu — beskrevet som forberedelse i v1-planen. Kræver pgvector integration og embedding pipeline.
- **Agent Teams integration:** TeammateTool er feature-flagged i cc v2.1.29. Når det bliver GA, kan `@cpm/runner` potentielt orkestrere multi-agent sessions.
- **Multiclaude / Gas Town:** Tredjeparts-orchestrators (Dan Lorenc / Steve Yegge) evalueret men ikke valgt — natives cc-features foretrukket for simplicity.
- **Docker sandboxes:** Overvejet til parallel cc-workers men parkeret — Christians M1 MacBook håndterer sekventiel execution bedst.
- **Git integration i v4:** Auto-branch + auto-PR som extension til autonomous runner (v4.1+).
