# Deep-Plan → CPM Integration Plan

## Formål

Formel mapping mellem Pierce Lamb's `/deep-plan` workflow og CPM's pipeline-arkitektur, med konkret implementeringsplan for de features vi adopterer. Dokumentet er skrevet så Claude Code kan bruge det som spec for implementering.

**Kilde:** https://github.com/piercelamb/deep-plan
**Licens:** MIT — vi kan frit låne og adaptere kode og patterns.

---

## Del 1: Formel Workflow Mapping

### Pierce's Pipeline → CPM Pipeline Stages

| deep-plan Step | Beskrivelse | CPM Pipeline Stage | CPM Komponent | Status i CPM |
|---|---|---|---|---|
| Research (codebase) | Analysér eksisterende kode, patterns, conventions | Stage 3 — Technical Architecture | `@cpm/runner` + Codebase Indexer (v5.2) | Ikke implementeret |
| Research (web) | Søg best practices, current versions, patterns | Stage 1 — Ideation & Discovery | `@cpm/shared` + Connector Architecture (v5) | Ikke implementeret |
| Interview | AI stiller 5-10 spørgsmål for at udfylde huller i spec | Stage 1 → Stage 2 | v6 Interview Module | Spec'et, ikke implementeret |
| Synthesize Spec | Kombiner research + interview til komplet spec | Stage 2 — Product Design | `@cpm/shared/services/` | Ikke implementeret |
| Generate Plan | Skriv detaljeret implementeringsplan (prose, ikke kode) | Stage 3 — Technical Architecture | Plan Management (v5) | Spec'et, ikke implementeret |
| External LLM Review | Send plan til Gemini + ChatGPT for uafhængig review | **NY FEATURE** | Multi-LLM Review Service | Ikke i CPM roadmap endnu |
| Integrate Feedback | Claude vælger hvad der integreres fra reviews | **NY FEATURE** | Review Integration Engine | Ikke i CPM roadmap endnu |
| TDD Transformation | Transformér plan til test-first format | Stage 4 — Implementation | Prompt Contract TDD mode | Ikke i CPM roadmap endnu |
| Section Splitting | Opdel plan i self-contained implementation units | Stage 4 — Implementation | Prompt Contract Slicing | Kernefunktionalitet, delvist spec'et |
| Per-Section Implementation | TDD loop per section med code review | Stage 4 — Ralph Wiggum Loop | `@cpm/runner` autonomous loop | Spec'et i v4 |
| Context Management | Checkpoint state, recover from compaction | Stage 4 — Ralph Wiggum Loop | Task persistence + config.json | Spec'et i v4 |

### Arkitektur-Parallel

```
deep-plan                          CPM
─────────                          ───
SKILL.md (orchestrator)     →      @cpm/runner pipeline definition
references/*.md (per-step)  →      Prompt Contract templates
scripts/*.py (deterministic)→      @cpm/shared/services/ (Node.js)
agents/*.md (subagents)     →      Connector-spawned cc sessions
hooks/hooks.json            →      @cpm/runner event hooks
planning/ output dir        →      @cpm/db + filesystem artifacts
deep_plan_config.json       →      runner_sessions + runner_jobs tables
```

---

## Del 2: Features Vi Adopterer

### Feature 1: Multi-LLM Plan Review Service

**Hvad:** Send en genereret plan (eller Prompt Contract) til Gemini og/eller ChatGPT for uafhængig kvalitetsreview inden execution.

**Hvorfor:** Pierce validerede at forskellige LLM'er finder forskellige blindspots fordi deres context windows "palpates" planen anderledes. Det er en billig kvalitetsløftning.

**Hvor i CPM:** Ny service i `@cpm/shared/services/llm-review.mjs`

**API Keys:** Bruger gemmer sine API keys i `.env.local`:
```
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx
```

**Implementeringsdesign:**

```javascript
// @cpm/shared/services/llm-review.mjs

/**
 * Send en plan/prompt contract til eksterne LLM'er for review.
 * Kører tilgængelige providers parallelt.
 * Returnerer reviews + integration suggestions.
 */
export async function reviewWithExternalLLMs(planContent, options = {}) {
  // 1. Detect hvilke API keys der er tilgængelige
  // 2. Byg review-prompt med planContent
  // 3. Kør tilgængelige providers parallelt (Promise.allSettled)
  // 4. Returnér structured reviews
}
```

**Review prompt template (fra deep-plan, adapteret):**
```
You are reviewing an implementation plan. Analyze it for:
1. Missing edge cases or error handling
2. Security concerns
3. Performance implications
4. Architectural footguns
5. Missing dependencies or prerequisites
6. Suggestions for improvement

Be specific and actionable. Reference specific sections of the plan.
Do NOT rewrite the plan — identify issues and suggest fixes.
```

**Output format:**
```javascript
{
  reviews: {
    gemini: { success: true, model: "gemini-2.5-pro", analysis: "..." },
    openai: { success: true, model: "gpt-4.1", analysis: "..." }
  },
  filesWritten: ["reviews/gemini-review.md", "reviews/openai-review.md"],
  availableProviders: ["gemini", "openai"]
}
```

**Integration i CPM workflow:**
- Web UI: "Review Plan" knap på Plan detail page → kalder API route → kalder service
- CLI: `cpm review <plan-id>` → kalder service direkte
- Runner pipeline: Automatisk review-step inden section splitting

**Filer der skal oprettes:**
```
packages/shared/services/llm-review.mjs        # Core review service
packages/shared/services/llm-clients/           # Provider-specific clients
packages/shared/services/llm-clients/gemini.mjs # Google Gemini client
packages/shared/services/llm-clients/openai.mjs # OpenAI client
packages/web/src/app/api/review/route.ts        # API endpoint
packages/cli/commands/review.mjs                # CLI command
```

---

### Feature 2: Interview Protocol (Formaliseret)

**Hvad:** Struktureret interview-flow hvor AI stiller fokuserede spørgsmål for at udfylde huller i en spec, baseret på deep-plan's interview-protocol.md.

**Hvorfor:** Pierce validerede at interviews konsekvent finder edge cases og requirements brugeren ikke har tænkt over. 5-10 spørgsmål er sweet spot.

**Hvor i CPM:** Del af v6 Interview Module, men den basale interview-logik kan implementeres nu i `@cpm/shared/services/interview.mjs`

**Design-principper (fra deep-plan's interview-protocol.md):**
1. Spørg åbne spørgsmål, aldrig ja/nej
2. 2-4 spørgsmål per runde
3. Skip spørgsmål der allerede er besvaret i spec eller research
4. Stop når brugeren svarer "I don't know" på de fleste spørgsmål
5. Stop når du er sikker på at du kan skrive en komplet plan uden antagelser
6. Gem transcript som nummereret Q&A markdown

**Eksempler på gode vs. dårlige spørgsmål:**

Gode:
- "Hvad sker der når X fejler? Skal vi retry, logge, eller vise til brugeren?"
- "Er der eksisterende patterns i codebasen for Y vi skal følge?"
- "Hvad er forventet skala — snesevis, tusinder, eller millioner af Z?"

Dårlige:
- "Noget andet?"
- "Er det alt?"
- "Har du andre krav?"

**Output format:**
```markdown
# Interview Transcript — [Plan Name]
**Date:** 2026-02-24
**Rounds:** 3

## Q1: [Spørgsmål]
**Svar:** [Brugerens svar]

## Q2: [Spørgsmål]
**Svar:** [Brugerens svar]
...
```

**Integration i CPM:**
- Web UI: Chat-lignende interface i Plan creation flow
- CLI: Interaktiv terminal Q&A via `cpm generate --interview`
- Gem transcript i `@cpm/db` som tilknyttet artefakt til planen

**Filer der skal oprettes:**
```
packages/shared/services/interview.mjs         # Interview engine
packages/shared/templates/interview-system.md   # System prompt template
packages/web/src/components/interview/          # React interview UI
packages/web/src/components/interview/chat.tsx  # Chat-style Q&A
packages/web/src/components/interview/summary.tsx
```

---

### Feature 3: Plan Writing med Code Budget

**Hvad:** Regler for at generere implementeringsplaner der er prose-dokumenter, ikke kode-dumps. Defineret "code budget" der kun tillader type definitions, function signatures, API contracts og directory structures.

**Hvorfor:** Pierce fandt at LLM'er instinktivt skriver kode når de ser feature requests, og producerer 25k+ token "planer" der i virkeligheden er implementations. Det spilder context og gør dårligere output.

**Hvor i CPM:** Integreres i Prompt Contract generation systemet og Plan Management (v5).

**Code Budget regler (fra deep-plan's plan-writing.md):**

Tilladt i planer:
- Type/interface definitions (fields only, ingen methods)
- Function signatures med docstrings
- API contracts (endpoint paths, request/response shapes)
- Directory structure (tree format)
- Configuration keys (ikke fulde config filer)

IKKE tilladt i planer:
- Full function/method bodies
- Complete test implementations
- Import statements
- Error handling kode
- Validation logik
- Database queries
- API response handling

**Implementation:**
Tilføj code budget instruktioner til plan-generation system prompt i `@cpm/shared/services/`. Når CPM genererer en plan, skal system prompten eksplicit forbyde kode-implementationer og opfordre til prose med begrænsede code stubs.

**Fil der skal oprettes/ændres:**
```
packages/shared/templates/plan-generation-system.md  # System prompt med code budget regler
packages/shared/services/plan-generator.mjs          # Plan generation service
```

---

### Feature 4: Context Check Pattern

**Hvad:** Automatisk estimering af context-brug med bruger-prompt om compaction inden tunge operationer.

**Hvorfor:** Pierce oplevede at context overflow midt i pipeline-steps er den primære fejlkilde. Proaktive context checks reducerer dette dramatisk.

**Hvor i CPM:** `@cpm/runner` — integreres i Ralph Wiggum Loop som checkpoint-mekanisme.

**Design (inspireret af deep-plan's check-context-decision.py):**

```javascript
// @cpm/runner/src/context-check.mjs

/**
 * Estimer context-brug baseret på genererede artefakter.
 * Returnerer anbefaling om compaction.
 */
export function checkContextHealth(planningDir) {
  // 1. Tæl tokens i alle genererede filer (plan, research, interview, etc.)
  // 2. Estimér akkumuleret context fra conversation
  // 3. Beregn headroom til næste operation
  // 4. Returnér decision: continue | compact_recommended | compact_required
}
```

**Output:**
```javascript
{
  totalArtifactTokens: 15000,
  estimatedConversationTokens: 45000,
  estimatedTotal: 60000,
  maxContext: 200000,
  headroomPercent: 70,
  upcomingOperation: "External LLM Review",
  estimatedOperationCost: 20000,
  recommendation: "continue" // | "compact_recommended" | "compact_required"
}
```

**Integration i CPM:**
- Runner: Automatisk check mellem pipeline steps
- Web UI: Context health indicator i runner dashboard
- CLI: Vis context status under `cpm status`

**Filer der skal oprettes:**
```
packages/runner/src/context-check.mjs     # Context estimation logic
packages/shared/utils/token-counter.mjs   # Simple token counter (tiktoken-lite eller char-based)
```

---

### Feature 5: Section Splitting med Batch Parallelisme

**Hvad:** Opdel en plan i self-contained "sections" (= Prompt Contracts) og eksekver dem i batches med kontrolleret parallelisme.

**Hvorfor:** Pierce validerede at section splitting + batch execution giver bedre resultater end sekventiel single-file processing. Hver section er self-contained og kan implementeres isoleret.

**Hvor i CPM:** `@cpm/runner` — udvider den eksisterende Ralph Wiggum Loop med batch-awareness.

**Section requirements (fra deep-plan):**
- Hver section SKAL være completly self-contained
- En implementer skal kunne læse KUN den section og starte implementering
- Tests FØRST (fra TDD plan), derefter implementation details
- Alle nødvendige file paths, dependencies, og baggrundskontekst inkluderet
- Cross-section dependencies markeret som reference, ikke duplikeret

**Batch execution model:**
```
Batch 1 (parallel):
  ├── section-01-setup     ─┐
  ├── section-02-schema    ─┼── alle kører samtidigt
  └── section-03-types     ─┘

Batch 2 (parallel, venter på batch 1):
  ├── section-04-api       ─┐
  └── section-05-services  ─┘

Batch 3 (sekventiel, venter på batch 2):
  └── section-06-integration
```

**Per-section execution loop (fra deep-plan billede 1):**
1. Read Section
2. Write Tests (expect failures)
3. Implement
4. Run Tests (expect passes)
5. Code Review (adversarial self-review af diff)
6. Apply Fixes
7. Commit
8. Compact Context → Next Section

**Integration i CPM:**
- Plan Management: UI til at se/redigere sections efter splitting
- Runner: Batch-aware execution i `autonomous-loop.mjs`
- CLI: `cpm run <plan-id> --sections` kører hele plan'en section-by-section

**Filer der skal oprettes/ændres:**
```
packages/shared/services/plan-splitter.mjs       # Split plan → sections
packages/runner/src/batch-executor.mjs            # Batch-aware execution
packages/runner/src/section-runner.mjs            # Per-section TDD loop
packages/shared/templates/section-template.md     # Section file format
packages/shared/templates/tdd-transform-system.md # TDD transformation prompt
```

---

### Feature 6: State Recovery via Filesystem

**Hvad:** Pipeline state management med JSON config fil + filesystem checkpoints der muliggør recovery fra crashes, compaction, og session-genstart.

**Hvorfor:** Pierce's vigtigste lesson learned: "Your plugin should be recoverable." Uden recovery mister brugeren alt arbejde ved context overflow.

**Hvor i CPM:** `@cpm/runner` — formaliserer den eksisterende Task-baserede persistens.

**State model (inspireret af deep-plan's deep_plan_config.json):**

```javascript
// .cpm/pipeline-state.json (i project dir)
{
  "pipelineId": "uuid",
  "planId": "cpm-plan-id",
  "startedAt": "2026-02-24T10:00:00Z",
  "currentStep": "external_review",
  "completedSteps": [
    "research_codebase",
    "research_web",
    "interview",
    "synthesize_spec",
    "generate_plan"
  ],
  "artifacts": {
    "research": ".cpm/artifacts/research.md",
    "interview": ".cpm/artifacts/interview.md",
    "spec": ".cpm/artifacts/spec.md",
    "plan": ".cpm/artifacts/plan.md",
    "reviews": {
      "gemini": ".cpm/artifacts/reviews/gemini.md",
      "openai": ".cpm/artifacts/reviews/openai.md"
    },
    "tddPlan": null,
    "sections": []
  },
  "config": {
    "reviewMode": "external_llm",
    "autonomyLevel": "supervised",
    "maxIterations": 10
  }
}
```

**Recovery logic:**
1. Ved pipeline-start: check om `.cpm/pipeline-state.json` eksisterer
2. Hvis ja: læs `currentStep`, spring til næste ufærdige step
3. Hvis nej: start fra scratch, opret state file
4. Ved hvert step completion: opdater state file + gem artefakt til disk
5. Ved crash/compaction: genstart læser state og fortsætter

**Filer der skal oprettes:**
```
packages/runner/src/pipeline-state.mjs     # State management
packages/runner/src/pipeline-recovery.mjs  # Recovery logic
```

---

## Del 3: Implementeringsrækkefølge

### Fase 1: Foundation Services (kan implementeres NU, uafhængigt af version)

| # | Feature | Package | Effort | Dependency |
|---|---------|---------|--------|------------|
| 1 | LLM Client abstraction (Gemini + OpenAI) | `@cpm/shared` | 1 dag | Ingen |
| 2 | Token counter utility | `@cpm/shared` | 0.5 dag | Ingen |
| 3 | Interview engine service | `@cpm/shared` | 1 dag | Ingen |
| 4 | Plan generation med code budget | `@cpm/shared` | 1 dag | Ingen |
| 5 | Multi-LLM review service | `@cpm/shared` | 1 dag | #1 |
| 6 | Pipeline state management | `@cpm/runner` | 1 dag | Ingen |

### Fase 2: Pipeline Integration (kræver v1 base)

| # | Feature | Package | Effort | Dependency |
|---|---------|---------|--------|------------|
| 7 | Context check i runner loop | `@cpm/runner` | 0.5 dag | #2, #6 |
| 8 | Plan splitter service | `@cpm/shared` | 1 dag | #4 |
| 9 | TDD transformation service | `@cpm/shared` | 1 dag | #4 |
| 10 | Section runner (per-section TDD loop) | `@cpm/runner` | 2 dage | #6, #8, #9 |

### Fase 3: UI & CLI Integration (kræver v1 web + cli)

| # | Feature | Package | Effort | Dependency |
|---|---------|---------|--------|------------|
| 11 | `cpm review <plan-id>` CLI command | `@cpm/cli` | 0.5 dag | #5 |
| 12 | Interview chat UI component | `@cpm/web` | 1 dag | #3 |
| 13 | Plan review UI (vis reviews + integration notes) | `@cpm/web` | 1 dag | #5 |
| 14 | Section viewer/editor UI | `@cpm/web` | 1 dag | #8 |
| 15 | Pipeline status dashboard | `@cpm/web` | 1 dag | #6 |

### Fase 4: Batch Execution (kræver v4 runner)

| # | Feature | Package | Effort | Dependency |
|---|---------|---------|--------|------------|
| 16 | Batch executor med parallelisme | `@cpm/runner` | 2 dage | #10 |
| 17 | `cpm run <plan-id> --pipeline` (full pipeline) | `@cpm/cli` | 1 dag | #16 |

**Total estimat: ~16 dage udvikling**

---

## Del 4: Prompt Contract Templates til CC Implementation

### Template 1: LLM Client Abstraction

```markdown
## GOAL
Implementér LLM client abstraction layer i @cpm/shared/services/llm-clients/
der understøtter Gemini og OpenAI med et unified interface.

## CONSTRAINTS
- ES modules med import statements
- API keys læses via DotEnv fra .env.local
- GEMINI_API_KEY og OPENAI_API_KEY environment variables
- Brug native fetch() — ingen axios eller andre HTTP libs
- Gemini endpoint: https://generativelanguage.googleapis.com/v1beta/models/
- OpenAI endpoint: https://api.openai.com/v1/chat/completions
- Returnér altid { success, model, content, tokensUsed, error }
- Kør tilgængelige providers parallelt via Promise.allSettled
- Graceful degradation: hvis én provider fejler, returner den anden
- Node.js 20+, ingen TypeScript compile step i shared package

## FORMAT
Filer:
- packages/shared/services/llm-clients/index.mjs (re-exports)
- packages/shared/services/llm-clients/gemini.mjs
- packages/shared/services/llm-clients/openai.mjs
- packages/shared/services/llm-clients/types.mjs (JSDoc typedefs)

Hvert client eksporterer:
  - async function review(content, systemPrompt, options)
  - function isConfigured() — check om API key er sat
  - const PROVIDER_NAME
  - const DEFAULT_MODEL

## FAILURE CONDITIONS
- Hardcoded API keys (skal komme fra env)
- CommonJS require() statements
- Manglende error handling på API kald
- Manglende timeout (default 60s)
- Console.log i production kode (brug structured return)
```

### Template 2: Multi-LLM Review Service

```markdown
## GOAL
Implementér multi-LLM review service i @cpm/shared/services/llm-review.mjs
der sender en plan til tilgængelige LLM providers for uafhængig kvalitetsreview.

## CONSTRAINTS
- Importér fra ./llm-clients/index.mjs
- Detect tilgængelige providers via isConfigured()
- Kør tilgængelige providers parallelt
- Review prompt fokuserer på: edge cases, security, performance, arkitektur-fejl
- Output gemmes som markdown filer i reviews/ subdir
- Returnér structured result med alle reviews + metadata
- Håndtér at 0, 1, eller 2 providers er tilgængelige
- Hvis ingen providers: returnér error med besked om at konfigurere API keys
- ES modules, DotEnv, Node.js 20+

## FORMAT
Fil: packages/shared/services/llm-review.mjs

Eksporterer:
  - async function reviewPlan(planContent, options)
    options: { outputDir, providers, systemPrompt }
    returns: { reviews: {}, filesWritten: [], availableProviders: [] }
  - async function getAvailableProviders()

## FAILURE CONDITIONS
- Sekventiel execution af providers (skal være parallel)
- Crash hvis én provider fejler (skal bruge Promise.allSettled)
- Manglende metadata i output (model, timestamp, token count)
- Review prompt der beder om at REWRITE planen (skal kun ANALYSERE)
```

### Template 3: Interview Engine

```markdown
## GOAL
Implementér interview engine i @cpm/shared/services/interview.mjs
der genererer kontekst-bevidste spørgsmål baseret på en spec og optional research.

## CONSTRAINTS
- Input: spec content (string) + optional research content (string)
- Output: array af spørgsmål grupperet i runder (2-4 per runde)
- Spørgsmål skal være åbne (ikke ja/nej)
- Skip spørgsmål der allerede er besvaret i spec/research
- Interview system prompt inkluderer: "Du er en senior arkitekt ansvarlig for denne implementation"
- Transcript gemmes som nummereret Q&A markdown
- Engine er stateless — caller (web UI eller CLI) håndterer user interaction loop
- ES modules, Node.js 20+

## FORMAT
Fil: packages/shared/services/interview.mjs

Eksporterer:
  - async function generateQuestions(specContent, options)
    options: { researchContent, previousAnswers, maxQuestionsPerRound, language }
    returns: { questions: [{ id, question, context }], round: number }
  - function formatTranscript(questionsAndAnswers)
    returns: string (markdown format)
  - function shouldStopInterviewing(answers)
    returns: boolean (true hvis de fleste svar er "ved ikke" / "op til dig")

Støttefil: packages/shared/templates/interview-system.md

## FAILURE CONDITIONS
- Ja/nej spørgsmål i output
- Spørgsmål der allerede er besvaret i spec
- Mere end 4 spørgsmål per runde
- Manglende context/rationale for hvert spørgsmål
- Vage spørgsmål som "Noget andet?" eller "Er det alt?"
```

### Template 4: Pipeline State Manager

```markdown
## GOAL
Implementér pipeline state management i @cpm/runner/src/pipeline-state.mjs
der tracker pipeline progress og muliggør recovery fra crashes.

## CONSTRAINTS
- State gemmes som JSON fil i project dir: .cpm/pipeline-state.json
- Atomic writes (skriv til temp fil, rename)
- State inkluderer: currentStep, completedSteps, artifacts paths, config
- Recovery: ved start, check om state fil eksisterer og resum fra currentStep
- Hvert step completion opdaterer state filen
- Artifacts gemmes i .cpm/artifacts/ subdirectory
- Pipeline steps er en ordered enum/array
- ES modules, Node.js 20+
- Brug node:fs/promises for fil operations

## FORMAT
Fil: packages/runner/src/pipeline-state.mjs

Eksporterer:
  - class PipelineState
    - static async load(projectDir) — load eller create
    - async save() — atomic write
    - markStepComplete(stepName, artifacts)
    - setCurrentStep(stepName)
    - getNextStep() — baseret på completedSteps
    - isStepComplete(stepName)
    - getArtifactPath(name)
    - toJSON()

Pipeline steps enum:
  RESEARCH_CODEBASE, RESEARCH_WEB, INTERVIEW, SYNTHESIZE_SPEC,
  GENERATE_PLAN, EXTERNAL_REVIEW, INTEGRATE_FEEDBACK,
  TDD_TRANSFORM, SECTION_SPLIT, EXECUTE_SECTIONS, COMPLETE

## FAILURE CONDITIONS
- Non-atomic writes (data corruption ved crash)
- State fil uden version field (breaking changes over tid)
- Manglende validation af step transitions
- Recovery der springer steps over i stedet for at genoptage
```

---

## Del 5: Hvad Vi Bevidst IKKE Adopterer

| deep-plan Feature | Hvorfor vi skipper den |
|---|---|
| Claude Code plugin system (SKILL.md, /plugin marketplace) | Vi bygger vores egen platform med web UI + CLI |
| Python scripts (uv, pyproject.toml) | CPM er JavaScript/Node.js monorepo |
| TODO list som ephemeral state | Vi bruger cc's native Tasks + pipeline-state.json |
| SubagentStop hooks | Vi kontrollerer execution direkte via @cpm/runner |
| `AskUserQuestion` tool afhængighed | Vi har vores eget interview UI i web + CLI |
| Session ID capture hook | Irrelevant — CPM manager sine egne session IDs |

---

## Del 6: Opsummering

### Kerneerkendelse

Pierce har manuelt valideret CPM's komplette pipeline-thesis med 100+ timer af real-world brug. Hans `/deep-plan → /deep-implement` trilogy er i praksis CPM's Stage 1-4 implementeret som Claude Code plugins. Vi bygger det som en platform.

### De 6 features vi adopterer

1. **Multi-LLM Review** — billig kvalitetsløftning via Gemini + ChatGPT
2. **Interview Protocol** — formaliseret Q&A der finder edge cases
3. **Code Budget** — planer er prose, ikke kode-dumps
4. **Context Checks** — proaktiv context management i pipeline
5. **Section Splitting + Batch Execution** — kontrolleret parallelisme
6. **State Recovery** — filesystem-baseret pipeline persistens

### Næste skridt

1. Start med Fase 1 (Foundation Services) — kan bygges uafhængigt af CPM version
2. Brug Prompt Contract Templates (Del 4) som CC specs
3. Integrer i v1 web/CLI når base er klar
4. Batch execution venter til v4 runner er stabil
