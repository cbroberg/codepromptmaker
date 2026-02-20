# DOMAINS.md — CPM Domain Discovery & Registration Module
### Intelligent Domain Name Search, Availability Check, and Registration via API

> **Document Purpose:** Technical plan for CPM's domain discovery and registration capabilities — from AI-powered name generation through availability checking to automated registration. This document covers API provider selection, integration architecture, and phased implementation across CPM versions.
>
> **Author:** Christian, CEO — WebHouse ApS
> **Date:** February 2026
> **Status:** Living Document — v1.0
> **Scope:** Domain name APIs, registrar integration, DNS configuration, EU compliance

---

## The Problem

When a developer or founder starts a new project, one of the first — and most frustrating — tasks is finding an available domain name that fits the brand. Today, this means:

1. Brainstorming names manually
2. Tabbing to a registrar website
3. Typing each candidate one by one
4. Getting disappointed by "taken" results
5. Repeating until something mediocre sticks

CPM can collapse this entire workflow into a single step: describe your project, and CPM suggests names, checks availability in real-time, shows pricing, and — in the SaaS version — lets you register directly from the CPM interface.

This is a natural extension of **Stage 1 (Ideation & Discovery)** and **Stage 5 (SaaS Infrastructure)** in the CPM Vision pipeline.

---

## The Two-Part Architecture

Domain handling in CPM is split into two fundamentally different responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│                     CPM Domain Module                    │
├──────────────────────────┬──────────────────────────────┤
│   CREATIVE LAYER (AI)    │   TECHNICAL LAYER (API)      │
│                          │                              │
│  Name generation         │  Availability check          │
│  Brand-fit scoring       │  Pricing lookup              │
│  TLD recommendation      │  Domain registration         │
│  Variation suggestions   │  DNS configuration           │
│                          │                              │
│  Powered by Claude       │  Powered by Registrar API    │
│  Zero API cost (Max)     │  Pay-per-action              │
└──────────────────────────┴──────────────────────────────┘
```

**Why this split matters:** Name generation is a creative/AI task where Claude excels — it understands context, branding, linguistic patterns, and can generate dozens of candidates from a project description. Availability checking is a mechanical/API task that requires real-time registry data. Keeping these separate means:

- AI name generation costs nothing (Claude Max plan)
- API calls are minimized (only check names the user actually wants)
- The creative layer can work offline; only the technical layer needs network

---

## API Provider Strategy

### The Cloudflare Situation

Cloudflare is an excellent registrar with at-cost pricing, 400+ TLDs, free DNSSEC, and integrated DNS. However, their API has critical limitations for CPM's use case:

| Capability | Cloudflare API Status |
|---|---|
| List owned domains | ✅ Available (all plans) |
| Get domain details | ✅ Available (all plans) |
| Update domain settings | ✅ Available (all plans) |
| **Check availability** | ⚠️ Only for owned domains |
| **Register new domain** | ❌ Enterprise only |
| **Transfer domain** | ❌ Enterprise only |

**Verdict:** Cloudflare cannot serve as CPM's domain lookup or registration API. It can remain a recommended registrar for manual registration, or a DNS provider post-registration.

---

### Provider Comparison Matrix

After extensive research, these are the viable providers ranked by suitability for CPM:

| Provider | HQ | Availability API | Registration API | DNS API | Sandbox | Pricing Model | TLDs | Best For |
|---|---|---|---|---|---|---|---|---|
| **Gandi** | 🇫🇷 France | ✅ + prices | ✅ Full | ✅ LiveDNS | ✅ Yes | Pay-per-domain | 750+ | CPM SaaS (recommended) |
| **Domainr** (Fastly) | 🇺🇸 USA | ✅ Search + status | ❌ Redirect only | ❌ No | N/A | Free (RapidAPI) | 1000+ | CPM v1 MVP lookup |
| **DNSimple** | 🇺🇸 USA (remote) | ✅ + prices | ✅ Full | ✅ Full | ✅ Yes | $9/mo + per-domain | 400+ | Alternative to Gandi |
| **Openprovider** | 🇳🇱 Netherlands | ✅ Bulk + prices | ✅ Full | ✅ Yes | ✅ Yes | Wholesale/reseller | 2000+ | High-volume reselling |
| **Scaleway** | 🇫🇷 France | ✅ Basic | ✅ Basic | ✅ Integrated | N/A | Pay-per-domain | Limited | Cloud-native stack |
| **GoDaddy** | 🇺🇸 USA | ✅ (50+ domains req.) | ✅ (reseller) | ✅ Yes | ✅ OTE | Free (restricted) | 500+ | Disqualified (see below) |
| **WhoisXML API** | 🇺🇸 USA | ✅ Bulk | ❌ No | ❌ No | N/A | Credit-based | All | Lookup-only analytics |

### GoDaddy Disqualification

GoDaddy's API has three showstoppers for CPM:

1. **Access gate:** Availability API requires 50+ domains on the account OR $20/month spend
2. **ToS restriction:** Explicitly prohibits using the API behind a paywall — directly conflicts with CPM SaaS Pro tier
3. **Data sovereignty:** US-based, subject to CLOUD Act — problematic for EU-focused customers

### WhoisXML API / WhoAPI / WhoisFreaks

These are **lookup-only** services — they check availability but cannot register domains. Useful as a supplementary data source but not as a primary provider. WhoisXML offers 100 free queries, then credit-based pricing.

---

## Recommended Provider: Gandi (Primary)

### Why Gandi

Gandi is the strongest fit for CPM across all dimensions:

**API Completeness:** Single API covers the entire domain lifecycle — availability check with pricing, registration, renewal, transfer, WHOIS management, and full DNS (LiveDNS) with zone management, DNSSEC, and snapshots. No need for a second provider.

**Developer Experience:** REST API with JSON responses, Personal Access Tokens for authentication, sandbox environment for testing, comprehensive documentation at `api.gandi.net/docs/`. The `dry-run` header (`Dry-Run: 1`) lets you validate any operation without executing it — perfect for CPM's preview/confirm UX pattern.

**EU Data Sovereignty:** French company, ICANN-accredited, data stored in EU. GDPR-compliant by default. WHOIS privacy included. No CLOUD Act exposure.

**Pricing Model:** No monthly platform fee — you only pay for domains you register (at competitive rates). This is critical for CPM: there's zero cost until a user actually registers a domain. Prepaid account model works well for SaaS billing integration.

**TLD Coverage:** 750+ TLDs including all major ones (.com, .io, .dev, .app, .ai) plus European ccTLDs (.dk, .de, .fr, .nl, .eu).

**Danish Support:** Gandi supports `.dk` domain registration with the required `x-dk_ident_number` (CPR/CVR) and `x-dk_registrant_vatid` parameters natively in their API.

### Gandi API Endpoints for CPM

```
Domain Lifecycle:
  GET  /v5/domain/check?name={name}          → Availability + price
  POST /v5/domain/domains                     → Register domain
  GET  /v5/domain/domains                     → List owned domains
  GET  /v5/domain/domains/{domain}            → Domain details
  PUT  /v5/domain/domains/{domain}/autorenew  → Auto-renewal settings

DNS Management (LiveDNS):
  GET  /v5/livedns/domains/{domain}/records           → List all records
  POST /v5/livedns/domains/{domain}/records            → Add record
  PUT  /v5/livedns/domains/{domain}/records/{name}/{type} → Update record
  DEL  /v5/livedns/domains/{domain}/records/{name}/{type} → Delete record
  POST /v5/livedns/domains/{domain}/keys               → Enable DNSSEC

Authentication:
  Header: Authorization: Bearer {personal_access_token}
  Sandbox: api.sandbox.gandi.net
  Production: api.gandi.net
```

### Gandi API Response Examples

**Availability Check:**
```json
// GET /v5/domain/check?name=myproduct.io
{
  "currency": "EUR",
  "grid": "A",
  "products": [
    {
      "name": "myproduct.io",
      "status": "available",
      "process": "create",
      "prices": [
        {
          "duration_unit": "y",
          "min_duration": 1,
          "max_duration": 10,
          "price_before_taxes": 39.00,
          "price_after_taxes": 47.19
        }
      ]
    }
  ]
}
```

**Domain Registration:**
```json
// POST /v5/domain/domains
{
  "fqdn": "myproduct.io",
  "duration": 1,
  "owner": {
    "type": "company",
    "given": "Christian",
    "family": "Broberg",
    "orgname": "WebHouse ApS",
    "streetaddr": "...",
    "city": "Aarhus",
    "country": "DK",
    "phone": "+45...",
    "email": "...",
    "extra_parameters": {
      "x-dk_ident_number": "DK12345678"
    }
  }
}
```

---

## Recommended Provider: Domainr (Supplementary — v1 MVP)

### Why Domainr for v1

Domainr (now owned by Fastly) is purpose-built for the *creative discovery* phase — it's the best domain search API available, with intelligent per-keystroke suggestions, TLD-aware matching, and wide coverage. Available free through RapidAPI for low-volume use.

**Key capabilities:**
- `/v2/search?query=myproduct` → Returns creative suggestions across TLDs
- `/v2/status?domain=myproduct.io` → Returns availability status
- Supports IDN and Unicode domain names
- Results include registrar links for manual registration

**Limitations:**
- Cannot register domains (redirects to registrars)
- No DNS management
- No pricing data
- Free tier has rate limits (via RapidAPI)

**CPM v1 usage:** Domainr handles the "explore and discover" phase with zero cost. The user gets creative suggestions, checks availability, and then registers manually at their preferred registrar.

---

## Phased Implementation Plan

### Phase 1 — v1 MVP (Local, Free)

**Goal:** AI-powered name suggestions with real-time availability checking. No registration, no cost.

**Provider:** Domainr via RapidAPI (free tier)

**User Flow:**
```
User: "I'm building a task management app for remote teams"
  ↓
CPM (Claude): Generates 10-15 name candidates
  [remotask, teamflow, asyncwork, pulsedesk, driftboard, ...]
  ↓
CPM (Domainr API): Checks availability for each + common TLDs
  ↓
UI: Shows results table
  ┌────────────────┬──────┬──────┬──────┬──────┐
  │ Name           │ .com │ .io  │ .app │ .dev │
  ├────────────────┼──────┼──────┼──────┼──────┤
  │ remotask       │  ❌  │  ✅  │  ✅  │  ✅  │
  │ teamflow       │  ❌  │  ❌  │  ✅  │  ✅  │
  │ asyncwork      │  ✅  │  ✅  │  ✅  │  ✅  │
  │ pulsedesk      │  ✅  │  ✅  │  ✅  │  ❌  │
  │ driftboard     │  ✅  │  ✅  │  ✅  │  ✅  │
  └────────────────┴──────┴──────┴──────┴──────┘
  User clicks → opens registrar website for chosen domain
```

**Implementation:**
- New AI Toolkit module: `@cpm/shared/services/domain-discovery.ts`
- Domainr API wrapper: `@cpm/shared/connectors/domainr.ts`
- CLI command: `cpm domain suggest "project description"`
- CLI command: `cpm domain check myproduct.io`
- Web UI: Domain discovery card in project creation flow
- Config: `DOMAINR_API_KEY` in `.env` (RapidAPI key)

**API Budget:** ~100 free queries/month via RapidAPI. Sufficient for personal/local use.

---

### Phase 2 — v3 SaaS (Cloud, Freemium)

**Goal:** Full domain lifecycle — search, check with pricing, register, and configure DNS. All from CPM.

**Provider:** Gandi API (primary), Domainr (supplementary for search suggestions)

**User Flow:**
```
User: "I'm building a task management app for remote teams"
  ↓
CPM (Claude): Generates name candidates with brand-fit scores
  ↓
CPM (Domainr): Enriches with creative TLD suggestions
  ↓
CPM (Gandi): Checks availability + retrieves exact pricing
  ↓
UI: Interactive results with pricing
  ┌────────────────┬────────────┬──────────┬─────────┐
  │ Domain         │ Available  │ Price/yr │ Action  │
  ├────────────────┼────────────┼──────────┼─────────┤
  │ asyncwork.com  │  ✅ Free   │  €12.54  │ [Register] │
  │ asyncwork.io   │  ✅ Free   │  €39.00  │ [Register] │
  │ asyncwork.dev  │  ✅ Free   │  €14.00  │ [Register] │
  │ teamflow.app   │  ⚠️ Premium│  €450.00 │ [Details]  │
  │ remotask.com   │  ❌ Taken  │    —     │ [WHOIS]    │
  └────────────────┴────────────┴──────────┴─────────┘
  ↓
User clicks [Register] on asyncwork.com
  ↓
CPM (Gandi): Registers domain with user's saved contact details
  ↓
CPM (Gandi LiveDNS): Configures DNS records
  - A record → deployment IP (Vercel/Fly.io)
  - CNAME www → deployment
  - MX records → email provider
  - TXT records → SPF/DKIM/DMARC
  ↓
Domain is live and configured ✅
```

**Implementation:**
- Gandi connector: `@cpm/shared/connectors/gandi.ts`
  - `checkAvailability(domain: string): Promise<DomainAvailability>`
  - `getDomainPrices(domain: string): Promise<DomainPricing>`
  - `registerDomain(domain: string, contact: ContactInfo): Promise<DomainRegistration>`
  - `configureDNS(domain: string, records: DNSRecord[]): Promise<void>`
- Contact management: Stored in user profile, reusable across registrations
- Billing integration: Gandi prepaid account funded via CPM's Stripe billing
- CLI commands:
  ```bash
  cpm domain suggest "project description"     # AI name generation
  cpm domain check myproduct.io                # Availability + price
  cpm domain register myproduct.io             # Register (requires SaaS account)
  cpm domain dns myproduct.io                  # Show/manage DNS records
  cpm domain dns myproduct.io --setup vercel   # Preset DNS for Vercel
  cpm domain dns myproduct.io --setup fly      # Preset DNS for Fly.io
  cpm domain list                              # List registered domains
  ```

**Pricing for CPM users:**
- Free tier: Domain suggestions + availability check (unlimited)
- Pro tier: Registration + DNS management (Gandi cost + CPM margin)
- Self-hosted: Bring your own Gandi API key

**API Budget:** Gandi charges nothing for API access. Costs are per-domain registration only. Availability checks are free and unlimited.

---

### Phase 3 — v4+ Autonomous (Pipeline Integration)

**Goal:** Domain registration as an automated step in the Overnight Product Machine pipeline.

In the fully autonomous pipeline (CPM Vision Stage 5), domain registration becomes a non-interactive step:

```
Stage 1 (Ideation) outputs: Product name + brand identity
  ↓
Stage 5 (Infrastructure) includes:
  1. Check availability of preferred domain
  2. If available → register automatically
  3. If taken → try alternatives from Stage 1 ranked list
  4. Configure DNS for deployment target
  5. Verify propagation
  6. Continue to SSL/deployment
```

**Implementation:**
- Pipeline step: `@cpm/runner/steps/domain-provision.ts`
- Autonomous decision logic: try primary name, fall back to alternatives
- DNS template system: pre-built configurations for common deploy targets
- Health check: verify DNS propagation before proceeding to deployment
- Rollback: if deployment fails, domain is parked with a "coming soon" page

---

## Data Model

### Domain Suggestion (Ephemeral — not persisted)

```typescript
interface DomainSuggestion {
  name: string;              // "asyncwork"
  tld: string;               // "com"
  fqdn: string;              // "asyncwork.com"
  available: boolean;
  premium: boolean;
  price: number | null;      // Annual price in user's currency
  currency: string;          // "EUR" | "USD" | "DKK"
  brandScore: number;        // 0-100, AI-generated brand-fit score
  source: 'ai' | 'domainr'; // Who suggested this name
}
```

### Registered Domain (Persisted)

```typescript
// packages/shared/types/domain.ts

interface RegisteredDomain {
  id: string;                          // UUID
  projectId: string;                   // Link to CPM project
  fqdn: string;                       // "asyncwork.com"
  registrar: 'gandi' | 'cloudflare' | 'other';
  registrarDomainId: string | null;    // External ID at registrar
  status: 'pending' | 'active' | 'expired' | 'transferred';
  expiresAt: Date;
  autoRenew: boolean;
  dnsProvider: 'gandi' | 'cloudflare' | 'custom';
  dnsRecords: DNSRecord[];             // Cached snapshot of current records
  sslStatus: 'none' | 'pending' | 'active';
  createdAt: Date;
  updatedAt: Date;
}

interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;                        // "@" | "www" | "api" | etc.
  value: string;
  ttl: number;                         // Seconds, default 3600
  priority?: number;                   // MX records
}
```

### Database Schema (Drizzle)

```typescript
// packages/db/schema/domains.ts

export const registeredDomains = sqliteTable('registered_domains', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  fqdn: text('fqdn').notNull().unique(),
  registrar: text('registrar', { enum: ['gandi', 'cloudflare', 'other'] }).default('gandi'),
  registrarDomainId: text('registrar_domain_id'),
  status: text('status', { enum: ['pending', 'active', 'expired', 'transferred'] }).default('pending'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).default(true),
  dnsProvider: text('dns_provider', { enum: ['gandi', 'cloudflare', 'custom'] }).default('gandi'),
  dnsRecords: text('dns_records', { mode: 'json' }).$type<DNSRecord[]>().default([]),
  sslStatus: text('ssl_status', { enum: ['none', 'pending', 'active'] }).default('none'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});
```

---

## DNS Template System

Pre-built DNS configurations for common deployment targets, applied with a single command or click:

### Vercel Template
```json
{
  "name": "vercel",
  "description": "Standard Vercel deployment",
  "records": [
    { "type": "A", "name": "@", "value": "76.76.21.21", "ttl": 3600 },
    { "type": "CNAME", "name": "www", "value": "cname.vercel-dns.com", "ttl": 3600 }
  ]
}
```

### Fly.io Template
```json
{
  "name": "fly",
  "description": "Standard Fly.io deployment",
  "records": [
    { "type": "A", "name": "@", "value": "${FLY_IP}", "ttl": 3600 },
    { "type": "AAAA", "name": "@", "value": "${FLY_IPV6}", "ttl": 3600 },
    { "type": "CNAME", "name": "www", "value": "${APP_NAME}.fly.dev", "ttl": 3600 }
  ]
}
```

### Cloudflare Pages Template
```json
{
  "name": "cloudflare-pages",
  "description": "Cloudflare Pages deployment (DNS at Gandi, hosting at CF)",
  "records": [
    { "type": "CNAME", "name": "@", "value": "${PROJECT}.pages.dev", "ttl": 3600 },
    { "type": "CNAME", "name": "www", "value": "${PROJECT}.pages.dev", "ttl": 3600 }
  ]
}
```

### Email Template (Protonmail / Generic)
```json
{
  "name": "email-protonmail",
  "description": "Protonmail business email",
  "records": [
    { "type": "MX", "name": "@", "value": "mail.protonmail.ch", "ttl": 3600, "priority": 10 },
    { "type": "MX", "name": "@", "value": "mailsec.protonmail.ch", "ttl": 3600, "priority": 20 },
    { "type": "TXT", "name": "@", "value": "v=spf1 include:_spf.protonmail.ch ~all", "ttl": 3600 },
    { "type": "CNAME", "name": "protonmail._domainkey", "value": "protonmail.domainkey.${DKIM_ID}.domains.proton.ch", "ttl": 3600 },
    { "type": "TXT", "name": "_dmarc", "value": "v=DMARC1; p=quarantine; rua=mailto:dmarc@${DOMAIN}", "ttl": 3600 }
  ]
}
```

Templates are composable — a user can apply `vercel` + `email-protonmail` to get both hosting and email configured in one operation.

---

## AI Name Generation Strategy

The creative layer uses Claude (via CPM's existing prompt generation) to produce high-quality domain name suggestions. The prompt is engineered to generate names that are:

1. **Short** — 6-12 characters preferred, never over 15
2. **Pronounceable** — easy to say in conversation and spell from hearing
3. **Memorable** — distinctive, not generic
4. **Brandable** — works as a company/product name, not just a URL
5. **Available-likely** — avoids common dictionary words that are always taken

### Name Generation Prompt Template

```
## GOAL
Generate 15 domain name suggestions for a new project.

## PROJECT CONTEXT
{user's project description}

## TARGET AUDIENCE
{from project or developer profile}

## CONSTRAINTS
- Names must be 6-12 characters (excluding TLD)
- Names must be pronounceable in English (and {user's language} if different)
- Names must not be existing well-known brands or trademarks
- Prioritize: invented words, clever portmanteaus, verb+noun combos, and
  metaphorical names over literal descriptions
- For each name, suggest the best-fit TLD (.com, .io, .dev, .app, .ai, etc.)

## OUTPUT FORMAT
Return a JSON array with objects containing:
- name: the domain name (without TLD)
- tld: recommended primary TLD
- alternativeTlds: array of 2-3 alternative TLDs
- rationale: one sentence explaining the name's connection to the project
- brandScore: 0-100 rating of brandability
```

### Brand Scoring Criteria

The AI assigns a `brandScore` (0-100) based on:

| Factor | Weight | Description |
|---|---|---|
| Length | 20% | Shorter is better (6-8 chars = max score) |
| Pronounceability | 25% | Can it be said aloud clearly? |
| Memorability | 20% | Is it distinctive and sticky? |
| Spelling clarity | 15% | Can someone spell it from hearing it? |
| Brand potential | 20% | Does it work as a company name, not just a URL? |

---

## Connector Architecture Integration

The domain module follows CPM's existing Connector Architecture (v5):

```typescript
// packages/shared/connectors/gandi.ts

import { BaseConnector } from './base.js';

export class GandiConnector extends BaseConnector {
  id = 'gandi';
  name = 'Gandi Domain Registrar';
  category = 'infrastructure';
  requiredConfig = ['GANDI_API_TOKEN'];
  optionalConfig = ['GANDI_SHARING_ID'];

  async checkAvailability(domain: string): Promise<DomainAvailability> { /* ... */ }
  async getDomainPrices(domain: string): Promise<DomainPricing> { /* ... */ }
  async registerDomain(domain: string, contact: ContactInfo, options?: RegisterOptions): Promise<DomainRegistration> { /* ... */ }
  async listDNSRecords(domain: string): Promise<DNSRecord[]> { /* ... */ }
  async setDNSRecords(domain: string, records: DNSRecord[]): Promise<void> { /* ... */ }
  async applyDNSTemplate(domain: string, template: string, vars: Record<string, string>): Promise<void> { /* ... */ }
  async testConnection(): Promise<boolean> { /* ... */ }
}
```

```typescript
// packages/shared/connectors/domainr.ts

import { BaseConnector } from './base.js';

export class DomainrConnector extends BaseConnector {
  id = 'domainr';
  name = 'Domainr Domain Search';
  category = 'discovery';
  requiredConfig = ['DOMAINR_API_KEY'];

  async search(query: string): Promise<DomainSuggestion[]> { /* ... */ }
  async checkStatus(domain: string): Promise<DomainStatus> { /* ... */ }
  async testConnection(): Promise<boolean> { /* ... */ }
}
```

---

## Security & Compliance

### API Key Management

- Gandi Personal Access Token stored in `.env` (self-hosted) or encrypted in database (SaaS)
- Tokens scoped per-organization in Gandi — CPM uses a dedicated org
- Domainr API key via RapidAPI — standard API key in header

### EU Data Compliance

- **Gandi (France):** GDPR-compliant, EU data residency, WHOIS privacy by default
- **No US data exposure:** Domain contact data never leaves EU jurisdiction
- **WHOIS redaction:** Gandi automatically redacts personal data from public WHOIS where permitted by registry policy

### Domain Registration Safeguards

- Registration is always a **two-step confirm** — CPM shows price and contact details, user must explicitly confirm
- `Dry-Run: 1` header used for all preview/validation requests
- Registration failures are logged with full error context for support
- No auto-registration without explicit user consent (even in autonomous pipeline mode — the pipeline pauses for human approval at the registration step)

### Financial Safeguards

- SaaS mode: CPM charges user's payment method *before* initiating Gandi registration
- Self-hosted mode: User's own Gandi prepaid balance — CPM shows balance before registration
- Failed registrations trigger automatic refund/credit

---

## Environment Configuration

### v1 MVP (Local)
```bash
# .env — Domain discovery only
DOMAINR_API_KEY=your_rapidapi_key_here
```

### v3 SaaS (Cloud)
```bash
# .env — Full domain lifecycle
DOMAINR_API_KEY=your_rapidapi_key_here
GANDI_API_TOKEN=your_personal_access_token_here
GANDI_SHARING_ID=your_organization_id_here    # Optional, for org-scoped operations
GANDI_SANDBOX=false                            # true for testing
```

---

## Cost Analysis

### For CPM (Platform Costs)

| Component | v1 MVP | v3 SaaS |
|---|---|---|
| Domainr API | Free (RapidAPI free tier) | Free (low volume) |
| Gandi API access | N/A | Free (no platform fee) |
| Gandi domain registrations | N/A | At-cost (passed to user + margin) |
| Total platform overhead | **$0/month** | **$0/month** (costs are per-transaction) |

### For CPM Users

| Action | Cost |
|---|---|
| AI name generation | Free (included in CPM) |
| Availability check | Free (unlimited) |
| Domain registration (.com) | ~€12-15/year (Gandi at-cost + CPM margin) |
| Domain registration (.io) | ~€39-45/year |
| DNS management | Free (included with domain) |
| DNS template application | Free |

### Margin Strategy

CPM adds a small margin (10-15%) on domain registration to cover operational overhead. This is transparent to the user — CPM shows the Gandi base price and the CPM service fee separately. Self-hosted users pay Gandi directly at-cost.

---

## Alternative Provider: Option B — Keeping Cloudflare

For users who prefer Cloudflare as their registrar/DNS provider, CPM supports a hybrid workflow:

```
CPM (Domainr/Gandi) → Availability check + pricing
  ↓
User chooses domain
  ↓
Option A: Register via Gandi (automated, full API)
Option B: "Register at Cloudflare" → Opens Cloudflare dashboard with domain pre-filled
  ↓
After registration (either path):
  CPM detects domain via Cloudflare API (list owned domains)
  CPM configures DNS via Cloudflare API (zone management — free tier)
```

This means CPM supports Cloudflare for DNS management even if registration happens elsewhere. The Cloudflare DNS API is free and fully featured for zone management on domains already added to Cloudflare.

---

## Dependencies & Prerequisites

### Before v1 Implementation
- [ ] RapidAPI account created
- [ ] Domainr API key obtained (free tier)
- [ ] Connector Architecture base classes implemented (v5)

### Before v3 Implementation
- [ ] Gandi account created with organization
- [ ] Gandi Personal Access Token generated
- [ ] Gandi prepaid account funded (for testing)
- [ ] Gandi sandbox environment tested
- [ ] Stripe billing integration complete (for charging users)
- [ ] Contact management UI built (for registration contact details)
- [ ] DNS template system implemented and tested

### Before v4 Implementation
- [ ] Autonomous pipeline Step 5 (Infrastructure) framework complete
- [ ] Domain health-check / propagation-check utility built
- [ ] Fallback logic for "domain taken" scenarios tested
- [ ] Human approval gate for registration in pipeline mode

---

## Open Questions

1. **Should CPM support multiple registrars?** Currently planned for Gandi primary + Cloudflare DNS. Adding more registrars (Openprovider, DNSimple) adds flexibility but increases maintenance. Recommendation: start with Gandi only, add others based on user demand.

2. **Domain aftermarket integration?** When a desired .com is taken, should CPM show aftermarket prices (e.g., via Sedo/Afternic APIs)? Potentially valuable but adds complexity. Park for post-v3.

3. **Bulk registration pricing?** For users registering multiple domains (brand protection), should CPM offer volume discounts? Gandi's pricing is already competitive, but this could be a Pro tier differentiator.

4. **Domain monitoring/renewal reminders?** Should CPM track expiration dates and send reminders? Gandi handles auto-renewal, but CPM could add a dashboard view. Low effort, nice-to-have for v3.

---

## Summary

| Phase | Provider | Capabilities | Cost |
|---|---|---|---|
| **v1 MVP** | Domainr (free) | AI naming + availability check | $0 |
| **v3 SaaS** | Gandi (EU) + Domainr | Full lifecycle: search → register → DNS | Per-domain only |
| **v4 Pipeline** | Gandi (EU) | Autonomous registration in overnight pipeline | Per-domain only |

**Key decisions:**
- Gandi is the primary registrar (EU-based, full API, no platform fee)
- Domainr supplements with creative search suggestions
- Cloudflare supported as optional DNS provider for existing users
- AI name generation is a first-class CPM feature, not an afterthought
- Registration always requires human confirmation, even in autonomous mode

---

*This document should be read by Claude Code at the start of any domain-related CPM development session. It represents the strategic and technical foundation for CPM's domain discovery and registration capabilities.*

*Last updated: February 2026 — Living document, updated with each implementation phase.*
