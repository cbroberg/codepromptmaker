# v7 — CPM Open Source Integration Architecture

> **Formål:** Definér en generel integrationsarkitektur for CPM der gør det muligt at plugge selvstændige open source-projekter ind som services. Brug **cc-recall** (RAG over Claude Code session-transkripter) som reference-implementation.
>
> **Forudsætning:** v1–v6 arkitektur forbliver intakt. v7 er additiv — en ny integrationsramme, nye tabeller og en klar kontrakt for hvordan eksterne OSS-værktøjer kobles til CPM.
>
> **Oprindelse:** Planlægningssession mellem Christian (CEO, WebHouse ApS) og Claude, 18. feb 2026. Discovery: Claude Code gemmer fulde session-transkripter som JSONL-filer (~68K til 7MB per session). Diskussionen er dokumenteret i `docs/LOG-cc-recall-discussion.md`.

---

## 1. Vision: Fra lukket monorepo til åbent økosystem

### 1.1 Hvorfor CPM har brug for en integrationsarkitektur

CPM's monorepo (`@cpm/shared`, `@cpm/db`, `@cpm/runner`, `@cpm/cli`, `@cpm/web`) er designet til at være tæt koblet internt — det er en styrke for kerneproduktet. Men i takt med at CPM vokser fra Prompt Maker (v1) til AI Command Center (v5) til Voice → Plan pipeline (v6), opstår der behov for specialiserede services der:

- **Lever udenfor monorepo'en** — selvstændige GitHub repos med eget livsforløb
- **Er nyttige alene** — andre udviklere kan bruge dem uden CPM
- **Beriger CPM når de plugges ind** — session-historik, codebase-indeksering, dokumentations-søgning

### 1.2 Cockpit-metaforen

v5 etablerede metaforen: *CPM er cockpittet, ikke motoren.* Hver integration tilføjer et instrument til cockpittet:

```
┌─────────────────────────────────────────────────────────┐
│                     CPM COCKPIT                          │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Prompts  │ │  Plans   │ │ Sessions │ │Knowledge │   │
│  │  (v1)    │ │  (v5)    │ │  (v5)    │ │  Base    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │            INTEGRATION LAYER (v7)                 │   │
│  └─────┬────────┬────────┬────────┬─────────────────┘   │
└────────┼────────┼────────┼────────┼─────────────────────┘
         │        │        │        │
    ┌────▼───┐ ┌──▼────┐ ┌▼──────┐ ┌▼──────────┐
    │cc-recall│ │whisper│ │codebase│ │git-historian│
    │(sessions)│ │(v6)   │ │indexer │ │            │
    └────────┘ └───────┘ └───────┘ └────────────┘
         ▲          ▲         ▲          ▲
    Standalone OSS projects — fungerer uafhængigt af CPM
```

### 1.3 Det pluggable service-mønster

Hvert integration-projekt følger samme mønster:

1. **Selvstændigt OSS-projekt** — eget GitHub repo, eget npm-package, egen brugervejledning
2. **Fungerer 100% standalone** — ingen CPM-dependency, brug det med andre tools
3. **CPM-adapter** — en tynd integration der kobler servicen til CPM's data model
4. **To koblingsmodi:** MCP server (løs kobling, nul import) eller npm dependency (tæt kobling, direkte import)

v6's whisper-service er allerede et eksempel på dette mønster — en selvstændig FastAPI-app på Fly.io der kommunikerer med CPM via HTTP. v7 formaliserer mønstret.

---

## 2. Integration Architecture Pattern

### 2.1 Integrationstyper

CPM understøtter fire integrationstyper, rangeret efter koblingsgrad:

| Type | Kobling | Transport | Eksempel |
|------|---------|-----------|----------|
| **MCP server** | Løsest | stdio/SSE | cc-recall MCP, filesystem MCP |
| **REST API** | Løs | HTTP | whisper-service (v6) |
| **npm package** | Tæt | Direct import | `@cc-recall/core` som dependency |
| **CLI tool** | Løs | Subprocess | `cpm integration sync cc-recall` |

**Anbefaling:** Start altid med MCP server (zero coupling). Tilføj npm package som option når tæt integration er ønsket.

### 2.2 Det pluggable service-mønster (diagram)

```
┌──────────────────────────────────────────────────────┐
│                  OSS PROJEKT (standalone)              │
│                                                        │
│  @cc-recall/core          @cc-recall/mcp              │
│  ┌─────────────────┐     ┌─────────────────┐         │
│  │ parse()          │     │ MCP Server       │         │
│  │ chunk()          │     │ - search_sessions│         │
│  │ embed()          │     │ - get_context    │         │
│  │ search()         │     │ - list_decisions │         │
│  │ index()          │     │ - get_summary    │         │
│  └─────────────────┘     └─────────────────┘         │
│          │                        │                    │
└──────────┼────────────────────────┼────────────────────┘
           │                        │
     npm import               MCP protocol
     (tæt kobling)           (løs kobling)
           │                        │
┌──────────▼────────────────────────▼────────────────────┐
│                    CPM INTEGRATION LAYER                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ICPMIntegration adapter                          │    │
│  │ - id: 'cc-recall'                                │    │
│  │ - type: 'mcp-server' | 'npm-package'             │    │
│  │ - dataStreams: ['session-decisions', 'session-    │    │
│  │                  context', 'code-changes']        │    │
│  │ - feedsInto: ['knowledge-base', 'session-history',│   │
│  │               'plan-management']                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Session History (v5 6.3) ← session decisions            │
│  Knowledge Base (v5 6.2)  ← architecture decisions       │
│  Plan Management (v5 3)   ← session-plan linking         │
└──────────────────────────────────────────────────────────┘
```

### 2.3 `ICPMIntegration` TypeScript Interface

```typescript
// packages/shared/types/integration.ts

export interface ICPMIntegration {
  /** Unik integration ID — bruges i registry og database */
  id: string;

  /** Display-navn til UI */
  name: string;

  /** Kort beskrivelse */
  description: string;

  /** Integrationstype */
  type: 'mcp-server' | 'npm-package' | 'rest-api' | 'cli-tool';

  /** Version af integrationen */
  version: string;

  /** Status */
  status: 'available' | 'installed' | 'configured' | 'active' | 'error';

  /** Hvilke data streams leverer denne integration? */
  dataStreams: IntegrationDataStream[];

  /** Hvilke CPM-moduler beriges af denne integration? */
  feedsInto: CPMModule[];

  /** Konfiguration specifik for denne integration */
  config: Record<string, unknown>;

  /** MCP server konfiguration (hvis type === 'mcp-server') */
  mcpConfig?: {
    command: string;           // fx 'npx'
    args: string[];            // fx ['@cc-recall/mcp']
    env?: Record<string, string>;
  };

  /** npm package info (hvis type === 'npm-package') */
  npmConfig?: {
    packageName: string;       // fx '@cc-recall/core'
    importPath: string;        // fx '@cc-recall/core'
  };

  /** REST API info (hvis type === 'rest-api') */
  restConfig?: {
    baseUrl: string;           // fx 'http://localhost:8080'
    healthEndpoint: string;    // fx '/health'
  };
}

export interface IntegrationDataStream {
  id: string;                  // fx 'session-decisions'
  name: string;                // fx 'Session Decisions'
  description: string;
  dataType: string;            // TypeScript type reference
  refreshMode: 'realtime' | 'on-demand' | 'scheduled';
  lastSyncedAt?: Date;
}

export type CPMModule =
  | 'knowledge-base'           // v5 6.2 — Context Library
  | 'session-history'          // v5 6.3 — Session History & Analytics
  | 'plan-management'          // v5 3 — Plan Management
  | 'prompt-generation'        // v1 — Prompt Contract enrichment
  | 'project-context'          // v5 6.1 — Project Context Manager
  | 'mcp-hub';                 // v5 6.8 — MCP Server Hub
```

### 2.4 Integration Registry

Udvider v5's Connector Registry (sektion 5) med support for OSS-integrationer:

```typescript
// packages/shared/integrations/registry.ts

import type { ICPMIntegration } from '../types/integration';

export const INTEGRATION_REGISTRY: ICPMIntegration[] = [
  // === REFERENCE IMPLEMENTATION ===
  {
    id: 'cc-recall',
    name: 'cc-recall — Session Memory',
    description: 'RAG over Claude Code session-transkripter. Søg i beslutninger, kodeændringer og arkitekturdiskussioner på tværs af sessioner.',
    type: 'mcp-server',
    version: '1.0.0',
    status: 'available',
    dataStreams: [
      {
        id: 'session-decisions',
        name: 'Session Decisions',
        description: 'Arkitekturbeslutninger og designvalg fra cc-sessioner',
        dataType: 'SessionChunk[]',
        refreshMode: 'on-demand',
      },
      {
        id: 'session-context',
        name: 'Session Context',
        description: 'Fuld kontekst fra specifikke sessioner',
        dataType: 'SessionSummary',
        refreshMode: 'on-demand',
      },
      {
        id: 'code-changes',
        name: 'Code Changes',
        description: 'Kodeændringer dokumenteret i session-transkripter',
        dataType: 'SessionChunk[]',
        refreshMode: 'on-demand',
      },
    ],
    feedsInto: ['session-history', 'knowledge-base', 'plan-management'],
    config: {
      sessionsPath: '~/.claude/projects/',
      embeddingModel: 'all-MiniLM-L6-v2',
      dbPath: '~/.cc-recall/recall.db',
    },
    mcpConfig: {
      command: 'npx',
      args: ['@cc-recall/mcp'],
    },
    npmConfig: {
      packageName: '@cc-recall/core',
      importPath: '@cc-recall/core',
    },
  },

  // === FREMTIDIGE INTEGRATIONER ===
  {
    id: 'codebase-indexer',
    name: 'Codebase Indexer',
    description: 'AST-baseret indeksering af kodebase med semantisk søgning',
    type: 'mcp-server',
    version: '0.0.0',
    status: 'available',
    dataStreams: [],
    feedsInto: ['knowledge-base', 'prompt-generation', 'project-context'],
    config: {},
  },
  {
    id: 'git-historian',
    name: 'Git Historian',
    description: 'Analyse af git-historik med commit-beskeder, blame og refactoring-patterns',
    type: 'npm-package',
    version: '0.0.0',
    status: 'available',
    dataStreams: [],
    feedsInto: ['session-history', 'knowledge-base'],
    config: {},
  },
];
```

### 2.5 Data flow: Integrationer → CPM moduler

```
                        ┌─────────────────┐
                        │  cc-recall       │
                        │  search_sessions │
                        └───────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                   ▼
   ┌──────────────┐  ┌──────────────┐   ┌──────────────────┐
   │ Knowledge    │  │ Session      │   │ Plan             │
   │ Base (v5 6.2)│  │ History      │   │ Management (v5 3)│
   │              │  │ (v5 6.3)     │   │                  │
   │ Context      │  │ AISession.   │   │ Plan.sourceRef   │
   │ Blocks med   │  │ decisionLog  │   │ = session ID     │
   │ auto-inject  │  │ + toolCalls  │   │                  │
   └──────────────┘  └──────────────┘   └──────────────────┘
```

Når en integration leverer data, mappes det til CPM's eksisterende data model:

| Integration data stream | CPM target | Mapping |
|------------------------|------------|---------|
| `session-decisions` | Knowledge Base (`ContextBlock`) | Chunk → `ContextBlock` med `category: 'architecture'` |
| `session-context` | Session History (`AISession`) | Session summary → `AISession.decisionLog` |
| `code-changes` | Session History (`AISession`) | Chunk → `AISession.filesChanged` |
| Session → Plan link | Plan Management (`Plan`) | Session ID → `Plan.sourceRef` |

### 2.6 Database schema for integrationer

```typescript
// packages/db/schema/integrations.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey(),               // fx 'cc-recall'
  name: text('name').notNull(),
  type: text('type', {
    enum: ['mcp-server', 'npm-package', 'rest-api', 'cli-tool']
  }).notNull(),
  version: text('version').notNull(),
  status: text('status', {
    enum: ['available', 'installed', 'configured', 'active', 'error']
  }).default('available'),
  config: text('config', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .default({}),
  mcpConfig: text('mcp_config', { mode: 'json' })
    .$type<{ command: string; args: string[]; env?: Record<string, string> } | null>(),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
  installedAt: integer('installed_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});

export const integrationDataStreams = sqliteTable('integration_data_streams', {
  id: text('id').primaryKey(),               // fx 'cc-recall:session-decisions'
  integrationId: text('integration_id')
    .notNull()
    .references(() => integrations.id),
  streamId: text('stream_id').notNull(),     // fx 'session-decisions'
  name: text('name').notNull(),
  dataType: text('data_type').notNull(),
  refreshMode: text('refresh_mode', {
    enum: ['realtime', 'on-demand', 'scheduled']
  }).default('on-demand'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  itemCount: integer('item_count').default(0),
});
```

---

## 3. cc-recall — Reference Implementation

cc-recall er det første OSS-projekt der implementerer v7's pluggable service-mønster. Det er et selvstændigt værktøj der indekserer og søger i Claude Code session-transkripter via RAG.

### 3.1 Hvad cc-recall gør

Claude Code gemmer fulde session-transkripter som JSONL-filer:

```
~/.claude/projects/-Users-cb-Apps-cbroberg-codepromptmaker/
├── 7380239c-....jsonl    (7.0 MB — primær builder-session)
├── 9e39a10b-....jsonl    (1.3 MB)
├── c9b9509e-....jsonl    (nyeste session)
└── ... (12 sessioner totalt for dette projekt)
```

Denne viden — beslutninger, fejlrettelser, arkitekturdiskussioner, kodeændringer — forsvinder når sessionen lukkes. cc-recall gør den søgbar:

- **"Hvordan løste vi Tailwind v4 dark mode problemet?"** — instant recall
- **"Hvilken session implementerede runner engine?"** — find det på sekunder
- **"Hvad var argumentet for polling over WebSocket?"** — decision log gratis

### 3.2 Arkitektur-diagram

```
┌────────────────────────────────────────────────────────┐
│                    cc-recall                             │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │ JSONL Parser │──▶│ Chunker      │──▶│ Embedder    │  │
│  │              │   │              │   │             │  │
│  │ Parse session│   │ Split into   │   │ all-MiniLM  │  │
│  │ messages,    │   │ semantic     │   │ -L6-v2      │  │
│  │ tool calls,  │   │ chunks by    │   │ (384 dim)   │  │
│  │ results      │   │ type         │   │             │  │
│  └─────────────┘   └──────────────┘   └──────┬──────┘  │
│                                               │         │
│                                        ┌──────▼──────┐  │
│  ┌──────────────┐                      │ SQLite +    │  │
│  │ MCP Server   │◀────── search ──────▶│ sqlite-vec  │  │
│  │              │                      │             │  │
│  │ Tools:       │                      │ ~/.cc-recall│  │
│  │ - search     │                      │ /recall.db  │  │
│  │ - context    │                      └─────────────┘  │
│  │ - decisions  │                                       │
│  │ - summary    │   ┌──────────────┐                    │
│  └──────────────┘   │ File Watcher │                    │
│                      │ (chokidar)   │                    │
│                      │ Auto-index   │                    │
│                      │ new sessions │                    │
│                      └──────────────┘                    │
└────────────────────────────────────────────────────────┘
```

### 3.3 JSONL session-format

Hver linje i en session-JSONL-fil er et JSON-objekt med denne struktur:

```jsonl
{"type":"human","message":{"role":"user","content":"Are cc storing full transcripts?"},"timestamp":"2026-02-18T20:30:00Z"}
{"type":"assistant","message":{"role":"assistant","content":"Yes. Each session is saved as a JSONL file...","tool_calls":[...]},"timestamp":"2026-02-18T20:30:05Z"}
{"type":"tool_result","tool_call_id":"tc_123","result":{"content":"file1.jsonl\nfile2.jsonl"},"timestamp":"2026-02-18T20:30:06Z"}
```

Relevante felter for cc-recall:

| Felt | Brug |
|------|------|
| `type` | Skelne mellem user/assistant/tool_result |
| `message.content` | Selve samtale-indholdet der skal indekseres |
| `message.tool_calls` | Hvilke tools der blev kaldt (Read, Write, Edit, Bash) |
| `tool_call_id` + `result` | Output fra tool-kald (kodeændringer, fil-indhold) |
| `timestamp` | Kronologisk sortering og session-metadata |

**Vigtigt:** JSONL-formatet er en Claude Code intern implementation-detalje. Formatet kan ændre sig mellem cc-versioner. cc-recall v1 parser det aktuelle format og noterer version i metadata. Se sektion 10 (Open Questions) for format-stabilitet.

### 3.4 Chunking-strategi

cc-recall splitter sessions i semantiske chunks — ikke blot per linje, men per meningsfuld enhed:

```typescript
// @cc-recall/core/types.ts

export type ChunkType =
  | 'decision'          // Arkitekturbeslutning ("Vi valgte polling over WebSocket fordi...")
  | 'code-change'       // Kodeændring (Write/Edit tool call + kontekst)
  | 'error-fix'         // Fejl + løsning (fejlbesked → fix → verifikation)
  | 'architecture'      // Arkitekturdiskussion (system design, patterns)
  | 'conversation';     // Generel samtale (alt der ikke passer ovenstående)

export interface SessionChunk {
  id: string;                    // UUID
  sessionId: string;             // Session-fil ID (fra filnavn)
  projectPath: string;           // Projekt-sti (fra directory-struktur)
  type: ChunkType;
  content: string;               // Chunk-indhold (sammensat fra messages)
  summary: string;               // Kort opsummering (genereret ved indeksering)
  messageRange: {
    startIndex: number;          // Første linje-index i JSONL
    endIndex: number;            // Sidste linje-index
    startTimestamp: string;
    endTimestamp: string;
  };
  metadata: {
    toolsUsed: string[];         // ['Read', 'Write', 'Bash'] etc.
    filesReferenced: string[];   // Filer nævnt/ændret i dette chunk
    tags: string[];              // Auto-genererede tags
  };
  embedding?: Float32Array;      // Vector embedding (udfyldt efter embed-step)
  createdAt: Date;
}

export interface SessionMetadata {
  sessionId: string;
  projectPath: string;
  projectName: string;           // Udtrukket fra path (sidste segment)
  fileSize: number;              // Bytes
  messageCount: number;
  firstTimestamp: string;
  lastTimestamp: string;
  chunkCount: number;
  indexedAt: Date;
}
```

**Chunking-regler:**

1. **Decision chunks:** Identificeres ved nøgleord som "vi valgte", "beslutning:", "fordi", "anbefaling:", "reason:" i assistant-beskeder. Inkluderer kontekst-beskederne omkring beslutningen.

2. **Code-change chunks:** Grupperer en sekvens af tool calls (Read → Edit/Write → verifikation) som én enhed. Inkluderer brugerens instruktion og assistentens forklaring.

3. **Error-fix chunks:** Matcher mønstret: fejlbesked (i tool_result) → assistant-analyse → fix (Edit/Write) → verifikation. Meget værdifuld for "hvordan løste vi dette?"

4. **Architecture chunks:** Længere assistant-beskeder med teknisk indhold (>500 tegn) der indeholder arkitektur-termer (pattern, interface, schema, migration, dependency).

5. **Conversation chunks:** Alt der ikke matcher ovenstående. Chunkes i vinduer af 3-5 besked-par (user + assistant) med overlap.

**Chunk-størrelse:** Mål: 200–800 tokens per chunk. For lange chunks splittes ved afsnit. For korte chunks sammenlægges med naboer.

### 3.5 Embedding-strategi

cc-recall bruger samme embedding-model som CPM's eksisterende `LocalEmbeddingProvider` for konsistens:

| Parameter | Værdi | Begrundelse |
|-----------|-------|-------------|
| **Default model** | `Xenova/all-MiniLM-L6-v2` | Matcher CPM's `packages/shared/src/embeddings/local-provider.ts` |
| **Dimensioner** | 384 | Matcher CPM's eksisterende embedding-pipeline |
| **Provider** | `@huggingface/transformers` | Samme som CPM — kører lokalt, gratis, ingen API key |
| **Upgrade path** | `nomic-embed-text` via Ollama (768 dim) | Bedre kvalitet, kræver Ollama installeret |

cc-recall implementerer `EmbeddingProviderInterface` fra CPM for kompatibilitet:

```typescript
// @cc-recall/core/embeddings.ts

// Implementerer samme interface som packages/shared/src/embeddings/provider.ts:
//
//   export interface EmbeddingProviderInterface {
//     embed(text: string): Promise<EmbeddingResult>;
//     readonly dimensions: number;
//     readonly modelName: string;
//   }
//
// og returnerer samme EmbeddingResult type:
//
//   export interface EmbeddingResult {
//     vector: Float32Array;
//     dimensions: number;
//     model: string;
//     provider: EmbeddingProvider;
//   }

import type { EmbeddingResult } from './types';

const DEFAULT_MODEL = 'Xenova/all-MiniLM-L6-v2';
const DEFAULT_DIMENSIONS = 384;

export class RecallEmbeddingProvider {
  readonly dimensions: number;
  readonly modelName: string;
  private pipeline: ((text: string, options?: Record<string, unknown>) =>
    Promise<{ data: Float32Array }>) | null = null;

  constructor(model: string = DEFAULT_MODEL, dimensions: number = DEFAULT_DIMENSIONS) {
    this.modelName = model;
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.pipeline) {
      const { pipeline } = await import('@huggingface/transformers');
      this.pipeline = (await pipeline('feature-extraction', this.modelName, {
        dtype: 'fp32',
      })) as unknown as (text: string, options?: Record<string, unknown>) =>
        Promise<{ data: Float32Array }>;
    }

    const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
    return {
      vector: new Float32Array(output.data),
      dimensions: this.dimensions,
      model: this.modelName,
      provider: 'local',
    };
  }
}
```

**Alternativ: Ollama provider** (upgrade path for bedre kvalitet):

```typescript
// @cc-recall/core/embeddings-ollama.ts

export class OllamaEmbeddingProvider {
  readonly dimensions = 768;
  readonly modelName = 'nomic-embed-text';
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const res = await fetch(`${this.baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.modelName, input: text }),
    });
    const data = await res.json();
    return {
      vector: new Float32Array(data.embeddings[0]),
      dimensions: this.dimensions,
      model: this.modelName,
      provider: 'local',
    };
  }
}
```

### 3.6 SQLite + sqlite-vec store schema

cc-recall bruger sin egen SQLite-database (ikke CPM's) for at forblive selvstændig:

**Database-lokation:** `~/.cc-recall/recall.db`

```sql
-- cc-recall database schema

-- Session metadata
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                    -- Session UUID (fra filnavn)
  project_path TEXT NOT NULL,             -- fx '-Users-cb-Apps-cbroberg-codepromptmaker'
  project_name TEXT NOT NULL,             -- fx 'codepromptmaker'
  file_path TEXT NOT NULL,                -- Fuld sti til JSONL-fil
  file_size INTEGER NOT NULL,             -- Bytes
  file_hash TEXT NOT NULL,                -- SHA-256 for change detection
  message_count INTEGER NOT NULL,
  first_timestamp TEXT,
  last_timestamp TEXT,
  chunk_count INTEGER DEFAULT 0,
  indexed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_sessions_project ON sessions(project_path);
CREATE INDEX idx_sessions_timestamp ON sessions(last_timestamp DESC);

-- Session chunks med embeddings
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('decision', 'code-change', 'error-fix', 'architecture', 'conversation')),
  content TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL,
  start_timestamp TEXT,
  end_timestamp TEXT,
  tools_used TEXT DEFAULT '[]',           -- JSON array
  files_referenced TEXT DEFAULT '[]',     -- JSON array
  tags TEXT DEFAULT '[]',                 -- JSON array
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_chunks_session ON chunks(session_id);
CREATE INDEX idx_chunks_type ON chunks(type);

-- sqlite-vec virtual table for vector search
-- Kræver sqlite-vec extension: https://github.com/asg017/sqlite-vec
CREATE VIRTUAL TABLE chunks_vec USING vec0(
  chunk_id TEXT PRIMARY KEY,
  embedding FLOAT[384]                    -- 384 dim for all-MiniLM-L6-v2
);
```

**Hvorfor sqlite-vec over CPM's nuværende JS `cosineSimilarity`:**

CPM's eksisterende embedding-søgning (`packages/shared/src/embeddings/similarity.ts`) beregner cosine similarity i JavaScript — det virker for et par hundrede embeddings, men skalerer ikke til tusindvis af chunks.

`sqlite-vec` giver:
- **Nativ vektor-søgning i SQL** — ingen JS-loop over alle vektorer
- **ANN (Approximate Nearest Neighbor)** — hurtigere end brute-force
- **Enkelt dependency** — et SQLite extension, ikke en separat database

CPM kan selv opgradere til sqlite-vec i v2 RAG — cc-recall baner vejen.

### 3.7 MCP tools

cc-recall eksponerer fire tools via MCP-protokollen:

```typescript
// @cc-recall/mcp/tools.ts

export const TOOLS = [
  {
    name: 'search_sessions',
    description: 'Semantisk søgning på tværs af alle Claude Code session-transkripter. Returnerer relevante chunks med kontekst.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Søgeforespørgsel i naturligt sprog, fx "hvordan løste vi dark mode"',
        },
        project: {
          type: 'string',
          description: 'Filtrer på projekt-navn (valgfri)',
        },
        chunkType: {
          type: 'string',
          enum: ['decision', 'code-change', 'error-fix', 'architecture', 'conversation'],
          description: 'Filtrer på chunk-type (valgfri)',
        },
        limit: {
          type: 'number',
          description: 'Max antal resultater (default: 5)',
          default: 5,
        },
      },
      required: ['query'],
    },
  },

  {
    name: 'get_session_context',
    description: 'Hent fuld kontekst for en specifik session — opsummering, tidslinje, vigtigste beslutninger.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session UUID',
        },
      },
      required: ['sessionId'],
    },
  },

  {
    name: 'list_decisions',
    description: 'List alle dokumenterede beslutninger på tværs af sessioner for et projekt.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Projekt-navn (valgfri — alle projekter hvis tom)',
        },
        limit: {
          type: 'number',
          default: 20,
        },
      },
    },
  },

  {
    name: 'get_session_summary',
    description: 'Generér en kort opsummering af en session — hvad blev gjort, hvilke filer blev ændret, vigtigste beslutninger.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session UUID',
        },
      },
      required: ['sessionId'],
    },
  },
];
```

### 3.8 npm package-struktur

cc-recall publiceres som to npm packages i et monorepo:

```
cc-recall/
├── package.json                          # Workspace root
├── pnpm-workspace.yaml
├── README.md
├── LICENSE                               # MIT
├── Dockerfile                            # Docker deployment option
├── docker-compose.yml
├── packages/
│   ├── core/                             # @cc-recall/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # Public API
│   │       ├── types.ts                  # SessionChunk, SessionMetadata, ChunkType
│   │       ├── parser.ts                 # JSONL parser
│   │       ├── chunker.ts               # Semantic chunking
│   │       ├── embeddings.ts            # RecallEmbeddingProvider (all-MiniLM-L6-v2)
│   │       ├── embeddings-ollama.ts     # OllamaEmbeddingProvider (nomic-embed-text)
│   │       ├── store.ts                 # SQLite + sqlite-vec operations
│   │       ├── indexer.ts               # Full indexing pipeline (parse → chunk → embed → store)
│   │       ├── search.ts               # Semantic search over chunks
│   │       ├── watcher.ts              # File watcher for incremental indexing
│   │       └── redact.ts               # Privacy/redaction pipeline
│   │
│   └── mcp/                              # @cc-recall/mcp
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                  # MCP server entry point
│           ├── server.ts                 # MCP server implementation
│           └── tools.ts                  # Tool definitions + handlers
```

**Public API for `@cc-recall/core`:**

```typescript
// @cc-recall/core/index.ts

export { RecallIndexer } from './indexer';
export { RecallSearch } from './search';
export { RecallEmbeddingProvider } from './embeddings';
export { OllamaEmbeddingProvider } from './embeddings-ollama';
export { RecallStore } from './store';
export { SessionWatcher } from './watcher';
export { redactSecrets } from './redact';

export type {
  SessionChunk,
  SessionMetadata,
  ChunkType,
  SearchResult,
  IndexOptions,
} from './types';
```

### 3.9 Deployment options

**Option A: npx (direkte, anbefalet til start)**

```bash
# Installér globalt
npm install -g @cc-recall/mcp

# Eller kør via npx (ingen installation)
npx @cc-recall/mcp

# Indeksér eksisterende sessioner
npx @cc-recall/core index

# Tilføj til Claude Code
# ~/.claude/settings.json:
{
  "mcpServers": {
    "cc-recall": {
      "command": "npx",
      "args": ["@cc-recall/mcp"]
    }
  }
}
```

**Option B: Docker container**

Inspireret af `cbroberg/openai-whisper-docker` — holder lokal maskine ren, embedder alle dependencies (sqlite-vec, embedding model):

```dockerfile
# cc-recall/Dockerfile

FROM node:20-slim

WORKDIR /app

# sqlite-vec native extension
RUN apt-get update && apt-get install -y \
    build-essential python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ packages/

RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @cc-recall/core build
RUN pnpm --filter @cc-recall/mcp build

# Pre-download embedding model ved build-tid
RUN node -e "import('@cc-recall/core').then(m => new m.RecallEmbeddingProvider().embed('warmup'))"

EXPOSE 3100

CMD ["node", "packages/mcp/dist/index.js"]
```

```yaml
# cc-recall/docker-compose.yml

services:
  cc-recall:
    build: .
    ports:
      - "3100:3100"
    volumes:
      # Mount Claude Code sessions (read-only)
      - ~/.claude/projects:/data/sessions:ro
      # Persist database
      - ~/.cc-recall:/data/db
    environment:
      - SESSIONS_PATH=/data/sessions
      - DB_PATH=/data/db/recall.db
      - EMBEDDING_MODEL=all-MiniLM-L6-v2
```

```bash
# Start cc-recall i Docker
docker compose up -d

# Indeksér alle sessioner
docker compose exec cc-recall node -e "import('@cc-recall/core').then(m => m.RecallIndexer.indexAll())"
```

### 3.10 Incremental indexing + file watcher

cc-recall indekserer inkrementelt — kun nye eller ændrede sessioner:

```typescript
// @cc-recall/core/watcher.ts (koncept)

import { watch } from 'chokidar';

export class SessionWatcher {
  private sessionsPath: string;
  private indexer: RecallIndexer;

  constructor(sessionsPath: string, indexer: RecallIndexer) {
    this.sessionsPath = sessionsPath;
    this.indexer = indexer;
  }

  /**
   * Watch for new/changed JSONL files and index them.
   *
   * Detection: Sammenligner SHA-256 hash af filen med stored hash i sessions-tabellen.
   * - Ny fil (ingen stored hash) → fuld indeksering
   * - Ændret fil (hash mismatch) → re-indeksér (slet gamle chunks, indeksér på ny)
   * - Uændret fil → skip
   */
  start(): void {
    const watcher = watch(`${this.sessionsPath}/**/*.jsonl`, {
      persistent: true,
      ignoreInitial: true,          // Kør ikke på eksisterende filer ved start
      awaitWriteFinish: {
        stabilityThreshold: 2000,   // Vent 2 sek efter sidste write
        pollInterval: 500,
      },
    });

    watcher.on('add', (path) => this.indexer.indexFile(path));
    watcher.on('change', (path) => this.indexer.reindexFile(path));
  }
}
```

**Initialt index-run:** Ved første start indekserer cc-recall alle eksisterende JSONL-filer. Herefter overvåger file watcheren for nye/ændrede filer.

### 3.11 Privacy/redaction pipeline

Session-transkripter kan indeholde følsomme data (API keys, passwords, tokens i tool outputs). cc-recall redigerer disse før indeksering:

```typescript
// @cc-recall/core/redact.ts (koncept)

const REDACTION_PATTERNS = [
  // API keys
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,          // Anthropic
  /sk-[a-zA-Z0-9]{48}/g,                  // OpenAI
  /ghp_[a-zA-Z0-9]{36}/g,                 // GitHub PAT
  /ghu_[a-zA-Z0-9]{36}/g,                 // GitHub user token

  // Generic secrets
  /(?:password|secret|token|key)\s*[:=]\s*['"][^'"]{8,}['"]/gi,

  // Environment variables med secrets
  /(?:API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*\S+/gi,

  // AWS
  /AKIA[0-9A-Z]{16}/g,
];

export function redactSecrets(text: string): string {
  let redacted = text;
  for (const pattern of REDACTION_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}
```

**Workflow:** Parse JSONL → redact secrets → chunk → embed → store. Originale JSONL-filer røres aldrig.

### 3.12 cc-recall v2 — Cloud session access

CPM v3 SaaS gør session-data til en cloud-ressource. cc-recall v2 skal understøtte fjern-adgang til session-filer:

| cc-recall version | Session source | Deployment |
|-------------------|---------------|------------|
| **v1** | Lokalt filsystem (`~/.claude/projects/`) | npm/Docker lokal |
| **v2** | + S3/R2 bucket, + Supabase storage | + Cloud deployment |

**Ikke designet i detaljer for v7** — noteret i Open Questions (sektion 10). Kræver afklaring af:
- Hvordan session-filer uploades til cloud (cc CLI hook? CPM sync?)
- Adgangskontrol (per-user session data i multi-tenant setup)
- Latency (embedding + vector search i cloud vs lokal)

---

## 4. CPM ↔ cc-recall Integration

### 4.1 To koblingsmodi

CPM kan bruge cc-recall på to måder — vælg baseret på koblingsgrad:

**Mode A: MCP (zero coupling, anbefalet)**

```json
// .claude/settings.json (brugerens cc-konfiguration)
{
  "mcpServers": {
    "cc-recall": {
      "command": "npx",
      "args": ["@cc-recall/mcp"]
    }
  }
}
```

CPM taler med cc-recall via MCP tools. Ingen npm dependency. CPM's kode ved intet om cc-recall's internals. Data hentes on-demand via `search_sessions`, `get_session_context` etc.

**Mode B: npm dependency (tæt kobling)**

```json
// packages/web/package.json
{
  "dependencies": {
    "@cc-recall/core": "^1.0.0"
  }
}
```

CPM importerer `@cc-recall/core` direkte. Giver adgang til:
- `RecallSearch.search(query)` — direkte vektor-søgning
- `RecallIndexer.indexAll()` — trigger indeksering fra CPM UI
- Chunk-typer og session-metadata for richer integration

**Anbefaling:** Start med Mode A (MCP). Tilføj Mode B når CPM v5 Session History implementeres og har brug for dybere integration.

### 4.2 Session History (v5 6.3) enrichment

v5 definerer `AISession` med felter som `decisionLog` og `toolCalls` (se v5 sektion 6.3). cc-recall's chunks mapper direkte:

```typescript
// Mapping: cc-recall chunk → v5 AISession enrichment

// cc-recall SessionChunk (type: 'decision')
//   → AISession.decisionLog: SessionDecision[]

// cc-recall SessionChunk (type: 'code-change')
//   → AISession.filesChanged: string[]
//   → AISession.toolCalls: ToolCallLog[]

// cc-recall SessionMetadata
//   → AISession.durationSeconds (from first/last timestamp)
//   → AISession.iterations (from chunk count)
```

**UI flow:** I CPM's Session History-visning tilføjes en "Session Memory" sektion der viser cc-recall-resultater for den valgte session.

### 4.3 Plan Management (v5 sektion 3) enhancement

Planer i CPM linkes til cc-recall sessioner:

```
Plan: "Implementér v6 Interview Module"
  └── Linked sessions (via cc-recall):
      ├── Session 7380239c — "Diskussion af Whisper model-valg"
      ├── Session 9e39a10b — "Implementation af AudioRecorder"
      └── Session c9b9509e — "Haiku korrektion pipeline"
```

**Implementation:** `Plan.sourceRef` kan pege på et session ID. cc-recall's `get_session_context` henter konteksten. CPM viser det i Plan-detalje-viewet.

### 4.4 Knowledge Base auto-population

cc-recall's `decision` og `architecture` chunks er ideelle kandidater til CPM's Knowledge Base (v5 6.2 `ContextBlock`):

```typescript
// Automatisk import flow:
// 1. cc-recall indekserer en session med arkitekturbeslutninger
// 2. CPM's integration layer henter nye 'decision' chunks
// 3. Opretter ContextBlocks med:
//    - category: 'architecture'
//    - scope: 'project'
//    - autoInject: false (bruger beslutter om de skal injiceres i prompts)
//    - content: chunk.content
//    - tags: chunk.metadata.tags
```

### 4.5 CPM UI: "Session Memory" tab

Ny tab i CPM's hovednavigation (v5 Sessions-sektion):

```
/sessions
  ├── Active Sessions      (eksisterende runner-sessions)
  └── Session Memory       (NY — cc-recall integration)
      ├── Search            → Fritekst-søgning via cc-recall
      ├── Decisions         → Liste af alle beslutninger (type: decision)
      ├── Browse Sessions   → Kronologisk liste af sessioner per projekt
      └── Settings          → cc-recall konfiguration (sti, model, re-index)
```

---

## 5. Integration SDK for fremtidige OSS-værktøjer

### 5.1 Trin-for-trin guide: Opret en CPM-integration

1. **Opret standalone OSS-projekt** — eget GitHub repo, eget formål
2. **Definér data streams** — hvilke data leverer dit projekt?
3. **Implementér MCP server** — eksponér tools via MCP-protokollen
4. **Publicér som npm package** — `@your-tool/core` + `@your-tool/mcp`
5. **Tilføj til CPM Integration Registry** — PR mod CPM med registry-entry
6. **Implementér CPM adapter** (valgfri) — for dybere integration via npm import

### 5.2 Fremtidige integrations-kandidater

| Integration | Beskrivelse | Data streams | CPM modules |
|-------------|-------------|--------------|-------------|
| **cc-recall** | RAG over cc-sessioner | decisions, context, code-changes | Session History, Knowledge Base, Plans |
| **codebase-indexer** | AST-baseret kode-indeksering | symbols, dependencies, patterns | Knowledge Base, Prompt Generation |
| **git-historian** | Git-historik analyse | commits, blame, refactoring | Session History, Knowledge Base |
| **doc-indexer** | Dokumentations-RAG | API docs, README, guides | Knowledge Base, Prompt Generation |
| **test-analyzer** | Test coverage + failure analysis | coverage, failures, flaky | Session History, Plan Management |
| **whisper-service** (v6) | Voice → Text | transcripts, corrections | Plan Management (via Interviews) |

### 5.3 CLI commands for integration management

```bash
# Integration management
cpm integration list                    # Vis alle kendte integrationer (installed + available)
cpm integration install <id>            # Installér integration (fx 'cc-recall')
cpm integration configure <id>          # Konfigurér (sti, model, etc.)
cpm integration status [id]             # Vis status for én eller alle installerede
cpm integration sync <id>              # Trigger data sync fra integration
cpm integration remove <id>            # Fjern integration

# cc-recall specifik
cpm integration sync cc-recall          # Re-indeksér alle sessioner
cpm integration status cc-recall        # Vis: X sessioner, Y chunks, last indexed
```

---

## 6. Database Migration

Nye tabeller (additive — bryder ikke eksisterende schema):

```sql
-- Migration: v7_add_integrations

-- Integrationer registry
CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('mcp-server', 'npm-package', 'rest-api', 'cli-tool')),
  version TEXT NOT NULL,
  status TEXT DEFAULT 'available'
    CHECK(status IN ('available', 'installed', 'configured', 'active', 'error')),
  config TEXT DEFAULT '{}',
  mcp_config TEXT,                        -- JSON: {command, args, env}
  last_synced_at INTEGER,
  error_message TEXT,
  installed_at INTEGER,
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Data streams per integration
CREATE TABLE integration_data_streams (
  id TEXT PRIMARY KEY,                    -- fx 'cc-recall:session-decisions'
  integration_id TEXT NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,                -- fx 'session-decisions'
  name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  refresh_mode TEXT DEFAULT 'on-demand'
    CHECK(refresh_mode IN ('realtime', 'on-demand', 'scheduled')),
  last_synced_at INTEGER,
  item_count INTEGER DEFAULT 0
);

CREATE INDEX idx_data_streams_integration ON integration_data_streams(integration_id);

-- Udvid runner_sessions med integration-reference
ALTER TABLE runner_sessions ADD COLUMN integration_id TEXT REFERENCES integrations(id);
```

---

## 7. Environment Variables

```bash
# packages/web/.env.local — CPM integration settings

# cc-recall (Mode A: MCP — ingen env vars nødvendige, konfigureret via .claude/settings.json)
# cc-recall (Mode B: npm) — stier til cc-recall database
CC_RECALL_DB_PATH=~/.cc-recall/recall.db
CC_RECALL_SESSIONS_PATH=~/.claude/projects/
CC_RECALL_EMBEDDING_MODEL=all-MiniLM-L6-v2    # eller 'nomic-embed-text' for Ollama
CC_RECALL_OLLAMA_URL=http://localhost:11434     # kun hvis Ollama bruges
```

```bash
# cc-recall/.env (standalone konfiguration)
SESSIONS_PATH=~/.claude/projects/
DB_PATH=~/.cc-recall/recall.db
EMBEDDING_MODEL=all-MiniLM-L6-v2
# EMBEDDING_MODEL=nomic-embed-text            # Ollama alternativ
# OLLAMA_URL=http://localhost:11434
WATCH_MODE=true                                # Auto-indeksér nye sessioner
LOG_LEVEL=info
```

---

## 8. Estimeret implementation-tid

| Komponent | Estimat |
|-----------|---------|
| **cc-recall standalone** | |
| JSONL parser + chunker | 3-4 timer |
| Embedding provider (all-MiniLM-L6-v2) | 1-2 timer |
| SQLite + sqlite-vec store | 2-3 timer |
| Indexing pipeline (parse → chunk → embed → store) | 2-3 timer |
| Semantic search | 1-2 timer |
| MCP server (4 tools) | 2-3 timer |
| File watcher (chokidar) | 1-2 timer |
| Privacy/redaction pipeline | 1-2 timer |
| Docker setup (Dockerfile + compose) | 1-2 timer |
| **cc-recall subtotal** | **~1.5-2 arbejdsdage** |
| | |
| **CPM integration layer** | |
| `ICPMIntegration` interface + types | 1-2 timer |
| Integration Registry | 1 time |
| Database migration (integrations + data_streams) | 1 time |
| Integration management API routes | 2-3 timer |
| CPM UI: Session Memory tab | 3-4 timer |
| CLI commands (integration list/install/status/sync) | 2 timer |
| **CPM integration subtotal** | **~1.5-2 arbejdsdage** |
| | |
| **Total** | **~3-4 arbejdsdage** |

---

## 9. Sammenhæng med eksisterende versioner

| Eksisterende version | Påvirkning fra v7 |
|---------------------|-------------------|
| **v1 (Local MVP)** | `integrations` og `integration_data_streams` tabeller tilføjes. Ingen funktionel ændring af v1-features. |
| **v2 (RAG)** | cc-recall's embedding-infrastruktur (chunking, sqlite-vec, embedding model) validerer den teknologi v2 RAG skal bruge. CPM kan potentielt skifte fra JS `cosineSimilarity` til sqlite-vec baseret på cc-recall's erfaringer. |
| **v3 (SaaS)** | cc-recall v2 (cloud session access) kræver at session-filer kan tilgås fra cloud. Integrationsarkitekturen skal håndtere per-user data isolation i multi-tenant setup. |
| **v4 (Autonomous runner)** | `runner_sessions` udvides med `integration_id` — sessions startet via en integration kan trackes. |
| **v5 (AI Command Center)** | v7 formaliserer v5's Connector Architecture (sektion 5) og MCP Server Hub (sektion 6.8) med en konkret implementationsmodel. Session History (6.3) og Knowledge Base (6.2) får automatisk data fra integrationer. |
| **v6 (Interview Module)** | whisper-service er retrospektivt et eksempel på v7's pluggable service-mønster (selvstændig service, REST API, CPM-adapter). |

v7 er **additiv** — bryder ingen eksisterende funktionalitet.

---

## 10. Open Questions

1. **Embedding model-valg for cc-recall:**
   - `all-MiniLM-L6-v2` (384 dim) — matcher CPM's eksisterende `LocalEmbeddingProvider`, ingen ekstra dependency
   - `nomic-embed-text` via Ollama (768 dim) — bedre kvalitet for kode/tekst, kræver Ollama installeret
   - **Anbefaling:** Default `all-MiniLM-L6-v2` for zero-dependency start. Ollama som opt-in upgrade.

2. **sqlite-vec vs blob-baseret cosine similarity:**
   - CPM bruger i dag JS `cosineSimilarity()` over blob-embeddings (`packages/shared/src/embeddings/similarity.ts`)
   - sqlite-vec giver native vektor-søgning i SQL
   - **Spørgsmål:** Skal CPM v2 RAG også migrere til sqlite-vec? cc-recall kan validere det.

3. **cc-recall database-lokation:**
   - `~/.cc-recall/recall.db` (selvstændig, udenfor CPM)
   - `~/.cpm/integrations/cc-recall/recall.db` (under CPM's paraply)
   - **Anbefaling:** `~/.cc-recall/` — cc-recall er standalone og bør ikke afhænge af CPM's directory-struktur.

4. **JSONL format-stabilitet:**
   - Claude Code's session-JSONL er en intern implementation-detalje
   - Formatet kan ændre sig mellem cc-versioner uden varsel
   - **Mitigering:** cc-recall parser med graceful degradation — ukendte felter ignoreres, parse-fejl logges men crasher ikke. Version-detection i parser.

5. **Ollama som dependency:**
   - cc-recall med `nomic-embed-text` kræver Ollama installeret (600+ MB)
   - For brugere der ikke allerede har Ollama er det en stor dependency
   - **Anbefaling:** Gør det valgfrit. Default er `@huggingface/transformers` (ingen ekstra install).

6. **Docker vs lokal som default:**
   - Docker: rent, isoleret, alle dependencies inkluderet. Kræver Docker Desktop.
   - npx: simpelt, direkte. Kræver at sqlite-vec kompilerer (kan give problemer).
   - **Anbefaling:** npx som default (laveste barrier). Docker som alternativ for dem der vil have isolation.

7. **Cloud session access (cc-recall v2):**
   - Session-JSONL-filer er lokale. CPM v3 SaaS skal kunne indeksere sessioner fra cloud.
   - Muligheder: S3/R2 bucket mount, Supabase storage, cc CLI sync hook.
   - **Status:** Parkeret til cc-recall v1 er stabil og CPM v3 er under udvikling.

8. **Integration discovery:**
   - Skal CPM auto-detecte installerede MCP servers og tilbyde integration?
   - Eller skal brugeren eksplicit installere via `cpm integration install`?
   - **Anbefaling:** Eksplicit installation. Auto-discovery er overengineered for v7.

---

*Dokument oprettet: 18. feb 2026*
*Baseret på: `docs/LOG-cc-recall-discussion.md` og planlægningssession med Claude (Opus 4.6)*
