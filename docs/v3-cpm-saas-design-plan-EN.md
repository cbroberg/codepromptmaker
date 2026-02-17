# CodePromptMaker (CPM) — v3 SaaS Design & Launch Plan

## codepromptmaker.com

---

## 1. Design Vision

### Design Tool Recommendations

| Task | Best tool | Why |
|------|-----------|-----|
| Visual concept & landing page layout | **v0.dev** or **ChatGPT canvas** | Better at creative ideation and visual invention |
| Screenshot/Figma → code | **Gemini** | Strongest at visual-to-code with large context window |
| Component library & implementation | **Claude / cc** | Cleanest code, best TypeScript, strongest architecture |
| Interactive prototypes | **Claude artifacts** | Live preview of React/Tailwind components |
| Icons, illustrations, brand assets | **Human designer** or **Midjourney/DALL-E** | AI-generated code-design is competent but not exceptional |

**Recommended workflow:**
1. Define design direction and moodboard (this document)
2. Use v0.dev to generate landing page variants based on the direction
3. Pick the best, iterate with ChatGPT canvas for details
4. Hand the final design to cc for production implementation

### Design DNA — "Developer Tool in Sunlight"

CPM's visual identity lives at the intersection of two worlds:

**From Littlebird.ai we take:**
- Light, airy background with generous white space
- Soft, rounded cards and containers
- Subtle gradient accents (not neon)
- Warm, approachable tone — "this is easy"
- Organic motion and micro-animations
- Clear visual hierarchy that guides the eye

**From Supabase.com we take:**
- Technical credibility — code examples that prove the product works
- Social proof with logo banner
- Clean feature grid with icons
- Terminal/CLI references that speak to developers
- Transparent pricing with feature comparison
- Dark mode as an alternative (not default on landing page)

**The result — CPM's aesthetic:**
A light, clean universe with technical weight. Think: "Vercel's clarity meets Notion's warmth meets Supabase's developer cred." Landing page is ALWAYS light mode. The app defaults to dark mode (developer preference). Users can toggle.

### Reference Sites (ranked by relevance)

| Site | What we borrow | Light/Dark |
|------|---------------|------------|
| **littlebird.ai** | Overall aesthetic, white space, soft shapes | Light |
| **supabase.com** | Feature grid, code blocks, pricing layout, CLI section | Dark (we do it light) |
| **resend.com** | Minimal developer tool in light aesthetic, clean typography | Light |
| **linear.app** | Precision, micro-interactions, "tool for pros" feel | Both |
| **vercel.com** | Navigation, deployment focus, terminal integration | Both |
| **ray.so** | Code snippet styling, gradient backgrounds on code blocks | Light |

### Color Palette (Light Mode — Landing Page)

```
Background:        #FAFBFC (warm off-white, not clinical white)
Surface/Cards:     #FFFFFF with subtle shadow
Primary:           #6366F1 (indigo-500 — energetic but not aggressive)
Primary hover:     #4F46E5 (indigo-600)
Accent:            #06B6D4 (cyan-500 — fresh, technical, "prompt" feeling)
Text primary:      #0F172A (slate-900)
Text secondary:    #64748B (slate-500)
Code background:   #1E293B (slate-800 — dark code block in light universe)
Code text:         #E2E8F0 (slate-200)
Success:           #10B981 (emerald-500)
Border:            #E2E8F0 (slate-200)
```

**Dark Mode (App default):**
```
Background:        #0F172A (slate-900)
Surface/Cards:     #1E293B (slate-800)
Primary:           #818CF8 (indigo-400)
Accent:            #22D3EE (cyan-400)
Text primary:      #F8FAFC (slate-50)
Text secondary:    #94A3B8 (slate-400)
Code background:   #020617 (slate-950)
Border:            #334155 (slate-700)
```

### Typography

```
Headings:          Inter (clean, modern, universal)
Body:              Inter
Mono/Code:         JetBrains Mono or Fira Code
Hero headline:     48-64px, font-bold, tracking-tight
Subheadline:       20-24px, font-normal, text-secondary
```

### Key Design Principles

1. **Code is content**: Prompt Contracts are displayed in styled code blocks with syntax highlighting — that IS the product
2. **Copy-to-clipboard is a first-class action**: Large, prominent button. Visual feedback on copy. It's the most important interaction
3. **Before/After**: Landing page shows "vibe prompt" vs "Prompt Contract" side-by-side — instant understanding of the value
4. **Terminal belongs here**: CLI section feels natural, not bolted on. Terminal mockup with `cpm generate` command
5. **Whitespace > decoration**: Let the content breathe. No unnecessary illustrations or hero images

---

## 2. Landing Page Structure (codepromptmaker.com)

### Sections top-to-bottom:

**1. Navigation Bar**
- Logo (CPM logomark + "CodePromptMaker")
- Links: Features, Pricing, Docs, GitHub
- CTA: "Sign Up Free" (filled) + "Star on GitHub" (outline with star count)
- Theme toggle (sun/moon) — but landing page always loads light

**2. Hero Section**
- Headline: "Stop vibe coding. Start shipping."
- Subheadline: "Transform natural language into structured Prompt Contracts that make Claude Code deliver on the first try."
- Primary CTA: "Try Free — 25 prompts included"
- Secondary CTA: "View on GitHub"
- Hero visual: Animated before/after — left side shows a vague prompt fading into a full Prompt Contract with GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS sections highlighted

**3. Before/After Demo**
- Split-screen with two code blocks
- Left (red/faded): `> Add a subscription system to the app`
- Right (green/bright): Full Prompt Contract output with all 4 sections
- Tagline below: "Same idea. 10x better results."

**4. How It Works — 3 steps**
- Step 1: "Describe what you need" — text input icon
- Step 2: "CPM builds your Prompt Contract" — document icon with sections
- Step 3: "Paste into Claude Code and ship" — terminal icon with checkmark
- Optionally with subtle animation/flow between steps

**5. Feature Grid (2x3 or 3x2)**
- 🎯 **Prompt Contracts** — GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS auto-generated
- 👤 **Developer Profile** — Save your stack, rules and patterns. Injected into every prompt
- 📚 **Prompt Bank** — Searchable history of all your prompts with rating and notes
- ⌨️ **CLI Tool** — `cpm generate "..."` straight from the terminal. Pipes to cc
- 📋 **One-Click Copy** — Copy prompt to clipboard with one click. Ready for cc
- 🔄 **CLAUDE.md Handshake** — Auto-prepended constraint verification in every prompt

**6. CLI Section**
- Dark terminal mockup (even in light mode — it's a terminal)
- Shows `cpm generate`, `cpm list`, `cpm run`, `cpm login` commands
- Tagline: "Works where you work — in the terminal"
- `npm install -g codepromptmaker` one-liner

**7. Open Source Section**
- GitHub repo card with star count
- "Self-host or use our cloud. Your choice."
- Three columns: "Clone & Run Locally" / "Use codepromptmaker.com" / "Connect CLI to Cloud"
- MIT/Apache 2.0 badge

**8. Pricing**
- Three tiers in horizontal grid (Supabase-style)
- **Free**: 25 prompts, 10 gen/day, CLI access, single profile — $0
- **Pro**: Unlimited prompts + gen, RAG search, priority API, team profiles — $X/mo
- **Self-hosted**: Unlimited everything, own API key, full control — Free forever
- Feature comparison table below card grid

**9. Testimonials/Social Proof** (v3.1 — when there are users)
- Placeholder in v3.0: "Built by developers, for developers" with GitHub contributor avatars

**10. Footer**
- Links: Docs, GitHub, Privacy, Terms
- "Built with Next.js, Tailwind, shadcn/ui, and Claude"
- Theme toggle

---

## 3. SaaS Architecture

### Authentication

```
Auth Provider:     NextAuth.js v5 (Auth.js)
Providers:         GitHub OAuth (primary — developer audience)
                   Google OAuth (secondary)
                   Email magic link (fallback)
Session:           JWT with database sessions for revocation
```

**Why NextAuth.js over Clerk:**
- Open source (matches CPM's open source DNA)
- Self-hostable (necessary for self-hosted instances)
- No vendor lock-in
- Free — important for freemium margins

### Database — Multi-Tenancy

**Migration from v1 → v3:**
```
v1: SQLite (single-user, local)
v3: PostgreSQL (multi-tenant, cloud)
    └── Hosted on Supabase or Neon (serverless Postgres)
    └── pgvector extension for RAG (v2 feature, ready in v3)
```

**Tenant scoping:**
- All tables get a `user_id` column (foreign key to auth users)
- All queries in `@cpm/db/queries/` extended with tenant filter
- Row Level Security (RLS) in PostgreSQL as an extra security layer
- Self-hosted instances continue to use SQLite (single-user) or their own PostgreSQL

**Schema changes v1 → v3:**
```sql
-- New table
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  plan          TEXT DEFAULT 'free',     -- 'free' | 'pro'
  stripe_customer_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Existing tables get user_id
ALTER TABLE developer_profiles ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE prompts ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE runner_sessions ADD COLUMN user_id UUID REFERENCES users(id);

-- New table for API tokens (CLI login)
CREATE TABLE api_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  token_hash    TEXT NOT NULL,            -- bcrypt hash of token
  name          TEXT DEFAULT 'CLI',       -- user-visible name
  last_used_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for freemium limits
CREATE TABLE usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  period        TEXT NOT NULL,            -- '2026-02' (YYYY-MM)
  prompts_saved INTEGER DEFAULT 0,
  generations   INTEGER DEFAULT 0,
  UNIQUE(user_id, period)
);
```

### `cpm login` Flow — Detailed Implementation

```
User in terminal                     codepromptmaker.com
────────────────                     ─────────────────────
$ cpm login
  │
  ├─→ Generate random `device_code`
  │   and `user_code` (8 chars)
  │
  ├─→ Open browser:
  │   codepromptmaker.com/cli/authorize?code=ABCD-1234
  │                                      │
  │                                      ├─→ User logs in
  │                                      │   (GitHub OAuth)
  │                                      │
  │                                      ├─→ Shows: "Authorize CLI?
  │                                      │    Code: ABCD-1234"
  │                                      │
  │                                      ├─→ User clicks "Authorize"
  │                                      │
  │                                      └─→ Generate API token,
  │                                          store hash in api_tokens,
  │                                          mark device_code as approved
  │
  ├─→ Poll: GET /api/cli/token?device_code=...
  │   (every 2 seconds, max 5 min timeout)
  │
  ├─→ Receive token response:
  │   { token: "cpm_xxxxxxxxxxxx", user: { name, email, plan } }
  │
  └─→ Save to ~/.cpm/config.json:
      {
        "token": "cpm_xxxxxxxxxxxx",
        "api_url": "https://codepromptmaker.com",
        "user": { "name": "Christian", "email": "...", "plan": "pro" }
      }

Subsequent CLI requests:
  Authorization: Bearer cpm_xxxxxxxxxxxx
```

**Device Authorization Grant** (RFC 8628) — same pattern as GitHub CLI (`gh auth login`), Vercel CLI, Fly.io CLI. Familiar to developers.

### CLI Dual Mode (local vs cloud)

```javascript
// packages/cli/lib/config.mjs
export function getMode() {
  const config = loadConfig(); // ~/.cpm/config.json
  if (config?.token && config?.api_url) {
    return { mode: 'cloud', ...config };
  }
  return { mode: 'local', db_path: findLocalDb() };
}

// All commands check mode:
// - cloud mode: HTTP requests to codepromptmaker.com/api/*
// - local mode: Direct SQLite import from @cpm/db
```

### Freemium Limits — Enforcement

```
                  Free              Pro
─────────────────────────────────────────
Saved prompts     25                Unlimited
Generations/day   10                Unlimited
Developer Profiles 1                5 (team)
Prompt export     ❌                CSV/JSON
RAG search        ❌                ✅
Runner sessions   5 active          Unlimited
API access        Rate limited      Full
CLI cloud sync    ✅                ✅
```

**Enforcement middleware:**
```typescript
// packages/web/src/middleware/usage-limit.ts
// Checked on:
//   1. POST /api/generate (generations limit)
//   2. POST /api/prompts (saved prompts limit)
//   3. CLI requests via Bearer token
// Returns 429 with upgrade message at limit
```

### Billing

```
Provider:          Stripe
Products:          1 (CPM Pro)
Billing:           Monthly ($X) or Yearly ($X × 10 — 2 months free)
Checkout:          Stripe Checkout (hosted) — minimal implementation
Portal:            Stripe Customer Portal for self-service
Webhooks:          checkout.session.completed → upgrade plan
                   customer.subscription.deleted → downgrade to free
```

### Deployment

```
Platform:          Fly.io (matches open source DNA, fair pricing)
                   Alternative: Vercel (simpler, but more expensive at scale)
Database:          Neon Serverless Postgres (free tier, auto-scaling)
                   Alternative: Supabase (more features, RLS built-in)
Domain:            codepromptmaker.com → Fly.io / Vercel
CDN:               Cloudflare (free tier)
Monitoring:        Sentry (error tracking, free tier)
Analytics:         Plausible or Umami (privacy-first, open source)
```

---

## 4. Pages & Routes (v3 additions)

### New Public Routes (landing site)
```
/                       Landing page (always light mode)
/pricing                Pricing page with feature comparison
/docs                   Documentation (MDX)
/docs/cli               CLI installation and commands
/docs/self-hosting      Self-hosting guide
/changelog              Product changelog
```

### New Auth Routes
```
/auth/signin            Login page (GitHub, Google, Magic Link)
/auth/signup            Signup → redirect to /auth/signin
/cli/authorize          CLI authorization page (device flow)
```

### Existing App Routes (behind auth)
```
/app                    Dashboard / Prompt Generator (dark mode default)
/app/prompts            Prompt Bank
/app/prompts/[id]       Prompt Detail + Launch in cc
/app/profile            Developer Profile
/app/settings           Account settings, billing, API tokens
/app/settings/billing   Stripe Customer Portal link
/app/settings/tokens    Manage CLI API tokens
```

---

## 5. Open Source Strategy

### Repository Structure
```
github.com/cbroberg/codepromptmaker
├── README.md                 # Getting started, screenshots, badges
├── LICENSE                   # MIT or Apache 2.0
├── CONTRIBUTING.md           # How to contribute
├── CLAUDE.md                 # For cc contributors
├── pnpm-workspace.yaml       # Monorepo workspace config
├── turbo.json                # Build pipeline
├── docker-compose.yml        # One-command self-hosting
├── Dockerfile
├── .env.example              # All env vars documented
├── docs/                     # Self-hosting, API docs
└── packages/                 # @cpm/web, @cpm/cli, @cpm/runner, @cpm/db, @cpm/shared
```

### Self-Hosting
```bash
# Option 1: Docker (simplest)
git clone https://github.com/cbroberg/codepromptmaker
cd codepromptmaker
cp .env.example .env.local    # Add ANTHROPIC_API_KEY
docker compose up

# Option 2: Manual
git clone https://github.com/cbroberg/codepromptmaker
cd codepromptmaker
pnpm install
pnpm db:migrate
pnpm dev
```

Self-hosted mode:
- Uses SQLite (no PostgreSQL required)
- No auth (single-user)
- No usage limits
- CLI connects locally (not cloud)
- Full functionality with your own Anthropic API key

### What is NOT open source
- Managed hosting infrastructure
- Stripe billing integration (cloud-only)
- Usage tracking/limit enforcement (cloud-only)
- Team features (cloud-only, pro tier)

---

## 6. Implementation Phases

### Phase 1 — v1 MVP (current plan, local)
Web app + CLI, SQLite, single-user, dark mode default.
**Status: Plan ready, ready for cc.**

### Phase 2 — v2 RAG
PostgreSQL migration, pgvector, semantic search.
**Prerequisite: v1 shipped and used daily.**

### Phase 3 — v3 SaaS Launch
1. PostgreSQL migration (Neon)
2. NextAuth.js integration with GitHub OAuth
3. Multi-tenant scoping on all queries
4. Landing page (light mode, design from this document)
5. Freemium usage tracking + limits
6. `cpm login` device flow
7. Stripe billing (Pro tier)
8. Docker self-hosting setup
9. Open source README + CONTRIBUTING.md
10. Deploy to Fly.io + Cloudflare
11. Launch on Product Hunt, Hacker News, r/ClaudeAI

### Phase 3.1 — Post-Launch
- Team profiles (Pro)
- Prompt sharing (public prompt links)
- Community prompt templates
- VS Code extension
- MCP server integration
- Prompt quality scoring (auto-rate based on runner success/failure)

---

## 7. Design Deliverables Checklist

- [ ] **Moodboard**: Collect screenshots from littlebird.ai, resend.com, linear.app, supabase.com/pricing
- [ ] **Landing page mockup**: Generate 3 variants in v0.dev using this document's color palette and section structure
- [ ] **Component library**: shadcn/ui components customized with CPM's color palette (cc task)
- [ ] **Code block styling**: Custom syntax highlighting theme matching CPM's aesthetic (indigo/cyan accents)
- [ ] **Logo**: Simple logomark — e.g. `</>` or prompt-cursor icon in indigo. AI-generated or commissioned
- [ ] **OG Image**: Social sharing preview image for codepromptmaker.com
- [ ] **Favicon**: Matching logomark as favicon + apple-touch-icon

---

## v0.dev Prompt for Landing Page

Use this prompt in v0.dev to generate a first draft:

```
Create a modern SaaS landing page for "CodePromptMaker" (codepromptmaker.com) — 
a developer tool that transforms natural language into structured Prompt Contracts 
for Claude Code terminal sessions.

Design style: Clean, light, airy like littlebird.ai combined with the technical 
credibility of supabase.com. Light mode primary. Developer-focused but warm and 
approachable.

Color palette: Background #FAFBFC, Primary indigo-500 (#6366F1), Accent cyan-500 
(#06B6D4), Text slate-900, Code blocks use dark slate-800 backgrounds even in 
light mode.

Font: Inter for headings and body. JetBrains Mono for code.

Sections in order:
1. Nav bar with logo, Features/Pricing/Docs/GitHub links, "Sign Up Free" CTA
2. Hero: "Stop vibe coding. Start shipping." with animated before/after code comparison
3. 3-step "How it works" section
4. 6-feature grid with icons
5. Dark terminal mockup showing CLI commands
6. Open source section with GitHub card
7. 3-tier pricing table (Free/Pro/Self-hosted)
8. Footer

Use shadcn/ui components and Tailwind CSS. React/Next.js.
```
