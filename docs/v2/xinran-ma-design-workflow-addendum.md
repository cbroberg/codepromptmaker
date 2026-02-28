# Addendum: AI Design Workflow Patterns (Xinran Ma)

> **Kilde:** [Xinran Ma podcast — "How to Design with AI"](https://www.news.aakashg.com/p/xinran-ma-podcast) (Aakash Gupta's Product Growth, 21. feb 2026)
>
> **Formål:** Indarbejde relevante design- og workflow-patterns fra Xinran Ma's AI design methodology i CPM's eksisterende spec-dokumenter. Ingen ny fase — alle tilføjelser passer ind i eksisterende versioner.
>
> **Oprindelse:** Planlægningssession mellem Christian (CEO, WebHouse ApS) og Claude, 22. feb 2026.

---

## Overblik: Hvad vi tager med

| Idé fra Xinran Ma | CPM-placering | Version | Effort |
|---|---|---|---|
| Creativity/divergence parameter | Prompt Contract schema | v3 (nu) | ~1 time |
| Opinionated defaults (skip auth flows) | Prompt generation logic | v3 (nu) | ~30 min |
| Validate Contract / Dry Run | Prompt Quality Evaluator | v5.1 | Allerede planlagt — beriges |
| Multi-tool target support | Connector Architecture | v5.0 | Allerede planlagt — beriges |
| Fire-lags Quality Gate | Prompt Quality Evaluator | v5.1 | Allerede planlagt — beriges |
| Structured interrogation pattern | Interview Module | v6 | Allerede planlagt — beriges |
| Markdown spec som mellemformat | Validering af Prompt Contracts | Alle | Konceptuel bekræftelse |

---

## 1. Tilføjelser til v3 SaaS (implementér nu)

### 1.1 Creativity Parameter på Prompt Contract Schema

**Inspiration:** Google Stitch har en "creative range slider" fra refined til YOLO. Forskellige opgaver kræver forskellig grad af frihed i outputtet.

**Tilføjelse til `prompts`-tabellen:**

```sql
ALTER TABLE prompts ADD COLUMN creativity TEXT DEFAULT 'balanced'
  CHECK(creativity IN ('precise', 'balanced', 'exploratory', 'yolo'));
```

**Drizzle schema:**

```typescript
creativity: text('creativity', { 
  enum: ['precise', 'balanced', 'exploratory', 'yolo'] 
}).default('balanced'),
```

**Effekt på Prompt Contract generation:**

| Niveau | CONSTRAINTS-effekt | FAILURE CONDITIONS-effekt |
|---|---|---|
| `precise` | Stramt formuleret, ingen afvigelser tilladt | Omfattende, detaljerede failure conditions |
| `balanced` | Standard CPM-opførsel (default) | Standard failure conditions |
| `exploratory` | Blødere constraints med "prefer X but consider alternatives" | Reducerede failure conditions, fokus på kernekrav |
| `yolo` | Minimale constraints, kun sikkerhedskritiske regler | Kun kritiske failure conditions (data loss, security) |

**UI:** Dropdown eller slider på prompt creation-siden, default `balanced`.

**CLI:**
```bash
cpm generate "Tilføj payment system" --creativity exploratory
```

**Prompt builder ændring i `@cpm/shared`:**

```typescript
// I buildPromptContract():
function getConstraintStrictness(creativity: CreativityLevel): string {
  switch (creativity) {
    case 'precise':
      return 'Follow these constraints exactly. No deviations.';
    case 'balanced':
      return 'Follow these constraints. Minor adaptations OK if justified.';
    case 'exploratory':
      return 'Use these as guidelines. Explore alternatives if they better serve the goal.';
    case 'yolo':
      return 'Core safety rules apply. Otherwise, experiment freely and surprise me.';
  }
}
```

### 1.2 Opinionated Defaults i Prompt Generation

**Inspiration:** Xinrans Custom GPT er programmeret til *aldrig* at foreslå login/signup som et key flow. Begrundelse: auth løser ikke brugerens kerneproblem. Det er standard overalt. Hvis du designer kerneoplevelsen først, bliver auth trivielt at tilføje bagefter.

**Tilføjelse til Prompt Contract generation system prompt:**

```typescript
const OPINIONATED_DEFAULTS = `
## Opinionated Defaults (altid aktive)

Når du genererer Prompt Contracts, følg disse principper:

1. SKIP AUTH FLOWS: Foreslå aldrig login, signup eller authentication som 
   en del af kerneopgaven medmindre brugeren eksplicit beder om det. 
   Auth er en commodity — fokusér på det der gør produktet unikt.

2. CORE EXPERIENCE FIRST: Prioritér altid den brugervendte kerneoplevelse 
   over infrastruktur. Brugeren kan altid tilføje auth, logging og 
   boilerplate bagefter.

3. TESTABLE FIRST OUTPUT: Den første ting brugeren ser efter cc-kørsel 
   skal være noget de kan interagere med — ikke en tom side med en 
   login-form.

4. SKIP BOILERPLATE SUGGESTIONS: Foreslå ikke "add error handling" eller 
   "add loading states" som separate opgaver — de bør være baked into 
   enhver Prompt Contract automatisk via FAILURE CONDITIONS.
`;
```

**Placering:** Tilføjes som en del af system prompt i `@cpm/shared/services/prompt-builder.ts`.

---

## 2. Berigelse af v5 — Prompt Quality Evaluator (§4.9)

### 2.1 Fire-lags Quality Gate Model

**Inspiration:** Xinran evaluerer AI-genereret output på fire lag. De fleste stopper efter lag 1.

**Tilføj til v5 §4.9 — Prompt Quality Evaluator:**

Evaluatoren scorer Prompt Contracts mod fire kvalitetslag, inspireret af Xinran Ma's AI Design Quality Framework:

#### Lag 1 — Strukturel Kvalitet (svarende til "Visual Representation")
- Har contracten alle fire sektioner (GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS)?
- Er GOAL specifikt og testbart med "Success = ..." metrik?
- Er CONSTRAINTS populeret fra Developer Profile?
- Er FAILURE CONDITIONS konkrete og verificerbare?
- Score: 0-25 point

#### Lag 2 — Problem-løsning (svarende til "Problem Solving")
- Adresserer contracten det faktiske brugerproblem (ikke boilerplate)?
- Er kerneoplevelsen i fokus (ikke auth/login)?
- Kan succeskriteriet verificeres på under 60 sekunder?
- Er scope realistisk for én cc-session?
- Score: 0-25 point

#### Lag 3 — Best Practice Compliance (svarende til "Design Principles")
- Følger contracten stack-krav fra Developer Profile?
- Er der eksplicitte accessibility/i18n krav hvor relevant?
- Er error handling og loading states dækket i FAILURE CONDITIONS?
- Følger FORMAT-sektionen projektets eksisterende filstruktur?
- Score: 0-25 point

#### Lag 4 — Implementation Feasibility (svarende til "Implementation Feasibility")
- Kan cc realistisk implementere dette inden for context window?
- Er der afhængigheder der kræver forudgående setup?
- Er der API-nøgler eller tjenester der skal konfigureres først?
- Er estimeret token-forbrug inden for rimelige grænser?
- Score: 0-25 point

**Total score: 0-100**
- 80-100: ✅ Klar til kørsel
- 60-79: ⚠️ Gennemgå forbedringsforslag
- 0-59: ❌ Omskriv anbefalet

### 2.2 Validate Contract / Dry Run

**Inspiration:** Xinran bruger Claude som "mock run" — paste spec, se om outputtet giver mening, ret spec'en inden han bruger Lovable-credits. Sparer tokens og fanger fejl tidligt.

**Tilføj til v5 §4.9:**

**"Validate Contract" trin:**
1. Bruger klikker "Validate" (eller `cpm validate <id>`)
2. CPM kører contracten mod Quality Gate (fire lag, se ovenfor)
3. Hvis score < 80: vis forbedringsforslag inline
4. Valgfri "Mock Run": send contracten til Claude med prefix `"Don't implement this. Instead, describe what you WOULD do step by step. List the files you'd create, the order of operations, and any clarifying questions you'd need answered."` — returnerer en preview af executionsplanen
5. Bruger reviewer mock-output og justerer contracten
6. Først derefter kører den rigtige cc-session

**CLI:**
```bash
cpm validate <id>                    # Kør Quality Gate scoring
cpm validate <id> --mock             # Quality Gate + Mock Run preview
cpm run <id> --dir ~/projects/myapp  # Rigtig kørsel (uændret)
```

**Web UI:**
- "Validate" knap ved siden af "Copy" og "Run" på prompt detail page
- Viser Quality Gate score med breakdown per lag
- "Mock Run" toggle der tilføjer preview-step

---

## 3. Berigelse af v5 — Connector Architecture (§4.3)

### 3.1 Multi-tool Target Support

**Inspiration:** Xinrans workflow bruger forskellige tools til forskellige formål: Custom GPT til klarhed, Claude til mock, Lovable til prototype, Cursor til full-stack. Samme spec, forskellige targets.

**Tilføj til v5 §4.3 — Connector Architecture:**

Hver Prompt Contract kan have et `target` felt der bestemmer hvilken connector den er optimeret til:

```typescript
type ConnectorTarget = 
  | 'claude-code'      // Default — cc terminal session
  | 'claude-chat'      // Claude.ai chat (mock run, ideation)
  | 'lovable'          // Lovable.dev prototype generation
  | 'v0'               // Vercel v0 component generation
  | 'cursor'           // Cursor IDE full-stack
  | 'custom';          // User-defined connector

interface PromptContract {
  // ... eksisterende felter
  target: ConnectorTarget;
  creativity: CreativityLevel;
}
```

**Export-formater per connector:**

| Target | Export-format | Tilpasning |
|---|---|---|
| `claude-code` | Standard Prompt Contract (GOAL/CONSTRAINTS/FORMAT/FAILURE) | Default, uændret |
| `claude-chat` | Forkortet version uden CLAUDE.md handshake, mere konversationel | Til mock run / ideation |
| `lovable` | Markdown spec fokuseret på UI screens, komponenter, interaktioner | Stripper backend-detaljer |
| `v0` | Komponent-fokuseret spec med Tailwind/shadcn constraints | Single-component focus |
| `cursor` | Full-stack spec med filstruktur og database schema | Inkluderer backend |

**CLI:**
```bash
cpm generate "Dashboard med real-time data" --target lovable
cpm export <id> --target v0    # Re-formattér eksisterende contract til v0-format
```

---

## 4. Berigelse af v6 — Interview Module

### 4.1 Structured Interrogation Pattern

**Inspiration:** Xinrans Custom GPT stiller en sekvens af fokuserede spørgsmål *før* den genererer nogen spec. Spørgsmålene tvinger brugeren til at definere: hvem, hvad, hvilken platform, hvilke key flows. Og den er programmeret til aldrig at foreslå login/signup.

**Tilføj til v6 — Interview → Plan generation (§8, system prompt):**

Opdatér `INTERVIEW_TO_PLAN_SYSTEM_PROMPT` med structured extraction:

```typescript
const INTERVIEW_TO_PLAN_SYSTEM_PROMPT = `
Du er en erfaren software arkitekt og product manager.
Du får en transskription af et kundeinterview eller stakeholder-møde på dansk.
Din opgave er at konvertere dette til en struktureret udviklingsplan i markdown-format.

## Extraction Framework (Xinran Ma-inspireret)

Før du skriver planen, identificér disse fem elementer fra transskriptionen:

1. **TARGET USER**: Hvem er den primære bruger? (rolle, kontekst, teknisk niveau)
2. **CORE NEED**: Hvad er det ene kerneproblem der skal løses? (ikke features, men behovet bag)
3. **PLATFORM**: Hvilken platform/kontekst? (web, mobil, CLI, API, intern tool)
4. **KEY FLOWS**: Hvad er de 3-5 vigtigste brugerflows? 
   ⚠️ ALDRIG inkludér login/signup/auth som et key flow.
   Auth er en commodity — fokusér på det der gør produktet unikt.
5. **SUCCESS METRIC**: Hvordan ved vi om det virker? (målbar indikator)

Hvis et element ikke fremgår tydeligt af transskriptionen, markér det med 
"⚠️ MANGLER — afklares med stakeholder" i stedet for at gætte.

## Output-struktur

Planen skal indeholde:
1. **Baggrund og kontekst** — hvad er projektet/problemet
2. **Target User** — identificeret fra interview (element 1)
3. **Kernebehov** — det ene vigtigste problem (element 2)
4. **Key Flows** — prioriteret liste (element 4), aldrig auth-first
5. **Identificerede features** — udledt fra flows
6. **Tekniske overvejelser** — platform, stack, integrationer
7. **Success Metric** — målbar indikator (element 5)
8. **Åbne spørgsmål** — alt markeret med ⚠️ MANGLER
9. **Næste skridt** — konkrete handlinger

Brug markdown med overskrifter. Vær konkret og præcis. Undgå vage formuleringer.
Planen skal kunne bruges direkte som input til Prompt Contract-generering i CPM.
`;
```

### 4.2 Interactive Interview Mode (fremtidig udvidelse)

**Inspiration:** Xinrans Custom GPT er *interaktiv* — den stiller spørgsmål én ad gangen og venter på svar. CPM's v6 Interview Module er primært passiv (optag → transkribér → plan). Men der er plads til en aktiv mode.

**Fremtidig feature (v6.1):**

"Guided Interview" mode hvor CPM fungerer som interviewer:

1. Brugeren starter en "Guided Interview" session
2. CPM stiller det første spørgsmål: "Hvad er det primære problem du vil løse?"
3. Brugeren svarer (tekst eller voice)
4. CPM stiller opfølgende spørgsmål baseret på Xinran-frameworket
5. Efter 5-8 spørgsmål genererer CPM automatisk en Plan

Spørgsmålssekvens:
```
1. "Hvad er produktets hovedformål?" → TARGET NEED
2. "Hvem er den primære bruger?" → TARGET USER  
3. "Hvilken platform?" → PLATFORM
4. "Beskriv den vigtigste ting brugeren skal kunne gøre" → KEY FLOW #1
5. "Hvad er den næstvigtigste?" → KEY FLOW #2
6. "Er der tekniske krav eller begrænsninger?" → CONSTRAINTS
7. "Hvordan måler du succes?" → SUCCESS METRIC
8. "Noget jeg ikke har spurgt om der er vigtigt?" → OPEN QUESTIONS
```

**Note:** Dette er en fremtidig udvidelse og kræver ikke ændringer i v6 MVP. Inkluderet her som design-note til fremtidig iteration.

---

## 5. Meta-indsigter og markedsvalidering

### 5.1 Xinrans workflow bekræfter CPM's arkitektur

Xinrans manuelle workflow er:
```
Custom GPT (klarhed) → Claude (mock/validate) → Lovable (prototype) → Iterate
```

CPM's pipeline er:
```
Interview/Input (klarhed) → Prompt Contract (spec) → Validate → cc/Connector (execution) → Quality Gate
```

Det er den *samme* staged pipeline — men CPM automatiserer den. Xinran gør det manuelt med 4-5 tools og copy-paste. CPM er orkestreringslaget der binder det sammen.

### 5.2 "Markdown spec som mellemformat" = Prompt Contracts

Xinran genererer en "lightweight spec in markdown — not a full PRD, just enough to define the front-end screens, components, and interactions." Det er *bogstaveligt talt* hvad CPM's Prompt Contracts er. 

Artiklen validerer at markedet bevæger sig præcis den retning CPM sigter mod — fra "prompt and pray" til strukturerede, staged workflows.

### 5.3 Positionering vs. Xinrans tool-stack

| Tool i Xinrans stack | CPM-ækvivalent | CPM's fordel |
|---|---|---|
| Custom GPT (spørgsmål → spec) | Interview Module + Plan generation | Integreret i pipeline, voice-support |
| Claude chat (mock run) | Validate Contract / Dry Run | Automatiseret Quality Gate |
| Lovable/v0/Cursor (prototype) | Connector Architecture | Én contract, multiple targets |
| Manuel iteration | Creativity parameter | Systematiseret divergens |
| Manuelt copy-paste mellem tools | CPM pipeline | Automatisk handoff |

**USP:** Xinran demonstrerer det manuelt. CPM automatiserer det.

---

## 6. Implementation Checklist

### Fase 1 — Nu (v3 SaaS, delvist implementeret)

- [ ] Tilføj `creativity` kolonne til `prompts` schema (migration)
- [ ] Tilføj creativity dropdown til prompt creation UI
- [ ] Tilføj `--creativity` flag til `cpm generate` CLI
- [ ] Opdatér `buildPromptContract()` i `@cpm/shared` med creativity-logik
- [ ] Tilføj opinionated defaults til prompt generation system prompt
- [ ] Test at auth-flows *ikke* foreslås som default i genererede contracts

### Fase 2 — v5.1 (allerede planlagt)

- [ ] Implementér fire-lags Quality Gate scorer
- [ ] Tilføj "Validate" knap til prompt detail page
- [ ] Implementér Mock Run preview funktion
- [ ] Tilføj `cpm validate` CLI kommando
- [ ] Tilføj `target` felt til Prompt Contract schema
- [ ] Implementér export-formattering per connector target
- [ ] Tilføj `--target` flag til `cpm generate` og `cpm export`

### Fase 3 — v6 (allerede planlagt)

- [ ] Opdatér `INTERVIEW_TO_PLAN_SYSTEM_PROMPT` med Xinran-extraction framework
- [ ] Tilføj "⚠️ MANGLER" markering for manglende elementer
- [ ] Sikr at genererede planer aldrig har auth som key flow
- [ ] Design-note: Guided Interview mode til v6.1

---

## 7. Kilder og references

- **Artikel:** [How to Design with AI — The Complete Guide for PMs with Xinran Ma](https://www.news.aakashg.com/p/xinran-ma-podcast)
- **Xinran Ma's newsletter:** [Design with AI](https://designwithai.substack.com/)
- **Tools nævnt:** Google Stitch, Google AI Studio, Lovable, v0, Magic Patterns, Cursor
- **Nøglekoncept:** Staged pipeline med structured handoffs, creativity parameter, opinionated defaults, four-layer quality evaluation
