# DEVLOG

## Day 1 : 06-05-2026

**Hours worked:** 0

**Why:**
did not  see the message for this assignment 


## Day 2 : 07-05-2026

**Hours worked:** 3

**What I did:**
- Initialized the Next.js project with TypeScript, Tailwind CSS, and shadcn/ui. Pushed the boilerplate to GitHub immediately.
- Set up the Supabase, signed up for Groq and installed the required packages 

**What I learned:**
- Next.js 16 requires `params` to be awaited as a Promise in both pages and API routes — different from Next.js 14 which I was initially planning for. 
- The shadcn/ui radix-lyra style uses `rounded-none` by default on buttons, which I need to keep in mind for visual consistency.
- localStorage persistence needs careful handling to avoid hydration mismatches — rendering a loading spinner until the client state is read is the cleanest approach.

**Blockers / what I'm stuck on:**
- nothing, everything is working as expected, I will make the changes that you suggested in the next commit. 



## Day 3 : 08-05-2026

**Hours worked:** 5

**What I did:**
- Set up Supabase project and created the `audits` and `leads` tables. Kept the schema simple — JSONB columns for the tool input and engine output, with denormalized `total_savings` and `spend_score` for quick queries later.
- Built the spend input form (`page.tsx`) with all 8 tools as collapsible cards. Each tool has an active/inactive toggle, plan dropdown, monthly spend, and seat count. Added global fields for team size and primary use case.
- Implemented localStorage persistence — form state saves on every change and restores on page load. Used a hydration guard to avoid React mismatches between server and client render.
- Built the core audit engine (`lib/auditEngine.ts`) as a pure function with no external dependencies. Implemented 6 rules: team-plan downgrades for small teams, duplicate coding tool consolidation, duplicate chat tool consolidation, API-to-flat-plan recommendations, enterprise-to-business downgrades, and Gemini Ultra for basic writing.
- Added the AI Spend Score — a simple 0–100 metric based on the ratio of wasteful spend to total spend. No external data needed, just math.
- Created the API route (`/api/audit`) with nanoid-based audit IDs, in-memory IP rate limiting, and best-effort Supabase persistence.
- Built the results page with hero savings section, color-coded Spend Score badge, per-tool recommendation cards, and Credex CTA for high-savings cases.
- Wrote 6 Vitest tests for the audit engine covering the main rule paths plus edge cases (zero seats, optimal spend).
- Set up Vitest config with path alias resolution.


**Blockers / what I'm stuck on:**
- nothing, everything is working as expected, I will make the changes that you suggested in the next commit. 

**Plan for tomorrow:**
- Set up Supabase project and populate env vars.
- Add `PRICING_DATA.md` with verified vendor URLs.
- Test the full form → API → results flow end-to-end.
- Start on the Groq AI summary integration (Day 3 scope per plan but may start early).
- Polish the UI — check mobile responsiveness, add proper error states.
- Reach out to potential users for interviews.
