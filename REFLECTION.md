# Reflection

## 1. The Hardest Bug I Hit This Week

The hardest bug was a silent failure in Supabase inserts that took me almost two hours on Day 3. The form would submit, the API route returned a 200 with an `auditId`, the redirect worked, but nothing showed up in the Supabase dashboard. No errors anywhere.

First I checked the environment variables, copied them fresh from Supabase, restarted the dev server. Still no rows. Then I thought it might be a schema mismatch with the JSONB columns, but a raw `INSERT` in the SQL editor worked fine.

The real cause: I was using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for server-side inserts in an API route, and Row Level Security was silently blocking the writes. The insert returned `{ data: null, error: null }`. Supabase doesn't throw on RLS denials, it just returns null for both fields. I only found it by logging the full response and noticing `data` was null while `error` was also null. Fixed it by switching API routes to `SUPABASE_SERVICE_ROLE_KEY` for server-side writes and adding explicit error checks (`if (!data) throw new Error(...)`). The lesson: "no error" doesn't mean "success".

Another painful issue was email delivery. I initially used the Resend SDK, but Resend only sends emails from verified custom domains. On the free tier you can only send from their test domain (`onboarding@resend.dev`), which meant my transactional emails were basically useless for real users. I wasted time trying to work around it before switching to Nodemailer with Gmail SMTP, which worked immediately with just an app password. Would use a proper provider like Postmark or SES in production, but for the MVP this was the right call.

## 2. A Decision I Reversed Mid-Week

I initially built the audit form with all eight tools in collapsible cards, grouped into categories: "Coding Assistants," "Chat/General AI," and "API/Direct." Each category mapped to different pricing rules in the engine, so it made sense to me.

By Day 5, after building the landing page with the hero section and how-it-works flow, the grouped form felt wrong. It was forcing my internal mental model onto users. Founders don't think about their tools in categories. They think "I pay for Cursor and ChatGPT." Making them understand my taxonomy before filling in the form added friction for no benefit.

I rebuilt it as a flat list of toggleable tool cards, no grouping. Each card has the tool name, on/off toggle, and inputs for plan/spend/seats. Coding tools still come first since that's the most common use case, but there are no category headers. The engine still applies category-based rules internally, the categorization just moved from the UI to the logic layer where it belongs.

## 3. What I Would Build in Week 2

Three things, in priority order:

**Benchmark mode.** The user interview showed this was a strong request: "Am I spending more than other companies my size?" I'd add anonymous aggregation over the audit database to compute percentiles for spend-per-developer by company size and use case. The results page would show: "Your AI spend is $X/developer/month, companies your size average $Y." This turns SpendWise from a one-time calculator into a repeated check-in tool.

**PDF export.** Interview subjects mentioned wanting to share the audit with their finance team. A shareable URL works for Slack, but finance people want a PDF for budget reviews. I'd use `@react-pdf/renderer` to generate a branded one-page report with the savings breakdown, spend score, and AI summary.

**Embeddable widget.** A `<script>` tag version that bloggers and SaaS reviewers could embed in their comparison posts. A mini form (3 fields: tool, plan, spend) that runs the engine client-side and shows savings inline. Each widget impression becomes a top-of-funnel touchpoint for SpendWise.

## 4. How I Used AI Tools

I used **AntiGravity** (with Claude Sonnet 4.6 and Claude Opus 4.6) as my primary development environment throughout the week.

**What I used AI for:** Boilerplate scaffolding (Next.js page/layout structure, Supabase client setup), CSS/Tailwind layout when I had a visual in mind but couldn't remember exact utility classes, generating test case skeletons that I then filled with real assertions, and debugging by describing symptoms and asking for hypotheses.

**What I didn't trust AI with:** The audit engine pricing constants (AI hallucinated Cursor Business as $30/mo at one point, I caught it by checking `PRICING_DATA.md` against the vendor pages), the audit engine rule logic (I wrote every rule myself because financial recommendations must be defensible), and the entrepreneurial files (GTM strategy, economics, user interview notes require genuine thinking and real conversations).

**A specific time AI was wrong:** When setting up Groq, Claude suggested `groq.completions.create()` with a `prompt` parameter (legacy OpenAI completions format). Groq's SDK actually uses `groq.chat.completions.create()` with a `messages` array. The code compiled but returned empty responses because the endpoint didn't exist. I caught it because the response was consistently `undefined`, checked Groq's actual SDK docs on npm, and fixed the call signature.

## 5. Self-Ratings

- **Discipline: 7/10** - Committed on 6 out of 7 days and kept the devlog updated. Lost half a day on Day 1 because I didn't see the assignment message immediately. Could have started user outreach earlier.

- **Code quality: 8/10** - The audit engine is well-typed, well-commented, and has 9 passing tests. TypeScript interfaces are shared across the stack. The main `page.tsx` form component at ~400 lines should be broken into smaller composable hooks, but I prioritized shipping over refactoring.

- **Design sense: 7/10** - The landing page looks polished with floating icons, trust strip, and clean typography. The results page is functional but could use more visual hierarchy and data visualization (charts, progress bars). I'm better at implementing designs than originating them.

- **Problem-solving: 8/10** - The Supabase RLS silent failure was a good example of systematic debugging. I formed hypotheses, tested each, and found the root cause through logging rather than guessing. I also made smart trade-offs (honeypot over hCaptcha, Groq over Anthropic) that saved time without hurting quality.

- **Entrepreneurial thinking: 7/10** - I built the product as a lead-gen tool, not a coding exercise. The Credex CTA only appears for high-savings cases, and I'm honest when spend is optimal. The GTM plan is specific. Where I fell short: I should have done user interviews earlier in the week and let them influence the form design from Day 1 instead of Day 5.
