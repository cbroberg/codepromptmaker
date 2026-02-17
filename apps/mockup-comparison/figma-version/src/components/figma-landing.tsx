'use client';

import { useState } from 'react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FeedbackSection } from './feedback/feedback-section';
import { FeedbackExport } from './feedback/feedback-export';
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
} from 'lucide-react';

export function FigmaLanding() {
  const [copiedDemo, setCopiedDemo] = useState(false);

  const handleCopyDemo = () => {
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <FeedbackSection id="navbar" label="Navigation Bar">
        <nav className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Logo />

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Docs
                </a>
                <a
                  href="#"
                  className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors inline-flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex border-[#E2E8F0] text-[#0F172A]"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Star on GitHub
                </Button>
                <Button
                  size="sm"
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </FeedbackSection>

      {/* Hero Section */}
      <FeedbackSection id="hero" label="Hero Section">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Now with CLI support
              </Badge>

              <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F172A]">
                Stop vibe coding.
                <br />
                <span className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                  Start shipping.
                </span>
              </h1>

              <p className="mb-10 text-xl sm:text-2xl text-[#64748B] max-w-2xl mx-auto">
                Transform natural language into structured Prompt Contracts that make Claude Code deliver on the first try.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-lg px-8 py-6"
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

              {/* Terminal preview mockup */}
              <div className="mt-16 rounded-xl bg-white shadow-2xl shadow-[#6366F1]/10 border border-[#E2E8F0] p-1">
                <div className="rounded-lg bg-[#1E293B] p-6 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  </div>
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
      </FeedbackSection>

      {/* Before/After Demo */}
      <FeedbackSection id="before-after" label="Before/After Demo">
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
            </div>
          </div>
        </section>
      </FeedbackSection>

      {/* How It Works */}
      <FeedbackSection id="how-it-works" label="How It Works">
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
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                      <Code2 className="w-6 h-6 text-[#6366F1]" />
                    </div>
                    <CardTitle>Describe what you need</CardTitle>
                    <CardDescription>
                      Natural language description of your feature or fix
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0] bg-white relative">
                  <div className="absolute -top-4 left-6">
                    <div className="w-8 h-8 rounded-full bg-[#06B6D4] text-white flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-[#06B6D4]" />
                    </div>
                    <CardTitle>CPM builds your contract</CardTitle>
                    <CardDescription>
                      Auto-generates GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0] bg-white relative">
                  <div className="absolute -top-4 left-6">
                    <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                      <Terminal className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <CardTitle>Paste into Claude Code</CardTitle>
                    <CardDescription>
                      One click copy, paste into cc, and ship with confidence
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </FeedbackSection>

      {/* Feature Grid */}
      <FeedbackSection id="features" label="Features Grid">
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
                  Everything you need for better prompts
                </h2>
                <p className="text-xl text-[#64748B]">
                  Built for developers who want to ship faster
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-[#6366F1]" />
                    </div>
                    <CardTitle>Prompt Contracts</CardTitle>
                    <CardDescription>
                      GOAL, CONSTRAINTS, FORMAT, FAILURE CONDITIONS auto-generated for clarity
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center mb-4">
                      <User className="w-6 h-6 text-[#06B6D4]" />
                    </div>
                    <CardTitle>Developer Profile</CardTitle>
                    <CardDescription>
                      Save your stack, rules, and patterns. Injected into every prompt
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <CardTitle>Prompt Bank</CardTitle>
                    <CardDescription>
                      Searchable history of all your prompts with rating and notes
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                      <Terminal className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <CardTitle>CLI Tool</CardTitle>
                    <CardDescription>
                      cpm generate &quot;...&quot; straight from terminal. Pipes to cc seamlessly
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                      <Copy className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <CardTitle>One-Click Copy</CardTitle>
                    <CardDescription>
                      Copy prompt to clipboard with visual feedback. Ready for cc instantly
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mb-4">
                      <RefreshCw className="w-6 h-6 text-[#EC4899]" />
                    </div>
                    <CardTitle>CLAUDE.md Handshake</CardTitle>
                    <CardDescription>
                      Auto-prepended constraint verification in every prompt
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </FeedbackSection>

      {/* CLI Section */}
      <FeedbackSection id="cli" label="CLI Section">
        <section className="py-20 bg-[#FAFBFC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
                  Works where you work
                </h2>
                <p className="text-xl text-[#64748B]">
                  Seamless terminal integration — just like cc
                </p>
              </div>

              <div className="rounded-xl bg-white shadow-xl border border-[#E2E8F0] p-1">
                <div className="rounded-lg bg-[#1E293B] p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span className="ml-4 text-[#94A3B8] text-sm font-mono">terminal</span>
                  </div>
                  <code className="text-[#E2E8F0] font-mono text-sm leading-relaxed block">
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

              <div className="mt-8 text-center">
                <p className="text-[#64748B] mb-4">
                  Use locally or sync with cloud — your choice
                </p>
                <Button variant="outline" className="border-[#E2E8F0]">
                  <Terminal className="w-4 h-4 mr-2" />
                  View CLI Docs
                </Button>
              </div>
            </div>
          </div>
        </section>
      </FeedbackSection>

      {/* Open Source Section */}
      <FeedbackSection id="open-source" label="Open Source Section">
        <section className="py-20 bg-white">
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
                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#6366F1]/10 flex items-center justify-center mb-4">
                      <Terminal className="w-6 h-6 text-[#6366F1]" />
                    </div>
                    <CardTitle>Clone & Run Locally</CardTitle>
                    <CardDescription className="space-y-2">
                      <code className="block text-xs bg-[#F3F4F6] px-2 py-1 rounded mt-3 text-[#0F172A]">
                        git clone repo<br />
                        pnpm install<br />
                        pnpm dev
                      </code>
                      <span className="block mt-2">SQLite, no auth needed</span>
                    </CardDescription>
                  </CardHeader>
                </Card>

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
                  </CardHeader>
                </Card>

                <Card className="border-[#E2E8F0]">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <CardTitle>Connect CLI to Cloud</CardTitle>
                    <CardDescription>
                      Use CLI with cloud sync. Access prompts anywhere, full history
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
      </FeedbackSection>

      {/* Pricing */}
      <FeedbackSection id="pricing" label="Pricing Section">
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
                {/* Free Tier */}
                <Card className="border-[#E2E8F0] bg-white">
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-[#0F172A]">$0</span>
                      <span className="text-[#64748B]">/month</span>
                    </div>
                    <CardDescription className="mt-4">
                      Perfect for trying out CPM
                    </CardDescription>
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
                      Get Started
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Tier */}
                <Card className="border-2 border-[#6366F1] bg-white relative shadow-xl">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white">
                    Most Popular
                  </Badge>
                  <CardHeader>
                    <CardTitle>Pro</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-[#0F172A]">$19</span>
                      <span className="text-[#64748B]">/month</span>
                    </div>
                    <CardDescription className="mt-4">
                      For serious developers who ship fast
                    </CardDescription>
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

                {/* Self-Hosted */}
                <Card className="border-[#E2E8F0] bg-white">
                  <CardHeader>
                    <CardTitle>Self-Hosted</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-[#0F172A]">Free</span>
                      <span className="text-[#64748B]"> forever</span>
                    </div>
                    <CardDescription className="mt-4">
                      Full control with your own infrastructure
                    </CardDescription>
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
                      View Setup Guide
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </FeedbackSection>

      {/* Footer */}
      <FeedbackSection id="footer" label="Footer">
        <footer className="py-12 bg-white border-t border-[#E2E8F0]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start gap-4">
                <Logo />
                <p className="text-sm text-[#64748B]">
                  Built with Next.js, Tailwind, shadcn/ui, and Claude
                </p>
              </div>

              <div className="flex gap-8">
                <a href="#docs" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Docs
                </a>
                <a href="#" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  GitHub
                </a>
                <a href="#privacy" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Privacy
                </a>
                <a href="#terms" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                  Terms
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#E2E8F0] text-center">
              <p className="text-sm text-[#94A3B8]">
                &copy; 2026 CodePromptMaker. Open source under MIT License.
              </p>
            </div>
          </div>
        </footer>
      </FeedbackSection>

      {/* Export Feedback Button */}
      <FeedbackExport mockupName="figma" />
    </div>
  );
}
