'use client';

import { useState } from 'react';
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
   ========================================================================== */

export function SaasLanding() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
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
    <nav className="fixed top-0 w-full z-50 bg-[#FAFBFC]/80 backdrop-blur-xl border-b border-[#E2E8F0]/60 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
        {/* Logo — Gemini style (Code2 icon + text) */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white">
            <Code2 size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">CodePromptMaker</span>
        </div>

        {/* Desktop nav links — Gemini hover (indigo) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-[#6366F1] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#6366F1] transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-[#6366F1] transition-colors">Docs</a>
          <a href="#github" className="hover:text-[#6366F1] transition-colors inline-flex items-center gap-1">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Desktop CTA — Figma buttons (Star on GitHub + Sign Up Free) */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#E2E8F0] text-[#0F172A] hover:text-[#6366F1] hover:border-[#6366F1]/30"
          >
            <Star className="w-4 h-4 mr-1" />
            Star on GitHub
          </Button>
          <Button
            size="sm"
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm hover:shadow-indigo-200"
          >
            Sign Up Free
          </Button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 flex flex-col gap-4 md:hidden shadow-lg">
          <a href="#features" className="text-slate-600 font-medium">Features</a>
          <a href="#pricing" className="text-slate-600 font-medium">Pricing</a>
          <a href="#docs" className="text-slate-600 font-medium">Docs</a>
          <div className="h-px bg-slate-100 w-full" />
          <a href="#" className="flex items-center justify-center gap-2 w-full border border-slate-200 py-2 rounded-lg font-medium text-slate-700">
            <Github size={16} /> Star on GitHub
          </a>
          <a href="#" className="w-full bg-[#6366F1] text-white py-2 rounded-lg font-medium text-center">
            Sign Up Free
          </a>
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
      <div className="absolute top-0 left-[-100px] w-96 h-96 rounded-full bg-indigo-100 blur-[80px] opacity-40 z-0" />
      <div className="absolute bottom-0 right-[-50px] w-80 h-80 rounded-full bg-cyan-100 blur-[80px] opacity-40 z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge — Figma "Now with CLI support" */}
          <a href="#cli" className="inline-block">
            <Badge className="mb-6 bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20 cursor-pointer hover:bg-[#6366F1]/15 transition-colors">
              <Sparkles className="w-3 h-3 mr-1" />
              Now with CLI support
            </Badge>
          </a>

          {/* Headline — Figma */}
          <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F172A] leading-[1.1]">
            Stop vibe coding.
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
              Start shipping.
            </span>
          </h1>

          {/* Subheader — updated per feedback */}
          <p className="mb-10 text-xl sm:text-2xl text-[#64748B] max-w-2xl mx-auto">
            Transform natural language into structured Plans and Prompt Contracts that make Agentic AI deliver on the first try.
          </p>

          {/* CTA buttons — Figma */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-lg px-8 py-6 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all"
            >
              Try Free — 25 prompts included
              <Zap className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#E2E8F0] text-[#0F172A] text-lg px-8 py-6"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>

          {/* Terminal preview — Figma content, Gemini window chrome, Figma colored dots */}
          <div className="mt-16 relative rounded-xl bg-[#0F172A] shadow-2xl shadow-[#6366F1]/10 border border-slate-700 overflow-hidden">
            {/* Gemini-style window header with Figma colored dots */}
            <div className="bg-[#1E293B] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <div className="ml-2 text-slate-400 text-xs font-mono">terminal</div>
            </div>
            {/* Figma terminal content */}
            <div className="p-6 text-left">
              <code className="text-[#E2E8F0] font-mono text-sm">
                <div className="text-[#06B6D4]">$ cpm generate &quot;Add subscription system&quot;</div>
                <div className="mt-2 text-[#94A3B8]">&#10003; Analyzing request...</div>
                <div className="text-[#94A3B8]">&#10003; Building Prompt Contract...</div>
                <div className="text-[#10B981] mt-2">&#10003; Ready to copy!</div>
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Same idea. 10x better results.
            </h2>
            <p className="text-xl text-[#64748B]">
              Compare a vague prompt with a structured Prompt Contract
            </p>
          </div>

          {/* Figma before/after cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="border-2 border-[#EF4444]/20 bg-[#FEF2F2]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#EF4444]">
                  <X className="w-5 h-5" />
                  Vague Prompt
                </CardTitle>
                <CardDescription>What most developers do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-[#1E293B] p-4">
                  <code className="text-[#E2E8F0] font-mono text-sm">
                    <div className="text-[#94A3B8]">&gt; Add a subscription system to the app</div>
                  </code>
                </div>
                <p className="mt-4 text-sm text-[#64748B]">
                  Result: Vague implementation, missing constraints, hours of back-and-forth
                </p>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-2 border-[#10B981]/20 bg-[#F0FDF4] relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#10B981]">
                  <CheckCircle2 className="w-5 h-5" />
                  Prompt Contract
                </CardTitle>
                <CardDescription>What CPM generates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-[#1E293B] p-4 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-[#94A3B8] hover:text-white"
                    onClick={handleCopyDemo}
                  >
                    {copiedDemo ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <code className="text-[#E2E8F0] font-mono text-xs leading-relaxed">
                    <div className="text-[#06B6D4] font-bold">## GOAL</div>
                    <div className="text-[#94A3B8] mb-3">Implement Stripe subscription system with Pro tier</div>
                    <div className="text-[#06B6D4] font-bold">## CONSTRAINTS</div>
                    <div className="text-[#94A3B8] mb-3">
                      - Use NextAuth.js existing setup<br />
                      - Stripe Checkout hosted flow<br />
                      - Store customer_id in users table
                    </div>
                    <div className="text-[#06B6D4] font-bold">## FORMAT</div>
                    <div className="text-[#94A3B8] mb-3">
                      /api/stripe/checkout → session URL<br />
                      /api/webhooks/stripe → handle events
                    </div>
                    <div className="text-[#06B6D4] font-bold">## FAILURE CONDITIONS</div>
                    <div className="text-[#94A3B8]">
                      &#10060; Missing webhook signature verification<br />
                      &#10060; No downgrade handling
                    </div>
                  </code>
                </div>
                <p className="mt-4 text-sm text-[#64748B]">
                  Result: Clear implementation, verified constraints, ships on first try
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gemini interactive toggle — inserted below the cards per feedback */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-slate-100 p-1 rounded-full inline-flex relative shadow-inner border border-slate-200">
                <button
                  onClick={() => setView('before')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${view === 'before' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Vibe Prompt
                </button>
                <button
                  onClick={() => setView('after')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${view === 'after' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Prompt Contract
                  {view === 'after' && <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </button>
              </div>
            </div>

            {/* Window Frame — Gemini style with Figma colored dots */}
            <div className="relative h-[420px] rounded-xl shadow-2xl border border-slate-200 overflow-hidden ring-4 ring-slate-50/50 text-left transition-colors duration-300">
              {/* Window header */}
              <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]/60" />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {view === 'before' ? 'input.txt' : 'contract.md'}
                </div>
                <div className="w-10" />
              </div>

              {/* Content */}
              <div className="h-full relative">
                {/* BEFORE VIEW */}
                {view === 'before' && (
                  <div className="animate-fade-in absolute inset-0 p-8 font-mono text-slate-800 bg-white">
                    <div className="text-slate-400 text-sm mb-4">// The &quot;Lazy Developer&quot; Approach</div>
                    <div className="text-lg border-l-2 border-slate-200 pl-4 py-2 mb-8">
                      &gt; Make a landing page for my SaaS.
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                        <AlertCircle size={16} />
                        <span>Ambiguous Request Detected</span>
                      </div>
                      <ul className="text-sm text-red-600/80 space-y-1 list-disc list-inside">
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
                  <div className="animate-fade-in absolute inset-0 bg-[#0F172A] text-slate-300 font-mono text-sm overflow-hidden flex flex-col">
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
                    <div className="h-10 bg-[#1E293B] border-t border-slate-700 flex items-center justify-between px-4 text-xs">
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
    <section className="py-20 bg-[#FAFBFC]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Three steps to perfect prompts
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#E2E8F0] bg-white relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold">1</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-[#6366F1]" />
                </div>
                <CardTitle>Describe what you need</CardTitle>
                <CardDescription>Natural language description of your feature or fix</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0] bg-white relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-[#06B6D4] text-white flex items-center justify-center font-bold">2</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <CardTitle>CPM builds your contract</CardTitle>
                <CardDescription>Auto-generates GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0] bg-white relative">
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">3</div>
              </div>
              <CardHeader className="pt-8">
                <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-[#10B981]" />
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
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Everything you need to control the AI
            </h2>
            <p className="text-xl text-[#64748B] max-w-3xl mx-auto">
              Stop treating LLMs like magic. Treat them like junior developers who need very specific instructions. Built for developers who want to ship faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#6366F1]" />
                </div>
                <CardTitle>Prompt Contracts</CardTitle>
                <CardDescription>GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS auto-generated for clarity</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <CardTitle>Developer Profile</CardTitle>
                <CardDescription>Save your stack, rules, and patterns. Injected into every prompt</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-[#10B981]" />
                </div>
                <CardTitle>Prompt Bank</CardTitle>
                <CardDescription>Searchable history of all your prompts with rating and notes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <CardTitle>CLI Tool</CardTitle>
                <CardDescription>cpm generate &quot;...&quot; straight from terminal. Pipes to cc seamlessly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                  <Copy className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <CardTitle>One-Click Copy</CardTitle>
                <CardDescription>Copy prompt to clipboard with visual feedback. Ready for cc instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-[#EC4899]" />
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
    <section id="cli" className="py-24 bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Gemini text column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-6 uppercase tracking-wider">
              <Terminal size={12} />
              CLI First
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Works where you work.</h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Don&apos;t want to leave your terminal? We get it.<br />
              Install the CLI and generate contracts without touching the mouse.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Instant Generation</h4>
                  <p className="text-sm text-slate-500">`cpm generate &quot;fix login bug&quot;`</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Pipe support</h4>
                  <p className="text-sm text-slate-500">Pipe output directly to Claude or a file.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-slate-50 rounded-lg border border-slate-200 inline-block">
              <code className="text-slate-600 font-mono text-sm">npm install -g codepromptmaker</code>
            </div>
          </div>

          {/* Right — Terminal mockup: Gemini window chrome + Figma colored dots + Figma content */}
          <div className="relative rounded-xl bg-[#0F172A] shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm">
            <div className="bg-[#1E293B] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <div className="ml-2 text-slate-400 text-xs">terminal</div>
            </div>
            <div className="p-6 text-[#E2E8F0] leading-relaxed">
              <code className="block">
                <div className="mb-4">
                  <span className="text-[#94A3B8]">$</span>{' '}
                  <span className="text-[#06B6D4]">npm install -g codepromptmaker</span>
                </div>
                <div className="mb-6 text-[#94A3B8]">&#10003; Installed cpm CLI</div>

                <div className="mb-4">
                  <span className="text-[#94A3B8]">$</span>{' '}
                  <span className="text-[#06B6D4]">cpm login</span>
                </div>
                <div className="mb-6 text-[#94A3B8]">&#10003; Authenticated as christian@example.com</div>

                <div className="mb-4">
                  <span className="text-[#94A3B8]">$</span>{' '}
                  <span className="text-[#06B6D4]">cpm generate</span>{' '}
                  <span className="text-[#E2E8F0]">&quot;Add API rate limiting&quot;</span>
                </div>
                <div className="text-[#10B981]">&#10003; Prompt Contract generated and copied!</div>

                <div className="mt-6 mb-4">
                  <span className="text-[#94A3B8]">$</span>{' '}
                  <span className="text-[#06B6D4]">cpm list</span>
                </div>
                <div className="text-[#94A3B8]">
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
    <section id="github" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
              <Github className="w-3 h-3 mr-1" />
              Open Source
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Self-host or use our cloud
            </h2>
            <p className="text-xl text-[#64748B]">
              Your choice, your data, your control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Clone & Run — enhanced with docker compose up */}
            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-[#6366F1]" />
                </div>
                <CardTitle>Clone & Run Locally</CardTitle>
                <CardDescription className="space-y-2">
                  <code className="block text-xs bg-[#F3F4F6] px-2 py-1 rounded mt-3 text-[#0F172A]">
                    git clone repo<br />
                    docker compose up
                  </code>
                  <span className="block mt-2">SQLite, no auth needed</span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Use Cloud — enhanced with Get Started link */}
            <Card className="border-[#E2E8F0] border-2 border-[#6366F1]/30 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white">
                Recommended
              </Badge>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <CardTitle>Use codepromptmaker.com</CardTitle>
                <CardDescription>
                  Managed hosting, automatic updates, team features, and cloud sync
                </CardDescription>
                <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-3 cursor-pointer hover:text-indigo-800 transition-colors">
                  Get Started <Zap size={12} />
                </div>
              </CardHeader>
            </Card>

            {/* Connect CLI — enhanced with cpm login example */}
            <Card className="border-[#E2E8F0]">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#10B981]" />
                </div>
                <CardTitle>Connect CLI to Cloud</CardTitle>
                <CardDescription className="space-y-2">
                  <span>Use CLI with cloud sync. Access prompts anywhere, full history</span>
                  <code className="block text-xs bg-[#F3F4F6] px-2 py-1 rounded mt-3 text-[#0F172A]">
                    cpm login
                  </code>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="border-[#E2E8F0]">
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
              <Badge className="ml-2 bg-[#F3F4F6] text-[#0F172A]">
                <Star className="w-3 h-3 mr-1 fill-[#F59E0B] text-[#F59E0B]" />
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
    <section id="pricing" className="py-20 bg-[#FAFBFC]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-[#64748B]">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier — hover effect added */}
            <Card className="border-[#E2E8F0] bg-white transition-all hover:shadow-lg hover:border-[#E2E8F0]/80">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#0F172A]">$0</span>
                  <span className="text-[#64748B]">/month</span>
                </div>
                <CardDescription className="mt-4">Perfect for trying out CPM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">25 saved prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">10 generations per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">CLI access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">Single developer profile</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-[#E2E8F0]">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier — Gemini ring/shadow style */}
            <Card className="border-2 border-indigo-100 bg-white relative ring-1 ring-indigo-500 shadow-xl shadow-indigo-100">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#0F172A]">$19</span>
                  <span className="text-[#64748B]">/month</span>
                </div>
                <CardDescription className="mt-4">For serious developers who ship fast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">Unlimited prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">Unlimited generations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">RAG semantic search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">5 team profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">Priority API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0F172A] font-medium">Export to CSV/JSON</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Self-Hosted — hover effect + "View Docs" CTA */}
            <Card className="border-[#E2E8F0] bg-white transition-all hover:shadow-lg hover:border-[#E2E8F0]/80">
              <CardHeader>
                <CardTitle>Self-Hosted</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#0F172A]">Free</span>
                  <span className="text-[#64748B]"> forever</span>
                </div>
                <CardDescription className="mt-4">Full control with your own infrastructure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">Unlimited everything</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">Use your own API key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">Full source code access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#64748B]">Docker support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-[#E2E8F0]">
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
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            {/* Gemini logo style */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white">
                <Code2 size={16} />
              </div>
              <span className="font-bold text-slate-900">CodePromptMaker</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              The missing layer between your thoughts and your LLM. Built for developers who care about code quality.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              <li><a href="#docs" className="hover:text-indigo-600 transition-colors">Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a></li>
              <li><a href="#github" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; 2026 CodePromptMaker. All rights reserved. Open source under MIT License.</p>
          <div className="flex items-center gap-4">
            <span>Built with &lt;3 in Aalborg, Denmark by Christian Broberg & Claude</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
