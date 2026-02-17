# v5 — CPM Functionality Extensions: AI Command Center

> **Formål:** Udvid CodePromptMaker fra et Prompt Contract-værktøj til et fuldt **AI Command Center** — et state-of-the-art hub for generativ AI, autonome pipelines og agentic workflows.
>
> **Forudsætning:** v1–v4 arkitektur forbliver intakt. v5 tilføjer nye moduler, en connector-arkitektur og Plan Management oven på den eksisterende monorepo-struktur.
>
> **Oprindelse:** Planlægningssessioner mellem Christian (CEO, WebHouse ApS) og Claude, 17. feb 2026.

---

## 1. Vision: Fra Prompt Maker til AI Command Center

### 1.1 Hvorfor v5 er et paradigmeskift

CPM startede som et værktøj der transformerer naturligt sprog til strukturerede Prompt Contracts. Men landskabet i 2026 har rykket sig dramatisk:

- **Agenter arbejder som teams**, ikke som individuelle værktøjer
- **Pipelines er autonome** — fra krav til deployment
- **IDE'er er agent-native** — udviklere definerer intentioner, agenter implementerer
- **Udvikleren er "strategisk supervisor"**, ikke kode-skriver

CPM's naturlige evolution er derfor fra "prompt maker" til **det centrale styringsværktøj for al AI-assisteret udvikling** — et sted hvor planer, prompts, agenter, regler, skills og pipelines styres fra ét interface.

### 1.2 v5 Kernekoncepter

v5 introducerer **fem nye kerneområder**:

1. **Plan Management** — Opret, gem, organiser og RAG-indeksér udviklingsplaner
2. **Connector Architecture** — Plugin-system der forbinder CPM til forskellige AI-værktøjer
3. **Project Scaffolding Tools** — CLAUDE.md generator, regel-editor, skills/actions creator, agent manager
4. **AI Toolkit Modules** — Funktionalitetsmoduler der gør CPM til et komplet AI-arbejdsværktøj
5. **Agentic Pipeline Framework** — Multi-agent orkestrering, governance og observability

### 1.3 Navnediskussion

Med v5 rækker CPM langt ud over "prompt making". Produktet har brug for et navn der afspejler dets faktiske scope.

**Problemet med "CodePromptMaker":**
- For snævert — produktet handler ikke kun om prompts
- For langt — "CodePromptMaker" er 15 tegn
- Antyder at det kun er et genererings-værktøj, ikke et command center

**Navneforslag at evaluere:**

| Navn | Fordele | Ulemper |
|------|---------|---------|
| **CPM Studio** | Beholder brand equity, "Studio" signalerer professionelt kreativt værktøj | Forklarer ikke hvad det gør |
| **CPM Command** | Præcist — det ER et command center | Kan lyde militaristisk |
| **AgentForge** | Stærk metafor (smedjen der former agenter), catchy | Mister CPM brand, domæne måske optaget |
| **Promptforge** → **AgentForge** | Naturlig evolution fra prompt-fokus til agent-fokus | Kræver domæne-skift |
| **Codepilot** / **DevPilot** | Intuitivt, "pilot" = du styrer | GitHub Copilot association |
| **Orchestr8** / **Orch** | Præcist for orkestrering, unikt | Svært at stave, lidt kryptisk |
| **Claude Ops** / **ClaudeHub** | Tydeligt Claude-fokus | Kan virke som Anthropic-produkt, ikke uafhængigt |
| **Shipyard** | Metafor: "Her bygger vi skibe (features) der sendes afsted" | Ikke umiddelbart tech-relateret |
| **ARC** (Agent Runtime Commander) | Kort, stærkt, akronymet virker | Generisk |

**Anbefaling:** Behold `codepromptmaker.com` som domæne og `cpm` som CLI-kommando (brand equity + allerede registreret), men rebrand UI og marketing til noget bredere. Beslutning parkeret til v5 er funktionelt defineret — navnevalg følger naturligt af hvad produktet *bliver*.

**Midlertidig arbejdstitel:** **CPM — AI Command Center**

---

## 2. 2026 Landskab: Kontekst for v5 Arkitektur

Denne sektion forankrer v5's designbeslutninger i state-of-the-art for agentic software development i 2026.

### 2.1 De Fem Store Skift

**Skift 1: Fra enkelt-agenter til koordinerede multi-agent teams**
Moderne systemer bruger "swarms" eller teams: en Researcher finder data, en Analyst bearbejder, en Writer formulerer, mens en Manager koordinerer. Frameworks som CrewAI (rolle-baseret), LangGraph (graf-orkestrering) og AutoGen (multi-agent samtaler) er industristandard.

**Skift 2: Langkørende agenter der bygger komplette systemer**
2026-generationen kan køre i timer eller dage, holde kontekst og iterativt forbedre. De refaktorerer kodebaser, migrerer frameworks, opsætter CI/CD og udfører kontinuerlig forbedring uden babysitting.

**Skift 3: Agent-native udviklingsmiljøer**
Google Antigravity, Apple Xcode 26.3 og GitHub Copilot Workspace er tidlige eksempler. Udvikleren definerer intentioner og overvåger — agenter implementerer.

**Skift 4: Execution-aware agentic coding**
Nyt frontier: generer kode → kør → test → reparér automatisk. Sandbox + auto-repair loops, test-driven agent loops og bidirectional validation er standard patterns.

**Skift 5: AgentOps som nyt felt**
"DevOps for AI Agents" — observability, governance, evaluering, policy-as-code, regression testing af agent-versioner. Værktøjer som LangSmith, Braintrust, Arize Phoenix og AgentOps.ai giver session replays og decision audit trails.

### 2.2 State-of-the-Art Tekniske Paradigmer

**Multi-agent orchestration som standard:**
Baseline er ikke én agent men multi-agent systemer med autonome komponenter. Typiske arkitekturmønstre: context-engineered agents, hierarkiske agent-teams, debate/consensus-loops, execution-aware validation loops.

**Execution-aware agentic coding (det nye frontier):**
Fokus flyttet fra "generér kode" til kør, test og reparér automatisk. Systemer som execution-aware autonomous coding agents validerer output automatisk og iterativt forbedrer det.

**Requirement-to-system pipelines:**
Agenter omsætter krav → arkitektur → kode → tests → deploy. AI som SDLC-orkestrator er det næste skridt efter "AI code generation".

**Pipeline management & governance:**
Enterprise-state-of-the-art: policy-as-code for agenter, deterministisk execution, logging og audit trails. I praksis "DevOps for agents".

### 2.3 State-of-the-Art Frameworks & Stacks

| Framework | Type | Styrke | CPM-integration |
|-----------|------|--------|-----------------|
| **LangGraph** | Graf-orkestrering | Deterministiske flows, error handling | Connector (v5.1) |
| **CrewAI** | Rolle-baseret teams | Nem agent-team definition | Pattern-inspiration for Agent Team Composer |
| **AutoGen** | Multi-agent dialog | Avancerede samtaler | Reference-arkitektur |
| **LlamaIndex** | Knowledge/retrieval | RAG excellence | Inspirerer v2 RAG pipeline |
| **Semantic Kernel** | Enterprise integration | Microsoft-økosystem | Ikke prioriteret (ikke Claude-fokuseret) |
| **OpenAI Swarm** | Lightweight agents | Simpel multi-agent | Pattern-reference |

### 2.4 Det Typiske SOTA Agentic Workflow i 2026

```
1. Spec Agent      → forstår krav (fra Plan i CPM)
2. Planner Agent   → dekomponerer i opgaver (genererer Prompt Contracts)
3. Coder Agents    → parallel implementering (via Claude Code connector)
4. Test Agent      → genererer + kører tests
5. Reviewer Agent  → kritik + refactor
6. Orchestrator    → styrer loopet (CPM's Workflow Builder)
```

**CPM's rolle:** Det orkestreringsværktøj der forbinder alle disse agenter, med planer som input, prompts som instruktioner, connectors som execution layer og sessions som observability.

### 2.5 Makrotrends

- **Human = orkestrator, ikke implementer**
- **Agent teams > single agents**
- **Evaluation & governance** bliver lige så vigtigt som modelvalg
- **Local/personal agents** vokser hurtigt
- **Industrialization** (ikke eksperimenter) er fokus
- Udviklere bruger AI i ~60% af arbejdet, men kan kun fuldt delegere 0-20%
- Selv topmodeller klarer kun ~11% af komplekse feature-tasks (FeatureBench)
- Implikation: CPM skal fokusere på at gøre de 60% mere effektive, ikke på fuld autonomi

### 2.6 Implikationer for CPM v5

| Landskabs-trend | CPM v5 svar |
|-----------------|-------------|
| Multi-agent teams | Connector Architecture + Agent Manager + Workflow Builder |
| Langkørende agenter | Ralph Wiggum loop (eksisterende) + Session History + Governance |
| Agent-native IDE | CPM som "meta-IDE" der orkestrerer på tværs af værktøjer |
| Execution-aware coding | Runner engine med sandbox + test-integration |
| AgentOps/Observability | Session History & Analytics + Agent Pipeline Governance |
| Policy-as-code | Rule Editor + Agent constraints i CLAUDE.md |
| Requirement-to-system | Plan → Prompt → Workflow → Execution pipeline |

### 2.7 CPM's Positionering

CPM er **ikke** et orchestration framework (LangGraph, CrewAI). CPM er **kontrolpanelet** — det sted hvor udvikleren definerer, konfigurerer, deployer og overvåger sine AI-agenter, uanset hvilket framework eller tool de kører i.

**Metafor:** LangGraph er motoren. CrewAI er gearkassen. **CPM er cockpittet.**

---

## 3. Plan Management

### Problemet

Christian bygger planer i Claude Desktop (Max plan), i Apple Notes og i markdown-filer. Disse planer er i dag spredt og ikke tilgængelige for RAG, søgning eller linking til prompts.

### Løsning

Et førsteklasses `Plan`-objekt i CPM med egen database-tabel, UI og RAG-indeksering.

### Plan Data Model

```typescript
// packages/shared/types/plan.ts

interface Plan {
  id: string;                          // UUID
  title: string;                       // Plan navn
  description: string | null;          // Kort beskrivelse
  content: string;                     // Fuld plan-indhold (markdown)
  source: 'manual' | 'import' | 'generated';  // Oprindelse
  sourceRef: string | null;            // Reference til kilde (fx Claude chat URL)
  status: 'draft' | 'active' | 'completed' | 'archived';
  projectId: string | null;            // Valgfri projekt-gruppering
  tags: string[];                      // Fritekst tags til filtrering
  language: 'en' | 'da';              // Sprog planen er skrevet i
  linkedPromptIds: string[];           // Prompts der er genereret fra denne plan
  embedding: Float32Array | null;      // RAG embedding (nullable i v1-v2)
  createdAt: Date;
  updatedAt: Date;
}
```

### Plan Database Schema (Drizzle)

```typescript
// packages/db/schema/plans.ts

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  source: text('source', { enum: ['manual', 'import', 'generated'] }).default('manual'),
  sourceRef: text('source_ref'),
  status: text('status', { enum: ['draft', 'active', 'completed', 'archived'] }).default('draft'),
  projectId: text('project_id'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  language: text('language', { enum: ['en', 'da'] }).default('en'),
  linkedPromptIds: text('linked_prompt_ids', { mode: 'json' }).$type<string[]>().default([]),
  embedding: blob('embedding'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});
```

### Plan UI Features

**Opret plan:**
- Markdown editor med preview (split pane)
- Paste fra Claude Desktop — intelligent parsing af samtale-kontekst
- Import fra fil (markdown, tekst)
- Valgfri: link til kilde (Claude chat URL, Notion link, etc.)

**Plan liste:**
- Filtrer på status, tags, projekt
- Søg i titel og indhold
- Sorter på dato, status, relevans

**Plan detalje:**
- Fuld markdown rendering
- Linked prompts (hvilke Prompt Contracts er genereret fra denne plan)
- Status tracking (draft → active → completed)
- Version history (diff mellem edits)

**Plan → Prompt workflow:**
- Fra en plan, klik "Generate Prompt Contract" → pre-udfylder prompt generator med plan-kontekst
- Planen injiceres som kontekst i Claude API-kaldet
- Den genererede prompt linkes automatisk tilbage til planen

### Plan CLI Commands

```bash
cpm plan create                    # Opret ny plan (åbner editor eller accepterer stdin)
cpm plan create --file plan.md     # Import plan fra fil
cpm plan create --paste            # Paste fra clipboard (Claude Desktop output)
cpm plan list                      # Vis alle planer
cpm plan list --status active      # Filtrer på status
cpm plan show <id>                 # Vis plan detaljer
cpm plan edit <id>                 # Redigér plan i $EDITOR
cpm plan link <plan-id> <prompt-id>  # Link prompt til plan
cpm plan status <id> <status>      # Opdatér status (draft/active/completed/archived)
cpm plan search <query>            # Semantisk søgning i planer (v2+ RAG)
```

### RAG over Plans

Planer indgår i samme RAG-pipeline som prompts (v2):
- Embedding genereres ved oprettelse/opdatering
- Søgning på tværs af planer OG prompts med semantisk relevans
- Kontekst fra relevante planer kan automatisk injiceres i prompt-generering

---

## 4. Project Scaffolding Tools

Dette er et helt nyt kerneområde i v5 — værktøjer der konfigurerer og vedligeholder et projekts AI-infrastruktur. Disse tools genererer, pusher og vedligeholder de filer og konfigurationer som AI-agenter afhænger af.

### 4.1 CLAUDE.md Generator & Manager

**Problem:** Hvert projekt har brug for en CLAUDE.md, men at skrive den manuelt er tidskrævende, og at holde den opdateret kræver disciplin. Desuden skal den pushes til GitHub.

**Løsning:** En CLAUDE.md editor/generator i CPM med GitHub OAuth integration for direkte push til repositories.

#### Data Model

```typescript
// packages/shared/types/claude-md.ts

interface ClaudeMdConfig {
  id: string;
  projectId: string;                   // Linked til projekt
  content: string;                     // Fuld CLAUDE.md indhold (markdown)
  sections: ClaudeMdSection[];         // Strukturerede sektioner
  generatedFrom: {                     // Hvad blev den genereret fra?
    developerProfile: boolean;
    projectDetection: boolean;         // Auto-detect fra package.json etc.
    plans: string[];                   // Plan IDs brugt som input
    contextBlocks: string[];           // Context Block IDs inkluderet
    manual: boolean;                   // Manuelle tilføjelser
  };
  githubRepo: string | null;           // fx 'webhouse/my-project'
  githubBranch: string;                // default: 'main'
  githubPath: string;                  // default: 'CLAUDE.md' (root)
  lastPushedAt: Date | null;
  lastPushedSha: string | null;        // Git commit SHA for diff-tracking
  syncStatus: 'synced' | 'local-ahead' | 'remote-ahead' | 'conflict';
  createdAt: Date;
  updatedAt: Date;
}

interface ClaudeMdSection {
  id: string;
  type: 'overview' | 'structure' | 'hard-rules' | 'versions' | 'database' |
        'language' | 'runner' | 'cli' | 'auth' | 'environment' | 'patterns' |
        'anti-patterns' | 'custom';
  title: string;
  content: string;
  order: number;
  source: 'generated' | 'manual' | 'imported';
  locked: boolean;                     // Bruger-locked sektioner ændres ikke ved regenerering
}
```

#### GitHub OAuth Integration

```typescript
// packages/shared/types/github.ts

interface GitHubConnection {
  id: string;
  userId: string;                      // CPM bruger (v3)
  githubUserId: string;
  githubUsername: string;
  accessToken: string;                 // Encrypted i DB
  tokenExpiresAt: Date;
  refreshToken: string;                // Encrypted
  scopes: string[];                    // ['repo', 'read:user']
  connectedAt: Date;
}

// Required OAuth scopes:
// - repo (read/write access til repositories for push)
// - read:user (bruger-info)
// - (optional) read:org (for organisation repos)
```

#### CLAUDE.md Generator Workflow

```
1. Bruger vælger projekt (eller opretter nyt)
2. CPM auto-detekterer:
   - package.json → stack, dependencies, scripts
   - tsconfig.json → TypeScript config
   - .eslintrc → linting rules
   - Eksisterende CLAUDE.md → import som baseline
   - .claude/ directory → eksisterende settings
3. Bruger redigerer sektioner i visual editor
   - Drag-and-drop sektion-rækkefølge
   - Per-sektion: generated / manual / locked
   - Preview af komplet CLAUDE.md
4. Injicér Developer Profile (stack, regler, patterns)
5. Injicér relevante Context Blocks
6. Preview → Save lokalt → Push til GitHub
```

#### Push til GitHub Flow

```
1. Bruger klikker "Push to GitHub"
2. OAuth check — er token gyldigt? Hvis ikke → re-auth
3. Hent aktuel CLAUDE.md fra repo (GET /repos/:owner/:repo/contents/CLAUDE.md)
4. Sammenlign SHA — er der remote ændringer?
   - Nej → push direkte (PUT med current SHA)
   - Ja → vis diff, lad bruger merge/overwrite
5. Commit message auto-genereret: "Update CLAUDE.md via CPM"
6. Opdatér syncStatus og lastPushedSha
```

#### UI Features

- **Section-baseret editor:** Strukturerede sektioner med type, titel og indhold
- **Template library:** Forudkonfigurerede CLAUDE.md templates for common stacks (Next.js, Python, Rust, etc.)
- **Diff view:** Sammenlign lokal CLAUDE.md med GitHub version
- **Auto-sync toggle:** Automatisk push ved ændringer (opt-in)
- **Multi-repo support:** Én CPM-instans kan manage CLAUDE.md for flere repos

#### CLI Commands

```bash
cpm claudemd generate              # Generér CLAUDE.md fra projekt-kontekst
cpm claudemd edit                  # Åbn CLAUDE.md i editor
cpm claudemd push                  # Push til GitHub
cpm claudemd pull                  # Hent fra GitHub
cpm claudemd diff                  # Vis diff mellem lokal og remote
cpm claudemd sync                  # Two-way sync med GitHub
```

---

### 4.2 Rule Editor (.claude/settings.local.json)

**Problem:** Claude Code's `.claude/settings.local.json` styrer vigtige adfærdsregler (allowed tools, denied tools, permissions), men filen redigeres manuelt i en JSON-editor. Fejl i syntaks kan bryde cc-sessioner.

**Løsning:** En visuel regel-editor i CPM der genererer og vedligeholder `settings.local.json`.

#### Settings Schema (cc format)

```typescript
// packages/shared/types/claude-settings.ts

interface ClaudeSettings {
  // Permissions
  permissions: {
    allow: PermissionRule[];           // Eksplicit tilladte tools/commands
    deny: PermissionRule[];            // Eksplicit blokerede tools/commands
    askEveryTime: PermissionRule[];    // Kræver godkendelse per brug
  };

  // Environment
  env: Record<string, string>;         // Environment variables til cc

  // MCP servers (project-scoped)
  mcpServers: Record<string, MCPServerConfig>;

  // Custom instructions
  customInstructions: string;          // Ekstra instruktioner til cc
}

type PermissionRule = string;
// Eksempler:
// "Read"                    — Tillad alle reads
// "Write"                   — Tillad alle writes
// "Bash(npm:*)"            — Tillad alle npm commands
// "Bash(rm -rf:*)"         — Blokér rm -rf
// "WebFetch(domain:api.example.com)" — Tillad specifik domain

interface MCPServerConfig {
  command: string;                     // fx 'npx'
  args: string[];                      // fx ['-y', '@modelcontextprotocol/server-filesystem']
  env?: Record<string, string>;
  cwd?: string;
}
```

#### Rule Editor UI

**Layout:** Tre-panel design

```
┌─────────────────────────────────────────────────────┐
│  ALLOWED TOOLS          │  DENIED TOOLS             │
│  ┌───────────────────┐  │  ┌──────────────────────┐ │
│  │ ✅ Read           │  │  │ 🚫 Bash(rm -rf:*)    │ │
│  │ ✅ Write          │  │  │ 🚫 Bash(sudo:*)      │ │
│  │ ✅ Edit           │  │  │ 🚫 Bash(curl:*)      │ │
│  │ ✅ Bash(npm:*)    │  │  │                      │ │
│  │ ✅ Bash(git:*)    │  │  │  [+ Add Deny Rule]   │ │
│  │                   │  │  └──────────────────────┘ │
│  │ [+ Add Allow Rule]│  │                           │
│  └───────────────────┘  │  ASK EVERY TIME           │
│                         │  ┌──────────────────────┐ │
│  MCP SERVERS            │  │ ⚠️ Bash(docker:*)    │ │
│  ┌───────────────────┐  │  │ ⚠️ WebFetch(*)       │ │
│  │ 📡 filesystem     │  │  └──────────────────────┘ │
│  │ 📡 postgres       │  │                           │
│  │ [+ Add MCP Server]│  │  CUSTOM INSTRUCTIONS      │
│  └───────────────────┘  │  ┌──────────────────────┐ │
│                         │  │ Always run tests...  │ │
│                         │  └──────────────────────┘ │
├─────────────────────────┴───────────────────────────┤
│  📄 PREVIEW: .claude/settings.local.json            │
│  { "permissions": { "allow": [...], "deny": [...] } │
└─────────────────────────────────────────────────────┘
```

**Features:**
- **Preset rule bundles:** "Safe Development" (read/write/edit + npm/git), "Full Access" (alt undtagen rm -rf/sudo), "Locked Down" (kun read + lint)
- **Per-projekt profiler:** Forskellige regler per projekt
- **Rule templates:** Genbrugelige rule-sets som context blocks
- **Validation:** Syntaks-check + advarsel ved overly permissive regler
- **Live preview:** JSON output opdateres i real-time
- **Push til projekt:** Skriver direkte til `.claude/settings.local.json` i projektets directory
- **GitHub push:** Push settings-fil til repo (via GitHub OAuth)

#### CLI Commands

```bash
cpm rules edit                     # Åbn regel-editor for aktivt projekt
cpm rules show                     # Vis aktive regler
cpm rules apply <preset>           # Anvend preset (safe/full/locked)
cpm rules push                     # Skriv til .claude/settings.local.json
cpm rules export                   # Eksportér som JSON til stdout
```

---

### 4.3 Skills & Slash Commands / Actions Creator

**Problem:** Claude Code understøtter custom Skills (markdown-filer med instruktioner) og Slash Commands / Actions (pre-definerede workflows). At oprette og vedligeholde disse kræver manuelt filarbejde i `.claude/` directory.

**Løsning:** Et visuelt værktøj i CPM der opretter, redigerer og deployer Skills og Actions til projekters repositories.

#### Skills Data Model

```typescript
// packages/shared/types/skill.ts

interface Skill {
  id: string;
  name: string;                        // fx 'nextjs-api-route'
  title: string;                       // fx 'Next.js API Route Creator'
  description: string;
  content: string;                     // Markdown med skill-instruktioner
  triggerPatterns: string[];           // Hvornår skal denne skill aktiveres?
  category: 'code-generation' | 'testing' | 'refactoring' | 'documentation' |
            'debugging' | 'deployment' | 'review' | 'custom';
  scope: 'global' | 'project';
  projectId: string | null;
  tags: string[];
  targetPath: string;                  // Hvor i repo'et gemmes skill-filen
  // fx '.claude/skills/nextjs-api-route.md'
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Actions / Slash Commands Data Model

```typescript
// packages/shared/types/action.ts

interface Action {
  id: string;
  name: string;                        // Slash command navn (fx 'create-component')
  command: string;                     // Slash command (fx '/create-component')
  title: string;                       // Display titel
  description: string;
  steps: ActionStep[];                 // Sekventielle trin
  variables: ActionVariable[];         // Input-variable fra bruger
  category: string;
  scope: 'global' | 'project';
  projectId: string | null;
  targetPath: string;                  // Hvor i repo'et gemmes action-filen
  // fx '.claude/commands/create-component.md'
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ActionStep {
  id: string;
  order: number;
  instruction: string;                 // Hvad agenten skal gøre
  expectedOutput: string | null;       // Forventet resultat
  validation: string | null;           // Hvordan valideres output
  failureAction: 'stop' | 'retry' | 'skip';
}

interface ActionVariable {
  name: string;                        // fx '{{componentName}}'
  label: string;                       // fx 'Component Name'
  type: 'text' | 'select' | 'file-path' | 'boolean';
  defaultValue: string | null;
  required: boolean;
  options: string[] | null;            // For select type
}
```

#### Skill/Action Editor UI

**Skill Editor:**
- Markdown editor med live preview
- Trigger pattern builder (visuelt)
- Test-mode: simulér hvornår skillen ville aktivere
- Builtin skill templates for common patterns
- Version history

**Action Editor:**
- Step-by-step builder (drag-and-drop steps)
- Variable definition med preview
- Command naming med auto-prefix (`/`)
- Preview af genereret markdown-fil
- Test-run mulighed

#### Deploy til Repository

```
1. Bruger opretter/redigerer Skill eller Action i CPM
2. CPM genererer markdown-fil i korrekt cc-format
3. Bruger vælger mål-repository og path
4. Deploy-metoder:
   a. Lokal: Skriv direkte til projektets .claude/ directory
   b. GitHub: Push via OAuth (commit til repo)
   c. Export: Download som fil
```

#### Builtin Skill Templates

```
📦 Code Generation
  ├── nextjs-api-route       — Opret Next.js API route med validation
  ├── react-component        — Opret React component med tests
  ├── drizzle-migration      — Opret database migration
  └── rest-endpoint          — Full REST endpoint med CRUD

🧪 Testing
  ├── unit-test              — Generer unit tests for en fil
  ├── integration-test       — Generer integration tests
  └── e2e-test               — Playwright E2E test

🔧 Refactoring
  ├── extract-component      — Udpak komponent fra eksisterende kode
  ├── typescript-migration   — Migrer JS → TS
  └── dependency-update      — Opdatér dependencies sikkert

📝 Documentation
  ├── api-docs               — Generer API dokumentation
  ├── readme-update          — Opdatér README
  └── changelog              — Generer changelog fra commits
```

#### CLI Commands

```bash
# Skills
cpm skill create                   # Opret ny skill (interaktiv)
cpm skill create --file skill.md   # Import skill fra fil
cpm skill list                     # Vis alle skills
cpm skill edit <id>                # Redigér skill
cpm skill deploy <id>              # Deploy til projekt (.claude/skills/)
cpm skill deploy <id> --github     # Deploy til GitHub repo
cpm skill export <id>              # Eksportér som markdown

# Actions / Slash Commands
cpm action create                  # Opret ny action (interaktiv)
cpm action list                    # Vis alle actions
cpm action edit <id>               # Redigér action
cpm action deploy <id>             # Deploy til projekt (.claude/commands/)
cpm action deploy <id> --github    # Deploy til GitHub repo
cpm action test <id>               # Test-kør action
```

---

### 4.4 Agent Manager

**Problem:** I 2026's multi-agent paradigme defineres agenter som markdown-filer med rolle, instruktioner, constraints og tool-adgang. Disse filer er manuelle at vedligeholde og spredt across projekter.

**Løsning:** Et centralt værktøj i CPM til at oprette, redigere, versionere og deploye agent-definitioner.

#### Agent Definition Data Model

```typescript
// packages/shared/types/agent.ts

interface AgentDefinition {
  id: string;
  name: string;                        // fx 'code-reviewer'
  title: string;                       // fx 'Senior Code Reviewer'
  role: string;                        // Kort rollebeskrivelse
  description: string;                 // Uddybende beskrivelse
  systemPrompt: string;                // Fuld system prompt (markdown)

  // Agent capabilities & constraints
  capabilities: {
    tools: string[];                   // Tilladte tools (cc format)
    fileAccess: 'read-only' | 'read-write' | 'none';
    networkAccess: boolean;
    maxIterations: number;             // Max Ralph Wiggum iterations
    autonomyLevel: 'single' | 'supervised' | 'full';
  };

  // Context configuration
  context: {
    claudeMdRequired: boolean;         // Skal læse CLAUDE.md først?
    contextBlockIds: string[];         // Automatisk inkluderede context blocks
    planIds: string[];                 // Planer agenten har adgang til
    codebaseAccess: 'full' | 'scoped' | 'none';
    scopedPaths: string[];             // Hvis scoped: hvilke paths
  };

  // Governance
  governance: {
    requiresApproval: boolean;         // HITL approval mellem steps?
    maxTokenBudget: number | null;     // Token limit per session
    timeoutMinutes: number;            // Max session varighed
    allowedBranches: string[];         // Git branches agenten må arbejde i
    forbiddenPatterns: string[];       // Regex patterns agenten ikke må matche
  };

  // Metadata
  category: 'coder' | 'reviewer' | 'tester' | 'planner' | 'researcher' |
            'documenter' | 'debugger' | 'deployer' | 'orchestrator' | 'custom';
  scope: 'global' | 'project';
  projectId: string | null;
  targetPath: string;                  // fx '.claude/agents/code-reviewer.md'
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Agent Templates (Builtin)

```
🏗️ Development Agents
  ├── architect       — Analyserer krav, designer arkitektur, dekomponerer opgaver
  ├── implementer     — Skriver kode baseret på Prompt Contracts
  ├── refactorer      — Forbedrer eksisterende kode uden at ændre adfærd
  └── migrator        — Migrerer mellem frameworks/versioner

🧪 Quality Agents
  ├── reviewer        — Code review med fokus på patterns, security, performance
  ├── tester          — Genererer og kører tests
  ├── debugger        — Finder og fikser bugs fra error logs
  └── security-auditor — Analyserer for sikkerhedshuller

📝 Support Agents
  ├── documenter      — Skriver/opdaterer dokumentation
  ├── researcher      — Finder information, evaluerer libraries
  └── devops          — CI/CD, deployment, infrastructure

🎯 Orchestration Agents
  ├── project-manager — Koordinerer andre agenter, tracker progress
  ├── sprint-planner  — Dekomponerer features til sprint tasks
  └── governance      — Overvåger andre agenter for compliance
```

#### Agent Editor UI

- **Visual role builder:** Definer rolle, capabilities og constraints visuelt
- **System prompt editor:** Markdown med syntax highlighting og preview
- **Tool whitelist builder:** Checkbox-baseret tool-selektion med presets
- **Governance panel:** Budget, timeout, approval requirements
- **Test agent:** Simulér agent-adfærd med en test-prompt
- **Deploy:** Push agent markdown til projekt eller GitHub

#### Agent Team Composer (v5.1)

Når individuelle agenter er defineret, kan de sammensættes til teams:

```typescript
interface AgentTeam {
  id: string;
  name: string;                        // fx 'Feature Development Team'
  description: string;
  agents: AgentTeamMember[];
  orchestrationPattern: 'sequential' | 'parallel' | 'hierarchical' | 'consensus';
  orchestratorAgentId: string | null;  // Hvis hierarchical: hvem styrer?
}

interface AgentTeamMember {
  agentId: string;
  role: string;                        // Rolle i teamet
  order: number;                       // Rækkefølge (for sequential)
  dependsOn: string[];                 // Agent IDs dette agent afhænger af
}
```

#### CLI Commands

```bash
cpm agent create                   # Opret ny agent (interaktiv)
cpm agent create --template <name> # Opret fra template
cpm agent list                     # Vis alle agenter
cpm agent show <id>                # Vis agent detaljer
cpm agent edit <id>                # Redigér agent
cpm agent deploy <id>              # Deploy til projekt (.claude/agents/)
cpm agent deploy <id> --github     # Deploy til GitHub repo
cpm agent test <id> --prompt "..." # Test agent med en prompt
cpm agent team create              # Opret agent team (v5.1)
cpm agent team list                # Vis teams
```

---

## 5. Connector Architecture

### Filosofi

CPM skal kunne tale med forskellige AI-værktøjer, men med en klar prioritering: **Claude-universet først**, andre værktøjer som udvidelser.

### Connector Interface

```typescript
// packages/shared/types/connector.ts

interface AIConnector {
  id: string;                          // Unik connector ID
  name: string;                        // Display navn
  provider: string;                    // 'anthropic' | 'openai' | 'google' | 'local' | 'other'
  category: ConnectorCategory;
  version: string;
  status: 'installed' | 'available' | 'disabled';

  capabilities: {
    executePrompt: boolean;
    autonomousLoop: boolean;
    streamOutput: boolean;
    taskManagement: boolean;
    fileAccess: boolean;
    webSearch: boolean;
    mcpSupport: boolean;
    codeExecution: boolean;
    agentSupport: boolean;             // Kan køre agent-definitioner
    teamSupport: boolean;              // Understøtter multi-agent teams
  };

  // Lifecycle
  install(): Promise<void>;
  configure(config: Record<string, unknown>): Promise<void>;
  validate(): Promise<{ valid: boolean; errors: string[] }>;
  uninstall(): Promise<void>;

  // Core operations
  execute(prompt: PromptContract, options: ExecuteOptions): Promise<ExecutionResult>;
  executeAgent(agent: AgentDefinition, task: string, options: ExecuteOptions): Promise<ExecutionResult>;
  getStatus(): Promise<ConnectorStatus>;
}

type ConnectorCategory =
  | 'terminal-agent'      // Claude Code, Aider, Codex CLI
  | 'ide-agent'           // Cursor, Windsurf, Continue.dev
  | 'api-model'           // Claude API, OpenAI API, Gemini API
  | 'orchestrator'        // LangChain, CrewAI, AutoGen, LangGraph
  | 'mcp-server'          // MCP-kompatible servers
  | 'observability'       // LangSmith, Braintrust, AgentOps
  | 'utility';            // Hjælpeværktøjer
```

### Connector Registry

```typescript
const CONNECTOR_REGISTRY: ConnectorMetadata[] = [
  // === DAG 1: Claude-universet ===
  {
    id: 'claude-code',
    name: 'Claude Code (cc)',
    provider: 'anthropic',
    category: 'terminal-agent',
    builtIn: true,
    capabilities: {
      executePrompt: true, autonomousLoop: true, streamOutput: true,
      taskManagement: true, fileAccess: true, webSearch: false,
      mcpSupport: true, codeExecution: true, agentSupport: true,
      teamSupport: false,  // Afventer TeammateTool GA
    }
  },
  {
    id: 'claude-api',
    name: 'Claude API (Direct)',
    provider: 'anthropic',
    category: 'api-model',
    builtIn: true,
  },
  {
    id: 'claude-desktop-mcp',
    name: 'Claude Desktop (MCP Bridge)',
    provider: 'anthropic',
    category: 'mcp-server',
  },

  // === FREMTIDIGE CONNECTORS ===

  // Terminal agents
  { id: 'aider', name: 'Aider', provider: 'other', category: 'terminal-agent' },
  { id: 'codex-cli', name: 'OpenAI Codex CLI', provider: 'openai', category: 'terminal-agent' },

  // IDE agents
  { id: 'cursor', name: 'Cursor IDE', provider: 'other', category: 'ide-agent' },
  { id: 'windsurf', name: 'Windsurf', provider: 'other', category: 'ide-agent' },
  { id: 'continue-dev', name: 'Continue.dev', provider: 'other', category: 'ide-agent' },

  // Orchestration frameworks
  { id: 'langgraph', name: 'LangGraph', provider: 'other', category: 'orchestrator' },
  { id: 'crewai', name: 'CrewAI', provider: 'other', category: 'orchestrator' },
  { id: 'autogen', name: 'Microsoft AutoGen', provider: 'other', category: 'orchestrator' },

  // Observability
  { id: 'langsmith', name: 'LangSmith', provider: 'other', category: 'observability' },
  { id: 'braintrust', name: 'Braintrust', provider: 'other', category: 'observability' },
  { id: 'agentops', name: 'AgentOps.ai', provider: 'other', category: 'observability' },
];
```

### Connector Settings UI

Under **Settings → Connectors:**
- Liste af tilgængelige connectors (installed / available / disabled)
- "Install" knap med konfigurationspanel
- Status indicator (connected / disconnected / error)
- "Test Connection" knap
- GitHub OAuth connection (separat, bruges af flere tools)

### Connector Database Schema

```typescript
export const installedConnectors = sqliteTable('installed_connectors', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  config: text('config', { mode: 'json' }),
  status: text('status', { enum: ['installed', 'disabled'] }).default('installed'),
  lastUsed: integer('last_used', { mode: 'timestamp' }),
  installedAt: integer('installed_at', { mode: 'timestamp' }).defaultNow(),
});
```

---

## 6. AI Toolkit Modules — Feature Forslag

Prioriteret i fire tiers: **Kerne** (v5.0), **Power** (v5.1), **Advanced** (v5.2+) og **Vision** (v6+).

### TIER 1 — Kerne (v5.0): Ship med v5 launch

#### 6.1 Project Context Manager

**Problem:** Hvert projekt har sin egen CLAUDE.md, regler, stack og kontekst. Context-switch er manuelt.

**Løsning:** Et Project-objekt der samler al kontekst.

```typescript
interface Project {
  id: string;
  name: string;
  path: string;                        // Lokal sti
  claudeMdId: string | null;          // Link til CLAUDE.md config
  settingsId: string | null;          // Link til .claude/settings config
  stack: TechStack;                    // Auto-detected
  rules: string[];                     // Projektspecifikke regler
  plans: string[];                     // Linked plan IDs
  prompts: string[];                   // Linked prompt IDs
  agents: string[];                    // Linked agent IDs
  skills: string[];                    // Linked skill IDs
  actions: string[];                   // Linked action IDs
  githubRepo: string | null;          // GitHub repo reference
  connectorOverrides: Record<string, unknown>;
}
```

**Features:**
- Auto-detect projekt-type fra package.json, pyproject.toml, Cargo.toml, etc.
- Hurtigt context-switch mellem projekter
- Projekt-dashboard: oversigt over planer, prompts, agenter, skills, sessions
- One-click: "Set up AI for this project" → genererer CLAUDE.md + settings + basic agents

#### 6.2 Knowledge Base / Context Library

**Problem:** Genbrugelige kontekst-snippets skal manuelt copy-pastes.

**Løsning:** Bibliotek af genanvendelige kontekst-blokke med auto-inject.

```typescript
interface ContextBlock {
  id: string;
  title: string;
  content: string;                     // Markdown
  category: 'standard' | 'architecture' | 'api-doc' | 'pattern' | 'rule' | 'reference';
  tags: string[];
  scope: 'global' | 'project';
  projectId: string | null;
  autoInject: boolean;                 // Auto-inkluderet i alle prompts for scope
  embedding: Float32Array | null;
}
```

**Features:**
- Drag-and-drop kontekst-blokke ind i prompt-generering
- Auto-inject rules baseret på projekt/tags
- RAG-søgning over kontekst-blokke
- Import fra URL (hent API docs, konvertér til kontekst-blok)

#### 6.3 Session History & Analytics

**Problem:** Ingen tracking af hvad der virker og ikke virker.

**Løsning:** Log alle AI-sessions med metadata og resultater.

```typescript
interface AISession {
  id: string;
  connectorId: string;
  agentId: string | null;              // Hvilken agent kørte
  promptId: string | null;
  planId: string | null;
  projectId: string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number | null;
  iterations: number;
  outcome: 'success' | 'partial' | 'failure' | null;
  rating: number | null;               // 1-5
  notes: string | null;
  filesChanged: string[];
  tokensUsed: number | null;
  // Observability data
  decisionLog: SessionDecision[];      // Hvad besluttede agenten?
  toolCalls: ToolCallLog[];            // Hvilke tools blev kaldt?
}
```

**Features:**
- Dashboard med session-historik per projekt/connector/agent
- Success rate over tid
- "Hvad virkede?" — top-ratede prompts og agenter
- Token/cost estimering
- Session replay (decision log + tool calls)

#### 6.4 Template Library

**Problem:** Lignende prompts skrives igen og igen.

**Løsning:** Prompt Contract templates med variable placeholders.

```typescript
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;                    // Prompt Contract med {{placeholders}}
  variables: TemplateVariable[];
  connectorId: string | null;
  agentId: string | null;             // Optimeret til specifik agent
  source: 'builtin' | 'community' | 'custom';
  usageCount: number;
}
```

### TIER 2 — Power Features (v5.1)

#### 6.5 Workflow Builder (Prompt & Agent Chains)

Visuel workflow-editor der chainer prompts og agenter:

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggerType: 'manual' | 'schedule' | 'webhook' | 'file-change' | 'git-push';
  agentTeamId: string | null;
}

interface WorkflowStep {
  id: string;
  order: number;
  type: 'prompt' | 'agent' | 'gate' | 'parallel-split' | 'parallel-join';
  promptId: string | null;
  agentId: string | null;
  connectorId: string;
  inputMapping: Record<string, string>;
  condition: string | null;
  onFailure: 'stop' | 'skip' | 'retry' | 'fallback-agent';
  fallbackAgentId: string | null;
}
```

**Features:** Drag-and-drop editor, agent-baserede steps, parallel branches, gate steps (human approval), workflow templates for SDLC patterns.

#### 6.6 Context Window Optimizer

Intelligent kontekst-sammensætning: visualisér forbrug, auto-prioritér, model-specifik optimering, "context budget" per sektion, tree-shaking.

#### 6.7 Diff Viewer & Change Tracker

Git-baseret: auto-snapshot før/efter session, visual diff, approve/reject per chunk, rollback, ændrings-statistik.

#### 6.8 MCP Server Hub

Central MCP management: browse/install servers, konfigurér per projekt, auto-generér config-filer, monitor health. **CPM som MCP server:** Eksponér planer, prompts, agents og kontekst via MCP.

#### 6.9 Prompt Quality Evaluator

Auto kvalitetsvurdering: checklist-scoring, anti-pattern detection, forbedringsforslag, A/B tracking.

#### 6.10 AI Model Router

Intelligent routing: model recommendation per opgave, cost-estimering, historisk performance, auto-routing i workflows.

### TIER 3 — Advanced (v5.2+)

#### 6.11 Agentic Pipeline Governance

**Policy-as-code for agenter** — "DevOps for agents":

```typescript
interface AgentPolicy {
  id: string;
  name: string;
  rules: PolicyRule[];
  scope: 'global' | 'project' | 'agent' | 'team';
  enforcement: 'block' | 'warn' | 'log';
}

interface PolicyRule {
  type: 'token-budget' | 'time-limit' | 'file-restriction' | 'branch-restriction' |
        'approval-required' | 'forbidden-pattern' | 'rate-limit';
  config: Record<string, unknown>;
  description: string;
}
```

**Features:** Regler som kode, audit trails, budget alerts, compliance dashboards, regression testing af agent-versioner.

#### 6.12 AI Code Review Pipeline

Trigger ved git push/PR → Claude analyserer mod regler → review-kommentarer → fokus: security, performance, style, coverage.

#### 6.13 AI Cost Dashboard

Token-estimering per session/projekt, historisk trend, budget alerts, ROI tracking.

#### 6.14 Codebase Indexer & RAG

AST-baseret parsing, dependency graph, intelligent file selection, @-mentions i prompts.

#### 6.15 Documentation Generator

Auto API docs, README update, changelog fra commits, Mermaid-diagrammer.

### TIER 4 — Vision (v6+)

#### 6.16 Multi-Agent Orchestration (Native)

Afventer TeammateTool GA: agent-teams med roller, visuel orkestrering, agent-til-agent kommunikation, patterns (sequential, parallel, hierarchical, consensus/debate).

#### 6.17 Self-Healing Pipelines

Monitor pipeline health, auto-detect failures, spawn debug-agent, fix og re-run.

#### 6.18 Continuous Architecture Evolution

Analysér kodebase-kvalitet over tid, foreslå forbedringer, auto-refaktor med godkendelse, track technical debt.

#### 6.19 Community Marketplace (v3 SaaS)

Del prompts, templates, skills, actions, agents, workflows. Rating, reviews, forks, featured collections.

#### 6.20 Voice-to-Prompt

Whisper transkription → strukturerede planer/prompts. "Brainstorm mode".

#### 6.21 Learning & Skills Tracker

Teknologi-radar, skill progression, suggested learning paths.

---

## 7. Opdateret Monorepo-struktur

```
codepromptmaker/
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── shared/              # @cpm/shared
│   │   ├── types/
│   │   │   ├── prompt.ts
│   │   │   ├── plan.ts              # NY
│   │   │   ├── connector.ts         # NY
│   │   │   ├── project.ts           # NY
│   │   │   ├── claude-md.ts         # NY — CLAUDE.md config
│   │   │   ├── claude-settings.ts   # NY — .claude/settings types
│   │   │   ├── skill.ts             # NY — Skills
│   │   │   ├── action.ts            # NY — Slash commands/actions
│   │   │   ├── agent.ts             # NY — Agent definitions
│   │   │   ├── context-block.ts     # NY
│   │   │   ├── session.ts           # NY
│   │   │   ├── template.ts          # NY
│   │   │   ├── workflow.ts          # NY (v5.1)
│   │   │   ├── policy.ts            # NY (v5.2) — Governance
│   │   │   └── github.ts            # NY — GitHub OAuth types
│   │   ├── connectors/
│   │   │   ├── registry.ts          # Connector registry
│   │   │   ├── base.ts              # Base connector class
│   │   │   └── claude-code.ts       # Claude Code connector
│   │   └── services/
│   │       ├── prompt-builder.ts
│   │       ├── plan-service.ts      # NY
│   │       ├── claudemd-service.ts  # NY — CLAUDE.md generation
│   │       ├── settings-service.ts  # NY — Settings generation
│   │       ├── skill-service.ts     # NY
│   │       ├── action-service.ts    # NY
│   │       ├── agent-service.ts     # NY
│   │       ├── context-service.ts   # NY
│   │       ├── template-service.ts  # NY
│   │       └── github-service.ts    # NY — GitHub API client
│   │
│   ├── db/                  # @cpm/db
│   │   └── schema/
│   │       ├── prompts.ts
│   │       ├── plans.ts             # NY
│   │       ├── projects.ts          # NY
│   │       ├── claude-md.ts         # NY
│   │       ├── skills.ts            # NY
│   │       ├── actions.ts           # NY
│   │       ├── agents.ts            # NY
│   │       ├── context-blocks.ts    # NY
│   │       ├── sessions.ts          # NY
│   │       ├── templates.ts         # NY
│   │       ├── connectors.ts        # NY
│   │       ├── github-connections.ts # NY
│   │       ├── workflows.ts         # NY (v5.1)
│   │       └── policies.ts          # NY (v5.2)
│   │
│   ├── runner/              # @cpm/runner (udvidet, connector-aware)
│   ├── cli/                 # @cpm/cli (udvidet med alle nye commands)
│   └── web/                 # @cpm/web
│       └── app/
│           ├── (prompt)/            # Eksisterende prompt UI
│           ├── (plans)/             # NY — Plan management
│           ├── (projects)/          # NY — Project context + dashboard
│           ├── (claudemd)/          # NY — CLAUDE.md generator
│           ├── (rules)/             # NY — Rule editor
│           ├── (skills)/            # NY — Skills creator
│           ├── (actions)/           # NY — Actions/slash commands
│           ├── (agents)/            # NY — Agent manager
│           ├── (knowledge)/         # NY — Knowledge base
│           ├── (sessions)/          # NY — Session history & analytics
│           ├── (templates)/         # NY — Template library
│           ├── (workflows)/         # NY (v5.1)
│           ├── (pipelines)/         # NY (v5.2) — Pipeline governance
│           └── settings/
│               ├── connectors/      # NY — Connector management
│               ├── github/          # NY — GitHub OAuth
│               └── profile/         # Eksisterende developer profile
```

---

## 8. Udvidede CLI Commands (Komplet oversigt)

```bash
# --- Plan Management ---
cpm plan create                    # Opret ny plan
cpm plan create --file plan.md     # Import fra fil
cpm plan create --paste            # Paste fra clipboard
cpm plan list [--status <status>]  # Vis planer
cpm plan show <id>                 # Vis plan detaljer
cpm plan edit <id>                 # Redigér i $EDITOR
cpm plan link <plan-id> <prompt-id>
cpm plan status <id> <status>
cpm plan search <query>            # Semantisk søgning (v2+)

# --- Project Management ---
cpm project init                   # Initialisér CPM i current dir
cpm project list                   # Vis projekter
cpm project switch <id>            # Skift aktivt projekt
cpm project setup                  # One-click AI setup (CLAUDE.md + settings + agents)
cpm project sync                   # Synkronisér med GitHub

# --- CLAUDE.md Management ---
cpm claudemd generate              # Generér fra projekt-kontekst
cpm claudemd edit                  # Redigér CLAUDE.md
cpm claudemd push                  # Push til GitHub
cpm claudemd pull                  # Hent fra GitHub
cpm claudemd diff                  # Vis diff lokal vs remote
cpm claudemd sync                  # Two-way sync

# --- Rule Editor ---
cpm rules edit                     # Åbn regel-editor
cpm rules show                     # Vis aktive regler
cpm rules apply <preset>           # Anvend preset (safe/full/locked)
cpm rules push                     # Skriv til .claude/settings.local.json
cpm rules export                   # Eksportér JSON

# --- Skills ---
cpm skill create [--file <file>]   # Opret skill
cpm skill list                     # Vis skills
cpm skill edit <id>                # Redigér
cpm skill deploy <id> [--github]   # Deploy til projekt/GitHub
cpm skill export <id>              # Eksportér markdown

# --- Actions / Slash Commands ---
cpm action create                  # Opret action
cpm action list                    # Vis actions
cpm action edit <id>               # Redigér
cpm action deploy <id> [--github]  # Deploy
cpm action test <id>               # Test-kør

# --- Agent Management ---
cpm agent create [--template <n>]  # Opret agent
cpm agent list                     # Vis agenter
cpm agent show <id>                # Vis detaljer
cpm agent edit <id>                # Redigér
cpm agent deploy <id> [--github]   # Deploy til projekt/GitHub
cpm agent test <id> --prompt "..." # Test med prompt
cpm agent team create              # Opret agent team (v5.1)
cpm agent team list                # Vis teams

# --- Connector Management ---
cpm connector list                 # Vis connectors
cpm connector install <id>         # Installér
cpm connector config <id>          # Konfigurér
cpm connector test <id>            # Test connection
cpm connector disable <id>         # Deaktivér

# --- Template Management ---
cpm template list                  # Vis templates
cpm template use <id>              # Generér fra template
cpm template create --from <prompt-id>  # Template fra prompt

# --- Knowledge Base ---
cpm context list                   # Vis kontekst-blokke
cpm context add <file>             # Tilføj fra fil
cpm context search <query>         # Søg

# --- GitHub ---
cpm github login                   # OAuth flow
cpm github status                  # Vis connection status
cpm github repos                   # List repos
```

---

## 9. Prioriteret Implementation Roadmap

### v5.0 — Foundation (Ship first)

| Prio | Modul | Begrundelse |
|------|-------|-------------|
| **P0** | Plan Management | Løser umiddelbart behov. Simpelt data model, stor værdi. |
| **P0** | Project Context Manager | Multi-projekt context switch. Fundament for alt andet. |
| **P0** | CLAUDE.md Generator + GitHub OAuth | Kernebehov — hvert projekt har brug for CLAUDE.md. GitHub push er gamechanger. |
| **P0** | Rule Editor | Simpelt værktøj, stor impact. Reducerer fejl i settings.local.json. |
| **P0** | Connector Architecture + Claude Code | Fundament for alle integrationer. |
| **P1** | Skills & Actions Creator | Lav effort, høj genbrug. Bootstrapper produktivitet. |
| **P1** | Agent Manager | Central for 2026-paradigmet. Templates gør adoption nem. |
| **P1** | Knowledge Base | Genbrugelig kontekst er kerneværdi. |
| **P1** | Template Library | Templates kan bootstrappes fra eksisterende prompts. |
| **P1** | Session History | Nødvendig feedback loop. |

### v5.1 — Power Features

| Prio | Modul | Begrundelse |
|------|-------|-------------|
| P2 | Workflow Builder | Chaining af prompts OG agenter. Kræver stabil v5.0. |
| P2 | Agent Team Composer | Multi-agent teams. Bygger på Agent Manager. |
| P2 | Context Window Optimizer | Differentiator vs simple prompt tools. |
| P2 | Diff Viewer & Change Tracker | Git-integration, stor DX forbedring. |
| P2 | MCP Server Hub | Strategisk for Claude-økosystem. |
| P2 | Prompt Quality Evaluator | Auto kvalitetscheck. |
| P2 | AI Model Router | Intelligent routing baseret på task type. |

### v5.2+ — Advanced

| Prio | Modul | Begrundelse |
|------|-------|-------------|
| P3 | Agentic Pipeline Governance | Policy-as-code, audit trails, compliance. |
| P3 | AI Cost Dashboard | Bygger på session history. |
| P3 | Codebase Indexer & RAG | Transformativt for kontekst-kvalitet. |
| P3 | AI Code Review Pipeline | Kræver connector + workflow infra. |
| P3 | Documentation Generator | Auto-docs fra kode. |

### v6+ — Vision

| Prio | Modul | Begrundelse |
|------|-------|-------------|
| P4 | Multi-Agent Orchestration (Native) | Afventer TeammateTool GA. |
| P4 | Self-Healing Pipelines | Autonome fejlrettende pipelines. |
| P4 | Continuous Architecture Evolution | AI-drevet arkitekturforbedring. |
| P4 | Community Marketplace | Kræver v3 SaaS. |
| P4 | Voice-to-Prompt | Nice-to-have. |
| P4 | Learning & Skills Tracker | Gamification layer. |

---

## 10. Database Migration fra v4 → v5

Nye tabeller (additive — bryder ikke eksisterende):

```sql
-- Plans
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  source_ref TEXT,
  status TEXT DEFAULT 'draft',
  project_id TEXT,
  tags TEXT DEFAULT '[]',
  language TEXT DEFAULT 'en',
  linked_prompt_ids TEXT DEFAULT '[]',
  embedding BLOB,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  claude_md_id TEXT,
  settings_id TEXT,
  stack TEXT,
  rules TEXT DEFAULT '[]',
  github_repo TEXT,
  active INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- CLAUDE.md Configs
CREATE TABLE claude_md_configs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  content TEXT NOT NULL,
  sections TEXT DEFAULT '[]',
  github_repo TEXT,
  github_branch TEXT DEFAULT 'main',
  github_path TEXT DEFAULT 'CLAUDE.md',
  last_pushed_at INTEGER,
  last_pushed_sha TEXT,
  sync_status TEXT DEFAULT 'local-ahead',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Skills
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  trigger_patterns TEXT DEFAULT '[]',
  category TEXT DEFAULT 'custom',
  scope TEXT DEFAULT 'project',
  project_id TEXT REFERENCES projects(id),
  tags TEXT DEFAULT '[]',
  target_path TEXT,
  version INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Actions / Slash Commands
CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT DEFAULT '[]',
  variables TEXT DEFAULT '[]',
  category TEXT,
  scope TEXT DEFAULT 'project',
  project_id TEXT REFERENCES projects(id),
  target_path TEXT,
  version INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Agent Definitions
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT,
  description TEXT,
  system_prompt TEXT NOT NULL,
  capabilities TEXT DEFAULT '{}',
  context_config TEXT DEFAULT '{}',
  governance TEXT DEFAULT '{}',
  category TEXT DEFAULT 'custom',
  scope TEXT DEFAULT 'project',
  project_id TEXT REFERENCES projects(id),
  target_path TEXT,
  version INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Agent Teams (v5.1)
CREATE TABLE agent_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  agents TEXT DEFAULT '[]',
  orchestration_pattern TEXT DEFAULT 'sequential',
  orchestrator_agent_id TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- GitHub Connections
CREATE TABLE github_connections (
  id TEXT PRIMARY KEY,
  github_user_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at INTEGER,
  refresh_token TEXT,
  scopes TEXT DEFAULT '[]',
  connected_at INTEGER DEFAULT (unixepoch())
);

-- Context Blocks (Knowledge Base)
CREATE TABLE context_blocks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'standard',
  tags TEXT DEFAULT '[]',
  scope TEXT DEFAULT 'global',
  project_id TEXT REFERENCES projects(id),
  auto_inject INTEGER DEFAULT 0,
  embedding BLOB,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Installed Connectors
CREATE TABLE installed_connectors (
  id TEXT PRIMARY KEY,
  connector_id TEXT NOT NULL,
  config TEXT,
  status TEXT DEFAULT 'installed',
  last_used INTEGER,
  installed_at INTEGER DEFAULT (unixepoch())
);

-- Templates
CREATE TABLE prompt_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template TEXT NOT NULL,
  variables TEXT DEFAULT '[]',
  connector_id TEXT,
  agent_id TEXT,
  source TEXT DEFAULT 'custom',
  usage_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Policies (v5.2)
CREATE TABLE agent_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rules TEXT DEFAULT '[]',
  scope TEXT DEFAULT 'global',
  enforcement TEXT DEFAULT 'warn',
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions (udvidelse af runner_sessions)
ALTER TABLE runner_sessions ADD COLUMN connector_id TEXT;
ALTER TABLE runner_sessions ADD COLUMN agent_id TEXT;
ALTER TABLE runner_sessions ADD COLUMN project_id TEXT;
ALTER TABLE runner_sessions ADD COLUMN outcome TEXT;
ALTER TABLE runner_sessions ADD COLUMN rating INTEGER;
ALTER TABLE runner_sessions ADD COLUMN notes TEXT;
ALTER TABLE runner_sessions ADD COLUMN files_changed TEXT;
ALTER TABLE runner_sessions ADD COLUMN tokens_used INTEGER;
ALTER TABLE runner_sessions ADD COLUMN decision_log TEXT;
ALTER TABLE runner_sessions ADD COLUMN tool_calls TEXT;

-- Plan-Prompt linking
ALTER TABLE prompts ADD COLUMN plan_id TEXT REFERENCES plans(id);
ALTER TABLE prompts ADD COLUMN project_id TEXT REFERENCES projects(id);
ALTER TABLE prompts ADD COLUMN template_id TEXT REFERENCES prompt_templates(id);
```

---

## 11. Open Spørgsmål

1. **Navnevalg:** Endelig beslutning parkeret til v5.0 er funktionelt defineret. Arbejdstitel: "CPM — AI Command Center". Domæne forbliver codepromptmaker.com.

2. **MCP som integrationsstrategi:** Skal CPM selv eksponere en MCP server? Det ville lade Claude Desktop query planer, prompts, agents og kontekst direkte — en meget tight feedback loop.

3. **GitHub OAuth scope:** `repo` scope giver fuld adgang. Anbefaling: `repo` fra start, da CLAUDE.md typisk er i private repos.

4. **Agent markdown format:** Skal CPM bruge cc's native agent-format, eller definere sit eget? Anbefaling: Follow cc's format 100% for kompatibilitet, tilføj CPM-metadata som frontmatter.

5. **Skill/Action deploy strategi:** Anbefaling: Lokal-first med optional GitHub push.

6. **Observability connectors:** Anbefaling: v5.1 — CPM's egen session history er nok til start.

7. **Cost tracking uden API:** Max plan har ingen token-tæller. Basér estimater på session-tid × model-rate.

8. **Agent Teams:** Afventer Claude Code TeammateTool GA. Agent Manager i v5.0 med single-agent fokus, team-composer i v5.1.

---

## 12. Sammenhæng med Eksisterende Versioner

| Version | Påvirkning fra v5 |
|---------|-------------------|
| **v1 (Local MVP)** | Nye tabeller og UI routes. CLAUDE.md generator + rule editor er v1-kompatible (lokal SQLite, ingen auth). |
| **v2 (RAG)** | Plans, context blocks, skills, agents og actions indgår alle i RAG-pipeline. Massiv udvidelse af embedding-targets. |
| **v3 (SaaS)** | GitHub OAuth deles med Supabase Auth. Agents, skills, templates synkroniseres. Community marketplace muligt. |
| **v4 (Autonomous runner)** | Runner bliver connector- og agent-aware. Agent governance integreres. Session tracking udvides. |

v5 er **additiv** — den bryder ikke eksisterende versioner, men beriger dem alle.
