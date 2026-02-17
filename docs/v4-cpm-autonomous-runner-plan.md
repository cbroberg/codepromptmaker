# CPM v4 — Cloud-Triggered Autonomous Runner

## codepromptmaker.com → local cc execution

**Prerequisite**: v3 shipped (SaaS, auth, `cpm login`, cloud sync)

---

## 1. Vision

A developer creates a Prompt Contract on codepromptmaker.com, clicks "Run Autonomously", and their local `cpm` CLI — already authenticated via `cpm login` — picks up the job and spawns an autonomous Claude Code session using the Ralph Wiggum loop pattern with native Tasks.

The web UI becomes **mission control**: queue jobs, monitor progress, see results — while the actual cc execution happens locally on the developer's machine where the code lives.

```
codepromptmaker.com                    Developer's Mac
─────────────────────                  ────────────────
Create Prompt Contract
     │
     ├─→ Click "Run Autonomously"
     │   Select target directory
     │   Set autonomy level
     │
     ├─→ Job created in cloud DB
     │   status: 'queued'
     │                                 $ cpm watch
     │                                      │
     │   ◄── poll /api/runner/pending ──────┤
     │                                      │
     ├─→ Return job payload               ├─→ Receive job
     │                                      │
     │                                      ├─→ Spawn cc headless
     │                                      │   with Prompt Contract
     │                                      │
     │   ◄── POST /api/runner/status ──────┤  (progress updates)
     │                                      │
     │   Show live progress               ├─→ Ralph Wiggum loop
     │   in web UI                          │   (restart on context full)
     │                                      │
     │   ◄── POST /api/runner/complete ────┤
     │                                      │
     └─→ Show results + artifacts           └─→ Done ✅
```

---

## 2. The Bridge Problem

The core challenge: **how does the cloud trigger something on a local machine?**

### Options Evaluated

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **WebSocket** (persistent connection) | Real-time, instant trigger | Complex, connection drops, battery drain | ❌ Over-engineered for v4 |
| **Polling** (`cpm watch` polls API) | Simple, robust, works everywhere | Slight delay (configurable), uses network | ✅ **Winner** |
| **Server-Sent Events** (SSE) | Real-time, simpler than WS | Still requires persistent connection | ❌ Not enough benefit over polling |
| **Manual** (copy `cpm run` command) | Already works in v3 | Not autonomous, defeats purpose | ❌ Already have this |
| **Push notification → CLI** | Native feel | No standard for terminal push | ❌ Not feasible |

### Decision: `cpm watch` with Polling

The simplest robust solution. A long-running CLI process that:
1. Polls `/api/runner/pending` every N seconds (default: 5s, configurable)
2. Picks up queued jobs for this machine
3. Spawns cc in headless mode
4. Reports progress back to cloud
5. Marks job complete/failed

This is the same pattern used by CI/CD runners (GitHub Actions self-hosted runners, GitLab Runners, Buildkite Agents). Battle-tested at scale.

---

## 3. Architecture

### New CLI Command: `cpm watch`

```bash
# Start the watcher (foreground)
cpm watch --dir ~/projects

# Start with specific project directory mapping
cpm watch --dir ~/projects --interval 10

# Run as background daemon
cpm watch --dir ~/projects --daemon

# Check watcher status
cpm watch --status

# Stop daemon
cpm watch --stop
```

**Behavior:**
- Requires `cpm login` (cloud mode only — this feature makes no sense locally)
- Registers this machine as a "runner" in cloud DB
- Polls for jobs assigned to this runner
- Processes one job at a time (sequential, not parallel — cc is resource-intensive)
- Sends heartbeat every 30s so cloud knows the runner is alive
- Graceful shutdown on SIGINT/SIGTERM

### New CLI Command: `cpm run` (enhanced for v4)

The existing `cpm run <id>` command is enhanced:

```bash
# Existing v3 behavior — run a local prompt
cpm run <id> --dir ~/projects/myapp

# New v4 — run a cloud job (fetched automatically by cpm watch)
# This is called internally by the watcher, not by the user directly
cpm run --job <job_id> --dir ~/projects/myapp

# New v4 — run with autonomy level
cpm run <id> --dir ~/projects/myapp --autonomy full
cpm run <id> --dir ~/projects/myapp --autonomy supervised
```

### Autonomy Levels

```
full        — Ralph Wiggum loop, no human intervention, auto-restart on
              context full, runs until GOAL success metric passes or
              max iterations reached. Allowed tools fully pre-approved.

supervised  — Same as full but pauses before each cc restart for human
              approval via web UI or terminal. Sends notification
              (browser push or terminal bell) when paused.

single      — One cc session only. No loop, no restart.
              Equivalent to current v3 `cpm run` behavior.
```

Default: `supervised` (safe default — user explicitly opts into `full`)

### Web UI — Job Creation Flow

```
Prompt Detail Page (/app/prompts/[id])
├── Existing: "Launch in cc" button (copies cpm command)
│
└── New: "Run Autonomously" button
    │
    ├─→ Modal opens:
    │   ┌──────────────────────────────────┐
    │   │ Run Autonomously                  │
    │   │                                   │
    │   │ Target directory:                 │
    │   │ [~/projects/myapp           ] 📁  │
    │   │                                   │
    │   │ Autonomy level:                   │
    │   │ ○ Single (one session)            │
    │   │ ● Supervised (pause between)      │
    │   │ ○ Full (no intervention)          │
    │   │                                   │
    │   │ Max iterations: [5        ]       │
    │   │ Max duration:   [2 hours  ]       │
    │   │                                   │
    │   │ Runner: 🟢 Christians-MacBook     │
    │   │                                   │
    │   │ [Cancel]           [Queue Job]    │
    │   └──────────────────────────────────┘
    │
    └─→ POST /api/runner/jobs
         Creates job in cloud DB
         cpm watch picks it up
```

### Web UI — Live Monitoring

```
Runner Dashboard (/app/runner)
├── Active Jobs
│   └── Job #42 — "Stripe subscription system"
│       ├── Status: 🟢 Running (iteration 2/5)
│       ├── Started: 14:32
│       ├── Duration: 12 min
│       ├── Progress: (from .claude/progress.md)
│       │   ✅ Created Stripe webhook handler
│       │   ✅ Added subscription tiers to database
│       │   🔄 Building checkout flow component
│       │   ⬜ Testing payment flow
│       │   ⬜ Error handling and edge cases
│       └── [Pause] [Stop] [View Logs]
│
├── Queued Jobs
│   └── Job #43 — "Add email notifications"
│       └── [Cancel] [Move Up]
│
├── Completed Jobs
│   └── Job #41 — "User profile page" ✅ (3 iterations, 8 min)
│       └── [View Details] [Re-run]
│
└── Runner Status
    └── 🟢 Christians-MacBook (last heartbeat: 2s ago)
```

---

## 4. Database Schema (v4 additions)

```sql
-- Runners — registered machines that can execute jobs
CREATE TABLE runners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  name          TEXT NOT NULL,             -- e.g. "Christians-MacBook"
  machine_id    TEXT NOT NULL,             -- unique hardware identifier
  status        TEXT DEFAULT 'offline',    -- 'online' | 'busy' | 'offline'
  last_heartbeat TIMESTAMPTZ,
  watch_dir     TEXT,                      -- base directory for projects
  config        JSONB DEFAULT '{}',        -- interval, autonomy defaults, etc.
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, machine_id)
);

-- Runner jobs — queued/active/completed autonomous runs
CREATE TABLE runner_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  runner_id     UUID REFERENCES runners(id),       -- NULL = any available runner
  prompt_id     UUID REFERENCES prompts(id) NOT NULL,
  
  -- Configuration
  target_dir    TEXT NOT NULL,             -- absolute path on runner machine
  autonomy      TEXT DEFAULT 'supervised', -- 'single' | 'supervised' | 'full'
  max_iterations INTEGER DEFAULT 5,
  max_duration_minutes INTEGER DEFAULT 120,
  allowed_tools TEXT[],                    -- cc --allowedTools list
  
  -- State
  status        TEXT DEFAULT 'queued',     
  -- 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  current_iteration INTEGER DEFAULT 0,
  progress_md   TEXT,                      -- latest .claude/progress.md content
  
  -- Timing
  queued_at     TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  
  -- Results
  exit_code     INTEGER,
  error_message TEXT,
  log_output    TEXT,                      -- truncated cc output
  files_changed TEXT[],                    -- git diff --name-only output
  
  -- Cost tracking
  total_tokens  INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0          -- how many cc sessions were spawned
);

-- Job events — granular event log for live monitoring
CREATE TABLE runner_job_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES runner_jobs(id) NOT NULL,
  event_type    TEXT NOT NULL,
  -- 'started' | 'iteration_start' | 'iteration_end' | 'progress_update' |
  -- 'paused' | 'resumed' | 'completed' | 'failed' | 'cancelled'
  iteration     INTEGER,
  message       TEXT,
  metadata      JSONB DEFAULT '{}',        -- tokens used, duration, etc.
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration note:** The v3 `runner_sessions` table is kept for backward compatibility (tracks manual `cpm run` executions). `runner_jobs` is the v4 table for autonomous cloud-triggered runs.

---

## 5. API Endpoints (v4 additions)

```
# Runner registration & heartbeat
POST   /api/runner/register          Register this machine as a runner
POST   /api/runner/heartbeat         Send heartbeat (every 30s)
DELETE /api/runner/register          Unregister runner

# Job management (web UI → cloud)
POST   /api/runner/jobs              Create a new job (queue)
GET    /api/runner/jobs              List jobs (filterable by status)
GET    /api/runner/jobs/[id]         Get job details
PATCH  /api/runner/jobs/[id]         Update job (pause/cancel/resume)
DELETE /api/runner/jobs/[id]         Cancel and delete job

# Job execution (CLI → cloud)  
GET    /api/runner/pending           Get next queued job for this runner
POST   /api/runner/jobs/[id]/status  Update job status + progress
POST   /api/runner/jobs/[id]/event   Log a job event
POST   /api/runner/jobs/[id]/complete Mark job as completed/failed

# Live monitoring (web UI polling)
GET    /api/runner/jobs/[id]/events  Get event stream for a job
GET    /api/runner/status            Get runner status (online/busy/offline)
```

All endpoints require `Authorization: Bearer cpm_xxx` (from `cpm login`).

---

## 6. The Ralph Wiggum Loop — v4 Implementation

The core loop is an evolution of the pattern from the
[autonomous agent conversation](https://claude.ai/chat/abc12f8a-393d-4e8f-a2ea-c04664e14f92),
now integrated into the CPM CLI.

```javascript
// packages/runner/src/autonomous-loop.mjs

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ALLOWED_TOOLS = [
  'Read', 'Write', 'Edit', 'MultiEdit',
  'Bash(npm:*)', 'Bash(npx:*)', 'Bash(pnpm:*)',
  'Bash(node:*)', 'Bash(git:*)', 'Bash(cat:*)',
  'Bash(ls:*)', 'Bash(find:*)', 'Bash(grep:*)',
  'Bash(mkdir:*)', 'Bash(cp:*)', 'Bash(mv:*)',
  'Bash(chmod:*)', 'Bash(head:*)', 'Bash(tail:*)',
  'Bash(wc:*)', 'Bash(sort:*)', 'Bash(curl:*)',
  'TodoRead', 'TodoWrite',
].join(',');

/**
 * Run the autonomous loop for a job.
 * 
 * @param {Object} job - The job from cloud API
 * @param {Object} options - Loop configuration
 * @param {Function} onProgress - Callback to report progress to cloud
 * @param {Function} onPause - Callback when supervised mode needs approval
 */
export async function runAutonomousLoop(job, options, onProgress, onPause) {
  const { targetDir, maxIterations, autonomy, promptContract } = options;
  const progressFile = join(targetDir, '.claude', 'progress.md');
  
  let iteration = 0;
  let shouldContinue = true;

  // Ensure .claude directory exists
  await ensureDir(join(targetDir, '.claude'));

  // Write initial progress file
  await writeFile(progressFile, `# CPM Autonomous Run\n\n## Job: ${job.id}\n## Status: Starting\n\n## Tasks\n- [ ] Starting autonomous execution\n`);

  while (shouldContinue && iteration < maxIterations) {
    iteration++;
    
    await onProgress({
      event: 'iteration_start',
      iteration,
      message: `Starting iteration ${iteration}/${maxIterations}`
    });

    // Build the prompt for this iteration
    const prompt = iteration === 1
      ? buildFirstIterationPrompt(promptContract, progressFile)
      : buildContinuationPrompt(progressFile);

    // Spawn cc in headless mode
    const result = await spawnCc({
      prompt,
      targetDir,
      allowedTools: ALLOWED_TOOLS,
      env: {
        CLAUDE_CODE_ENABLE_TASKS: '1',
      }
    });

    // Read progress file to check status
    const progress = await readProgressFile(progressFile);
    
    await onProgress({
      event: 'iteration_end',
      iteration,
      message: `Iteration ${iteration} complete`,
      exitCode: result.exitCode,
      progressMd: progress,
      tokensUsed: result.tokensUsed
    });

    // Check if goal is achieved
    if (progress.includes('[x] All tasks complete') || 
        progress.includes('## Status: Complete')) {
      shouldContinue = false;
      break;
    }

    // Supervised mode: pause and wait for approval
    if (autonomy === 'supervised' && iteration < maxIterations) {
      await onProgress({
        event: 'paused',
        iteration,
        message: 'Waiting for approval to continue'
      });
      
      const approved = await onPause({ iteration, progress });
      if (!approved) {
        shouldContinue = false;
        break;
      }
    }

    // Brief pause between iterations (let system breathe)
    await sleep(3000);
  }

  return {
    iterations: iteration,
    completed: !shouldContinue || iteration >= maxIterations,
    finalProgress: await readProgressFile(progressFile)
  };
}

function buildFirstIterationPrompt(promptContract, progressFile) {
  return `${promptContract}

ADDITIONAL AUTONOMOUS INSTRUCTIONS:
- You are running in autonomous mode via CPM (CodePromptMaker)
- Track your progress in ${progressFile}
- Update the progress file BEFORE and AFTER each significant action
- Use this format in the progress file:
  ## Status: In Progress | Complete | Blocked
  ## Tasks
  - [x] Completed task
  - [ ] Pending task
- When ALL tasks are complete, set Status to "Complete"
- If you are blocked and cannot proceed, set Status to "Blocked" and explain why
- Do NOT ask questions — make reasonable decisions and document them
- Run tests after each significant change
- Commit logical units of work with descriptive messages`;
}

function buildContinuationPrompt(progressFile) {
  return `Read ${progressFile} and continue where the previous session left off.

You are in an autonomous CPM session. The previous cc session ended (likely due to 
context limits). Continue the work described in the progress file.

Rules:
- Read the progress file FIRST to understand current state
- Continue from the next unchecked task
- Update the progress file as you work
- When ALL tasks are complete, set Status to "Complete"
- Do NOT repeat work that is already marked as done
- Run tests to verify previous work still passes before continuing`;
}

function spawnCc({ prompt, targetDir, allowedTools, env }) {
  return new Promise((resolve) => {
    let output = '';
    
    const proc = spawn('claude', [
      '-p', prompt,
      '--allowedTools', allowedTools,
      '--output-format', 'json',
    ], {
      cwd: targetDir,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });

    proc.on('close', (exitCode) => {
      let tokensUsed = 0;
      try {
        const parsed = JSON.parse(output);
        tokensUsed = (parsed.usage?.input_tokens || 0) + 
                     (parsed.usage?.output_tokens || 0);
      } catch { /* ignore parse errors */ }
      
      resolve({ exitCode, output, tokensUsed });
    });
  });
}

async function readProgressFile(path) {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return '## Status: Unknown\n';
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function ensureDir(dir) {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(dir, { recursive: true });
}
```

---

## 7. `cpm watch` Implementation

```javascript
// packages/cli/commands/watch.mjs

import { getMode } from '../lib/config.mjs';
import { runAutonomousLoop } from '@cpm/runner';

const POLL_INTERVAL = 5000; // 5 seconds default
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export async function watchCommand(options) {
  const config = getMode();
  
  if (config.mode !== 'cloud') {
    console.error('❌ cpm watch requires cloud mode. Run `cpm login` first.');
    process.exit(1);
  }

  const { dir, interval = POLL_INTERVAL, daemon = false } = options;

  // Register this machine as a runner
  const runner = await registerRunner(config, dir);
  console.log(`🟢 Runner registered: ${runner.name}`);
  console.log(`📂 Base directory: ${dir}`);
  console.log(`⏱️  Poll interval: ${interval / 1000}s`);
  console.log(`👀 Watching for jobs...\n`);

  // Start heartbeat
  const heartbeatTimer = setInterval(
    () => sendHeartbeat(config, runner.id),
    HEARTBEAT_INTERVAL
  );

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Stopping watcher...');
    clearInterval(heartbeatTimer);
    await unregisterRunner(config, runner.id);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Main poll loop
  while (true) {
    try {
      const job = await pollForJob(config, runner.id);
      
      if (job) {
        console.log(`\n📋 Job received: ${job.id}`);
        console.log(`   Prompt: "${job.prompt_title}"`);
        console.log(`   Target: ${job.target_dir}`);
        console.log(`   Autonomy: ${job.autonomy}`);
        console.log(`   Max iterations: ${job.max_iterations}\n`);

        // Mark runner as busy
        await updateRunnerStatus(config, runner.id, 'busy');

        // Execute the job
        await executeJob(config, job);

        // Mark runner as online (ready for next job)
        await updateRunnerStatus(config, runner.id, 'online');
      }
    } catch (err) {
      console.error(`⚠️  Poll error: ${err.message}`);
    }

    await sleep(interval);
  }
}

async function executeJob(config, job) {
  const promptContract = job.generated_prompt;

  const onProgress = async (event) => {
    // Report to cloud
    await fetch(`${config.api_url}/api/runner/jobs/${job.id}/event`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    // Local terminal output
    const icon = {
      iteration_start: '🔄',
      iteration_end: '✅',
      paused: '⏸️',
      progress_update: '📝'
    }[event.event] || '📌';
    
    console.log(`${icon} ${event.message}`);
  };

  const onPause = async ({ iteration, progress }) => {
    console.log(`\n⏸️  Supervised mode — iteration ${iteration} complete.`);
    console.log(`   Approve continuation in web UI or press Enter here.`);
    
    // Report paused status to cloud
    await fetch(`${config.api_url}/api/runner/jobs/${job.id}/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'paused' })
    });

    // Wait for approval from either:
    // 1. User pressing Enter in terminal
    // 2. Cloud API status change to 'running' (from web UI)
    return await waitForApproval(config, job.id);
  };

  try {
    await fetch(`${config.api_url}/api/runner/jobs/${job.id}/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'running' })
    });

    const result = await runAutonomousLoop(
      job,
      {
        targetDir: job.target_dir,
        maxIterations: job.max_iterations,
        autonomy: job.autonomy,
        promptContract
      },
      onProgress,
      onPause
    );

    // Report completion
    await fetch(`${config.api_url}/api/runner/jobs/${job.id}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'completed',
        iterations: result.iterations,
        progressMd: result.finalProgress
      })
    });

    console.log(`\n✅ Job ${job.id} completed in ${result.iterations} iterations.`);
  } catch (err) {
    await fetch(`${config.api_url}/api/runner/jobs/${job.id}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'failed',
        error: err.message
      })
    });

    console.error(`\n❌ Job ${job.id} failed: ${err.message}`);
  }
}
```

---

## 8. Security Considerations

### Runner Authentication
- `cpm watch` requires active `cpm login` session
- Every API call uses the Bearer token from `~/.cpm/config.json`
- Jobs are scoped to the authenticated user — cannot pick up other users' jobs
- Runner ID is tied to both `user_id` and `machine_id` (hardware fingerprint)

### Code Execution Safety
- cc runs with explicit `--allowedTools` whitelist (no arbitrary bash)
- Default excludes dangerous tools: `Bash(rm -rf:*)`, `Bash(sudo:*)`, etc.
- `target_dir` must exist on the local machine — no remote path injection
- Max iterations and max duration are hard limits (not suggestions)
- `supervised` mode is the default — user must explicitly opt into `full` autonomy

### Token/Cost Protection
- Each job tracks `total_tokens` consumed across all iterations
- Optional: user can set `max_tokens_per_job` budget limit in profile
- Web UI shows real-time token consumption per job
- Free tier: limited to `single` autonomy only (no loops)
- Pro tier: all autonomy levels, with configurable limits

---

## 9. Monorepo Structure (v4 additions)

v4 adds to the existing monorepo packages:

```
packages/
├── runner/                        # @cpm/runner (v4 additions)
│   └── src/
│       ├── index.ts               # Public exports
│       ├── loop.ts                # v3 — basic Ralph Wiggum (local)
│       ├── autonomous-loop.ts     # v4 — NEW: cloud-aware autonomous loop
│       ├── allowed-tools.ts
│       └── progress.ts            # v4 — NEW: progress file parser
│
├── cli/                           # @cpm/cli (v4 additions)
│   ├── commands/
│   │   ├── generate.mjs
│   │   ├── list.mjs
│   │   ├── show.mjs
│   │   ├── copy.mjs
│   │   ├── run.mjs
│   │   ├── status.mjs
│   │   ├── login.mjs              # v3
│   │   ├── logout.mjs             # v3
│   │   ├── sync.mjs               # v3
│   │   └── watch.mjs              # v4 — NEW (imports from @cpm/runner)
│   └── lib/
│       ├── config.mjs
│       ├── display.mjs
│       ├── api.mjs                # v3 — cloud API client
│       └── runner-api.mjs         # v4 — NEW: runner-specific API calls
│
├── web/                           # @cpm/web (v4 additions)
│   └── src/
│       ├── app/
│       │   └── app/runner/        # v4 — NEW: runner dashboard pages
│       └── components/
│           └── runner/            # v4 — NEW: runner UI components
│
└── db/                            # @cpm/db (v4 additions)
    └── src/
        ├── schema.ts              # + runners, runner_jobs, runner_job_events tables
        └── queries/
            └── runner-jobs.ts     # v4 — NEW: job queue queries
```

**Key monorepo benefit for v4:** `@cpm/runner` is already isolated as a reusable package from v1. Adding cloud-aware autonomous execution is just extending the existing package — `cpm watch` imports `runAutonomousLoop` from `@cpm/runner`, not from a sibling directory.

---

## 10. Web UI Pages (v4 additions)

```
/app/runner                 Runner Dashboard (job list + runner status)
/app/runner/[jobId]         Job Detail (live progress, events, logs)
/app/runner/settings        Runner preferences (default autonomy, limits, allowed tools)
```

### Runner Dashboard Components (`packages/web/src/components/runner/`)
```
runner/
│   ├── job-queue.tsx           # Queued/active/completed job lists
│   ├── job-card.tsx            # Individual job card with status
│   ├── job-detail.tsx          # Full job view with progress
│   ├── job-create-modal.tsx    # "Run Autonomously" modal
│   ├── progress-viewer.tsx     # Renders .claude/progress.md as checklist
│   ├── event-timeline.tsx      # Chronological event log
│   ├── runner-status.tsx       # Online/busy/offline indicator
│   └── token-usage.tsx         # Token consumption chart per job
```

---

## 11. Future Extensions (v4.1+)

- **Multiple runners**: Register multiple machines (e.g. MacBook + cloud VM), route jobs to specific runners or load-balance
- **Job dependencies**: "Run job B only after job A completes successfully"
- **Scheduled jobs**: Cron-like scheduling for recurring tasks (e.g. daily dependency updates)
- **Git integration**: Auto-create branch per job, auto-PR on completion
- **Notification channels**: Slack/Discord webhook on job complete/fail, not just browser push
- **Shared runners**: Team feature — one runner can process jobs for multiple team members
- **Job templates**: Save common job configurations (autonomy, tools, iterations) as reusable templates
- **Cost budgets**: Monthly token budget per user, warn/block at threshold
- **Agent Teams integration**: When cc's TeammateTool is GA, spawn multi-agent jobs with specialized roles

---

## 12. Implementation Order

When v3 is shipped and stable:

1. **Database**: Add `runners`, `runner_jobs`, `runner_job_events` tables
2. **API**: Build runner endpoints (register, heartbeat, pending, status, complete)
3. **autonomous-loop.ts**: Enhance the Ralph Wiggum loop in `@cpm/runner` (extend existing `loop.ts`)
4. **`cpm watch`**: Implement the watcher command with polling + heartbeat
5. **Web UI — Job Creation**: "Run Autonomously" button + modal on prompt detail page
6. **Web UI — Runner Dashboard**: `/app/runner` with job queue and status
7. **Web UI — Live Monitoring**: `/app/runner/[jobId]` with progress viewer + event timeline
8. **Security hardening**: Token limits, allowed tools config, rate limiting
9. **Testing**: End-to-end test: create prompt on web → picked up by watch → cc runs → results shown on web

### Definition of Done — v4

- [ ] `cpm watch --dir ~/projects` starts and polls for jobs
- [ ] Runner registers in cloud DB with machine fingerprint
- [ ] Heartbeat keeps runner marked as online
- [ ] Job created on web UI appears in `cpm watch` within poll interval
- [ ] cc spawns in headless mode with the Prompt Contract from the job
- [ ] Progress file is read and sent back to cloud after each iteration
- [ ] Web UI shows live progress on /app/runner/[jobId]
- [ ] Supervised mode pauses and waits for approval (web UI or terminal Enter)
- [ ] Full autonomy mode runs without intervention until done or max iterations
- [ ] Job marked complete/failed with token count and session count
- [ ] Graceful shutdown of `cpm watch` unregisters runner
- [ ] Free tier limited to `single` autonomy only
- [ ] Security: allowed tools whitelist, max iterations, max duration enforced

### Critical Failure Conditions — v4

- `cpm watch` running without `cpm login` (must reject)
- Jobs executed with unbounded iterations (max_iterations must be enforced)
- Runner picking up jobs for a different user
- cc spawned without `--allowedTools` restriction
- Progress not reported back to cloud (web UI shows stale data)
- No heartbeat causing cloud to show runner as offline while it's running
- Full autonomy available on free tier
