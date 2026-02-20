# CPM v4 — Addendum 2: Execution Environments & Container Isolation

## Proof-of-Concept Research — cc-docker-demo

**Prerequisite**: Read `v4-cpm-autonomous-runner-plan.md` and `v4-cpm-autonomous-runner-plan-add-1.md` first
**Date**: February 2026
**Status**: Research complete — ready to inform v4 implementation
**Repo**: `~/Apps/cbroberg/cc-docker-demo` (also on GitHub: cbroberg/cc-docker-demo)

---

## 1. What Was Built

A standalone proof-of-concept (`cc-docker-demo`) that runs Claude Code headlessly in four different execution environments and compares them. All modes use `--dangerously-skip-permissions` and the Ralph Wiggum-compatible `-p` (headless) flag.

**Reference implementation**: Before implementing CPM v4 runner container support, read the full `cc-docker-demo` codebase — particularly `lib/common.mjs`, `mode-docker.mjs`, `mode-sandbox.mjs`, and `mode-fly.mjs`. It contains all discovered gotchas, working auth patterns, and tested command signatures.

---

## 2. The Four Execution Modes

### Mode A: Plain Docker / Podman Container

```
docker run --rm \
  -v <workspace>:/workspace \
  -e CLAUDE_CODE_OAUTH_TOKEN=<token> \
  cpm-runner:demo
```

- **Isolation**: Container (shared host kernel)
- **Auth**: `CLAUDE_CODE_OAUTH_TOKEN` env var passed to container
- **Image**: `node:22-slim` + `npm install -g @anthropic-ai/claude-code` + `hasCompletedOnboarding: true`
- **Works on**: Any machine running Docker or Podman (macOS, Linux, CI/CD)
- **Tested on**: Mac M1 (Docker Desktop), Ubuntu (Docker Engine + Podman via Linuxbrew)
- **Duration**: ~17–30s per task
- **Podman note**: Does NOT create `/.dockerenv` — container environment detection differs

### Mode B: Docker Sandbox (microVM)

```
docker sandbox run <sandbox-name> -- \
  -p --dangerously-skip-permissions \
  --max-turns 20 --output-format text \
  "<prompt>"
```

- **Isolation**: Firecracker microVM (dedicated kernel per sandbox)
- **Auth**: Full credentials JSON piped from macOS Keychain into `~/.claude/.credentials.json` inside the microVM via `docker sandbox exec -i`
- **Requires**: Docker Desktop 4.58+ (macOS/Windows only)
- **Workspace**: Synced at same absolute path (not a volume mount) — must use `/private/tmp`, NOT `os.tmpdir()` which returns `/var/folders/...` (not in Docker Desktop's file sharing config)
- **Strategy**: Persistent named sandbox (`cpm-demo-persistent`) — credentials re-injected before every run for transparent 29h token rotation
- **Duration**: ~35s warm, ~3min first run (microVM template download)

### Mode C: Fly.io Ephemeral Machine

```
fly machine run registry.fly.io/<app>:demo \
  --env CLAUDE_CODE_OAUTH_TOKEN=<token> \
  --rm
```

- **Isolation**: Remote Firecracker microVM (Fly.io infrastructure)
- **Auth**: Token passed via `--env` — transmitted over HTTPS to Fly API, not in shell history or logs
- **Execution**: `fly machine run --rm` returns when machine **starts**, not when it exits. Log streaming via `fly logs` detects exit signal (`machine restart policy set to 'no'`)
- **Image**: Same Dockerfile as Mode A, built `--platform linux/amd64` (Mac builds ARM64 by default)
- **Duration**: ~35s per task
- **Cost**: Fly.io machine time — minimal for batch tasks

### Mode A (Podman variant)

Identical to Mode A but uses `podman` binary instead of `docker`. Same Dockerfile, same token auth, same workspace mount. Tested with Podman 5.8.0 (Linuxbrew) on Ubuntu.

---

## 3. Auth & Token Management

### Token Resolution (priority order)

`resolveToken()` in `lib/common.mjs` checks in this order:

1. `CLAUDE_CODE_OAUTH_TOKEN` env var — auto-renewal skipped (externally managed)
2. macOS Keychain — `security find-generic-password -s "Claude Code-credentials" -w` returns full JSON blob
3. `~/.claude/.credentials.json` — used on Linux or as macOS fallback

### Auto-Renewal (< 2h threshold)

Before resolving the token, `autoRenewIfNeeded()` runs:

```js
// Checks expiry from Keychain or .credentials.json
// If expired or < 2h remaining:
execSync('claude -p "hi" --output-format text --max-turns 1')
// CC does an OAuth refresh before the API call, writes renewed token back
```

- **macOS**: renewed token written back to Keychain automatically
- **Linux**: renewed token written back to `~/.claude/.credentials.json`
- `findClaudeBinary()` probes `~/.local/bin/claude`, `/usr/local/bin/claude` etc — SSH non-interactive shells don't source `~/.bashrc`

### Linux Self-Sufficiency

If CC is installed and authenticated on the Linux machine, **no token relay is needed**. The machine manages its own token via `~/.claude/.credentials.json` + auto-renewal.

For machines without CC installed: `push-token.mjs` SSHes from macOS and writes the token to the remote `.env`.

### Token Lifetime

OAuth tokens expire after ~29 hours. Sufficient for overnight autonomous runs (start at 23:00, done by morning). The 2h auto-renewal threshold provides a buffer for long-running tasks.

---

## 4. Key Technical Discoveries

These are hard-won findings that will save implementation time in CPM v4:

| Issue | Root cause | Fix |
|---|---|---|
| `docker sandbox exec` without `-i` → 0-byte file | stdin not forwarded | Always use `-i` flag |
| Workspace not synced in Docker Sandbox | `os.tmpdir()` returns `/var/folders/...` | Use `realpathSync('/tmp')` → `/private/tmp` |
| Linux Docker workspace unwritable | `mkdtempSync` creates `0700`, agent has different UID | `chmodSync(dir, 0o777)` on Linux |
| Docker Sandbox v0.12: `--workspace` removed | Breaking change | Workspace is now a positional arg |
| Sandboxes invisible in `docker ps` | They're microVMs, not containers | Use `docker sandbox ls` |
| Docker Desktop "host-side proxy" doesn't inject CC CLI credentials | Proxy only works with Docker Desktop's own Claude account | Use `docker sandbox exec -i` to pipe credentials directly |
| `fly machine run --rm` returns on start, not exit | Machine output goes to Fly logging | Concurrent `fly logs` stream + exit signal detection |
| `fly secrets` unusable for ephemeral machines | Secrets staged but never deployed | Pass token via `--env` in `fly machine run` |
| Mac builds ARM64, Fly.io needs AMD64 | Apple Silicon default | Always `--platform linux/amd64` in `docker build` |
| Podman rootless fails on Ubuntu | Missing `uidmap` package | `sudo apt-get install -y uidmap` |
| `claude` not in PATH in SSH non-interactive shells | `.bashrc` not sourced | `findCloudBinary()` probes known install locations |

---

## 5. Recommendations for CPM v4

### Recommended execution model for `cpm watch`

**Start with Mode A (Docker)** — universal, works anywhere, simplest auth:

```
cpm watch
  → poll API for pending jobs
  → for each job:
      1. resolveToken() with auto-renewal
      2. docker run --rm -v <workspace>:/workspace -e CLAUDE_CODE_OAUTH_TOKEN cpm-runner:cpm
      3. stream output back to API
      4. POST completion
```

Mode B (Docker Sandbox) is better isolation but macOS/Windows only — add as optional upgrade path for users on Docker Desktop 4.58+.

Mode C (Fly.io) is the right model for **cloud-hosted CPM SaaS** — the runner lives remotely, the user doesn't need a local machine running.

### Image for CPM runner

The `cc-docker-demo` Dockerfile is a working starting point. Key requirements:
- `node:22-slim` base
- `npm install -g @anthropic-ai/claude-code`
- Non-root `agent` user
- `hasCompletedOnboarding: true` in `~/.claude.json`
- Entrypoint: `claude -p --dangerously-skip-permissions`
- Build target: `linux/amd64`

### Token relay for CPM SaaS

For cloud-hosted runners (Mode C / Fly.io equivalent):
- Token is passed via `--env` in machine launch (HTTPS to cloud API, not in logs)
- `cpm watch` on user's local machine: auto-renewal via local `claude` binary keeps the token fresh before pushing jobs

---

## 6. File Reference

```
cc-docker-demo/
├── lib/common.mjs      ← resolveToken(), autoRenewIfNeeded(), findClaudeBinary(), createWorkspace()
├── mode-docker.mjs     ← Mode A: full working docker run implementation
├── mode-sandbox.mjs    ← Mode B: persistent sandbox + credential injection
├── mode-fly.mjs        ← Mode C: fly machine run + log streaming + exit detection
├── push-token.mjs      ← SSH-based token relay (Mac → Linux)
└── Dockerfile          ← cc runner image (copy this for CPM runner)
```
