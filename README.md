# SpendWise - AI Spend Audit Tool

SpendWise is a free AI infrastructure spend optimization tool that audits your AI and cloud tool stack against verified vendor pricing, surfaces overspend, and recommends concrete actions to save money. Built for startup founders and engineering managers who pay for tools like Cursor, Copilot, Claude, ChatGPT, Gemini, and Windsurf but have no benchmark for whether they're overspending.

**Live:** [https://spendwise-ai-test.vercel.app/](https://spendwise-ai-test.vercel.app/)

---

## Youtube Video

[![SpendWise Demo](https://img.youtube.com/vi/8WYTR5WF3qQ/hqdefault.jpg)](https://youtu.be/8WYTR5WF3qQ)

---

## Quick Start

```bash
# Clone
git clone https://github.com/Karam-999/SpendWise-AI.git
cd SpendWise-AI

# Install
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NEXT_PUBLIC_BASE_URL

# Run locally
npm run dev        # → http://localhost:3000

# Run tests
npm test           # runs vitest

# Deploy
vercel --prod      # or push to main for auto-deploy
```

---

## Decisions

### 1. Groq API for AI summaries
The Groq's free tier gives 14,400 requests/day with no credit card, zero cost during development and at launch scale. The summary quality from llama3-70b is comparable to Claude Haiku for 100-word structured paragraphs.

### 2. Deterministic audit engine with no AI
The core audit recommendations use hardcoded deterministic rules and verified pricing. This ensures: (a) every recommendation traces to a specific price comparison a finance person can verify, (b) same input always yields same output (critical for financial advice), (c) sub-millisecond execution with zero API cost. AI is reserved only for the natural-language summary paragraph, where it adds genuine value.

### 3. Supabase over Firebase or a custom Postgres
Supabase gives a managed Postgres with a generous free tier, instant setup, and a JS client that works in both client and server contexts. Firebase would work but adds a NoSQL data model that's awkward for relational audit-to-lead joins. A raw Postgres on Render would be more work for the same outcome. Trade-off: Supabase's free tier has connection limits (500 concurrent), but for an MVP doing <100 audits/day, this is a non-issue.

### 4. localStorage for form persistence instead of server-side drafts
The assignment requires form state to persist across reloads. localStorage is the simplest solution, with no auth, no API call, no database write on every keystroke. Trade-off: state is device-local (can't resume on another device), and there's a hydration mismatch risk with SSR. Solved by rendering a loading skeleton until the client-side state is read.

### 5. Honeypot field over hCaptcha for abuse protection
hCaptcha adds friction to the user flow and a third-party dependency. A honeypot field (hidden input that bots auto-fill) is invisible to real users and catches the majority of automated form spam. Trade-off: sophisticated bots can bypass it, but for an MVP with low traffic, the simplicity wins. Added server-side IP rate limiting (5 audits/hour) as a second layer.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase |
| AI Summary | Groq API (llama3-70b-8192) |
| Deploy | Vercel |
| CI | GitHub Actions (lint + vitest) |
| Testing | Vitest (8 tests) |

---

## Required Files

| File | Description |
|---|---|
| `ARCHITECTURE.md` | System diagram, data flow, stack justification, 10k scale |
| `DEVLOG.md` | 7 daily entries |
| `REFLECTION.md` | 5 reflective questions, 150–400 words each |
| `TESTS.md` | Test inventory and run instructions |
| `PRICING_DATA.md` | Verified vendor pricing with source URLs |
| `PROMPTS.md` | LLM prompts, reasoning, failed iterations |
| `GTM.md` | Go-to-market strategy |
| `ECONOMICS.md` | Unit economics analysis |
| `USER_INTERVIEWS.md` | 3 real user interview notes |
| `LANDING_COPY.md` | Landing page copy |
| `METRICS.md` | North Star metric and input metrics |
