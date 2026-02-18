'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Target,
  User,
  Database,
  Terminal,
  Copy,
  RefreshCw,
  Github,
  Star,
  Sparkles,
  CheckCircle2,
  Code2,
  Zap,
  Shield,
  Check,
  X,
  AlertCircle,
  Menu,
} from 'lucide-react';

/* ==========================================================================
   MERGED SAAS LANDING PAGE
   Figma layout + Gemini polish, per section-by-section feedback decisions.
   Adapted for theme-aware color system (CSS custom properties).
   ========================================================================== */

export function SaasLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <HeroSection />
        <BeforeAfterSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CliSection />
        <OpenSourceSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  );
}

/* --------------------------------------------------------------------------
   NAVBAR — Figma layout + Gemini logo/hover/glass-nav
   -------------------------------------------------------------------------- */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
        {/* Logo — Gemini style (Code2 icon + text) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
            <Code2 size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">CodePromptMaker</span>
        </Link>

        {/* Desktop nav links — Gemini hover (indigo) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-indigo-500 transition-colors">Docs</a>
          <Link href="/generate" className="hover:text-indigo-500 transition-colors">Generate</Link>
          <a href="#github" className="hover:text-indigo-500 transition-colors inline-flex items-center gap-1">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Desktop CTA — Figma buttons (Star on GitHub + Sign Up Free) */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:text-indigo-500 hover:border-indigo-500/30"
          >
            <Star className="w-4 h-4 mr-1" />
            Star on GitHub
          </Button>
          <Button
            size="sm"
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-indigo-200"
            asChild
          >
            <Link href="/generate">Sign Up Free</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-card border-b border-border p-4 flex flex-col gap-4 md:hidden shadow-lg">
          <a href="#features" className="text-muted-foreground font-medium">Features</a>
          <a href="#pricing" className="text-muted-foreground font-medium">Pricing</a>
          <a href="#docs" className="text-muted-foreground font-medium">Docs</a>
          <Link href="/generate" className="text-muted-foreground font-medium">Generate</Link>
          <div className="h-px bg-muted w-full" />
          <a href="#" className="flex items-center justify-center gap-2 w-full border border-border py-2 rounded-lg font-medium text-foreground">
            <Github size={16} /> Star on GitHub
          </a>
          <Link href="/generate" className="w-full bg-indigo-500 text-white py-2 rounded-lg font-medium text-center block">
            Sign Up Free
          </Link>
        </div>
      )}
    </nav>
  );
}

/* --------------------------------------------------------------------------
   HERO — Figma structure + updated text + Gemini window chrome + Figma dots
   -------------------------------------------------------------------------- */
function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Background blobs from Gemini */}
      <div className="absolute top-0 left-[-100px] w-96 h-96 rounded-full bg-indigo-100 blur-[80px] opacity-40 z-0 dark:opacity-10" />
      <div className="absolute bottom-0 right-[-50px] w-80 h-80 rounded-full bg-cyan-100 blur-[80px] opacity-40 z-0 dark:opacity-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge — Figma "Now with CLI support" */}
          <a href="#cli" className="inline-block">
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 cursor-pointer hover:bg-indigo-500/15 transition-colors">
              <Sparkles className="w-3 h-3 mr-1" />
              Now with CLI support
            </Badge>
          </a>

          {/* Headline — Figma */}
          <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Stop vibe coding.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Start shipping.
            </span>
          </h1>

          {/* Subheader — updated per feedback */}
          <p className="mb-10 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transform natural language into structured Plans and Prompt Contracts that make Agentic AI deliver on the first try.
          </p>

          {/* CTA buttons — Figma */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg px-8 py-6 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all dark:shadow-indigo-500/20"
              asChild
            >
              <Link href="/generate">
                Try Free — 25 prompts included
                <Zap className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground text-lg px-8 py-6"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Terminal preview — Figma content, Gemini window chrome, Figma colored dots */}
          <div className="mt-16 relative rounded-xl bg-slate-900 shadow-2xl shadow-indigo-500/10 border border-slate-700 overflow-hidden">
            {/* Gemini-style window header with Figma colored dots */}
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="ml-2 text-slate-400 text-xs font-mono">terminal</div>
            </div>
            {/* Figma terminal content */}
            <div className="p-6 text-left">
              <code className="text-slate-200 font-mono text-sm">
                <div className="text-cyan-400">$ cpm generate &quot;Add subscription system&quot;</div>
                <div className="mt-2 text-slate-400">&#10003; Analyzing request...</div>
                <div className="text-slate-400">&#10003; Building Prompt Contract...</div>
                <div className="text-emerald-400 mt-2">&#10003; Ready to copy!</div>
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   BEFORE/AFTER — Figma cards + Gemini interactive toggle below
   -------------------------------------------------------------------------- */
function BeforeAfterSection() {
  const [copiedDemo, setCopiedDemo] = useState(false);
  const [view, setView] = useState<'before' | 'after'>('before');

  const handleCopyDemo = () => {
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Same idea. 10x better results.
            </h2>
            <p className="text-xl text-muted-foreground">
              Compare a vague prompt with a structured Prompt Contract
            </p>
          </div>

          {/* Figma before/after cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="border-2 border-red-500/20 bg-red-50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <X className="w-5 h-5" />
                  Vague Prompt
                </CardTitle>
                <CardDescription>What most developers do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-800 p-4">
                  <code className="text-slate-200 font-mono text-sm">
                    <div className="text-slate-400">&gt; Add a subscription system to the app</div>
                  </code>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Result: Vague implementation, missing constraints, hours of back-and-forth
                </p>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  Prompt Contract
                </CardTitle>
                <CardDescription>What CPM generates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-800 p-4 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={handleCopyDemo}
                  >
                    {copiedDemo ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <code className="text-slate-200 font-mono text-xs leading-relaxed">
                    <div className="text-cyan-400 font-bold">## GOAL</div>
                    <div className="text-slate-400 mb-3">Implement Stripe subscription system with Pro tier</div>
                    <div className="text-cyan-400 font-bold">## CONSTRAINTS</div>
                    <div className="text-slate-400 mb-3">
                      - Use NextAuth.js existing setup<br />
                      - Stripe Checkout hosted flow<br />
                      - Store customer_id in users table
                    </div>
                    <div className="text-cyan-400 font-bold">## FORMAT</div>
                    <div className="text-slate-400 mb-3">
                      /api/stripe/checkout → session URL<br />
                      /api/webhooks/stripe → handle events
                    </div>
                    <div className="text-cyan-400 font-bold">## FAILURE CONDITIONS</div>
                    <div className="text-slate-400">
                      &#10060; Missing webhook signature verification<br />
                      &#10060; No downgrade handling
                    </div>
                  </code>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Result: Clear implementation, verified constraints, ships on first try
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gemini interactive toggle — inserted below the cards per feedback */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-muted p-1 rounded-full inline-flex relative shadow-inner border border-border">
                <button
                  onClick={() => setView('before')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${view === 'before' ? 'bg-card shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Vibe Prompt
                </button>
                <button
                  onClick={() => setView('after')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${view === 'after' ? 'bg-card shadow-sm text-indigo-500 ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Prompt Contract
                  {view === 'after' && <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </button>
              </div>
            </div>

            {/* Window Frame — Gemini style with Figma colored dots */}
            <div className="relative h-[420px] rounded-xl shadow-2xl border border-border overflow-hidden ring-4 ring-muted/50 text-left transition-colors duration-300">
              {/* Window header */}
              <div className="h-10 border-b border-border bg-muted flex items-center justify-between px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {view === 'before' ? 'input.txt' : 'contract.md'}
                </div>
                <div className="w-10" />
              </div>

              {/* Content */}
              <div className="h-full relative">
                {/* BEFORE VIEW */}
                {view === 'before' && (
                  <div className="animate-fade-in absolute inset-0 p-8 font-mono text-foreground bg-card">
                    <div className="text-muted-foreground text-sm mb-4">// The &quot;Lazy Developer&quot; Approach</div>
                    <div className="text-lg border-l-2 border-border pl-4 py-2 mb-8">
                      &gt; Make a landing page for my SaaS.
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4">
                      <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2">
                        <AlertCircle size={16} />
                        <span>Ambiguous Request Detected</span>
                      </div>
                      <ul className="text-sm text-red-500/80 space-y-1 list-disc list-inside">
                        <li>No tech stack specified</li>
                        <li>No color palette defined</li>
                        <li>Missing section structure</li>
                        <li>Risk of generic output: <span className="font-bold">HIGH</span></li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* AFTER VIEW */}
                {view === 'after' && (
                  <div className="animate-fade-in absolute inset-0 bg-slate-900 text-slate-300 font-mono text-sm overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scroll p-8">
                      <div className="mb-6">
                        <span className="text-indigo-400 font-bold"># GOAL</span>
                        <p className="text-slate-100 mt-1">Create high-conversion SaaS landing page for &quot;CodePromptMaker&quot;.</p>
                      </div>
                      <div className="mb-6">
                        <span className="text-indigo-400 font-bold"># DESIGN_SYSTEM</span>
                        <ul className="mt-1 space-y-1 text-slate-400">
                          <li>- Palette: <span className="text-cyan-400">#FAFBFC</span> (bg), <span className="text-indigo-400">#6366F1</span> (primary)</li>
                          <li>- Font: Inter (Headings), JetBrains Mono (Code)</li>
                          <li>- Style: &quot;Developer Tool in Sunlight&quot;</li>
                        </ul>
                      </div>
                      <div className="mb-6">
                        <span className="text-indigo-400 font-bold"># CONSTRAINTS</span>
                        <ul className="mt-1 space-y-1 text-slate-400">
                          <li>- Use single-file React component</li>
                          <li>- No external CSS files (Tailwind only)</li>
                          <li>- <span className="text-yellow-300">lucide-react</span> for all icons</li>
                          <li>- Mobile responsive (stack columns on sm)</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-indigo-400 font-bold"># SECTIONS</span>
                        <p className="text-slate-400 mt-1">1. Navbar, 2. Hero, 3. Features, 4. Pricing</p>
                      </div>
                    </div>
                    {/* Footer bar */}
                    <div className="h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <Check size={12} /> Validated
                      </span>
                      <span className="text-slate-500">Generated in 0.4s</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   HOW IT WORKS — Figma (numbered cards with colored icons)
   -------------------------------------------------------------------------- */
function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Three steps to perfect prompts
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border bg-card relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">1</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle>Describe what you need</CardTitle>
                <CardDescription>Natural language description of your feature or fix</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">2</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle>CPM builds your contract</CardTitle>
                <CardDescription>Auto-generates GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                </div>
                <CardTitle>Paste into Claude Code</CardTitle>
                <CardDescription>One click copy, paste into cc, and ship with confidence</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   FEATURES — Figma card layout + Gemini heading/subheading text
   -------------------------------------------------------------------------- */
function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Everything you need to control the AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop treating LLMs like magic. Treat them like junior developers who need very specific instructions. Built for developers who want to ship faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle>Prompt Contracts</CardTitle>
                <CardDescription>GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS auto-generated for clarity</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle>Developer Profile</CardTitle>
                <CardDescription>Save your stack, rules, and patterns. Injected into every prompt</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-emerald-500" />
                </div>
                <CardTitle>Prompt Bank</CardTitle>
                <CardDescription>Searchable history of all your prompts with rating and notes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-violet-500" />
                </div>
                <CardTitle>CLI Tool</CardTitle>
                <CardDescription>cpm generate &quot;...&quot; straight from terminal. Pipes to cc seamlessly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <Copy className="w-6 h-6 text-amber-500" />
                </div>
                <CardTitle>One-Click Copy</CardTitle>
                <CardDescription>Copy prompt to clipboard with visual feedback. Ready for cc instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-pink-500" />
                </div>
                <CardTitle>CLAUDE.md Handshake</CardTitle>
                <CardDescription>Auto-prepended constraint verification in every prompt</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   CLI — Gemini side-by-side layout + Figma terminal content + hybrid window
   -------------------------------------------------------------------------- */
function CliSection() {
  return (
    <section id="cli" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Gemini text column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold mb-6 uppercase tracking-wider">
              <Terminal size={12} />
              CLI First
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">Works where you work.</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Don&apos;t want to leave your terminal? We get it.<br />
              Install the CLI and generate contracts without touching the mouse.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-1 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Instant Generation</h4>
                  <p className="text-sm text-muted-foreground">`cpm generate &quot;fix login bug&quot;`</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-1 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Pipe support</h4>
                  <p className="text-sm text-muted-foreground">Pipe output directly to Claude or a file.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-muted rounded-lg border border-border inline-block">
              <code className="text-muted-foreground font-mono text-sm">npm install -g codepromptmaker</code>
            </div>
          </div>

          {/* Right — Terminal mockup: Gemini window chrome + Figma colored dots + Figma content */}
          <div className="relative rounded-xl bg-slate-900 shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm">
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="ml-2 text-slate-400 text-xs">terminal</div>
            </div>
            <div className="p-6 text-slate-200 leading-relaxed">
              <code className="block">
                <div className="mb-4">
                  <span className="text-slate-400">$</span>{' '}
                  <span className="text-cyan-400">npm install -g codepromptmaker</span>
                </div>
                <div className="mb-6 text-slate-400">&#10003; Installed cpm CLI</div>

                <div className="mb-4">
                  <span className="text-slate-400">$</span>{' '}
                  <span className="text-cyan-400">cpm login</span>
                </div>
                <div className="mb-6 text-slate-400">&#10003; Authenticated as christian@example.com</div>

                <div className="mb-4">
                  <span className="text-slate-400">$</span>{' '}
                  <span className="text-cyan-400">cpm generate</span>{' '}
                  <span className="text-slate-200">&quot;Add API rate limiting&quot;</span>
                </div>
                <div className="text-emerald-400">&#10003; Prompt Contract generated and copied!</div>

                <div className="mt-6 mb-4">
                  <span className="text-slate-400">$</span>{' '}
                  <span className="text-cyan-400">cpm list</span>
                </div>
                <div className="text-slate-400">
                  1. Add API rate limiting (2 min ago)<br />
                  2. Implement Stripe webhooks (1 hour ago)<br />
                  3. Add user profiles (yesterday)
                </div>
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   OPEN SOURCE — Figma design + Gemini enhancements (docker, cpm login, Get Started)
   -------------------------------------------------------------------------- */
function OpenSourceSection() {
  return (
    <section id="github" className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <Github className="w-3 h-3 mr-1" />
              Open Source
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Self-host or use our cloud
            </h2>
            <p className="text-xl text-muted-foreground">
              Your choice, your data, your control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Clone & Run — enhanced with docker compose up */}
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle>Clone & Run Locally</CardTitle>
                <CardDescription className="space-y-2">
                  <code className="block text-xs bg-muted px-2 py-1 rounded mt-3 text-foreground">
                    git clone repo<br />
                    docker compose up
                  </code>
                  <span className="block mt-2">SQLite, no auth needed</span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Use Cloud — enhanced with Get Started link */}
            <Card className="border-border border-2 border-indigo-500/30 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white">
                Recommended
              </Badge>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle>Use codepromptmaker.com</CardTitle>
                <CardDescription>
                  Managed hosting, automatic updates, team features, and cloud sync
                </CardDescription>
                <Link href="/generate" className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-3 hover:text-indigo-600 transition-colors">
                  Get Started <Zap size={12} />
                </Link>
              </CardHeader>
            </Card>

            {/* Connect CLI — enhanced with cpm login example */}
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <CardTitle>Connect CLI to Cloud</CardTitle>
                <CardDescription className="space-y-2">
                  <span>Use CLI with cloud sync. Access prompts anywhere, full history</span>
                  <code className="block text-xs bg-muted px-2 py-1 rounded mt-3 text-foreground">
                    cpm login
                  </code>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="border-border">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
              <Badge className="ml-2 bg-muted text-foreground">
                <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                1.2k
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   PRICING — Figma structure + Gemini ring/shadow on Pro + updated CTAs + hover
   -------------------------------------------------------------------------- */
function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier — hover effect added */}
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:border-border/80">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">Perfect for trying out CPM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">25 saved prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">10 generations per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">CLI access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Single developer profile</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-border" asChild>
                  <Link href="/generate">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier — Gemini ring/shadow style */}
            <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-card relative ring-1 ring-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-indigo-500/10">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">For serious developers who ship fast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">Unlimited prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">Unlimited generations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">RAG semantic search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">5 team profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">Priority API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">Export to CSV/JSON</span>
                  </li>
                </ul>
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Self-Hosted — hover effect + "View Docs" CTA */}
            <Card className="border-border bg-card transition-all hover:shadow-lg hover:border-border/80">
              <CardHeader>
                <CardTitle>Self-Hosted</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Free</span>
                  <span className="text-muted-foreground"> forever</span>
                </div>
                <CardDescription className="mt-4">Full control with your own infrastructure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Unlimited everything</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Use your own API key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Full source code access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">Docker support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-border">
                  <Github className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   FOOTER — Gemini 4-column layout + custom credit line
   -------------------------------------------------------------------------- */
function FooterSection() {
  return (
    <footer className="bg-muted border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            {/* Gemini logo style */}
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center text-background">
                <Code2 size={16} />
              </div>
              <span className="font-bold text-foreground">CodePromptMaker</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              The missing layer between your thoughts and your LLM. Built for developers who care about code quality.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-indigo-500 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Changelog</a></li>
              <li><a href="#docs" className="hover:text-indigo-500 transition-colors">Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Twitter</a></li>
              <li><a href="#github" className="hover:text-indigo-500 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 CodePromptMaker. All rights reserved. Open source under MIT License.</p>
          <div className="flex items-center gap-4">
            <span>Built with &lt;3 in Aalborg, Denmark by Christian Broberg & Claude</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
