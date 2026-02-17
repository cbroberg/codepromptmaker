'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { FeedbackSection } from './feedback/feedback-section';
import { FeedbackExport } from './feedback/feedback-export';
import {
  Terminal,
  Copy,
  Check,
  Github,
  Code2,
  Zap,
  LayoutTemplate,
  Box,
  Cpu,
  Search,
  Menu,
  X,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function GeminiLanding() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <Steps />
        <FeatureGrid />
        <TerminalSection />
        <OpenSource />
        <Pricing />
      </main>
      <FooterSection />
      <FeedbackExport mockupName="gemini" />
    </div>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FeedbackSection id="navbar" label="Navigation Bar">
      <nav className="fixed top-0 w-full z-50 bg-[#FAFBFC]/80 backdrop-blur-xl border-b border-[#E2E8F0]/60 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white">
              <Code2 size={20} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">CodePromptMaker</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#6366F1] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#6366F1] transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-[#6366F1] transition-colors">Docs</a>
            <a href="#github" className="hover:text-[#6366F1] transition-colors">GitHub</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm border border-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Github size={16} />
              <span>Star</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-500 font-bold">1.2k</span>
            </a>
            <a
              href="#"
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-indigo-200"
            >
              Sign Up Free
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 flex flex-col gap-4 md:hidden shadow-lg">
            <a href="#features" className="text-slate-600 font-medium">Features</a>
            <a href="#pricing" className="text-slate-600 font-medium">Pricing</a>
            <a href="#docs" className="text-slate-600 font-medium">Docs</a>
            <div className="h-px bg-slate-100 w-full"></div>
            <a href="#" className="flex items-center justify-center gap-2 w-full border border-slate-200 py-2 rounded-lg font-medium text-slate-700">
              <Github size={16} /> Star on GitHub
            </a>
            <a href="#" className="w-full bg-[#6366F1] text-white py-2 rounded-lg font-medium text-center">
              Sign Up Free
            </a>
          </div>
        )}
      </nav>
    </FeedbackSection>
  );
}

function Hero() {
  const [view, setView] = useState<'before' | 'after'>('after');

  return (
    <FeedbackSection id="hero" label="Hero Section" buttonTopClass="top-20">
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-[-100px] w-96 h-96 rounded-full bg-indigo-100 blur-[80px] opacity-40 z-0"></div>
        <div className="absolute bottom-0 right-[-50px] w-80 h-80 rounded-full bg-cyan-100 blur-[80px] opacity-40 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            v3.0 is now available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Stop vibe coding. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">
              Start shipping.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
            Transform natural language into structured <span className="text-slate-900 font-medium">Prompt Contracts</span> that make Claude Code deliver on the first try.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Try Free
              <span className="opacity-70 text-sm font-normal">— 25 prompts included</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
              <Github size={18} />
              View on GitHub
            </button>
          </div>

          {/* Interactive Toggle Demo */}
          <div className="max-w-3xl mx-auto">
            {/* Toggle Control */}
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
                  {view === 'after' && <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>}
                </button>
              </div>
            </div>

            {/* Window Frame */}
            <div className="relative h-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden ring-4 ring-slate-50/50 text-left transition-colors duration-300">
              {/* Window Header */}
              <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {view === 'before' ? 'input.txt' : 'contract.md'}
                </div>
                <div className="w-10"></div>
              </div>

              {/* Content Container */}
              <div className="h-full bg-white relative">
                {/* BEFORE VIEW */}
                {view === 'before' && (
                  <div className="animate-fade-in absolute inset-0 p-8 font-mono text-slate-800">
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

                    {/* Footer of Code Block */}
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
      </section>
    </FeedbackSection>
  );
}

function FileTextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-indigo-600"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function Steps() {
  const steps = [
    {
      id: 1,
      title: 'Describe what you need',
      desc: "Dump your thoughts in plain English. No need to structure it yourself.",
      icon: <LayoutTemplate size={24} className="text-indigo-600" />,
    },
    {
      id: 2,
      title: 'CPM builds the Contract',
      desc: 'We generate a structured Prompt Contract with constraints & failure conditions.',
      icon: <FileTextIcon />,
    },
    {
      id: 3,
      title: 'Paste & Ship',
      desc: 'Copy the contract into Claude Code. Watch it get it right the first time.',
      icon: <Terminal size={24} className="text-emerald-600" />,
    },
  ];

  return (
    <FeedbackSection id="how-it-works" label="How It Works">
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 z-0"></div>

            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-[#FAFBFC] border border-slate-100 shadow-sm flex items-center justify-center mb-6 relative group transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute top-2 right-2 text-xs font-bold text-slate-300">0{step.id}</div>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeedbackSection>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: <Zap size={20} />,
      title: 'Prompt Contracts',
      desc: 'Auto-generates GOAL, CONSTRAINTS, and FAILURE_CONDITIONS sections for you.',
    },
    {
      icon: <Box size={20} />,
      title: 'Developer Profile',
      desc: 'Save your stack (Next.js, Supabase, etc.) once. We inject it into every prompt.',
    },
    {
      icon: <Search size={20} />,
      title: 'Prompt Bank',
      desc: 'Searchable history of your best prompts. Stop rewriting the same context.',
    },
    {
      icon: <Terminal size={20} />,
      title: 'CLI Tool',
      desc: 'Generate prompts straight from your terminal. Pipes directly to `claude`.',
    },
    {
      icon: <Copy size={20} />,
      title: 'One-Click Copy',
      desc: 'Instant formatted copy. Pre-validated to ensure LLM compliance.',
    },
    {
      icon: <Cpu size={20} />,
      title: 'CLAUDE.md Handshake',
      desc: 'Automatically reads your local CLAUDE.md to verify project rules.',
    },
  ];

  return (
    <FeedbackSection id="features" label="Features Grid">
      <section id="features" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to control the AI</h2>
            <p className="text-slate-500 text-lg">Stop treating LLMs like magic. Treat them like junior developers who need very specific instructions.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeedbackSection>
  );
}

function TerminalSection() {
  return (
    <FeedbackSection id="cli" label="CLI Section">
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-6 uppercase tracking-wider">
                <Terminal size={12} />
                CLI First
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Works where you work.</h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Don&apos;t want to leave your terminal? We get it. <br />
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

            {/* Terminal Mockup */}
            <div className="relative rounded-xl bg-[#0F172A] shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm">
              <div className="bg-[#1E293B] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-2 text-slate-400 text-xs">user@macbook: ~/project</div>
              </div>
              <div className="p-6 text-slate-300 space-y-4">
                <div>
                  <span className="text-green-400">&#10132;</span> <span className="text-cyan-400">~</span> cpm generate <span className="text-yellow-300">&quot;Add dark mode toggle to navbar&quot;</span>
                </div>
                <div className="text-slate-500">
                  Analyzing project context (React, Tailwind)...<br />
                  Generating Prompt Contract...
                </div>
                <div className="pt-2">
                  <span className="text-indigo-400"># GOAL</span><br />
                  Add theme toggle switch to Navbar component using next-themes.<br />
                  <br />
                  <span className="text-indigo-400"># CONSTRAINTS</span><br />
                  - Use <span className="text-white">`useTheme`</span> hook<br />
                  - Persist in local storage<br />
                  - Icon: Sun (lucide-react) for light, Moon for dark<br />
                  <br />
                  <span className="text-green-400">&#10004; Copied to clipboard!</span>
                </div>
                <div>
                  <span className="text-green-400">&#10132;</span> <span className="text-cyan-400">~</span> <span className="inline-block w-2 h-4 bg-slate-500 animate-pulse align-middle"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FeedbackSection>
  );
}

function OpenSource() {
  return (
    <FeedbackSection id="open-source" label="Open Source Section">
      <section id="github" className="py-20 bg-[#FAFBFC] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-6">
            <Github size={32} className="text-slate-900" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Open Source at heart</h2>
          <p className="text-lg text-slate-500 mb-10">
            We believe developer tools should be transparent. Self-host it, fork it, or contribute back.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">Clone & Run</h3>
              <p className="text-sm text-slate-500 mb-4">Run locally with Docker. No external dependencies required.</p>
              <div className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-600">docker compose up</div>
            </Card>
            <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg">RECOMMENDED</div>
              <h3 className="font-bold text-slate-900 mb-2">Use Cloud</h3>
              <p className="text-sm text-slate-500 mb-4">Managed hosting, persisted history, and team features.</p>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                Get Started <ArrowRight size={12} />
              </div>
            </Card>
            <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">Connect CLI</h3>
              <p className="text-sm text-slate-500 mb-4">Connect your local terminal to your cloud account.</p>
              <div className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-600">cpm login</div>
            </Card>
          </div>
        </div>
      </section>
    </FeedbackSection>
  );
}

function Pricing() {
  return (
    <FeedbackSection id="pricing" label="Pricing Section">
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500">Start for free, upgrade when you ship.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Hobby</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> 25 Prompts / month
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> CLI Access
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> 1 Developer Profile
                </li>
              </ul>
              <button className="w-full py-2.5 rounded-lg border border-slate-200 font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-all">Start Free</button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl border border-indigo-100 bg-[#FAFBFC] relative ring-1 ring-indigo-500 shadow-xl shadow-indigo-100">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="font-bold text-indigo-600 text-lg mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">$19</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <Check size={16} className="text-indigo-500" /> Unlimited Prompts
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <Check size={16} className="text-indigo-500" /> RAG Project Context
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <Check size={16} className="text-indigo-500" /> Team Profiles
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                  <Check size={16} className="text-indigo-500" /> Priority API
                </li>
              </ul>
              <button className="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium transition-all shadow-sm">Get Pro</button>
            </div>

            {/* Self Hosted */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Self-Hosted</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> Full Source Code
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> Own API Keys
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> Unlimited Users
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="text-indigo-500" /> Community Support
                </li>
              </ul>
              <button className="w-full py-2.5 rounded-lg border border-slate-200 font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-all">View Docs</button>
            </div>
          </div>
        </div>
      </section>
    </FeedbackSection>
  );
}

function FooterSection() {
  return (
    <FeedbackSection id="footer" label="Footer">
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
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
                <li><a href="#" className="hover:text-indigo-600">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600">Changelog</a></li>
                <li><a href="#" className="hover:text-indigo-600">Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Terms</a></li>
                <li><a href="#" className="hover:text-indigo-600">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-600">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; 2026 CodePromptMaker. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Built with Next.js, Tailwind, & Claude</span>
            </div>
          </div>
        </div>
      </footer>
    </FeedbackSection>
  );
}
