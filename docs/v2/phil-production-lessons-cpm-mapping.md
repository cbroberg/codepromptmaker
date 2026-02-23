# From 400 Manual Sessions to Automated Prompt Contracts

## How CPM Solves Every Production Pain Point from 6 Months of Claude Code in the Trenches

> **Context:** Phil from Rentier Digital Automation — the developer whose "Prompt Contract" methodology inspired CPM — published his hard-won lessons after 400 Claude Code sessions, 2 SaaS apps, and 6 months of daily production use. Every pain point he describes maps directly to a CPM module. This document is the bridge between his manual discipline and CPM's automated solution.

---

## The Core Thesis

Phil's article makes one thing unmistakably clear: **the gap between "Claude Code works in a tutorial" and "Claude Code ships to production" is a systems design problem, not a features problem.**

Tutorials teach CLAUDE.md, slash commands, and multi-worktree setups. Production demands context management, session discipline, error recovery protocols, and relentless scope control. Phil solved these problems through hard-won manual habits. CPM encodes those habits into software.

Phil's own words validate this: his Prompt Contract template — Goal, Constraints, Output Format, Failure Conditions — cut his revert rate **from 1-in-3 to 1-in-10**. That single data point is CPM's entire value proposition in one sentence.

---

## Pain Point #1: "Your CLAUDE.md Is Probably Too Long"

### Phil's Problem

His first CLAUDE.md was 847 lines. It consumed ~3,000 tokens every session before Claude wrote a single character. On complex refactoring sessions, he hit the context limit 30–40% faster. Claude perfectly remembered his opinions on semicolons while forgetting the actual conversation.

His solution: cut to 127 lines. Keep only stack declarations (8 lines), hard boundaries (12 lines), file structure rules (15 lines), and the contract template (20 lines). Move everything else to task-specific prompts pasted in only when relevant.

### How CPM Solves This

**CPM Modules:** Developer Profile (v1) + Project Context Manager (v5, module 4.1) + Knowledge Base / Context Library (v5, module 4.2)

CPM architecturally separates what Phil had to learn manually:

- **Developer Profile** stores the static, always-relevant context: stack, hard rules, patterns. This is Phil's surviving 127 lines, structured as data instead of prose.
- **Project Context Manager** handles per-project CLAUDE.md content, auto-detecting project type from package.json/pyproject.toml and maintaining project-specific rules separately from global preferences.
- **Knowledge Base / Context Library** is where Phil's "moved to task-specific prompts" content lives — as tagged, searchable, auto-injectable context blocks. Instead of manually copy-pasting error handling patterns when they're relevant, CPM injects them based on task type and project scope.
- **Context Window Optimizer** (v5.1, module 4.6) adds the intelligence layer: visualize token budget, auto-prioritize which context blocks to include, warn when the window is filling up, and tree-shake irrelevant context.

**The key difference:** Phil manually curates what goes into each session. CPM does it programmatically — the right context for the right task, every time, with zero manual overhead.

---

## Pain Point #2: "The Checkpoint Loop"

### Phil's Problem

After losing 6 hours of work when Claude cascaded a refactoring across four components with no clean revert state, Phil developed a rigid discipline:

1. `git commit` checkpoint before every session
2. Open Claude Code with a scoped contract for one specific task
3. Execute, review, test
4. `git commit` the result
5. Kill the session. Start fresh for the next task.

His git log: 15–20 commits per day. "Ugly" but a time machine. He discovered that "context decay" hits around 45 minutes or 15–20 messages — Claude starts repeating patterns, referencing modified code, and forgetting mid-session refinements.

### How CPM Solves This

**CPM Modules:** Ralph Wiggum Loop (v4) + Session History (v5, module 4.3) + Diff Viewer (v5.1, module 4.7)

Phil's checkpoint loop is a manual version of CPM's Ralph Wiggum Loop — the autonomous execution pattern that treats context limits as natural iteration boundaries, not failures:

- **Ralph Wiggum Loop** automates the entire cycle: git checkpoint → spawn Claude Code session → execute scoped Prompt Contract → validate → commit → kill session → spawn new session for next task. Phil does this by hand 15–20 times a day. CPM's `cpm watch` runner does it autonomously.
- **Session History & Analytics** (module 4.3) logs every session with metadata: duration, iterations, files changed, outcome, user rating. This creates the feedback loop Phil doesn't have — which contracts produce the best results? How many iterations does a typical auth task take? Where do sessions tend to fail?
- **Diff Viewer & Change Tracker** (module 4.7) adds what Phil's "git diff line-by-line" evening was missing: automatic git snapshots before and after each session, visual diff of all changes, approve/reject per file or per chunk, one-click rollback.

**The key difference:** Phil's discipline is admirable but fragile — it depends on him never forgetting a checkpoint. CPM makes checkpointing structural and automatic. You can't skip it because the system won't run without it.

---

## Pain Point #3: "Declare Your Adjacent Surfaces (or Lose a Day)"

### Phil's Problem

Claude refactored his payment flow correctly — clean code, tests passing — but silently broke the dashboard's revenue chart. Because Claude didn't know (and Phil didn't tell it) that the dashboard read from the same Convex table with a different query pattern. Finding the bug took a day and a half.

His solution: three lines per task listing adjacent file paths and one-liner descriptions of what they care about. Two minutes of manual work that prevents days of debugging.

### How CPM Solves This

**CPM Modules:** Codebase Indexer & RAG (v5.2+, module 4.17) + Prompt Contract Generation (v1 core) + Project Context Manager (v5, module 4.1)

This is where CPM can deliver transformative value over Phil's manual approach:

- **Codebase Indexer** uses AST-based code parsing and dependency graph analysis to automatically identify which files are "adjacent" to any given task. When you create a Prompt Contract for "refactor payment flow," CPM knows that `/app/dashboard/revenue.tsx` reads from the same table and auto-includes it in the contract's Adjacent Code section.
- **Prompt Contract Generation** already has the structure for this — the FORMAT section specifies file paths. Extending it with an auto-generated ADJACENT CODE section is a natural fit.
- **Dependency Graph Visualization** lets developers see the impact radius of any change before starting a session. Phil's day-and-a-half debugging session becomes a 30-second visual check.

**The key difference:** Phil's manual three-liner works — but only when he remembers to write it, and only when he knows which files are adjacent. CPM knows because it's indexed the codebase. It catches the dependencies you didn't know existed.

**Potential feature name:** "Impact Radar" — shows the blast radius of any proposed change before Claude writes a line of code.

---

## Pain Point #4: "Error Recovery Is Where You Actually Lose Time"

### Phil's Problem

The happy path works ~60% of the time. The other 40% is error recovery, and debugging with Claude is a fundamentally different skill than building with Claude. When something breaks, Claude becomes "apologetic and over-corrective" — rewriting entire handlers instead of fixing one line, deleting working code to "start fresh."

His workaround: kill the session, start a new one, paste only the error message and specific file, lock everything else with "DO NOT modify any file except X."

### How CPM Solves This

**CPM Modules:** Template Library (v5, module 4.4) + Prompt Contract Generation (v1) + Session History (v5, module 4.3)

Phil's error recovery protocol is a perfect candidate for a specialized Prompt Contract template:

- **Debug Template** — a builtin Template Library category specifically for error recovery:
  - Input fields: error message, target file path, payload/context
  - Auto-generated constraint: "DO NOT modify any file except `[target]`"
  - Auto-adjacent: shows only the target file's direct dependencies
  - Scope-locked: prevents Claude's "nuke from orbit" instinct by structurally limiting what it can touch
- **Session History** tracks which tasks required error recovery, building a dataset of common failure patterns. Over time, CPM can warn: "Tasks like this have a 40% error rate — consider splitting into smaller contracts."
- **Fresh Session Enforcement** — CPM's runner already kills sessions between tasks. Error recovery naturally gets a clean context because that's how the system works, not because the developer remembered to do it.

**Potential feature:** "Debug Mode" toggle in the Prompt Contract generator that automatically applies Phil's error recovery constraints — single file scope, error-specific prompt, no-modify locks on adjacent files.

---

## Pain Point #5: "Context Decay"

### Phil's Problem

Around the 45-minute mark or 15–20 messages, Claude's output quality degrades subtly. It repeats earlier patterns, references code that's been modified, and forgets mid-session refinements. The context window is technically still there, but attention is spread too thin.

### How CPM Solves This

**CPM Modules:** Ralph Wiggum Loop (v4) + Context Window Optimizer (v5.1, module 4.6) + Prompt Contract scoping (v1 core)

This is perhaps the most fundamental alignment between Phil's experience and CPM's architecture:

- **Ralph Wiggum Loop** was designed specifically for this problem. It treats context exhaustion as a natural checkpoint — not a failure, but an iteration boundary. When a session approaches the limit, the loop commits progress, spawns a fresh session, and continues from the last known-good state. Phil does this manually; CPM does it automatically.
- **Context Window Optimizer** adds proactive management: token budget visualization, warnings before you hit the decay zone, and intelligent prioritization of what stays in context vs. what gets trimmed.
- **Prompt Contract scoping** prevents context decay by design — each contract targets one specific task with bounded scope. You can't have a 45-minute unfocused session when the contract says "Add the webhook handler for Clerk user creation" and nothing else.

**CPM Vision quote #36:** *"Context limits in AI models are not blockers. They're checkpoints. The Ralph Wiggum Loop treats them as natural iteration boundaries — not failures, but opportunities to review and continue."*

Phil arrived at this exact insight independently through 400 sessions of production experience. CPM baked it into the architecture from day one.

---

## Pain Point #6: "What I Tried and Ditched"

### Phil's Experiments (and What CPM Learns from Them)

Phil tested several popular Claude Code techniques and abandoned them. Each abandoned experiment contains a design lesson for CPM:

### 6a. "Think hard" on every prompt → Wasted tokens on simple tasks

**Phil's finding:** "Think step by step" improves complex architectural decisions but makes Claude write 400-word plans for 3-line changes. He now uses it on ~1 in 5 prompts.

**CPM design lesson:** The Prompt Contract generator should include **intelligent complexity detection**. Simple UI tasks get lean contracts. Complex refactoring gets extended thinking instructions. This isn't a toggle the user manages — CPM infers it from the task description and scope.

**CPM Module:** Prompt Quality Evaluator (v5.1, module 4.9) — can assess task complexity and adjust the generated contract's "thinking mode" accordingly.

### 6b. Multi-worktree parallel sessions → Cognitive overload for solo devs

**Phil's finding:** Three Claude instances in three git worktrees sounds productive. In practice, it's "generating merge conflicts faster." The cognitive overhead of reviewing three concurrent outputs solo makes it net-negative.

**CPM design lesson:** This validates CPM v4's choice of **sequential task execution** via the Ralph Wiggum Loop rather than parallel multi-agent chaos. For CPM's target audience (solo founders, 2-person teams), sequential-with-checkpoints beats parallel-with-merge-conflicts. Multi-agent orchestration (v6, module 4.14) should be reserved for teams with dedicated review capacity.

### 6c. Claude reviewing its own code → Expensive QA theater

**Phil's finding:** A structured 4-stage self-review system produced thorough output, but cost 30–45 minutes of review dialogue per feature. He spent more time supervising the reviewer than reviewing code himself. And Claude doesn't remember the review in the next session.

**CPM design lesson:** This validates the **Diff Viewer** (module 4.7) approach over AI self-review. Show the human what changed, let the human approve/reject per chunk. The review artifact persists (it's a git diff), unlike a Claude conversation that evaporates with the session. Cost: 2 minutes of visual inspection vs. 45 minutes of AI dialogue.

**CPM Module:** AI Code Review Pipeline (v5.2+, module 4.12) should be lightweight and diff-based, not conversational. Quick automated checks (linting, type safety, pattern violations) + visual diff for human judgment.

### 6d. Personality instructions → Zero measurable impact

**Phil's finding:** "You are a senior TypeScript engineer who values clean architecture" — 15 lines of persona instructions with no impact on code quality. Claude codes differently when you give it constraints and context, not personality traits.

**CPM design lesson:** The Developer Profile should focus exclusively on **constraints, patterns, and hard rules** — never persona descriptions. Save those tokens. This is already CPM's approach (the profile stores stack, rules, patterns — not personality), but it's worth explicitly documenting as a design principle.

---

## Summary: Phil's Manual Discipline → CPM's Automated System

| Phil's Hard-Won Lesson | Manual Effort | CPM Module | Automated Solution |
|---|---|---|---|
| CLAUDE.md is too long | Manually cut from 847→127 lines, paste task-specific context | Developer Profile + Context Library + Context Window Optimizer | Structured profile data, auto-injected context blocks, token budget management |
| Checkpoint every task | 15–20 manual git commits/day, kill sessions by hand | Ralph Wiggum Loop + Session History | Automatic checkpoint → execute → commit → kill → repeat |
| Declare adjacent surfaces | Write 3 lines per task listing related files | Codebase Indexer & RAG + Prompt Contract generation | AST-parsed dependency graph, auto-generated Adjacent Code section |
| Error recovery needs fresh sessions | Kill session, craft scoped error prompt, lock files manually | Debug Template + Fresh Session Enforcement | Builtin debug contract template with auto-scoped constraints |
| Context decay after ~45 min | Manually limit sessions, watch for quality drops | Ralph Wiggum Loop + Context Window Optimizer | Proactive context management, automatic session rotation |
| Skip persona instructions, skip parallel sessions, skip AI self-review | Trial and error over 6 months | Complexity detection, sequential execution, diff-based review | Intelligent defaults baked into the system |

---

## The Bottom Line

Phil wrote: *"Tutorials sell the magic. Production charges for the cleanup."*

CPM's mission is to eliminate the cleanup. Not by making tutorials better, but by encoding 6 months of production discipline into a system that enforces good habits by default. Every pain point Phil describes is a problem CPM is designed to solve — not with more features, but with better structure.

Phil proved the Prompt Contract methodology works at scale. CPM makes it accessible to every developer who doesn't have 400 sessions of battle scars to learn from.

---

*Document created: February 2026*
*Source article: "Every Claude Code Tutorial Teaches You the Same 5 Things. None of Them Matter in Production." by Phil | Rentier Digital Automation*
*Mapping to: CodePromptMaker (CPM) v1–v5 architecture by WebHouse ApS*
