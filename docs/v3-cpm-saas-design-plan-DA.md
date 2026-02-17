# CodePromptMaker (CPM) — v3 SaaS Design & Launch Plan

## codepromptmaker.com

---

## 1. Design Vision

### Ærlig Vurdering af AI Design Tools

| Opgave | Bedste tool | Hvorfor |
|--------|------------|---------|
| Visuel koncept & landing page layout | **v0.dev** eller **ChatGPT canvas** | Bedre til kreativ ideation, mood boards, og visuel opfindelse |
| Screenshot/Figma → kode | **Gemini** | Stærkest på visual-to-code med stort context window |
| Komponent-bibliotek & implementation | **Claude / cc** | Reneste kode, bedste TypeScript, stærkest arkitektur |
| Interaktive prototyper | **Claude artifacts** | Live preview af React/Tailwind komponenter |
| Ikoner, illustrationer, brand assets | **Menneske-designer** eller **Midjourney/DALL-E** | AI-genereret kode-design er kompetent men ikke exceptionelt |

**Anbefalet workflow:**
1. Definer design-retning og moodboard (dette dokument)
2. Brug v0.dev til at generere landing page varianter baseret på retningen
3. Vælg det bedste, iterér med ChatGPT canvas for detaljer
4. Giv det endelige design til cc for production-implementering

### Design DNA — "Developer Tool i Sollys"

CPM's visuelle identitet lever i krydsfeltet mellem to verdener:

**Fra Littlebird.ai tager vi:**
- Lys, luftig baggrund med rigeligt white space
- Bløde, afrundede kort og containers
- Subtile gradient-accenter (ikke neon)
- Varm, imødekommende tone — "dette er nemt"
- Organisk bevægelse og micro-animationer
- Klar visuel hierarki der guider øjet

**Fra Supabase.com tager vi:**
- Teknisk troværdighed — kode-eksempler der viser produktet virker
- Social proof med logo-banner
- Klart feature-grid med ikoner
- Terminal/CLI-referencer der taler til developers
- Gennemskuelig pricing med feature-sammenligning
- Dark mode som alternativ (ikke default på landing page)

**Resultatet — CPM's æstetik:**
Et lyst, rent univers med teknisk tyngde. Tænk: "Vercel's klarhed møder Notion's varme møder Supabase's developer-cred." Landing page er ALTID light mode. App'en defaulter til dark mode (developer preference). Brugeren kan skifte.

### Reference Sites (rangeret efter relevans)

| Site | Hvad vi låner | Lys/Mørk |
|------|--------------|-----------|
| **littlebird.ai** | Overordnet æstetik, white space, bløde former | Lys |
| **supabase.com** | Feature-grid, code blocks, pricing layout, CLI section | Mørk (vi gør lyst) |
| **resend.com** | Minimal developer tool i lys æstetik, ren typografi | Lys |
| **linear.app** | Præcision, mikro-interaktioner, "tool for pros" følelse | Begge |
| **vercel.com** | Navigation, deployment-fokus, terminal-integration | Begge |
| **ray.so** | Code snippet styling, gradient backgrounds på kode-blokke | Lys |

### Farvepalette (Light Mode — Landing Page)

```
Background:        #FAFBFC (varm off-white, ikke klinisk hvid)
Surface/Cards:     #FFFFFF med subtle shadow
Primary:           #6366F1 (indigo-500 — energisk men ikke aggressiv)
Primary hover:     #4F46E5 (indigo-600)
Accent:            #06B6D4 (cyan-500 — frisk, teknisk, "prompt" feeling)
Text primary:      #0F172A (slate-900)
Text secondary:    #64748B (slate-500)
Code background:   #1E293B (slate-800 — mørk kode-blok i lyst univers)
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

### Typografi

```
Headings:          Inter (clean, modern, universal)
Body:              Inter
Mono/Code:         JetBrains Mono eller Fira Code
Hero headline:     48-64px, font-bold, tracking-tight
Subheadline:       20-24px, font-normal, text-secondary
```

### Nøgle Design-Principper

1. **Kode er content**: Prompt Contracts vises i stilede code blocks med syntax highlighting — det ER produktet
2. **Copy-to-clipboard er en first-class action**: Stor, tydelig knap. Visuelt feedback ved kopi. Det er den vigtigste interaktion
3. **Before/After**: Landing page viser "vibe prompt" vs "Prompt Contract" side-by-side — instant forståelse af værdien
4. **Terminal er hjemme her**: CLI-sektionen føles naturlig, ikke påklistret. Terminal-mockup med `cpm generate` kommando
5. **Whitespace > dekoration**: Lad indholdet trække vejret. Ingen unødvendige illustrationer eller hero-images

---

## 2. Landing Page Struktur (codepromptmaker.com)

### Sektioner top-til-bund:

**1. Navigation Bar**
- Logo (CPM logomark + "CodePromptMaker")
- Links: Features, Pricing, Docs, GitHub
- CTA: "Sign Up Free" (filled) + "Star on GitHub" (outline med star count)
- Theme toggle (sun/moon) — men landing page loader altid lyst

**2. Hero Section**
- Headline: "Stop vibe coding. Start shipping."
- Subheadline: "Transform natural language into structured Prompt Contracts that make Claude Code deliver on the first try."
- Primary CTA: "Try Free — 25 prompts included"
- Secondary CTA: "View on GitHub"
- Hero visual: Animeret before/after — venstre side viser vag prompt der fader over i en fuld Prompt Contract med GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS sektioner highlighted

**3. Before/After Demo**
- Split-screen med to code blocks
- Venstre (rød/faded): `> Add a subscription system to the app`
- Højre (grøn/bright): Fuld Prompt Contract output med alle 4 sektioner
- Tagline under: "Same idea. 10x better results."

**4. How It Works — 3 steps**
- Step 1: "Describe what you need" — ikon af tekst-input
- Step 2: "CPM builds your Prompt Contract" — ikon af document med sektioner
- Step 3: "Paste into Claude Code and ship" — ikon af terminal med checkmark
- Eventuelt med subtil animation/flow mellem steps

**5. Feature Grid (2x3 eller 3x2)**
- 🎯 **Prompt Contracts** — GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS auto-genereret
- 👤 **Developer Profile** — Gem din stak, regler og patterns. Injiceret i hver prompt
- 📚 **Prompt Bank** — Søgbar historik over alle dine prompts med rating og noter
- ⌨️ **CLI Tool** — `cpm generate "..."` direkte fra terminalen. Pipes til cc
- 📋 **One-Click Copy** — Kopiér prompt til clipboard med ét klik. Klar til cc
- 🔄 **CLAUDE.md Handshake** — Auto-prepended constraint verification i hver prompt

**6. CLI Section**
- Mørk terminal-mockup (selv i light mode — det er en terminal)
- Viser `cpm generate`, `cpm list`, `cpm run`, `cpm login` kommandoer
- Tagline: "Works where you work — in the terminal"
- `npm install -g codepromptmaker` one-liner

**7. Open Source Section**
- GitHub repo card med star count
- "Self-host or use our cloud. Your choice."
- Tre kolonner: "Clone & Run Locally" / "Use codepromptmaker.com" / "Connect CLI to Cloud"
- MIT/Apache 2.0 badge

**8. Pricing**
- Tre tiers i horisontalt grid (Supabase-stil)
- **Free**: 25 prompts, 10 gen/dag, CLI access, single profile — $0
- **Pro**: Ubegrænset prompts + gen, RAG search, priority API, team profiles — $X/mo
- **Self-hosted**: Ubegrænset alt, egen API key, fuld kontrol — Free forever
- Feature comparison table under kort-grid

**9. Testimonials/Social Proof** (v3.1 — når der er brugere)
- Placeholder i v3.0: "Built by developers, for developers" med GitHub contributor avatars

**10. Footer**
- Links: Docs, GitHub, Privacy, Terms
- "Built with Next.js, Tailwind, shadcn/ui, and Claude"
- Theme toggle

---

## 3. SaaS Arkitektur

### Authentication

```
Auth Provider:     NextAuth.js v5 (Auth.js)
Providers:         GitHub OAuth (primær — developer audience)
                   Google OAuth (sekundær)
                   Email magic link (fallback)
Session:           JWT med database sessions for revocation
```

**Hvorfor NextAuth.js over Clerk:**
- Open source (passer til CPM's open source DNA)
- Self-hostable (nødvendigt for self-hosted instancer)
- Ingen vendor lock-in
- Gratis — vigtigt for freemium margins

### Database — Multi-Tenancy

**Migration fra v1 → v3:**
```
v1: SQLite (single-user, lokal)
v3: PostgreSQL (multi-tenant, cloud)
    └── Hosted på Supabase eller Neon (serverless Postgres)
    └── pgvector extension til RAG (v2 feature, klar i v3)
```

**Tenant scoping:**
- Alle tabeller får en `user_id` kolonne (foreign key til auth users)
- Alle queries i `@cpm/db/queries/` udvides med tenant filter
- Row Level Security (RLS) i PostgreSQL som ekstra sikkerhedslag
- Self-hosted instancer bruger fortsat SQLite (single-user) eller egen PostgreSQL

**Schema ændringer v1 → v3:**
```sql
-- Ny tabel
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  plan          TEXT DEFAULT 'free',     -- 'free' | 'pro'
  stripe_customer_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Eksisterende tabeller får user_id
ALTER TABLE developer_profiles ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE prompts ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE runner_sessions ADD COLUMN user_id UUID REFERENCES users(id);

-- Ny tabel til API tokens (CLI login)
CREATE TABLE api_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  token_hash    TEXT NOT NULL,            -- bcrypt hash af token
  name          TEXT DEFAULT 'CLI',       -- bruger-synligt navn
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

### `cpm login` Flow — Detaljeret Implementation

```
Bruger i terminal                    codepromptmaker.com
─────────────────                    ─────────────────────
$ cpm login
  │
  ├─→ Generér random `device_code`
  │   og `user_code` (8 chars)
  │
  ├─→ Åbn browser:
  │   codepromptmaker.com/cli/authorize?code=ABCD-1234
  │                                      │
  │                                      ├─→ Bruger logger ind
  │                                      │   (GitHub OAuth)
  │                                      │
  │                                      ├─→ Viser: "Authorize CLI?
  │                                      │    Code: ABCD-1234"
  │                                      │
  │                                      ├─→ Bruger klikker "Authorize"
  │                                      │
  │                                      └─→ Generér API token,
  │                                          gem hash i api_tokens,
  │                                          marker device_code som approved
  │
  ├─→ Poll: GET /api/cli/token?device_code=...
  │   (hvert 2. sekund, max 5 min timeout)
  │
  ├─→ Modtag token response:
  │   { token: "cpm_xxxxxxxxxxxx", user: { name, email, plan } }
  │
  └─→ Gem i ~/.cpm/config.json:
      {
        "token": "cpm_xxxxxxxxxxxx",
        "api_url": "https://codepromptmaker.com",
        "user": { "name": "Christian", "email": "...", "plan": "pro" }
      }

Efterfølgende CLI requests:
  Authorization: Bearer cpm_xxxxxxxxxxxx
```

**Device Authorization Grant** (RFC 8628) — samme pattern som GitHub CLI (`gh auth login`), Vercel CLI, Fly.io CLI. Velkendt for developers.

### CLI Dual Mode (lokal vs cloud)

```javascript
// packages/cli/lib/config.mjs
export function getMode() {
  const config = loadConfig(); // ~/.cpm/config.json
  if (config?.token && config?.api_url) {
    return { mode: 'cloud', ...config };
  }
  return { mode: 'local', db_path: findLocalDb() };
}

// Alle commands tjekker mode:
// - cloud mode: HTTP requests til codepromptmaker.com/api/*
// - local mode: Direkte SQLite import fra @cpm/db
```

### Freemium Limits — Enforcement

```
                  Free              Pro
─────────────────────────────────────────
Gemte prompts     25                Ubegrænset
Generationer/dag  10                Ubegrænset
Developer Profiles 1                5 (team)
Prompt export     ❌                CSV/JSON
RAG search        ❌                ✅
Runner sessions   5 aktive          Ubegrænset
API access        Rate limited      Full
CLI cloud sync    ✅                ✅
```

**Enforcement middleware:**
```typescript
// packages/web/src/middleware/usage-limit.ts
// Tjekkes ved:
//   1. POST /api/generate (generations limit)
//   2. POST /api/prompts (saved prompts limit)
//   3. CLI requests via Bearer token
// Returnerer 429 med upgrade-besked ved limit
```

### Billing

```
Provider:          Stripe
Products:          1 (CPM Pro)
Billing:           Monthly ($X) eller Yearly ($X × 10 — 2 mdr gratis)
Checkout:          Stripe Checkout (hosted) — minimal implementation
Portal:            Stripe Customer Portal for self-service
Webhooks:          checkout.session.completed → upgrade plan
                   customer.subscription.deleted → downgrade to free
```

### Deployment

```
Platform:          Fly.io (passer til open source DNA, fair pricing)
                   Alternativ: Vercel (enklere, men dyrere ved skala)
Database:          Neon Serverless Postgres (gratis tier, auto-scaling)
                   Alternativ: Supabase (mere features, RLS built-in)
Domain:            codepromptmaker.com → Fly.io / Vercel
CDN:               Cloudflare (gratis tier)
Monitoring:        Sentry (error tracking, gratis tier)
Analytics:          Plausible eller Umami (privacy-first, open source)
```

---

## 4. Sider & Routes (v3 tilføjelser)

### Nye Public Routes (landing site)
```
/                       Landing page (altid light mode)
/pricing                Pricing page med feature comparison
/docs                   Dokumentation (MDX)
/docs/cli               CLI installation og commands
/docs/self-hosting      Self-hosting guide
/changelog              Produkt changelog
```

### Nye Auth Routes
```
/auth/signin            Login page (GitHub, Google, Magic Link)
/auth/signup             Signup → redirect til /auth/signin
/cli/authorize           CLI authorization page (device flow)
```

### Eksisterende App Routes (bag auth)
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

## 5. Open Source Strategi

### Repository Struktur
```
github.com/cbroberg/codepromptmaker
├── README.md                 # Getting started, screenshots, badges
├── LICENSE                   # MIT eller Apache 2.0
├── CONTRIBUTING.md           # How to contribute
├── CLAUDE.md                 # For cc contributors
├── pnpm-workspace.yaml       # Monorepo workspace config
├── turbo.json                # Build pipeline
├── docker-compose.yml        # One-command self-hosting
├── Dockerfile
├── .env.example              # Alle env vars dokumenteret
├── docs/                     # Self-hosting, API docs
└── packages/                 # @cpm/web, @cpm/cli, @cpm/runner, @cpm/db, @cpm/shared
```

### Self-Hosting
```bash
# Option 1: Docker (enklest)
git clone https://github.com/cbroberg/codepromptmaker
cd codepromptmaker
cp .env.example .env.local    # Tilføj ANTHROPIC_API_KEY
docker compose up

# Option 2: Manual
git clone https://github.com/cbroberg/codepromptmaker
cd codepromptmaker
pnpm install
pnpm db:migrate
pnpm dev
```

Self-hosted mode:
- Bruger SQLite (ingen PostgreSQL påkrævet)
- Ingen auth (single-user)
- Ingen usage limits
- CLI forbinder lokalt (ikke cloud)
- Fuld funktionalitet med egen Anthropic API key

### Hvad der IKKE er open source
- Managed hosting infrastruktur
- Stripe billing integration (cloud-only)
- Usage tracking/limit enforcement (cloud-only)
- Team features (cloud-only, pro tier)

---

## 6. Implementation Faser

### Fase 1 — v1 MVP (nuværende plan, lokal)
Web app + CLI, SQLite, single-user, dark mode default.
**Status: Plan klar, klar til cc.**

### Fase 2 — v2 RAG
PostgreSQL migration, pgvector, semantic search.
**Forudsætning: v1 shipped og brugt i dagligdagen.**

### Fase 3 — v3 SaaS Launch
1. PostgreSQL migration (Neon)
2. NextAuth.js integration med GitHub OAuth
3. Multi-tenant scoping på alle queries
4. Landing page (light mode, design fra dette dokument)
5. Freemium usage tracking + limits
6. `cpm login` device flow
7. Stripe billing (Pro tier)
8. Docker self-hosting setup
9. Open source README + CONTRIBUTING.md
10. Deploy til Fly.io + Cloudflare
11. Lancering på Product Hunt, Hacker News, r/ClaudeAI

### Fase 3.1 — Post-Launch
- Team profiles (Pro)
- Prompt sharing (public prompt links)
- Community prompt templates
- VS Code extension
- Integration med MCP servers
- Prompt quality scoring (auto-rate baseret på runner success/failure)

---

## 7. Design Deliverables Checklist

For at bygge landing page og app UI med det bedste resultat:

- [ ] **Moodboard**: Saml screenshots fra littlebird.ai, resend.com, linear.app, supabase.com/pricing i en Figma board eller simpel folder
- [ ] **Landing page mockup**: Generér 3 varianter i v0.dev med dette dokuments farvepalette og sektions-struktur som prompt
- [ ] **Component library**: shadcn/ui components customized med CPM's farvepalette (cc opgave)
- [ ] **Code block styling**: Custom syntax highlighting theme der matcher CPM's æstetik (indigo/cyan accenter)
- [ ] **Logo**: Simpelt logomark — evt. `</>` eller prompt-cursor ikon i indigo. Kan genereres med AI eller bestilles hos designer
- [ ] **OG Image**: Social sharing preview image til codepromptmaker.com
- [ ] **Favicon**: Matching logomark som favicon + apple-touch-icon

---

## v0.dev Prompt til Landing Page

Brug denne prompt i v0.dev for at generere et første udkast:

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
