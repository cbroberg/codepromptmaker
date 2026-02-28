# v9 — CPM Project Onboarding: Import Existing Apps

> **Version:** v9
> **Afhængigheder:** v5.0 (Project Context Manager, Connector Architecture), v5.2 (Codebase Indexer), v8 (Knowledge Extractor)
> **Formål:** Gør CPM til "manager" for eksisterende, levende applikationer ved at importere GitHub repos og gøre dem til førsteklasses CPM-projekter.

---

## 1. Problemet

Christian bygger og vedligeholder komplekse apps som **FysioDK Sport** — et pnpm monorepo med Next.js 16, Supabase, Capacitor (iOS + Android), Fastlane CI/CD, 14+ database migrations, 10+ E2E test flows, push notifications, audit logging, og store monitoring. Denne app er bygget primært med Claude Code, men CPM har ingen viden om den.

Udfordringerne i dag:

- **Ingen central oversigt** — Features, bugs, og teknisk gæld trackes i Apple Notes, CLAUDE.md sessionsnoter, og hukommelse
- **Kontekst-tab ved sessioner** — Hver ny cc-session starter fra scratch og skal genopbygge forståelse af kodebasen
- **Ingen validering af features mod kodebasen** — "Er multi-tenant support realistisk givet nuværende database schema?" kræver manuel analyse
- **Ingen automatisk Prompt Contract generering** — Nye features kræver manuelt kontekstarbejde for at cc forstår eksisterende arkitektur

## 2. Visionen

CPM som **App Manager** — en platform der:

1. **Importerer** et eksisterende GitHub repo og analyserer dets arkitektur
2. **Vedligeholder** et levende "Project DNA" der holdes synkroniseret med kodebasen
3. **Modtager feature requests** i naturligt sprog og validerer dem mod kodebasens virkelighed
4. **Genererer Prompt Contracts** der er forhåndsfyldt med projektets kontekst, patterns, regler og stack
5. **Orkestrerer cc** til at bygge features autonomt med fuld kendskab til kodebasen

### Cockpit-metaforen udvidet

CPM er cockpittet. Et importeret projekt er et *fly i flåden*. Feature banken er *flight planen*. Prompt Contracts er *autopilot-instruktionerne*. cc er *motoren*.

---

## 3. Project Onboarding Pipeline

### 3.1 Fase 1: Repository Import

```
cpm project import --github webhousecode/fysiodk-aalborg-sport
```

**Hvad sker der:**

1. **GitHub Connector** (v5) cloner eller læser repo via GitHub API/CLI
2. **Repo Scanner** analyserer projektstruktur:
   - Detekterer monorepo-type (pnpm, npm, yarn, turbo, nx, lerna)
   - Finder alle packages/apps og deres afhængigheder
   - Identificerer framework (Next.js, React, Vue, Svelte, etc.)
   - Finder database-lag (Supabase, Drizzle, Prisma, etc.)
   - Detekterer CI/CD (GitHub Actions, Fastlane, etc.)
   - Parser CLAUDE.md hvis den eksisterer (guldmine af kontekst)
3. **Project DNA** genereres — et struktureret JSON/markdown objekt

### 3.2 Project DNA Model

```typescript
interface ProjectDNA {
  id: string;
  name: string;
  slug: string;                          // f.eks. "fysiodk-sport"
  repo: {
    url: string;                         // GitHub URL
    defaultBranch: string;
    lastCommit: string;
    lastSyncedAt: Date;
  };
  
  // Auto-detekteret ved import
  structure: {
    type: 'monorepo' | 'single-app';
    manager: 'pnpm' | 'npm' | 'yarn';
    buildTool: 'turbo' | 'nx' | 'none';
    apps: AppDescriptor[];               // Alle apps/packages
    sharedPackages: PackageDescriptor[];
  };
  
  stack: {
    framework: string;                   // "Next.js 16.1.6"
    language: string;                    // "TypeScript 5.9.3"
    styling: string;                     // "Tailwind CSS 3.4.x"
    database: string;                    // "Supabase (PostgreSQL)"
    auth: string;                        // "Supabase Auth"
    mobile: string | null;               // "Capacitor 8.x"
    ui: string;                          // "Radix UI + ShadCN/UI"
    testing: string;                     // "Playwright E2E"
  };
  
  // Fra CLAUDE.md parsing
  rules: string[];                       // "Hårde Regler" sektionen
  patterns: string[];                    // Kodningspatterns
  uiPatterns: string[];                  // UI-specifikke patterns
  
  // Fra migration-analyse
  database: {
    tables: TableDescriptor[];
    migrations: MigrationDescriptor[];
    rlsPolicies: string[];
  };
  
  // Fra CI/CD analyse
  deployment: {
    hosting: string;                     // "Self-hosted AWS Ubuntu"
    cicd: string;                        // "GitHub Actions"
    mobileDistribution: {
      ios: string;                       // "Fastlane → TestFlight"
      android: string;                   // "Fastlane → Google Play"
    };
  };
  
  // Auth & roller
  rbac: {
    roles: RoleDescriptor[];
    permissionMatrix: Record<string, string[]>;
  };
  
  // Levende metadata
  health: {
    lastDeploy: Date;
    openIssues: number;
    testCoverage: number | null;
    lastE2ERun: Date | null;
  };
}
```

### 3.3 Fase 2: CLAUDE.md Parsing (den store smutvej)

FysioDK Sport har en 35KB CLAUDE.md der indeholder:

- Stack-valg og hårde regler
- UI patterns med kodeeksempler
- Session-noter med implementeringsdetaljer
- Deploy-pipeline dokumentation
- E2E test-suite beskrivelser
- Database schema-reference
- Team-kontaktinformation

**CPM parser denne fil** og ekstraherer struktureret data:

```typescript
interface ClaudeMdExtract {
  stackRules: Rule[];           // "Installér aldrig en ny dependency uden at spørge"
  codePatterns: CodePattern[];  // SearchInput, StatusBadge, osv.
  teamMembers: TeamMember[];    // Christian, Mikkel, Morten, Nina
  deployConfig: DeployConfig;   // pnpm ship, GitHub Actions
  sessionHistory: Session[];    // Implementerede features med datoer
  knownIssues: Issue[];         // Fra KNOWN_ISSUES.md reference
}
```

### 3.4 Fase 3: Database Schema Analyse

Scanner `supabase/migrations/` og bygger en levende forståelse:

- **Tabeller og relationer** — profiles, clinics, injuries, injury_areas, audit_logs, etc.
- **RLS-policies** — Hvem kan se hvad
- **Funktioner og triggers** — pg_cron jobs, notification triggers
- **Enum-værdier** — injury status flow, brugerroller

### 3.5 Fase 4: Synkronisering

```
cpm project sync fysiodk-sport
```

Henter seneste ændringer fra GitHub og opdaterer Project DNA:
- Nye migrations → opdatér database-sektion
- Nye commits → opdatér session-historie
- Ændret CLAUDE.md → re-parse regler og patterns

---

## 4. Arkitektonisk Placering i CPM

### Nye Komponenter

```
@cpm/shared
  ├── types/project-dna.ts          # ProjectDNA interface
  ├── services/repo-scanner.ts      # GitHub repo analyse
  ├── services/claudemd-parser.ts   # CLAUDE.md intelligent parsing
  └── services/migration-analyzer.ts # Database schema analyse

@cpm/db
  └── schema/projects.ts            # Udvidet project-tabel med DNA

@cpm/cli
  └── commands/project-import.ts    # cpm project import --github <repo>
  └── commands/project-sync.ts      # cpm project sync

@cpm/web
  └── app/(app)/projects/[id]/      # Project dashboard med DNA-overblik
```

### Integration med Eksisterende v5 Moduler

| v5 Modul | Integration med v9 |
|----------|-------------------|
| **Project Context Manager** | Project DNA bliver den primære datakilde for project context |
| **Knowledge Base** | Parsed CLAUDE.md-sektioner importeres som context blocks |
| **Connector Architecture** | GitHub connector leverer repo-data, Supabase connector leverer live database-info |
| **Codebase Indexer (v5.2)** | Bygger videre på repo scanner med AST-analyse og dependency graphs |
| **Plan Management** | Feature Bank items kan linkes til planer |
| **Template Library** | Projektets patterns bliver til templates automatisk |

---

## 5. CLI Commands

```bash
# --- Project Import ---
cpm project import --github webhousecode/fysiodk-aalborg-sport
cpm project import --github webhousecode/fysiodk-aalborg-sport --name "FDS"
cpm project import --local /Users/cb/Apps/webhouse/fysiodk-aalborg-sport

# --- Project Sync ---
cpm project sync                    # Sync aktivt projekt
cpm project sync fysiodk-sport      # Sync specifikt projekt
cpm project sync --full             # Fuld re-scan (ikke bare delta)

# --- Project DNA ---
cpm project dna                     # Vis Project DNA for aktivt projekt
cpm project dna --section stack     # Vis kun stack-sektionen
cpm project dna --section database  # Vis database schema
cpm project dna --section rules     # Vis regler fra CLAUDE.md

# --- Project Health ---
cpm project health                  # Status: deploy, tests, issues
```

---

## 6. FysioDK Sport som Reference Implementation

Ved import af FysioDK Sport ville CPM generere dette Project DNA:

```yaml
name: FysioDK Sport
slug: fysiodk-sport
repo: webhousecode/fysiodk-aalborg-sport

structure:
  type: monorepo
  manager: pnpm
  buildTool: turbo
  apps:
    - name: web (Next.js 16.1.6 + Capacitor 8.x)
      path: apps/web
      purpose: "Hybrid web + mobile app for injury reporting"
  sharedPackages:
    - name: shared
      path: packages/shared
      exports: [types, constants]

stack:
  framework: "Next.js 16.1.6 (App Router)"
  language: "TypeScript 5.9.3 (strict)"
  styling: "Tailwind CSS 3.4.x"
  database: "Supabase PostgreSQL + RLS"
  auth: "Supabase Auth (email, Google OAuth, biometric)"
  mobile: "Capacitor 8.x (iOS + Android)"
  ui: "Radix UI + ShadCN/UI + Lucide"
  testing: "Playwright E2E (10 flows, 14 tests)"
  
rules:
  - "Installér aldrig ny dependency uden at spørge"
  - "Modificér aldrig database schema uden at vise migrationsplan"
  - "Alle eksterne API-kald bag interne API routes"
  - "Alle brugervendte tekster på dansk"
  - "Server components som default"
  - "Fjern aldrig eksisterende funktionalitet uden aftale"

database:
  tables: [profiles, clinics, injuries, injury_areas, audit_logs, 
           push_tokens, email_templates, announcements, cron_settings,
           store_monitor_snapshots, store_monitor_changes, store_monitor_settings]
  migrations: 14
  
rbac:
  roles: [owner, admin, behandler, user]
  
deployment:
  hosting: "Self-hosted AWS Ubuntu (WebHouse.dk Stockholm)"
  cicd: "GitHub Actions → Docker → PM2 + Apache"
  ios: "Fastlane → TestFlight → App Store"
  android: "Fastlane → Google Play"
```

**Denne DNA** injiceres automatisk i enhver Prompt Contract der genereres for FysioDK Sport — cc starter aldrig fra scratch igen.

---

## 7. Konsekvenser for Prompt Contract Generering

Når CPM kender et projekts DNA, ændres Prompt Contract genereringen fundamentalt:

### Før (uden Project DNA)
```markdown
## GOAL
Implementér multi-tenant support i min Next.js app.

## CONSTRAINTS
- Brug TypeScript
- Brug Supabase
```

### Efter (med Project DNA injiceret)
```markdown
## GOAL
Implementér multi-tenant support i FysioDK Sport så systemet kan 
videresælges til andre fysioterapiklinikker (f.eks. Brønderslev).

## CONSTRAINTS
- Monorepo: pnpm + Turbo (apps/web + packages/shared)
- Eksisterende database: 14 Supabase migrations, RLS-policies per rolle
- 4 roller: owner, admin, behandler, user — permission matrix i constants.ts
- Eksisterende tabeller: profiles (har IKKE tenant_id endnu), clinics, injuries
- Deploy: Docker → GitHub Actions → PM2 på AWS Ubuntu
- ALTID server components, ALDRIG nye dependencies uden godkendelse
- Alle tekster på dansk
- Test: Opdatér relevante E2E flows (10 flows eksisterer)

## FORMAT
1. Database migration (00015_multi_tenant.sql) med:
   - tenants tabel
   - tenant_id FK på profiles, clinics, injuries
   - RLS policies opdateret per tenant
2. Shared types opdateret (packages/shared/src/types.ts)
3. API routes opdateret med tenant-scoping
4. Admin UI for tenant management

## FAILURE CONDITIONS
- RLS policies der lækker data på tværs af tenants
- Eksisterende brugere mister adgang under migration
- E2E tests der fejler efter ændring
```

**Forskellen er nat og dag.** cc ved præcis hvad den arbejder med.

---

## 8. Afhængigheder og Implementation Rækkefølge

```
v5.0 Project Context Manager  ─── Fundament (allerede spec'et)
         │
v5.0 Connector Architecture   ─── GitHub connector
         │
v8  Knowledge Extractor        ─── Repo scanning primitiver
         │
v9  Project Onboarding         ─── DETTE DOKUMENT
         │
    ├── Repo Scanner
    ├── CLAUDE.md Parser  
    ├── Migration Analyzer
    ├── Project DNA Generator
    └── Sync Engine
```

**Estimat:** 5-7 dage implementering (efter v5.0 og v8 er stabile)

---

## 9. Relation til Feature Bank (v9.1)

Project Onboarding er *forudsætningen* for Feature Bank. Uden Project DNA kan features ikke valideres mod kodebasen. Se **v9.1 — Feature Bank** for det næste lag der bygger oven på dette fundament.

Flowet er:

```
1. cpm project import     → Project DNA oprettet
2. cpm feature add        → Feature registreret i Feature Bank
3. cpm feature validate   → Feature valideret mod Project DNA
4. cpm feature plan       → Feature → Plan → Prompt Contract(s)
5. cpm run               → cc bygger featuren autonomt
```
