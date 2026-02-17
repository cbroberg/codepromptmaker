# CPM Mockup Comparison

Side-by-side comparison of two landing page mockups for CodePromptMaker SaaS.

- **Figma version** (port 3005) — Created with Figma/React, shadcn Card components
- **Gemini version** (port 3006) — Created with Gemini/Vite, custom styling + glass effects

## Quick Start

```bash
# Terminal 1 — Figma version
cd apps/mockup-comparison/figma-version
npm install
npm run dev
# → http://localhost:3005

# Terminal 2 — Gemini version
cd apps/mockup-comparison/gemini-version
npm install
npm run dev
# → http://localhost:3006
```

Open both side-by-side in your browser.

## Feedback Overlay

Each section in both mockups has a **Feedback** button (top-right corner):
1. Click the button to open a popover
2. Write natural language notes about what to keep, change, or remove
3. Feedback auto-saves to localStorage (debounced 300ms)
4. Sections with feedback show an indigo dot indicator
5. Click **Export Feedback** (bottom-right) to download all annotations as JSON

Feedback from each app is stored separately in localStorage using different prefixes:
- Figma: `cpm-mockup-figma:feedback:*`
- Gemini: `cpm-mockup-gemini:feedback:*`

## Not Part of the Monorepo

These are throwaway planning tools. They are **not** registered in `pnpm-workspace.yaml` and have their own `node_modules`.
