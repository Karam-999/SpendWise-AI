# DEVLOG

## Day 1 — 2026-05-06

**Hours worked:** 0
**Why:** Didn't see the assignment message until later.

## Day 2 — 2026-05-07

**Hours worked:** 3

**What I did:**
- Initialized Next.js project with TypeScript, Tailwind CSS, and shadcn/ui
- Set up Supabase project, signed up for Groq, installed required packages
- Pushed boilerplate to GitHub

**What I learned:**
- Next.js 16 has breaking changes — `params` is now a Promise in pages and API routes
- shadcn/ui radix-lyra style defaults to `rounded-none` on buttons

**Blockers / what I'm stuck on:**
- None — setup went smoothly

**Plan for tomorrow:**
- Build the audit engine and spend input form
- Create API route and results page
- Write tests

## Day 3 — 2026-05-08

**Hours worked:** 5

**What I did:**
- Built audit engine (`auditEngine.ts`) — pure function, 6 rules, AI Spend Score (0–100)
- Built spend input form with 8 tool cards, toggles, plan dropdowns, localStorage persistence
- Created `/api/audit` route with nanoid IDs, in-memory rate limiting, Supabase save
- Built results page with savings hero, Spend Score badge, per-tool cards, Credex CTA
- Wrote 6 Vitest tests — all passing
- Created Supabase SQL schema for `audits` and `leads` tables

**What I learned:**
- localStorage restore needs a hydration guard to avoid React server/client mismatches
- `next build` fails if Supabase client is eagerly initialized — lazy init fixes this
- $0-savings recommendations (API→flat plan) need to be filtered separately from savings totals

**Blockers / what I'm stuck on:**
- Need to run schema.sql in Supabase SQL Editor to create the tables
- Not deployed to Vercel yet

**Plan for tomorrow:**
- Add `PRICING_DATA.md` with verified vendor URLs
- Start Groq AI summary integration
- Polish UI for mobile, add error states
- Reach out for user interviews
