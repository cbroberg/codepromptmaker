# CPM v4 — Addendum 1: Permission & Autonomy Strategy

## Solving the 99% Autonomous Execution Problem

**Prerequisite**: Read `v4-cpm-autonomous-runner-plan.md` first  
**Date**: February 2026  
**Status**: Planning — extends v4 Section 8 (Security Considerations)  
**Revision**: 2 — Resolved all open questions, updated network strategy

---

## 1. The Problem

Claude Code's permission system is designed for interactive use — it asks before every potentially destructive action. For CPM's autonomous runner (Ralph Wiggum loop), this is a showstopper: cc pauses and waits for human input that never comes.

The v4 plan specifies `--allowedTools` whitelist as the solution, but real-world testing reveals several issues:

1. **Known bug**: `--allowedTools` can be ignored in `bypassPermissions` mode — Anthropic recommends using `--disallowedTools` instead (inverted logic, more reliable)
2. **Piped commands break allowlists**: `ls /tmp | wc -l` prompts for permission even when both `ls` and `wc` are individually allowed (GitHub issue #13340)
3. **Maintaining allowlists is fragile**: Every new framework, tool, or build step requires updating the list — a single missing entry stops the autonomous run
4. **One size doesn't fit all**: A Python ML project needs different permissions than a Next.js SaaS app

This addendum defines CPM's **Permission & Autonomy Strategy** — a layered approach that maps each autonomy level to the appropriate execution environment.

---

## 2. Four Execution Strategies

### Strategy 1: Smart Disallowlist (Deny the dangerous, allow everything else)

**Principle**: Instead of whitelisting what cc CAN do (fragile, incomplete), we blacklist what it MUST NOT do (small, stable list).

```
cc -p --disallowedTools "Bash(rm -rf:*)" "Bash(sudo:*)" "Bash(chmod 777:*)" \
   "Bash(shutdown:*)" "Bash(reboot:*)" "Bash(kill -9:*)" "Bash(mkfs:*)" \
   "Bash(dd:*)" "Bash(:(){ :|:& };:)" \
   --prompt "..."
```

**Advantages**: Covers 95% of dev workflows without modification. No need to enumerate every npm/pnpm/node/python/git subcommand.

**Limitations**: Still runs directly on developer's machine. A creative cc session could still find paths to destructive behavior not covered by the denylist. Piped command bug still applies.

**Best for**: `single` autonomy (one session, developer nearby)

### Strategy 2: Native cc Sandbox (OS-level isolation)

**Principle**: Use Claude Code's built-in sandboxing (`/sandbox`) which leverages macOS Seatbelt (on M1/Apple Silicon) or Linux bubblewrap for OS-level filesystem and network isolation.

Anthropic reports **84% reduction in permission prompts** with sandboxing enabled internally.

**What it provides**:
- Filesystem isolation: read/write only within `cwd` and subdirectories
- Network isolation: only through approved unix socket proxy
- OS-level enforcement: not bypassable by cc itself — enforced by kernel
- Subprocesses are also sandboxed (npm install, git, build scripts)

**What it doesn't provide**:
- Complete isolation from host system resources (CPU, memory)
- Protection against filling up disk space
- Isolation from other processes on the same machine

**Best for**: `supervised` autonomy (loop with pause-between-iterations)

### Strategy 3: Container Sandbox (Full YOLO in Docker/Podman)

**Principle**: Run cc inside a container with `--dangerously-skip-permissions` (bypass all checks). The container itself provides the safety boundary — cc can do anything, but "anything" is limited to the container's filesystem.

**Container runtime**: CPM supports both Docker and Podman. The user chooses during runner setup (see Section 6 for comparison and details).

```
# Docker example
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  -e CLAUDE_CODE_OAUTH_TOKEN=$CPM_OAUTH_TOKEN \
  cpm-runner:latest \
  claude -p --dangerously-skip-permissions "..."

# Podman equivalent (identical CLI)
podman run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  -e CLAUDE_CODE_OAUTH_TOKEN=$CPM_OAUTH_TOKEN \
  cpm-runner:latest \
  claude -p --dangerously-skip-permissions "..."
```

**Key insight — Claude Max plan in containers**: cc supports `CLAUDE_CODE_OAUTH_TOKEN` environment variable when `hasCompletedOnboarding` is set to `true` in `~/.claude.json`. This means CPM can authenticate headless containers against the user's Max plan — no API keys needed.

**What it provides**:
- Total filesystem isolation (container is disposable)
- Network access with domain allowlist (see Section 2.1)
- Zero permission prompts — cc runs at full speed
- Reproducible environment (same image, same tools, every time)
- Safe `rm -rf /` — only destroys the container, not the host

**What it doesn't provide**:
- Direct access to host git credentials (must be mounted in)
- Native file change events (mounted volumes have slight latency on macOS)
- Instant startup (container boot adds 2-5s overhead)

**Best for**: `full` autonomy (overnight runs, no human intervention)

### 2.1 Network Strategy: Domain Allowlist (Not --network none)

The original security guides recommend `--network none` to prevent data exfiltration, but this makes containers useless for real development work. cc itself doesn't browse the web, but it constantly executes commands that require network access:

- `pnpm install` / `npm install` → registry.npmjs.org
- `pip install` → pypi.org, files.pythonhosted.org
- `git push` / `git pull` / `git clone` → github.com, gitlab.com
- `npx create-next-app` and similar scaffolding tools
- `curl` for API testing during development
- Dev servers on localhost

**CPM's approach**: Domain allowlist per permission profile, not blanket network blocking.

**Implementation options** (evaluated in order of preference):

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| **cc native sandbox proxy** | cc's built-in unix socket proxy filters outbound traffic per domain | Integrates with cc's own sandbox system, maintained by Anthropic | Only available with cc sandbox enabled |
| **Container DNS filtering** | Custom DNS resolver in container that only resolves allowed domains | Simple, no iptables needed | Can be bypassed with raw IPs |
| **iptables/nftables rules** | Firewall rules in container allowing only specific IP ranges | Strong enforcement | Requires resolving domains to IPs, fragile with CDNs |
| **Proxy container** | Sidecar container running Squid/nginx proxy with domain whitelist | Battle-tested, works with any runtime | Extra container overhead |

**Decision**: Use cc's native sandbox proxy when available (supervised mode). For Docker/Podman containers (full mode), use a lightweight DNS filtering approach with a fallback to proxy container for strict environments.

**Default allowlist per profile** (configurable by user during autonomy setup):

```javascript
// Common domains allowed across all profiles
const BASE_NETWORK_ALLOWLIST = [
  // Package registries
  'registry.npmjs.org',
  'pypi.org',
  'files.pythonhosted.org',
  'crates.io',
  
  // Git hosting
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  
  // CDNs commonly needed by build tools
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  
  // Claude API (for cc itself)
  'api.anthropic.com',
  'auth.anthropic.com',
];

// Profile-specific additions
const PROFILE_NETWORK = {
  'node-fullstack': [...BASE_NETWORK_ALLOWLIST, 'registry.yarnpkg.com'],
  'python-ml':      [...BASE_NETWORK_ALLOWLIST, 'huggingface.co', 'conda.anaconda.org'],
  'static-site':    [...BASE_NETWORK_ALLOWLIST],  // No extras needed
};
```

**User override**: When setting up autonomy mode in CPM's web UI, the developer/PM can:
- Add custom domains (e.g., private npm registry, internal GitLab)
- Remove domains they don't want cc to access
- Toggle "unrestricted network" for projects that need full access (with warning)

### Strategy 4: Hybrid Tiered (Recommended — combine all three)

**Principle**: CPM's three autonomy levels map directly to the three strategies:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CPM Permission Strategy                           │
├──────────────┬──────────────────┬───────────────────────────────────┤
│ Autonomy     │ Execution Mode   │ Permission Approach               │
├──────────────┼──────────────────┼───────────────────────────────────┤
│ single       │ Native (on Mac)  │ Smart Disallowlist                │
│              │                  │ --disallowedTools                 │
│              │                  │ One session, no loop              │
├──────────────┼──────────────────┼───────────────────────────────────┤
│ supervised   │ Native + Sandbox │ cc /sandbox enabled               │
│              │                  │ OS-level filesystem isolation      │
│              │                  │ Network via sandbox proxy          │
│              │                  │ Pause between iterations          │
├──────────────┼──────────────────┼───────────────────────────────────┤
│ full         │ Container        │ --dangerously-skip-permissions    │
│              │ (Docker/Podman)  │ Container filesystem isolation    │
│              │                  │ Network via domain allowlist      │
│              │                  │ Compose support for services      │
│              │                  │ Runs to completion                │
└──────────────┴──────────────────┴───────────────────────────────────┘
```

The user chooses autonomy level in the web UI modal (already designed in v4 plan). CPM's Permission Resolver automatically selects the right execution strategy.

---

## 3. Permission Profile System

### 3.1 Profile Structure

CPM maintains reusable "Permission Profiles" — predefined sets of denied tools and sandbox configurations, scoped per project type.

```javascript
// @cpm/shared/types/permission-profile.d.ts
interface PermissionProfile {
  id: string;
  name: string;                         // "node-fullstack", "python-ml", etc.
  description: string;
  
  // Tools cc is NOT allowed to use (deny-first approach)
  disallowedTools: string[];            // e.g. ["Bash(rm -rf:*)", "Bash(sudo:*)"]
  
  // Additional tools to explicitly allow (override cc defaults)
  additionalAllowedTools: string[];     // e.g. ["Bash(docker compose:*)"]
  
  // Sandbox configuration
  sandbox: {
    enabled: boolean;                   // Use cc native sandbox
    allowedWritePaths: string[];        // Beyond cwd (e.g. /tmp, node_modules)
    allowedNetworkDomains: string[];    // Domain allowlist for outbound traffic
    allowUnixSockets: boolean;          // For Docker socket access etc.
  };
  
  // Container configuration (for 'full' autonomy)
  container: {
    runtime: 'docker' | 'podman' | 'auto'; // 'auto' detects available runtime
    baseImage: string;                  // "cpm-runner:node-22" | "cpm-runner:python-3.12"
    additionalPackages: string[];       // apt packages to install
    mountPaths: MountPath[];            // Additional volumes to mount
    networkDomains: string[];           // Domain allowlist (replaces networkMode)
    unrestrictedNetwork: boolean;       // Override: allow all outbound (user must opt-in)
    environmentVars: Record<string, string>;
    composeFile: string | null;         // Path to compose file for service deps
  };
  
  // Metadata
  source: 'builtin' | 'community' | 'custom';
  tags: string[];                       // ["node", "react", "nextjs"]
}

interface MountPath {
  hostPath: string;
  containerPath: string;
  readonly: boolean;
}
```

### 3.2 Builtin Profiles

CPM ships with curated profiles for common stacks:

#### `node-fullstack` (Default for JS/TS projects)
```json
{
  "name": "node-fullstack",
  "description": "Node.js, React, Next.js, full-stack development",
  "disallowedTools": [
    "Bash(rm -rf /*:*)",
    "Bash(rm -rf ~:*)",
    "Bash(sudo:*)",
    "Bash(chmod 777:*)",
    "Bash(shutdown:*)",
    "Bash(reboot:*)",
    "Bash(mkfs:*)",
    "Bash(dd if=:*)",
    "Bash(kill -9 1:*)",
    "Bash(:(){ :|:& };:*)",
    "Bash(curl * | bash:*)",
    "Bash(wget * | bash:*)",
    "Bash(ssh:*)",
    "Bash(scp:*)",
    "Bash(nc:*)",
    "Bash(ncat:*)"
  ],
  "additionalAllowedTools": [],
  "sandbox": {
    "enabled": true,
    "allowedWritePaths": ["/tmp"],
    "allowedNetworkDomains": [
      "registry.npmjs.org",
      "registry.yarnpkg.com",
      "cdn.jsdelivr.net",
      "github.com",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "allowUnixSockets": false
  },
  "container": {
    "runtime": "auto",
    "baseImage": "cpm-runner:node-22",
    "additionalPackages": [],
    "mountPaths": [],
    "networkDomains": [
      "registry.npmjs.org",
      "registry.yarnpkg.com",
      "cdn.jsdelivr.net",
      "unpkg.com",
      "github.com",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "unrestrictedNetwork": false,
    "environmentVars": {},
    "composeFile": null
  }
}
```

#### `python-ml` (Python / ML / Data Science)
```json
{
  "name": "python-ml",
  "description": "Python, pip, poetry, data science workflows",
  "disallowedTools": [
    "Bash(rm -rf /*:*)",
    "Bash(rm -rf ~:*)",
    "Bash(sudo:*)",
    "Bash(chmod 777:*)",
    "Bash(shutdown:*)",
    "Bash(reboot:*)",
    "Bash(mkfs:*)",
    "Bash(dd if=:*)",
    "Bash(ssh:*)",
    "Bash(scp:*)",
    "Bash(curl * | bash:*)"
  ],
  "additionalAllowedTools": [
    "Bash(python3:*)",
    "Bash(python:*)",
    "Bash(pip:*)",
    "Bash(pip3:*)",
    "Bash(poetry:*)",
    "Bash(pytest:*)",
    "Bash(jupyter:*)"
  ],
  "sandbox": {
    "enabled": true,
    "allowedWritePaths": ["/tmp", ".venv"],
    "allowedNetworkDomains": [
      "pypi.org",
      "files.pythonhosted.org",
      "github.com",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "allowUnixSockets": false
  },
  "container": {
    "runtime": "auto",
    "baseImage": "cpm-runner:python-3.12",
    "additionalPackages": ["build-essential"],
    "mountPaths": [],
    "networkDomains": [
      "pypi.org",
      "files.pythonhosted.org",
      "huggingface.co",
      "conda.anaconda.org",
      "github.com",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "unrestrictedNetwork": false,
    "environmentVars": {},
    "composeFile": null
  }
}
```

#### `static-site` (Low-risk — HTML/CSS/Markdown)
```json
{
  "name": "static-site",
  "description": "Static sites, documentation, Markdown, HTML/CSS",
  "disallowedTools": [
    "Bash(rm:*)",
    "Bash(sudo:*)",
    "Bash(chmod:*)",
    "Bash(ssh:*)",
    "Bash(curl:*)",
    "Bash(wget:*)",
    "Bash(docker:*)",
    "Bash(kill:*)"
  ],
  "additionalAllowedTools": [],
  "sandbox": {
    "enabled": true,
    "allowedWritePaths": [],
    "allowedNetworkDomains": [
      "github.com",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "allowUnixSockets": false
  },
  "container": {
    "runtime": "auto",
    "baseImage": "cpm-runner:node-22",
    "additionalPackages": [],
    "mountPaths": [],
    "networkDomains": [
      "github.com",
      "cdn.jsdelivr.net",
      "api.anthropic.com",
      "auth.anthropic.com"
    ],
    "unrestrictedNetwork": false,
    "environmentVars": {},
    "composeFile": null
  }
}
```

### 3.3 Profile Auto-Detection

When a job is created, CPM analyzes the Prompt Contract and target directory to suggest the best profile:

```
Detection signals:
  package.json exists           → node-fullstack
  requirements.txt / pyproject  → python-ml  
  Cargo.toml                    → rust-dev
  go.mod                        → go-dev
  *.html / *.md only            → static-site
  Prompt mentions "Next.js"     → node-fullstack
  Prompt mentions "Django"      → python-ml
  
Fallback: node-fullstack (most common use case)
```

The user can always override in the "Run Autonomously" modal.

---

## 4. Permission Resolver

### 4.1 Core Logic

The Permission Resolver is a function in `@cpm/runner` that takes a job's configuration and produces the exact cc spawn command.

```
Input:  { autonomy, permissionProfile, targetDir, promptContract, oauthToken }
Output: { command, args, env, containerConfig? }
```

**Decision tree:**

```
autonomy === 'single'?
  → Spawn cc directly on host
  → Apply --disallowedTools from profile
  → No loop, single session
  → Return: { command: 'claude', args: ['-p', '--disallowedTools', ...], env: {} }

autonomy === 'supervised'?
  → Spawn cc directly on host  
  → Apply --disallowedTools from profile
  → Enable native sandbox (write sandbox config to .claude/settings.json)
  → Network via sandbox proxy with domain allowlist
  → Ralph Wiggum loop WITH pause between iterations
  → Return: { command: 'claude', args: ['-p', '--disallowedTools', ...], env: { sandboxConfig } }

autonomy === 'full'?
  → Check: Container runtime available? (docker info || podman info)
    → Yes: Spawn container with YOLO mode
      → If profile.composeFile: use docker/podman compose up
      → Return: { containerConfig: { image, volumes, env, networkDomains }, 
                   command: 'claude', args: ['-p', '--dangerously-skip-permissions'] }
    → No: Fallback to 'supervised' mode + warn user
  → Ralph Wiggum loop WITHOUT pause
  → Inject CLAUDE_CODE_OAUTH_TOKEN into container env
  → Start token refresh sidecar (see Section 5)
```

### 4.2 Sandbox Configuration Generator

For `supervised` mode, CPM writes a temporary sandbox configuration:

```javascript
// Generated at: {targetDir}/.claude/settings.json (temporary, removed after job)
{
  "permissions": {
    "deny": [
      // From permission profile disallowedTools
    ]
  },
  "sandbox": {
    "enabled": true,
    "permissions": {
      "disk": {
        "write": {
          "allow": [
            "${targetDir}",
            "${targetDir}/**",
            "/tmp/**"
          ]
        }
      },
      "network": {
        "allow": [
          // From permission profile allowedNetworkDomains
        ]
      }
    }
  }
}
```

### 4.3 Container Command Generator

For `full` mode, CPM builds the container run command:

```javascript
// Pseudocode — actual implementation in @cpm/runner/src/container/command-builder.ts
function buildContainerCommand(job, profile, oauthToken) {
  // Detect available runtime
  const runtime = detectRuntime(profile.container.runtime);
  // 'docker' | 'podman' — auto-detection checks Podman first (free)
  
  const args = [
    runtime, 'run',
    '--rm',                                        // Auto-cleanup
    '-w', '/workspace',                            // Working directory
    '-v', `${job.targetDir}:/workspace`,           // Mount project
    '-v', `${homedir()}/.gitconfig:/home/agent/.gitconfig:ro`,
    '-e', `CLAUDE_CODE_OAUTH_TOKEN=${oauthToken}`, // Max plan auth
    '-e', 'CLAUDE_CODE_ENABLE_TASKS=1',            // Enable Tasks
  ];
  
  // Network: domain allowlist (NOT --network none)
  if (!profile.container.unrestrictedNetwork) {
    // DNS-based filtering: inject custom resolv.conf + dnsmasq config
    args.push('-v', `${buildDnsConfig(profile.container.networkDomains)}:/etc/dnsmasq.d/allowlist.conf:ro`);
  }
  // If unrestrictedNetwork: no network restriction at all (user opted in)
  
  // Mount git credentials read-only for push/pull
  args.push('-v', `${homedir()}/.ssh:/home/agent/.ssh:ro`);
  
  // Additional mounts from profile
  for (const mount of profile.container.mountPaths) {
    const ro = mount.readonly ? ':ro' : '';
    args.push('-v', `${mount.hostPath}:${mount.containerPath}${ro}`);
  }
  
  // Image
  args.push(profile.container.baseImage);
  
  // cc command inside container
  args.push(
    'claude', '-p',
    '--dangerously-skip-permissions',
    '--max-turns', '200'
  );
  
  return { runtime, args };
}

function detectRuntime(preference) {
  if (preference !== 'auto') return preference;
  
  // Check Podman first (free, no licensing concerns, lower footprint)
  if (commandExists('podman')) return 'podman';
  if (commandExists('docker')) return 'docker';
  
  throw new Error('No container runtime found. Install Docker or Podman for full autonomy mode.');
}
```

---

## 5. OAuth Token Management & Refresh Sidecar

### 5.1 The Token Problem

Claude Code's Max plan uses OAuth tokens with the following characteristics (based on community testing and GitHub issues):

- **Access tokens** (`sk-ant-oat01-...`): Short-lived, expire in **8-12 hours**
- **Refresh tokens** (`sk-ant-ort01-...`): Longer-lived but also expire, and are **single-use** (using one invalidates it)
- **Race condition**: Multiple cc instances sharing the same refresh token will invalidate each other's auth (GitHub issue #24317)
- **No auto-refresh in headless mode**: cc's internal refresh logic requires interactive terminal access
- **`claude setup-token`**: Creates a **1-year token** designed for automated/headless workflows — preferred when available

Token storage location on host:
```
~/.claude/.credentials.json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",    // Short-lived (8-12h)
    "refreshToken": "sk-ant-ort01-...",   // Used to get new access tokens
    "expiresAt": 1748658860401,           // Unix timestamp (ms)
    "scopes": ["user:inference", "user:profile"]
  }
}
```

### 5.2 CPM Token Strategy

Given that `full` autonomy jobs can run for hours (overnight "Product Machine" scenario), token expiry during execution is a **guaranteed problem**, not an edge case. CPM solves this with a two-tier approach:

1. **Preferred**: Use `claude setup-token` (1-year token) if available — eliminates the refresh problem entirely
2. **Fallback**: Token Refresh Sidecar for standard OAuth tokens

### 5.3 Token Refresh Sidecar

A lightweight background process that runs alongside the container and proactively refreshes tokens before they expire.

```
┌──────────────────────────────────────────────────┐
│  Developer's Mac                                  │
│                                                   │
│  ┌─────────────────┐   ┌──────────────────────┐  │
│  │ CPM Token        │   │ Container (cc)       │  │
│  │ Refresh Sidecar  │   │                      │  │
│  │                  │   │ CLAUDE_CODE_OAUTH_    │  │
│  │ • Reads          │──→│ TOKEN=<fresh token>  │  │
│  │   ~/.claude/     │   │                      │  │
│  │   .credentials   │   │ claude -p            │  │
│  │ • Refreshes      │   │ --dangerously-skip   │  │
│  │   every 2 hours  │   │                      │  │
│  │ • Updates env    │   │ Ralph Wiggum loop    │  │
│  │   in container   │   │ (restart picks up    │  │
│  │ • Handles        │   │  new token from env) │  │
│  │   single-use     │   │                      │  │
│  │   refresh tokens │   └──────────────────────┘  │
│  │ • File locking   │                             │
│  │   to prevent     │                             │
│  │   race conditions│                             │
│  └─────────────────┘                              │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

1. **Sidecar runs on HOST, not in container** — it needs access to `~/.claude/.credentials.json` and the ability to call `auth.anthropic.com` for token refresh
2. **File locking** — uses `~/.claude/.credentials.lock` to prevent race conditions if multiple CPM jobs or other cc instances are active
3. **Token injection on Ralph Wiggum restart** — when cc context fills and the loop restarts cc, the new iteration reads the refreshed `CLAUDE_CODE_OAUTH_TOKEN` env var. This is a natural integration point since the Ralph Wiggum loop already restarts cc between iterations
4. **Fallback to `claude setup-token`** — if available, CPM checks for a long-lived setup token (1 year) and uses that instead of the short-lived OAuth token, bypassing the refresh problem entirely
5. **Graceful degradation** — if token refresh fails, sidecar pauses the job and notifies the user (web UI + optional push notification) rather than letting cc crash mid-task

### 5.4 Token Flow

```
cpm login
  → Browser OAuth flow completes
  → CPM stores token in ~/.cpm/config.json (CPM's own token)
  → CPM reads ~/.claude/.credentials.json (cc's OAuth tokens)
  → CPM checks for setup-token (1-year, preferred)
  → CPM caches auth data in ~/.cpm/auth-cache.json (encrypted)

cpm watch picks up 'full' job
  → Check: setup-token available?
    → Yes: use it directly, no sidecar needed
    → No: start Token Refresh Sidecar
  → Container starts with CLAUDE_CODE_OAUTH_TOKEN env var
  → Every 2 hours: sidecar refreshes token via auth.anthropic.com
  → Between Ralph Wiggum iterations: fresh token injected
  → On token failure: job paused, user notified

cpm watch picks up 'supervised' or 'single' job
  → No sidecar needed — cc runs on host with native token refresh
  → cc handles its own auth internally
```

### 5.5 Token Security

- Tokens encrypted at rest in `~/.cpm/auth-cache.json`
- Encryption key derived from machine hardware ID (same as runner `machine_id`)
- Tokens only decrypted in-memory when spawning containers
- Tokens passed via env var (not written to image layers or Dockerfiles)
- File lock prevents multiple processes from invalidating each other's refresh tokens

---

## 6. Container Runtime: Docker vs Podman

### 6.1 Why Support Both

Docker Desktop requires a **paid license** for companies with >250 employees or >$10M annual revenue. This affects CPM users in enterprise environments. Podman is fully open-source (Apache 2.0) with no licensing restrictions.

CPM treats container runtime as a **user choice** configured during runner setup. The first time `full` autonomy is selected, CPM asks which runtime to use.

### 6.2 Comparison

| Metric | Docker | Podman |
|--------|--------|--------|
| **Idle RAM** | ~150-300MB (daemon always running) | **Near zero** (daemonless, no background process) |
| **Idle CPU** | Constant daemon overhead | **None** — processes only when running containers |
| **Container startup** | ~150ms (10-15% faster) | ~180ms (slightly slower due to daemonless init) |
| **Disk footprint** | Docker Desktop: ~2-4GB installed | Podman Desktop: ~500MB-1GB |
| **Build speed** | Marginally faster (daemon caching) | Near-identical (OCI-compatible images) |
| **Scaling (100+ containers)** | Slight degradation | **Linear performance maintained** |
| **Security** | Requires root daemon by default | **Rootless by default**, no daemon attack surface |
| **Licensing** | Free for personal/small biz, paid for enterprise | **Free for all** (Apache 2.0) |
| **Compose support** | `docker compose` (built-in) | `podman compose` (compatible) |
| **macOS support** | Docker Desktop (mature) | Podman Desktop (mature since v4+) |
| **CLI compatibility** | Reference implementation | **Drop-in compatible** (`alias docker=podman`) |

**Summary**: Podman uses 65% less RAM when idle, 70% less CPU when idle, and takes roughly half the disk space — all because it has no background daemon. Docker is 10-15% faster for individual container operations but for CPM's use case (one long-running container), this difference is negligible. Podman is the preferred default for auto-detection.

### 6.3 Runtime Detection & Configuration

```javascript
// @cpm/runner/src/container/runtime.ts

async function detectAndConfigureRuntime(preference) {
  // preference: 'docker' | 'podman' | 'auto'
  
  if (preference === 'auto') {
    // Prefer Podman (free, smaller footprint)
    if (await commandExists('podman')) {
      return { runtime: 'podman', compose: 'podman compose' };
    }
    if (await commandExists('docker')) {
      return { runtime: 'docker', compose: 'docker compose' };
    }
    return null; // No runtime available
  }
  
  return {
    runtime: preference,
    compose: `${preference} compose`
  };
}
```

### 6.4 CPM Onboarding Question

When the user first selects `full` autonomy, CPM asks:

```
┌──────────────────────────────────────────┐
│ Container Runtime Setup                   │
│                                          │
│ Full autonomy runs cc inside an isolated │
│ container. Which runtime do you use?     │
│                                          │
│ ● Auto-detect (recommended)              │
│ ○ Docker                                 │
│ ○ Podman                                 │
│                                          │
│ ℹ️ Podman is free for all use.           │
│   Docker Desktop requires a paid license │
│   for companies >250 employees or        │
│   >$10M revenue.                         │
│                                          │
│ [Continue]                               │
└──────────────────────────────────────────┘
```

---

## 7. Compose Support for Service Dependencies

### 7.1 The Problem

Real-world projects often depend on external services: PostgreSQL, Redis, Elasticsearch, etc. A single container running cc cannot provide these. **Full means full** — CPM should handle the complete environment.

### 7.2 Solution: Compose Files

For `full` autonomy, CPM supports Docker Compose / Podman Compose files that define the complete environment:

```yaml
# .cpm/compose.yml — checked into the project repo
services:
  # The cc runner — CPM manages this service
  runner:
    image: cpm-runner:node-22
    volumes:
      - .:/workspace
    working_dir: /workspace
    environment:
      - CLAUDE_CODE_OAUTH_TOKEN=${CPM_OAUTH_TOKEN}
      - CLAUDE_CODE_ENABLE_TASKS=1
      - DATABASE_URL=postgresql://dev:dev@postgres:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Service dependencies — developer defines these
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

### 7.3 How It Works

1. CPM detects `.cpm/compose.yml` in the project directory
2. When a `full` autonomy job starts, CPM runs `{runtime} compose up -d` to start all services
3. The `runner` service is started with cc in YOLO mode
4. CPM injects the OAuth token into the runner service's environment
5. cc can access Postgres, Redis, etc. via service names (container internal DNS)
6. On job completion: `{runtime} compose down` tears down everything cleanly

Both `docker compose` and `podman compose` use the same YAML format — no changes needed between runtimes.

### 7.4 Compose Profiles for Common Stacks

CPM can generate starter compose files:

```bash
cpm init compose --stack node-postgres    # Node.js + PostgreSQL
cpm init compose --stack node-full        # Node.js + PostgreSQL + Redis + Mailhog
cpm init compose --stack python-ml        # Python + Jupyter + PostgreSQL
```

---

## 8. Git Branch Safety Net

Regardless of autonomy level or execution strategy, CPM ALWAYS creates a safety net before cc starts:

### 8.1 Pre-Job Git Protocol

```
1. Verify target_dir is a git repository (reject if not)
2. Check for uncommitted changes (warn user, optionally stash)
3. Create branch: cpm/job-{jobId} from current HEAD
4. Switch to the new branch
5. cc executes on this branch
6. On completion: report diff stats to web UI
7. User decides: merge to main, create PR, or discard
```

### 8.2 Rollback Capability

From the web UI, users can:
- **View diff**: See all changes cc made
- **Cherry-pick**: Select specific commits to keep
- **Rollback**: `git reset --hard` to pre-job state
- **Merge**: Fast-forward merge into the original branch
- **PR**: Auto-create a GitHub PR from the job branch

### 8.3 No-Git Fallback

If `target_dir` is not a git repo:
- `single` mode: Warn but proceed (user's risk)
- `supervised` mode: Create backup tarball before starting
- `full` mode: **Refuse to run** — too risky without version control

---

## 9. Hooks Integration

Claude Code supports lifecycle hooks (PreToolUse, PostToolUse) that execute deterministic shell commands. CPM leverages these for additional safety and auditing.

**CRITICAL**: Hooks must fire correctly within the sandbox/container environment. This requires verification during implementation (see Section 9.3).

### 9.1 CPM Safety Hooks

```json
// Written to {targetDir}/.claude/settings.json by Permission Resolver
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "cpm-hook-validate-bash \"$TOOL_INPUT\""
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "command": "cpm-hook-log-change \"$TOOL_INPUT\" \"$TOOL_OUTPUT\""
      }
    ]
  }
}
```

### 9.2 Hook Functions

**`cpm-hook-validate-bash`**: Checks bash commands against a pattern-based blocklist before execution. Unlike `--disallowedTools` which uses simple prefix matching, hooks can apply regex patterns and catch evasion attempts (e.g., `r\m -rf /`, backtick injection, variable expansion tricks).

**`cpm-hook-log-change`**: Logs every file write/edit to `.cpm/change-log.jsonl` for post-job auditing. This feeds into the web UI's diff viewer and provides a granular timeline of what cc did.

**`cpm-hook-check-scope`**: Validates that file operations stay within the declared `target_dir` — an extra layer beyond sandbox enforcement.

### 9.3 Hooks in Sandbox/Container: CRITICAL VERIFICATION

**This must be validated before shipping. It is a potential Phase 2 blocker.**

- **Native sandbox**: Do hooks execute inside or outside the sandbox boundary? If hooks run inside the sandbox, they inherit its filesystem restrictions — meaning `cpm-hook-log-change` can only write the audit log to paths the sandbox allows. The `.cpm/` directory within `target_dir` should be writable, but this must be tested.

- **Container mode**: Hooks fire inside the container (they're part of cc's process). The hook scripts must be available in the container image OR mounted in. CPM's base images should include the hook scripts at a known path (e.g., `/usr/local/bin/cpm-hook-*`).

- **Hook + YOLO mode interaction**: In `--dangerously-skip-permissions` mode, do hooks still fire? Per Anthropic docs, hooks are lifecycle events separate from permission checks — they should fire regardless of permission mode. **Must verify.**

**Implementation task**: Create a test matrix during step 8g:

| Mode | Hooks fire? | Can write audit log? | Can block commands? |
|------|-------------|----------------------|---------------------|
| single (native) | ✅ Expected | ✅ Expected | ✅ Expected |
| supervised (sandbox) | ❓ Must verify | ❓ Verify path access | ❓ Must verify |
| full (YOLO in container) | ❓ Must verify | ✅ Container fs | ❓ Must verify |

If hooks do NOT fire in YOLO mode, CPM must find an alternative enforcement mechanism (possibly a wrapper script around cc that intercepts tool calls). This could block the Phase 2 ship date — **test early**.

### 9.4 Why Hooks Matter

Hooks are **deterministic** — they run actual shell commands, not LLM instructions. This means:
- cc cannot be prompt-injected into bypassing them
- They execute for every tool use, even in YOLO mode (if verified)
- They provide an audit trail independent of cc's own logging
- They work identically across all autonomy levels

---

## 10. Web UI Extensions

### 10.1 Permission Profile Selector (extends job-create-modal.tsx)

The "Run Autonomously" modal from v4 plan gains additional sections:

```
┌──────────────────────────────────────────────┐
│ Run Autonomously                              │
│                                               │
│ Target directory:                             │
│ [~/projects/myapp                      ] 📁   │
│                                               │
│ Autonomy level:                               │
│ ○ Single (one session)                        │
│ ● Supervised (pause between)                  │
│ ○ Full (no intervention) 🐳                   │
│                                               │
│ ─────────── Permission Profile ───────────    │
│ [🟢 node-fullstack (auto-detected)    ▼]     │
│                                               │
│ Network access:                               │
│ ☑ Package registries (npm, pypi)              │
│ ☑ Git hosting (github, gitlab)                │
│ ☐ Unrestricted (allow all outbound) ⚠️       │
│ [+ Add custom domain...]                      │
│                                               │
│ ─────────── Execution Limits ─────────────    │
│ Max iterations: [5        ]                   │
│ Max duration:   [2 hours  ]                   │
│                                               │
│ ─────────── Environment ──────────────────    │
│ Runner: 🟢 Christians-MacBook                 │
│ Container: ✅ Podman available                 │
│ Services: .cpm/compose.yml detected           │
│   └ postgres:16, redis:7                      │
│                                               │
│ [Cancel]                    [Queue Job]       │
└──────────────────────────────────────────────┘
```

### 10.2 Permission Profile Editor (/app/runner/settings)

```
Runner Settings
├── Default Autonomy Level
│   └── [supervised ▼]
│
├── Container Runtime
│   ├── Active: Podman (auto-detected)
│   ├── [Switch to Docker] [Re-detect]
│   └── Licensing: ✅ Podman — free for all use
│
├── Permission Profiles
│   ├── node-fullstack (builtin) [View] [Clone]
│   ├── python-ml (builtin) [View] [Clone]
│   ├── static-site (builtin) [View] [Clone]
│   └── [+ Create Custom Profile]
│
├── Container Images
│   ├── cpm-runner:node-22 ✅ pulled
│   ├── cpm-runner:python-3.12 ❌ [Pull]
│   ├── cpm-runner:fullstack ❌ [Pull]
│   └── Custom: .cpm/Dockerfile detected [Build]
│
├── Git Safety
│   ├── ☑ Always create branch before job
│   ├── ☑ Refuse 'full' autonomy without git
│   └── ☐ Auto-create PR on completion
│
└── Authentication
    ├── OAuth status: ✅ Valid (expires in 6h)
    ├── Setup token (1yr): ❌ Not configured [Setup]
    ├── Token refresh sidecar: ✅ Available
    └── [Refresh Now] [Re-authenticate]
```

---

## 11. Updated Monorepo Structure

v4 Addendum 1 adds the following to `@cpm/runner`:

```
packages/runner/src/
├── index.ts                    # Public exports
├── loop.ts                     # v3 — basic Ralph Wiggum (local)
├── autonomous-loop.ts          # v4 — cloud-aware autonomous loop
├── allowed-tools.ts            # v4 — RENAMED: permission-profiles.ts
├── progress.ts                 # v4 — progress file parser
│
├── permissions/                # v4-add1 — NEW
│   ├── resolver.ts             # Permission Resolver (core logic)
│   ├── profiles.ts             # Built-in profile definitions
│   ├── profile-detector.ts     # Auto-detect profile from project
│   ├── sandbox-config.ts       # Generate cc sandbox settings
│   ├── disallowlist.ts         # Base deny-lists per risk level
│   └── network-allowlist.ts    # Domain allowlist generator
│
├── container/                  # v4-add1 — NEW
│   ├── runtime.ts              # Detect Docker/Podman, manage runtime
│   ├── command-builder.ts      # Build run/compose commands
│   ├── image-manager.ts        # Pull/build/cache container images
│   ├── compose-manager.ts      # Handle .cpm/compose.yml lifecycle
│   ├── dns-filter.ts           # Generate DNS-based network allowlist
│   └── oauth-injector.ts       # Inject Max plan token into containers
│
├── auth/                       # v4-add1 — NEW
│   ├── token-sidecar.ts        # Token refresh sidecar process
│   ├── token-cache.ts          # Encrypted token storage
│   ├── credentials-reader.ts   # Read ~/.claude/.credentials.json
│   └── file-lock.ts            # Prevent refresh race conditions
│
├── hooks/                      # v4-add1 — NEW
│   ├── hook-installer.ts       # Write hooks to .claude/settings.json
│   ├── validate-bash.sh        # PreToolUse bash validation hook
│   ├── log-change.sh           # PostToolUse change logging hook
│   └── check-scope.sh          # Scope validation hook
│
└── git/                        # v4-add1 — NEW
    ├── branch-safety.ts        # Create/manage job branches
    ├── rollback.ts             # Reset/cherry-pick operations
    └── pr-creator.ts           # Auto-create GitHub PRs
```

### New files in @cpm/shared

```
packages/shared/types/
├── permission-profile.d.ts     # PermissionProfile interface
└── container-config.d.ts       # Container/compose-related types
```

### New files in @cpm/cli

```
packages/cli/
├── commands/watch.mjs          # Extended: container support for 'full' jobs
├── commands/init-compose.mjs   # NEW: generate starter compose files
└── hooks/                      # Installable hook scripts
    ├── cpm-hook-validate-bash
    ├── cpm-hook-log-change
    └── cpm-hook-check-scope
```

---

## 12. Updated runner_jobs Schema

Extends the v4 `runner_jobs` table with permission-related columns:

```sql
ALTER TABLE runner_jobs ADD COLUMN
  permission_profile_id TEXT,                    -- references permission profile
  execution_mode        TEXT DEFAULT 'native',   -- 'native' | 'sandbox' | 'container'
  container_runtime     TEXT,                    -- 'docker' | 'podman' (if container mode)
  container_image       TEXT,                    -- image used (if container mode)
  container_id          TEXT,                    -- container ID (if container mode)
  compose_services      TEXT[],                  -- services started (if compose used)
  network_domains       TEXT[],                  -- allowed network domains for this job
  git_branch            TEXT,                    -- cpm/job-{id} branch name
  git_pre_sha           TEXT,                    -- HEAD before job started
  git_post_sha          TEXT,                    -- HEAD after job completed
  hooks_enabled         BOOLEAN DEFAULT true,    -- safety hooks active
  token_sidecar_active  BOOLEAN DEFAULT false,   -- refresh sidecar running
  files_backup_path     TEXT;                    -- tarball path (no-git fallback)
```

---

## 13. Implementation Order (Addendum 1)

Fits into v4 plan step 8 ("Security hardening"):

```
8a. Permission Profiles — Define builtin profiles, profile detector, network allowlists
8b. Permission Resolver — Core logic: autonomy level → execution strategy
8c. Disallowlist system — Replace allowedTools with disallowedTools approach
8d. Native Sandbox integration — Write sandbox configs per job, domain allowlist
8e. Git Branch Safety — Pre-job branching, post-job diff/rollback
8f. Hooks — Install CPM safety hooks, validate-bash, log-change
8g. Hooks verification — Test hooks in sandbox + container + YOLO mode (CRITICAL)
8h. Container runtime detection — Docker/Podman auto-detect, user preference
8i. Container command builder — Build run commands, OAuth injection
8j. Token refresh sidecar — Implement proactive token refresh with file locking
8k. Container images — Create and publish cpm-runner base images
8l. Compose support — Handle .cpm/compose.yml lifecycle
8m. Web UI — Profile selector in modal, network config, runtime settings
8n. DNS filtering — Implement domain allowlist for container networking
```

### Phase Recommendation

**Phase 1 (ship with v4)**: 8a through 8g — Native execution with sandbox support. Covers `single` and `supervised` autonomy. No container dependency. Validates hooks.

**Phase 2 (v4.1)**: 8h through 8n — Container sandbox for `full` autonomy with Docker/Podman, token sidecar, compose support, and network domain allowlist.

---

## 14. Updated Definition of Done

Adds to v4 Definition of Done:

- [ ] Permission profiles load from builtin + custom sources
- [ ] Profile auto-detection suggests correct profile for project
- [ ] `--disallowedTools` used instead of `--allowedTools` for cc spawn
- [ ] Native sandbox enabled for `supervised` mode jobs
- [ ] Network domain allowlist applied (not blanket --network none)
- [ ] Git branch created before every job (configurable)
- [ ] Safety hooks installed and executing for every tool use
- [ ] **Hooks verified to work in sandbox, container, and YOLO mode**
- [ ] Container spawns for `full` autonomy (Docker or Podman)
- [ ] Container runtime auto-detected with user override option
- [ ] OAuth token injected into containers (Max plan works headless)
- [ ] Token refresh sidecar keeps tokens alive during long jobs
- [ ] Compose services started when .cpm/compose.yml exists
- [ ] Compose services torn down after job completion
- [ ] Web UI shows permission profile + network config in job creation modal
- [ ] Web UI shows git diff and rollback option on job completion
- [ ] Jobs without git repo refused in `full` mode
- [ ] CPM asks dev/PM about runtime preference on first full-autonomy setup
- [ ] CPM asks dev/PM about network allowlist during autonomy setup

### Updated Critical Failure Conditions

Adds to v4 failure conditions:

- cc spawned with `--allowedTools` instead of `--disallowedTools` (known bug)
- `full` autonomy job running outside container (must use container isolation)
- OAuth token written to container image layer (must be env var only)
- OAuth token expired mid-job without sidecar refresh (job fails silently)
- Multiple CPM instances refreshing same token without file lock (race condition)
- `full` autonomy job running without git (no rollback possible)
- Safety hooks bypassed or not installed before job starts
- **Hooks not firing in YOLO mode (must verify before shipping)**
- Network completely unrestricted without user explicitly opting in
- Permission profile not applied (cc runs with default prompting behavior)
- Compose services still running after job completion (must tear down)

---

## 15. Decision Log

| # | Decision | Chosen | Alternatives | Rationale |
|---|----------|--------|--------------|-----------|
| 1 | Deny-first over allow-first | `--disallowedTools` | `--allowedTools` | Known bug where allowedTools ignored in bypass mode. Denylist is smaller, more stable, and more robust against new tools |
| 2 | Container for full autonomy | Docker/Podman isolation | Native YOLO mode on host | Only container isolation provides true safety for unattended runs. "Dangerously" means dangerously. |
| 3 | Support both Docker and Podman | User choice with auto-detect | Docker-only | Podman is free (no licensing), 65% less idle RAM, 70% less idle CPU, half the disk footprint, rootless by default, and CLI-compatible. Enterprise users may be forced to use Podman. CPM asks user on first setup. |
| 4 | Domain allowlist over --network none | DNS-based filtering | `--network none`, unrestricted | `--network none` breaks all package installation and git operations. cc needs network for real work. Domain allowlist blocks exfiltration while allowing development traffic. User configures domains per profile during autonomy setup. |
| 5 | Token refresh sidecar | Proactive refresh every 2h with file lock | Static token only, API keys | Access tokens expire in 8-12h — guaranteed to die during overnight jobs. Sidecar refreshes with file locking to prevent race conditions. Setup-token (1yr) preferred when available. |
| 6 | Git branch mandatory for full | Hard requirement | Optional with warning | Risk of data loss without version control is too high for unattended multi-hour runs |
| 7 | Hooks for audit trail | PreToolUse + PostToolUse | Log parsing after completion | Hooks are deterministic (not LLM-dependent), execute in real-time, and cannot be prompt-injected. Must verify they fire in all modes. |
| 8 | Compose for full autonomy | Docker/Podman Compose | Single container only | Real projects need databases and caches. Full means full. Compose file lives in `.cpm/compose.yml`. Both `docker compose` and `podman compose` use identical YAML format. |
| 9 | Phased rollout | Phase 1 (native) → Phase 2 (container) | Ship everything at once | Native sandbox covers 80% of use cases. Container adds complexity that follows when Phase 1 is proven stable. |

---

## 16. Resolved Questions (from rev 1)

### Q1: Docker Desktop licensing — support Podman?

**Answer**: Yes, CPM supports both Docker and Podman with auto-detection (Podman checked first). Podman advantages for CPM:

- **Free for all use** — Apache 2.0, no licensing restrictions regardless of company size
- **65% less RAM when idle** — no background daemon consuming resources
- **70% less CPU when idle** — daemonless architecture, zero footprint when not running containers
- **~500MB-1GB disk** vs Docker Desktop's 2-4GB
- **Drop-in CLI compatible** — `podman run` accepts identical arguments as `docker run`
- **Rootless by default** — better security posture, no root daemon attack surface
- **Compose support** — `podman compose` works with standard compose files

Trade-off: Docker is 10-15% faster for individual container operations (startup, image pull). For CPM's use case (one container running for minutes/hours), this difference is imperceptible.

CPM asks the developer/PM which runtime to use on first `full` autonomy setup, with a licensing note about Docker Desktop.

### Q2: Network access for package installation?

**Answer**: Default is **domain allowlist**, not `--network none`. cc constantly needs network for `npm install`, `pip install`, `git push`, and similar operations. CPM provides sensible defaults per permission profile (package registries + git hosting + Anthropic API) and lets the dev/PM customize during autonomy setup:

- Add custom domains (private registries, internal services)
- Remove domains they don't want
- Toggle "unrestricted network" with explicit opt-in and warning

### Q3: Token refresh for long-running containers?

**Answer**: Yes, implement a **Token Refresh Sidecar**. The tokens in question:

- **Access tokens** (`sk-ant-oat01-...`): Short-lived, expire in **8-12 hours**
- **Refresh tokens** (`sk-ant-ort01-...`): Longer-lived but **single-use** — using one invalidates it server-side

For overnight "Product Machine" runs, token expiry is guaranteed, not hypothetical. The sidecar runs on the host, refreshes every 2 hours with file locking to prevent race conditions across multiple cc instances. Additionally, CPM checks for `claude setup-token` (1-year token) as a simpler alternative when available. See Section 5 for full architecture.

### Q4: Docker Compose for service dependencies?

**Answer**: Yes — **full means full**. CPM supports Docker Compose and Podman Compose via `.cpm/compose.yml` in the project directory. This enables cc to work with PostgreSQL, Redis, Elasticsearch, or any other service dependency. CPM manages the compose lifecycle: `up -d` before job starts, `down` after completion. Both runtimes use identical YAML format. Starter compose files can be generated with `cpm init compose --stack <name>`. See Section 7 for details.

### Q5: Hooks firing inside sandbox/container?

**Answer**: **Critical verification required before shipping Phase 2.** Implemented as step 8g — a dedicated verification step with a test matrix across all three execution modes. If hooks do NOT fire in YOLO mode, CPM must find an alternative enforcement mechanism before the container-based `full` autonomy can ship. See Section 9.3 for the full test matrix and fallback plan.
