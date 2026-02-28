# v7 — CPM Knowledge Extractor: Stack-Aware Best Practices Bank

> **Formål:** Tilføj en Knowledge Extraction pipeline til CPM der automatisk trækker best practices, conventions og patterns ud af eksisterende Git repositories og opbygger en søgbar, stak-filtreret **Knowledge Bank** som beriger Prompt Contracts med data-drevne CONSTRAINTS.
>
> **Forudsætning:** v5 Knowledge Base / Context Library (modul 4.2) leverer storage og query-laget. v7 tilføjer extraction-pipelinen der *fylder* denne knowledge base fra eksterne kilder.
>
> **Oprindelse:** Planlægningssession mellem Christian (CEO, WebHouse ApS) og Claude, 24. feb 2026.
>
> **Prototype repo:** [github.com/cbroberg/cpm-knowledge-extractor](https://github.com/cbroberg/cpm-knowledge-extractor)

---

## 1. Vision: Viden fra Repos ind i Prompt Contracts

### Problemet

Når CPM genererer en Prompt Contract, afhænger kvaliteten af CONSTRAINTS-sektionen i dag udelukkende af brugerens hukommelse og Developer Profile. Men de bedste AI coding conventions lever allerede i open source repos — i CLAUDE.md filer, convention docs, config files og selve koden. Denne viden er:

- **Fragmenteret** — spredt over tusindvis af repos
- **Ustruktureret** — blandet med irrelevant boilerplate
- **Stak-specifik** — Next.js conventions er irrelevante for et Django-projekt
- **Dynamisk** — best practices ændrer sig med nye framework-versioner

### Løsningen

En **Knowledge Extraction Pipeline** der:

1. **Crawler** repos (remote eller lokale) og finder knowledge-bærende filer
2. **Detekterer** projektets tech stack fra config filer
3. **Extraherer** strukturerede knowledge blocks fra relevante sektioner
4. **Klassificerer** hvert fragment med kategori, type, confidence og tags
5. **Lagrer** fragmenter i CPM's Knowledge Bank med stak-metadata
6. **Injicerer** relevante fragmenter i Prompt Contracts baseret på match med aktuelle projekts stak + opgavetype

### Resultat

Prompt Contracts der automatisk inkluderer stak-relevante best practices:

```
Task: "Opret en ny API route med auth"
Stack detected: Next.js 16, Supabase Auth, Drizzle

→ CPM Knowledge Bank matcher:
  - Next.js App Router: "Always use route.ts not route.js in app/ directory"
  - Supabase Auth: "Use createServerClient in server components, createBrowserClient in client"
  - Drizzle: "Always use db.transaction() for multi-table writes"
  - Anti-pattern: "Never import server-only modules in client components"

→ Injiceret i CONSTRAINTS sektion af Prompt Contract
```

---

## 2. Knowledge Fragment Schema

### Data Model

Hvert stykke viden lagres som et **Knowledge Fragment** — den atomare enhed i Knowledge Bank:

```typescript
// packages/shared/types/knowledge-fragment.ts

interface KnowledgeFragment {
  id: string;                          // Deterministisk hash (repo+file+line)
  
  // Hvad det handler om
  stack: string[];                     // ["next.js@16", "tailwind@4"]
  category: KnowledgeCategory;         // Se enum nedenfor
  type: 'rule' | 'pattern' | 'anti-pattern' | 'convention';
  
  // Indhold
  title: string;                       // Kort beskrivende titel
  description: string;                 // Selve best practice/pattern (max 500 chars)
  fullContent: string;                 // Fuld sektion fra kilden
  example: string | null;              // Kodeeksempel hvis tilgængeligt
  
  // Oprindelse
  source: {
    repo: string;                      // "owner/repo"
    file: string;                      // "CLAUDE.md"
    line: number;                      // Linje-nummer
    url: string;                       // GitHub permalink
  };
  
  // Kvalitet
  confidence: 'high' | 'medium' | 'low';
  corroborations: number;             // Antal repos der bekræfter dette mønster
  
  // Søgbarhed
  tags: string[];                      // ["app-router", "middleware", "auth"]
  
  // Metadata
  extractedAt: string;                 // ISO timestamp
  lastVerified: string;                // Seneste check mod kilde
  fragmentVersion: string;             // Schema version
}

type KnowledgeCategory = 
  | 'error-handling'
  | 'auth-pattern'
  | 'testing'
  | 'file-structure'
  | 'naming'
  | 'security'
  | 'performance'
  | 'conventions'
  | 'architecture'
  | 'api-design'
  | 'database'
  | 'deployment'
  | 'imports'
  | 'state-management'
  | 'styling'
  | 'accessibility';
```

### Database Schema

```typescript
// packages/db/schema/knowledge-fragments.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const knowledgeFragments = sqliteTable('knowledge_fragments', {
  id: text('id').primaryKey(),
  stack: text('stack', { mode: 'json' }),           // JSON array
  category: text('category').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  fullContent: text('full_content'),
  example: text('example'),
  sourceRepo: text('source_repo').notNull(),
  sourceFile: text('source_file').notNull(),
  sourceLine: integer('source_line'),
  sourceUrl: text('source_url'),
  confidence: text('confidence').notNull().default('medium'),
  corroborations: integer('corroborations').default(1),
  tags: text('tags', { mode: 'json' }),              // JSON array
  extractedAt: text('extracted_at').notNull(),
  lastVerified: text('last_verified'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// Index for stak-baseret opslag
// CREATE INDEX idx_fragments_stack ON knowledge_fragments (stack);
// CREATE INDEX idx_fragments_category ON knowledge_fragments (category);
```

---

## 3. Extraction Pipeline

### Arkitektur

```
┌─────────────┐     ┌───────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│  Repo Input │ ──► │  Discover │ ──► │ Extract  │ ──► │  Classify  │ ──► │  Output  │
│  (URL/path) │     │  Files    │     │ Knowledge│     │  Fragments │     │  Store   │
└─────────────┘     └───────────┘     └──────────┘     └────────────┘     └──────────┘
       │                  │                 │                  │                 │
       │            ┌─────┴─────┐    ┌─────┴──────┐   ┌─────┴──────┐   ┌─────┴──────┐
       │            │ Stack     │    │ Section    │   │ Category   │   │ JSON/DB    │
       │            │ Detection │    │ Splitting  │   │ Detection  │   │ Knowledge  │
       ▼            │           │    │ Signal     │   │ Confidence │   │ Bank       │
  ┌──────────┐      │ package.  │    │ Filtering  │   │ Tagging    │   └────────────┘
  │  Clone   │      │ json/     │    └────────────┘   └────────────┘
  │  (shallow│      │ pyproject │
  │   --depth│      │ .toml     │
  │   1)     │      └───────────┘
  └──────────┘
```

### Trin-for-trin

#### Trin 1: Repo Input & Clone

```bash
# Remote repo → shallow clone
git clone --depth 1 --single-branch <url> /tmp/cpm-ke/<owner>--<name>

# Local repo → direkte adgang
# Ingen clone nødvendig
```

#### Trin 2: File Discovery

Prioriteret søgeliste — højere prioritet = stærkere signal:

| Prioritet | Fil | Kategori | Signalkvalitet |
|-----------|-----|----------|----------------|
| 1 | `CLAUDE.md` | AI instructions | ★★★★★ |
| 1 | `.cursorrules` / `.cursor/rules` | AI instructions | ★★★★★ |
| 1 | `.clinerules` | AI instructions | ★★★★☆ |
| 1 | `AGENTS.md` | AI instructions | ★★★★☆ |
| 1 | `copilot-instructions.md` | AI instructions | ★★★★☆ |
| 2 | `CONVENTIONS.md` | Conventions | ★★★★☆ |
| 2 | `CODING_STANDARDS.md` | Conventions | ★★★★☆ |
| 2 | `ARCHITECTURE.md` | Architecture | ★★★★☆ |
| 3 | `CONTRIBUTING.md` | Contributing | ★★★☆☆ |
| 3 | `README.md` | Readme | ★★★☆☆ |
| 3 | `docs/*.md` | Documentation | ★★★☆☆ |
| 4 | `eslint.config.js` | Linting rules | ★★☆☆☆ |
| 4 | `tsconfig.json` | TS strictness | ★★☆☆☆ |
| 4 | `.prettierrc` | Formatting | ★★☆☆☆ |
| 4 | `biome.json` | Linting rules | ★★☆☆☆ |

#### Trin 3: Stack Detection

Detektion baseret på dependency analysis:

```javascript
// package.json dependencies → stack mapping
{
  "next": "next.js",
  "tailwindcss": "tailwind",
  "drizzle-orm": "drizzle",
  "@supabase/supabase-js": "supabase",
  "zod": "zod",
  "vitest": "vitest",
  // ... 40+ mappings
}

// Supplerende signaler:
// - components.json → shadcn/ui
// - pnpm-workspace.yaml → monorepo
// - pyproject.toml → Python stack
// - Cargo.toml → Rust stack
```

#### Trin 4: Knowledge Extraction

Markdown-filer splittes i sektioner (## headings) og filtreres med signal-heuristik:

**Positive signaler** (beholder blokken):
- Imperative ord: "must", "always", "never", "don't", "avoid", "prefer"
- Tekniske nøgleord: "pattern", "convention", "rule", "standard"
- Kodeblokke (``` markers)
- Bold text (ofte markerer vigtige regler)
- Bullet-lister med konkrete instruktioner

**Negative signaler** (dropper blokken):
- License/copyright boilerplate
- Changelog-indhold
- Badge/shield markdown
- Blokke under 30 tegn

Config-filer (eslint, tsconfig, prettier) extraheres som hele blokke.

#### Trin 5: Classification

Hvert raw block klassificeres:

- **Category**: Keyword-scoring mod 15 kategorier
- **Type**: Signal-detection (rule/pattern/anti-pattern/convention)
- **Confidence**: Baseret på kildeprioriteten (AI instructions = high, config = low)
- **Tags**: Stack-navne + teknologi-termer fundet i indholdet

#### Trin 6: Output

```json
{
  "metadata": {
    "extractedAt": "2026-02-24T14:30:00Z",
    "version": "0.1.0",
    "totalFragments": 47,
    "sources": ["vercel/next.js", "shadcn-ui/ui"],
    "stackDetected": ["next.js@16", "react@19", "tailwind@4"]
  },
  "fragments": [
    {
      "id": "a3f4c2d1e5b6",
      "stack": ["next.js@16"],
      "category": "file-structure",
      "type": "rule",
      "title": "Use route.ts for App Router API routes",
      "description": "Always use route.ts (not route.js) in app/ directory...",
      "confidence": "high",
      "source": { "repo": "vercel/next.js", "file": "CLAUDE.md", "line": 42 }
    }
  ]
}
```

---

## 4. Integration med CPM

### 4.1 CLI Commands

```bash
# --- Knowledge Extraction ---
cpm knowledge extract <repo-url>           # Extrahér fra remote repo
cpm knowledge extract .                    # Extrahér fra current repo
cpm knowledge extract --batch repos.txt    # Batch-extraction fra fil

# --- Knowledge Bank Management ---
cpm knowledge list                         # Vis alle fragmenter
cpm knowledge list --stack next.js         # Filtrer på stak
cpm knowledge list --category auth-pattern # Filtrer på kategori
cpm knowledge search <query>              # Fuldtekst-søgning
cpm knowledge stats                       # Vis statistik
cpm knowledge prune                       # Fjern inaktive/outdated
cpm knowledge verify                      # Re-check mod kilder
cpm knowledge export                      # Eksportér som JSON

# --- Knowledge Application ---
cpm knowledge match                       # Match mod current projects stak
cpm knowledge inject <prompt-id>          # Manuelt injicér i prompt
```

### 4.2 Automatisk Injection i Prompt Contracts

Når CPM genererer en Prompt Contract (v1 core flow):

```
1. Bruger beskriver opgave: "Opret en ny API route med Supabase auth"
2. CPM detekterer projektets stak fra package.json
3. CPM slår op i Knowledge Bank:
   - stack IN ("next.js", "supabase") 
   - category IN ("api-design", "auth-pattern")
   - confidence IN ("high", "medium")
4. Top-5 fragmenter injiceres i CONSTRAINTS:

CONSTRAINTS:
- [Auto] Next.js App Router: Use route.ts handler pattern with typed params
- [Auto] Supabase: createServerClient() in server components, never createBrowserClient
- [Auto] Error handling: Always return NextResponse.json with status codes, never throw
- [Auto] Anti-pattern: Never import @supabase/supabase-js directly, use project's lib/supabase
- Use Drizzle ORM for all database queries
- Follow existing error handling pattern in src/app/api/
```

Fragmenter markeres med `[Auto]` for at indikere de kommer fra Knowledge Bank, ikke fra brugeren.

### 4.3 Corroboration (Krydstjek)

Når samme mønster findes i flere repos, stiger `corroborations` count:

```
Fragment: "Always validate API input with Zod before processing"
├── Fundet i: vercel/commerce CLAUDE.md (line 67)
├── Fundet i: shadcn-ui/ui CONTRIBUTING.md (line 23)  
├── Fundet i: cal.com/cal.com CONVENTIONS.md (line 45)
└── corroborations: 3 → confidence: HIGH
```

Fragmenter med høj corroboration-score prioriteres ved injection.

---

## 5. Curated Seed Banks

### Formål

Starter med manuelt kuraterede seed banks for de mest relevante stacks. Disse er pre-built Knowledge Banks der følger med CPM "out of the box".

### Seed Bank: Next.js + React + Tailwind v4

**Repos at extrahere fra:**

```
# Core frameworks
vercel/next.js                    # CLAUDE.md, CONTRIBUTING.md, docs/
tailwindlabs/tailwindcss         # CONTRIBUTING.md, docs/
facebook/react                   # CONTRIBUTING.md, docs/

# UI
shadcn-ui/ui                     # CLAUDE.md, conventions
radix-ui/primitives              # CONTRIBUTING.md

# Reference implementations
vercel/commerce                  # CLAUDE.md, arkitektur patterns
vercel/ai                        # CLAUDE.md, AI patterns  
steven-tey/dub                   # CLAUDE.md, Next.js patterns
calcom/cal.com                   # CLAUDE.md, monorepo patterns

# AI instruction examples
anthropics/anthropic-cookbook     # CLAUDE.md
t3-oss/create-t3-app            # conventions
```

### Seed Bank: Supabase + Drizzle

```
supabase/supabase                # docs/, guides
drizzle-team/drizzle-orm         # docs/, CONTRIBUTING.md
supabase/auth-helpers            # README.md, examples
```

### Seed Bank: Monorepo + Turbo

```
vercel/turbo                     # docs/, examples
vercel/turborepo                 # CLAUDE.md
changesets/changesets            # CONTRIBUTING.md
```

---

## 6. Stack-Specifikke Pattern Matchers

For dybere analyse end filsøgning kan specialiserede matchers scanne kildekode:

### 6.1 Next.js Pattern Matcher

Detekterer fra kode:
- App Router vs Pages Router usage
- Server vs Client component patterns (`'use client'` directives)
- Route handler patterns (GET, POST exports)
- Middleware patterns
- Server Actions patterns
- Metadata API usage
- Error boundary patterns

### 6.2 Tailwind Pattern Matcher

Detekterer:
- v3 config (`tailwind.config.js`) vs v4 CSS-first (`@import "tailwindcss"`)
- Custom theme extensions
- Plugin usage patterns
- Dark mode strategy (class vs media)
- Design tokens

### 6.3 Drizzle Pattern Matcher

Detekterer:
- Schema patterns (relations, indexes)
- Migration patterns
- Transaction usage
- Query builder vs SQL usage
- Connection pooling

### 6.4 Supabase Pattern Matcher

Detekterer:
- Auth helper patterns (SSR vs client)
- Row Level Security policies
- Real-time subscription patterns
- Storage patterns
- Edge Function patterns

---

## 7. Prioriteret Implementation Roadmap

### v7.0 — Prototype (Standalone Tool)

| Prioritet | Feature | Status |
|-----------|---------|--------|
| P0 | CLI extraction pipeline (clone → discover → extract → classify → output) | ✅ Prototype i repo |
| P0 | JSON output format | ✅ Prototype i repo |
| P0 | Stack detection fra package.json | ✅ Prototype i repo |
| P0 | Priority-ordered file discovery | ✅ Prototype i repo |
| P1 | Section-based markdown splitting med signal heuristik | ✅ Prototype i repo |
| P1 | Batch mode (repos.txt) | ✅ Prototype i repo |
| P1 | YAML output format | ✅ Prototype i repo |

### v7.1 — CPM Integration

| Prioritet | Feature | Beskrivelse |
|-----------|---------|-------------|
| P0 | `cpm knowledge extract` command | Integrer extractor i @cpm/cli |
| P0 | Knowledge Fragments database tabel | Drizzle schema + migration |
| P0 | Auto-injection i Prompt Contracts | Match fragments mod projekt-stak |
| P1 | `cpm knowledge search/list/stats` | Knowledge Bank management CLI |
| P1 | Corroboration scoring | Krydstjek på tværs af repos |
| P1 | Pre-built seed banks | Next.js + Tailwind + Supabase seeds |

### v7.2 — Smart Features

| Prioritet | Feature | Beskrivelse |
|-----------|---------|-------------|
| P2 | Stack-specifikke pattern matchers | Kode-analyse for Next.js, Drizzle, etc. |
| P2 | Web UI for Knowledge Bank | Browse, søg, toggle fragmenter |
| P2 | Fragment verification pipeline | Periodisk re-check mod kilder |
| P2 | Version-aware matching | Match fragments mod specifik framework-version |
| P3 | Community sharing | Del og importér Knowledge Banks |
| P3 | AI-powered deduplication | Flet lignende fragments med LLM |
| P3 | RAG integration | Embedding-baseret semantic search |

---

## 8. Dependency Graph

```
v7 Knowledge Extractor integrationer:

@cpm/shared
  └── types/knowledge-fragment.ts  (NEW)

@cpm/db
  └── schema/knowledge-fragments.ts (NEW)

@cpm/cli
  └── commands/knowledge.js (NEW)
      ├── extract command → kalder extractor pipeline
      ├── list/search/stats → query Knowledge Bank
      └── inject command → manual fragment injection

@cpm/web (v7.2+)
  └── app/knowledge/ (NEW)
      ├── page.tsx → Knowledge Bank browser
      ├── [id]/page.tsx → Fragment detaljer
      └── components/ → FilterPanel, FragmentCard, etc.

Ekstern dependency:
  cpm-knowledge-extractor (standalone prototype)
  → Integreres i @cpm/cli som intern modul i v7.1
```

---

## 9. Risici og Mitigering

| Risiko | Impact | Mitigering |
|--------|--------|------------|
| Store repos tager lang tid at clone | Bruger venter | Shallow clone (--depth 1), cache i /tmp |
| For mange fragments = noise | Lavere prompt kvalitet | Confidence scoring + max 5 auto-injected |
| Outdated fragments | Forkerte patterns | `lastVerified` timestamp + verification pipeline |
| Stak-mismatch | Irrelevante fragments | Strict stack matching mod package.json |
| License/copyright i fragments | Juridisk | Kun extract regler/patterns, aldrig proprietær kode |
| Token budget ved injection | Oversized prompts | Max token budget for Knowledge Bank injection (default: 500 tokens) |

---

## 10. Success Metrics

- **Extraction coverage**: Kan extrahere ≥10 relevante fragments fra top 10 framework repos
- **Match accuracy**: ≥80% af auto-injected fragments er relevante for opgaven
- **Prompt quality**: Prompt Contracts med Knowledge Bank injection producerer færre fejl i cc sessions
- **Time saved**: Brugeren behøver ikke manuelt skrive stak-specifikke constraints
- **Corroboration**: ≥50% af fragments har corroborations ≥ 2

---

## 11. Designfilosofi

### "Better Constraints, Better Code"

Knowledge Extractor er en direkte realisering af CPM's kerneindsigt: **bedre Prompt Contracts eliminerer de fleste runtime-ambiguiteter**. Phil's erfaring viser at hans revert-rate faldt fra 1-i-3 til 1-i-10 med strukturerede Prompt Contracts. Knowledge Bank tager dette videre — nu er CONSTRAINTS ikke bare menneskelige regler, men **data-drevne, community-validerede best practices**.

### "Stak-fikseret er en Feature"

Ja, Knowledge Fragments er stak-specifikke. Det er en feature, ikke en begrænsning. En Next.js App Router konvention er meningsløs for et Django-projekt. Stack-awareness sikrer at kun relevante fragments injiceres, og at confidence-scoring afspejler den specifikke version af det framework projektet bruger.

### "Curated > Comprehensive"

En kurateret seed bank med 200 high-confidence fragments fra 10 top repos slår en automatisk crawl af 10.000 repos med noise. Start smalt, validér kvaliteten, og udvid gradvist.
