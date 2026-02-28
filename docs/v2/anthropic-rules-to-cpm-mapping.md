# Anthropic's Workflow Orchestration Regler → CPM Feature Mapping

> **Formål:** Systematisk mapping af Anthropics egne CLAUDE.md best practices til CPM's arkitektur og roadmap.
> **Kilde:** Anthropics officielle Workflow Orchestration, Task Management og Core Principles guidelines (screenshot fra februar 2026).
> **Mapping til:** CodePromptMaker (CPM) v1–v9.1 af WebHouse ApS

---

## Kontekst

Anthropic har publiceret et sæt officielle regler for hvordan Claude Code bør orkestrere arbejde i komplekse projekter. Disse regler er designet til at blive inkluderet i en `CLAUDE.md`-fil og styrer CC's adfærd omkring planlægning, verifikation, læring og kodestandard.

Disse regler validerer CPM's kernepræmis: **Claude Code har brug for strukturerede instruktioner for at performe konsistent.** Anthropic siger selv "write detailed specs upfront to reduce ambiguity" — det er bogstaveligt talt CPM's raison d'être.

Men mapping'en afslører også **gaps** i CPM's nuværende arkitektur — funktionalitet som Anthropic anbefaler, men som CPM endnu ikke har formaliseret.

---

## Sektion 1: Workflow Orchestration

### Regel 1: Plan Mode Default

**Anthropics regel:**
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

**CPM-status:** ✅ Delvist dækket — men med gaps

**Eksisterende CPM-features:**
- Prompt Contract-frameworket (GOAL/CONSTRAINTS/FORMAT/FAILURE CONDITIONS) er i sin essens en formaliseret plan
- v5 Plan Management specificerer plans med checkbare items
- deep-plan-to-cpm-mapping.md beskriver section splitting + batch execution

**Gaps identificeret:**

1. **Re-plan trigger mangler.** CPM's Ralph Wiggum Loop genstarter sessions ved context overflow, men har ingen mekanisme til at detektere "something goes sideways" og trigge en re-plan. I dag kører loopet videre til max iterations eller COMPLETE-marker uanset om CC løber ind i fejl.

2. **Plan mode som default.** CPM genererer Prompt Contracts der instruerer CC i at planlægge — men det er op til CC at vælge plan mode. CPM bør eksplicit inkludere `/plan` mode instruktion i alle genererede contracts for non-trivielle tasks.

3. **Verification plans.** CPM's contracts fokuserer på implementation-planer. Anthropic anbefaler også plans specifikt for verifikation — altså en separat plan for "hvordan beviser vi at dette virker?"

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Tilføj `VERIFICATION PLAN` sektion til Prompt Contract-formatet | `@cpm/shared` prompt template | v1 patch | Lille |
| Inkludér eksplicit `/plan` mode instruktion i genererede contracts | `@cpm/shared` prompt generator | v1 patch | Lille |
| Re-plan detection i Ralph Wiggum Loop (error count threshold → re-plan) | `@cpm/runner` autonomous-loop | v4 | Medium |
| "Stop and re-plan" instruktion som standard FAILURE CONDITION | `@cpm/shared` prompt template | v1 patch | Lille |

**Foreslået Prompt Contract tilføjelse:**
```markdown
## VERIFICATION PLAN
[Specifik plan for at bevise at implementeringen virker]
1. [Test der skal køres og forventet output]
2. [Manuel verifikation brugeren kan udføre]
3. [Logs/output der skal checkes]

## FAILURE CONDITIONS
- ...eksisterende conditions...
- If implementation deviates significantly from plan: STOP, write updated plan to tasks/todo.md, and request re-review before continuing
```

---

### Regel 2: Subagent Strategy

**Anthropics regel:**
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

**CPM-status:** 🟡 Designet men ikke implementeret

**Eksisterende CPM-features:**
- Ralph Wiggum Loop er fundamentalt en single-agent sequential execution pattern
- v5 roadmap inkluderer Multi-Agent Orchestration (P4, v6+)
- Phil's lessons validerede sequential > parallel for solo devs

**Gaps identificeret:**

1. **Subagents for research er et quick win.** Selv uden fuld multi-agent orchestration kan CPM generere contracts der eksplicit instruerer CC i at bruge subagents til research-opgaver (dependency checking, API-dokumentation, codebase exploration).

2. **"One task per subagent" validerer section splitting.** Anthropic bekræfter at batched execution med isolerede tasks er den rigtige tilgang.

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Tilføj subagent-instruktioner til contracts for komplekse tasks | `@cpm/shared` prompt generator | v1 patch | Lille |
| Section splitting default for plans >5 tasks | `@cpm/shared` plan-splitter | v5 | Allerede spec'et |
| Research subagent template i Template Library | `@cpm/shared` templates | v5 | Lille |

**Foreslået Prompt Contract tilføjelse (for komplekse tasks):**
```markdown
## CONSTRAINTS
### Execution Strategy
- Use subagents (Task tool) for research and exploration tasks
- Keep main context focused on implementation
- One task per subagent — do not bundle unrelated work
```

---

### Regel 3: Self-Improvement Loop

**Anthropics regel:**
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

**CPM-status:** ❌ Ikke implementeret — **dette er en ny feature**

**Eksisterende CPM-features:**
- Session History (v5) tracker sessions men ikke læringer
- Knowledge Base (v5) er designet til genbrugelig kontekst men ikke specifikt fejl-læringer
- Developer Profile gemmer præferencer men ikke projektspecifikke lessons

**Gap-analyse:**

Dette er den mest markante gap mellem Anthropics regler og CPM's nuværende arkitektur. CPM mangler helt konceptet om **akkumuleret projektlæring** — en feedback-mekanik der gør fremtidige sessions bedre baseret på fortidige fejl.

**Ny CPM-feature: Project Lessons Engine**

```
Flowet:
1. CC laver en fejl i en session
2. Brugeren retter CC eller rapporterer dårligt resultat
3. CPM fanger læringen (manuelt eller via AI-klassificering)
4. Læringen gemmes i projektets lessons.md
5. Næste gang CPM genererer en Prompt Contract for samme projekt,
   injiceres relevante lessons i CONSTRAINTS-sektionen
6. Over tid akkumuleres en projektspecifik "anti-pattern database"
```

**Data model:**
```typescript
interface ProjectLesson {
  id: string;
  projectId: string;
  sessionId: string | null;          // Hvilken session affødte læringen
  trigger: 'user-correction' | 'failed-test' | 'manual' | 'ai-detected';
  pattern: string;                   // "CC overskriver eksisterende RLS policies"
  rule: string;                      // "ALDRIG slet eksisterende RLS policies — tilføj nye"
  category: 'code-pattern' | 'architecture' | 'testing' | 'deployment' | 'style';
  severity: 'critical' | 'important' | 'minor';
  occurrences: number;               // Hvor mange gange er denne fejl set
  lastSeen: Date;
  resolved: boolean;                 // Brugeren kan markere en lesson som løst
}
```

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| `tasks/lessons.md` instruktion i alle Prompt Contracts | `@cpm/shared` prompt template | v1 patch | Lille |
| Project Lessons data model + CRUD | `@cpm/db` schema | v5 | Medium |
| `cpm lesson add "pattern" --rule "regel"` CLI-kommando | `@cpm/cli` | v5 | Lille |
| Auto-inject relevante lessons i genererede contracts | `@cpm/shared` prompt generator | v5 | Medium |
| Lessons dashboard i web UI | `@cpm/web` | v5 | Medium |
| AI-drevet lesson detection fra session logs | `@cpm/shared` services | v5.2 | Stor |

**Foreslået Prompt Contract tilføjelse:**
```markdown
## CONSTRAINTS
### Project Lessons (auto-injiceret fra CPM)
- ALDRIG slet eksisterende RLS policies — tilføj nye ved siden af
- Brug altid `pnpm` ikke `npm` i dette projekt
- Migration-filer SKAL have prefix med sekventielt nummer (00016_xxx.sql)
[...relevante lessons for dette projekt...]

### Self-Improvement
- After ANY correction: update tasks/lessons.md with the pattern
- Format: `## [Category] \n - Pattern: [what went wrong] \n - Rule: [how to prevent it]`
- Review tasks/lessons.md at session start
```

---

### Regel 4: Verification Before Done

**Anthropics regel:**
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

**CPM-status:** 🟡 Delvist dækket via FAILURE CONDITIONS

**Eksisterende CPM-features:**
- FAILURE CONDITIONS-sektionen definerer anti-patterns
- GOAL-sektionen kræver testbar success metric ("Success = ...")
- Ralph Wiggum Loop checker for `.claude/COMPLETE` marker

**Gaps identificeret:**

1. **Ingen eksplicit verifikationskrav.** CPM's contracts siger hvad der skal bygges og hvad der er forkert — men mangler en eksplicit "bevis at det virker" sektion.

2. **"Staff engineer" quality gate.** Anthropic foreslår en mental model for kvalitetskontrol der er stærkere end CPM's nuværende approach. CPM bør inkludere dette som standard-instruktion.

3. **Diff-baseret verifikation.** CPM's Diff Viewer (v5.1) er spec'et men ikke koblet til Prompt Contracts. Contracts bør instruere CC i at producere en diff-summary.

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Tilføj `## VERIFICATION` sektion til Prompt Contract format | `@cpm/shared` prompt template | v1 patch | Lille |
| "Staff engineer" quality gate som standard instruktion | `@cpm/shared` prompt template | v1 patch | Lille |
| Diff summary instruktion i contracts | `@cpm/shared` prompt template | v1 patch | Lille |
| Verification automation i Ralph Wiggum Loop (run tests before COMPLETE) | `@cpm/runner` | v4 | Medium |

**Foreslået Prompt Contract tilføjelse:**
```markdown
## VERIFICATION
Before marking this task as complete:
1. Run all relevant tests and paste output
2. Diff your changes against main — review every changed file
3. Ask yourself: "Would a staff engineer approve this PR?"
4. Check logs for warnings or errors
5. Demonstrate correctness with concrete output (not just "it works")

Success = [fra GOAL-sektionen, gentaget her som checklist]
```

---

### Regel 5: Demand Elegance (Balanced)

**Anthropics regel:**
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

**CPM-status:** 🟡 Indirekte dækket via Developer Profile patterns

**Eksisterende CPM-features:**
- Developer Profile kan inkludere "Patterns" der beskriver foretrukne arkitektur-mønstre
- FAILURE CONDITIONS fanger anti-patterns
- Phil's mapping inkluderer "Complexity detection" for intelligent contract-tilpasning

**Gaps identificeret:**

1. **Elegance-instruktion mangler.** CPM's contracts fokuserer på korrekthed og constraints — men inkluderer ikke en eksplicit instruktion om at søge elegante løsninger.

2. **Balancen er vigtig.** Anthropic understreger "skip this for simple fixes" — CPM's complexity detection (v5.1) bør styre hvornår elegance-instruktionen inkluderes.

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Elegance-instruktion for non-trivielle contracts | `@cpm/shared` prompt generator | v1 patch | Lille |
| Complexity-baseret toggling af elegance-krav | `@cpm/shared` complexity detector | v5.1 | Medium |

**Foreslået Prompt Contract tilføjelse (kun for medium/large tasks):**
```markdown
## CONSTRAINTS
### Quality Standards
- For non-trivial implementations: pause and consider if there's a more elegant approach
- If a solution feels hacky, step back and implement the clean version
- Challenge your own work before presenting it — would you be proud of this code?
- Exception: simple, obvious fixes should stay simple. Don't over-engineer.
```

---

### Regel 6: Autonomous Bug Fixing

**Anthropics regel:**
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

**CPM-status:** 🟡 Delvist dækket via Debug Template koncept

**Eksisterende CPM-features:**
- Phil-mapping inkluderer "Debug Template" i Template Library
- "Fresh Session Enforcement" via Ralph Wiggum Loop
- Error recovery pattern beskrevet i Phil pain point #4

**Gaps identificeret:**

1. **Bug-fix mode som førsteklasses workflow.** CPM fokuserer primært på feature-bygning. Bugs er en anden workflow der fortjener sin egen Prompt Contract template med strammere constraints.

2. **Zero context switching.** Anthropic mener CC skal kunne løse bugs autonomt uden bruger-intervention. CPM's `supervised` mode kræver godkendelse mellem iterationer — der bør være en `fix` mode der er mere autonom for bug fixes.

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Bug Fix template i Template Library | `@cpm/shared` templates | v5 | Lille |
| `cpm fix "error message" --file path/to/file` CLI shortcut | `@cpm/cli` | v5 | Medium |
| Bug-fix autonomy level (mere aggressiv end supervised) | `@cpm/runner` | v4 | Medium |

**Foreslået Bug Fix Template:**
```markdown
## GOAL
Fix the following bug: [error description]
Success = [test/command] passes without errors

## CONSTRAINTS
- DO NOT modify any file except: [target files]
- DO NOT refactor or restructure — fix the bug only
- Point at the root cause in logs/errors before implementing the fix
- If the fix requires changes to more than 3 files, STOP and re-plan

## FORMAT
1. Root cause analysis (2-3 sentences)
2. Fix implementation
3. Test output proving the fix works

## FAILURE CONDITIONS
- Rewriting entire handlers instead of fixing the specific bug
- Deleting working code to "start fresh"
- Touching files not listed in constraints
- "Fixing" by commenting out code
```

---

## Sektion 2: Task Management

### Regel 1-6: Plan First → Capture Lessons

**Anthropics regler (samlet):**
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

**CPM-status:** 🟡 Delvist dækket — stærkeste alignment med Plan Management

**Mapping til CPM-moduler:**

| Anthropic-regel | CPM-modul | Status | Gap |
|-----------------|-----------|--------|-----|
| Plan First (todo.md) | v5 Plan Management | Spec'et | CPM plans bør auto-generere `tasks/todo.md` i target dir |
| Verify Plan | Prompt Contract GOAL section | ✅ Dækket | Mangler eksplicit "check in" instruktion |
| Track Progress | Ralph Wiggum Loop progress file | ✅ Dækket | `.claude/progress.md` eksisterer allerede |
| Explain Changes | Session History (v5) | Spec'et | Mangler "explain at each step" instruktion i contracts |
| Document Results | Session History (v5) | Spec'et | CPM bør auto-appende resultater til `tasks/todo.md` |
| Capture Lessons | **NY: Project Lessons Engine** | ❌ Mangler | Se Regel 3 ovenfor |

**Anbefalede CPM-ændringer:**

| Ændring | Hvor | Version | Effort |
|---------|------|---------|--------|
| Auto-generér `tasks/todo.md` fra Plan Management | `@cpm/shared` plan-to-todo service | v5 | Medium |
| "Check in before implementing" instruktion i contracts | `@cpm/shared` prompt template | v1 patch | Lille |
| "Explain changes" instruktion per step | `@cpm/shared` prompt template | v1 patch | Lille |
| Auto-append resultater til todo.md via runner | `@cpm/runner` | v4 | Medium |
| `tasks/lessons.md` integration (se Regel 3) | `@cpm/db` + `@cpm/shared` | v5 | Medium-Stor |

**Foreslået standard Task Management blok i alle Prompt Contracts:**
```markdown
## CONSTRAINTS
### Task Management Protocol
- Write your plan to tasks/todo.md with checkable items BEFORE implementing
- Check in: confirm the plan makes sense before writing code
- Mark items complete (- [x]) as you go
- After each significant change: write a 1-2 sentence summary as comment in todo.md
- When done: add a ## Results section to tasks/todo.md with summary and test output
- After any user correction: update tasks/lessons.md with the pattern and prevention rule
```

---

## Sektion 3: Core Principles

### Simplicity First

**Anthropics regel:**
- Make every change as simple as possible. Impact minimal code.

**CPM-mapping:** ✅ Allerede CPM's filosofi. Phil-mapping dokumenterer dette: "The Developer Profile should focus exclusively on constraints, patterns, and hard rules — never persona descriptions. Save those tokens."

**CPM-implementering:** Inkludér som standard CONSTRAINT:
```markdown
- Simplicity First: make every change as simple as possible. Minimize code impact.
```

### No Laziness

**Anthropics regel:**
- Find root causes. No temporary fixes. Senior developer standards.

**CPM-mapping:** ✅ Dækket via FAILURE CONDITIONS. CPM's contracts eksplicit forbyder lazy patterns som:
- "Fixing" by commenting out code
- Using `any` types
- Hardcoded values
- Missing error handling

**CPM-forbedring:** Tilføj som standard FAILURE CONDITION:
```markdown
- Temporary fixes, workarounds, or TODO-comments instead of proper implementation
- Treating symptoms instead of root causes
```

### Minimal Impact

**Anthropics regel:**
- Changes should only touch what's necessary. Avoid introducing bugs.

**CPM-mapping:** 🟡 Delvist dækket. Phil's "Impact Radar" (Codebase Indexer, v5.2) ville løse dette systematisk. Indtil da:

**CPM-forbedring:** Tilføj som standard CONSTRAINT:
```markdown
- Minimal Impact: only modify files directly related to this task
- Do NOT refactor adjacent code "while you're in there"
- If you discover a bug in unrelated code: document it in tasks/todo.md, don't fix it now
```

---

## Samlet Implementation Prioritering

### Fase 1: Quick Wins (v1 patch — dage, ikke uger)

Disse ændringer kræver kun opdatering af CPM's prompt templates og kan implementeres med det samme:

| # | Ændring | Effort |
|---|---------|--------|
| 1 | Tilføj `## VERIFICATION` sektion til Prompt Contract format | Lille |
| 2 | Tilføj Task Management Protocol blok som standard CONSTRAINT | Lille |
| 3 | Tilføj `tasks/lessons.md` instruktion til alle contracts | Lille |
| 4 | Tilføj Simplicity First + Minimal Impact som standard constraints | Lille |
| 5 | Tilføj "Staff engineer" quality gate | Lille |
| 6 | Tilføj elegance-instruktion for non-trivielle tasks | Lille |
| 7 | Tilføj subagent-instruktion for komplekse tasks | Lille |
| 8 | Tilføj re-plan trigger som standard FAILURE CONDITION | Lille |

**Total effort Fase 1:** 1-2 dage. Kræver kun ændring i `@cpm/shared` prompt templates.

### Fase 2: Strukturelle Forbedringer (v4-v5)

| # | Feature | Modul | Effort |
|---|---------|-------|--------|
| 1 | Project Lessons Engine (data model + CRUD) | `@cpm/db` + `@cpm/cli` | Medium |
| 2 | Auto-inject lessons i contracts | `@cpm/shared` | Medium |
| 3 | Re-plan detection i Ralph Wiggum Loop | `@cpm/runner` | Medium |
| 4 | Bug Fix template + `cpm fix` CLI | `@cpm/cli` + templates | Medium |
| 5 | Auto-generér `tasks/todo.md` fra plans | `@cpm/shared` | Medium |
| 6 | Verification automation (run tests before COMPLETE) | `@cpm/runner` | Medium |

**Total effort Fase 2:** ~2-3 uger fordelt over v4/v5 implementering.

### Fase 3: Avanceret (v5.1+)

| # | Feature | Modul | Effort |
|---|---------|-------|--------|
| 1 | Complexity-baseret contract tilpasning | `@cpm/shared` | Stor |
| 2 | AI-drevet lesson detection fra session logs | `@cpm/shared` | Stor |
| 3 | Impact Radar (codebase dependency visualization) | `@cpm/web` | Stor |
| 4 | Lessons dashboard med trend-analyse | `@cpm/web` | Medium |

---

## Konklusion: Hvad Denne Mapping Viser

**Tre nøgleindsigter:**

1. **CPM's arkitektur er fundamentalt korrekt.** Anthropics egne regler validerer Prompt Contracts, Ralph Wiggum Loop, section splitting, og sequential execution. Der er ingen grundlæggende arkitekturfejl der skal rettes.

2. **Den største gap er Project Lessons.** CPM mangler helt konceptet om akkumuleret læring på tværs af sessions. Anthropics `tasks/lessons.md` mønster er simpelt men transformativt — det er feedback-loopet der gør CC bedre over tid. Dette bør prioriteres som en v5 P0-feature.

3. **De fleste forbedringer er "gratis."** 8 af de anbefalede ændringer er rene template-opdateringer i `@cpm/shared` der kan implementeres på 1-2 dage. De kræver ingen ny infrastruktur — kun bedre default-instruktioner i de genererede Prompt Contracts.

**Perspektiv:** Anthropic har i praksis publiceret en "ideal CLAUDE.md" — og CPM's mission er at generere projektspecifikke varianter af præcis dette. Hvor Anthropic giver generelle regler, giver CPM kontekstspecifikke regler baseret på projekt-DNA, developer profile og akkumulerede lessons. Det er forskellen mellem en best-practice guide og et system der håndhæver best practices automatisk.

---

*Dokument oprettet: Februar 2026*
*Kilde: Anthropic Workflow Orchestration guidelines (CLAUDE.md best practices)*
*Mapping til: CodePromptMaker (CPM) v1–v9.1 arkitektur af WebHouse ApS*
