## What this PR does

Adds a "re-audit on pricing change" system to SpendWise. Audits are now stored with a snapshot of the pricing data used at the time. When AI tool pricing changes, a detection endpoint identifies affected audits, emails users with what changed and how it impacts their recommendations, and provides a one-click link to a side-by-side diff view comparing old and new audit results.

## Why

AI tool pricing changes frequently — Cursor raised prices in 2024, Claude added new tiers in 2025, Copilot restructured plans. A one-time audit becomes stale quickly, and stale advice is worse than no advice. This feature turns SpendWise from a one-shot calculator into a persistent monitoring tool. Users who've completed an audit now have a reason to come back, and the email notifications create a re-engagement channel that doesn't require the user to remember to check.

## How it works

The pricing data lives as an exported `PRICING` constant in `auditEngine.ts`. When an audit is created, the current `PRICING` is stored as `pricing_snapshot` in the Supabase `audits` row alongside the existing `tools_json` and `results_json`.

When a pricing change happens, `POST /api/detect-changes` is called (manually or via cron). It accepts optional `pricing_overrides` (e.g., `{ "cursor": { "pro": 25 } }`) which are merged with the current `PRICING`. It then:

1. Fetches all audits that have an email and a pricing snapshot
2. Compares each audit's stored snapshot against the new effective pricing using `detectPricingChanges()` from `pricingDiff.ts`
3. For audits with pricing differences, re-runs the audit engine with `auditEngineWithPricing()` using the new pricing
4. If recommendations or savings changed, flags the audit as affected
5. Groups affected audits by user email and sends one consolidated notification per user via Resend
6. Updates the pricing snapshot on affected audits to prevent duplicate notifications

The re-audit diff view at `/audit/[id]/reaudit` is a server component that fetches the original audit, re-runs it with current pricing, and renders a side-by-side comparison client component showing changed/added/removed recommendations with a savings delta headline.

**New files:**
- `src/lib/pricingDiff.ts` — pricing comparison utilities
- `src/app/api/detect-changes/route.ts` — detection + notification endpoint
- `src/app/audit/[id]/reaudit/page.tsx` + `client.tsx` — diff view
- `supabase/migration_round2.sql` — schema changes

**Modified files:**
- `src/lib/auditEngine.ts` — exported PRICING, added `auditEngineWithPricing()`
- `src/lib/email.ts` — added `sendPricingChangeEmail()`
- `src/app/api/audit/route.ts` — stores pricing_snapshot
- `src/app/api/leads/route.ts` — links email to audit row

## What I cut

- **One-click unsubscribe** — the value/effort ratio in 36h favored getting the diff view right. Would add an `unsubscribed` boolean on the audits table and filter in detect-changes.
- **Public pricing changelog page** — interesting growth surface but zero impact on the core re-audit flow. Would be a static page fed by the `reaudit_notifications` table.
- **Admin dashboard** — would show total audits, emails sent, click-through. Deferred because the data is already in Supabase and queryable via SQL.
- **Scheduled cron trigger** — used a manual endpoint instead. Vercel Cron requires Pro; a GitHub Actions schedule calling the endpoint would work but adds CI complexity for no functional benefit during review.
- **HTML email templates** — sent plain text emails. A styled HTML email with pricing diff tables would be more polished but takes 2+ hours to get right across email clients.

## How to test it manually

1. Go to the live URL and submit an audit with **Cursor on Teams plan at $40/mo, 1 seat**
2. On the results page, submit your email via the lead capture form (this links your email to the audit)
3. Note the audit ID from the URL (`/audit/{id}`)
4. Trigger a pricing change detection:
   ```
   curl -X POST https://spend-wise-ai-credex.vercel.app/api/detect-changes \
     -H "Content-Type: application/json" \
     -d '{"pricing_overrides": {"cursor": {"pro": 30}}}'
   ```
5. Check your email for a pricing change notification from SpendWise
6. Click the re-audit link in the email, or visit `/audit/{id}/reaudit` directly
7. You should see a side-by-side diff: old savings ($20/mo) vs new savings ($10/mo) because Cursor Pro increased from $20 to $30

## What's tested

- `src/tests/auditEngine.test.ts` — 9 tests for audit engine rules (existing, all pass)
- `src/tests/pricingDiff.test.ts` — 6 new tests:
  - Detects no changes when pricing is identical
  - Detects price increases
  - Detects price decreases
  - Merges pricing overrides correctly
  - `auditEngineWithPricing` produces different savings with different pricing
  - Backward compatibility between `auditEngine` and `auditEngineWithPricing`
- Build verification: `npm run build` passes with no errors
- TypeScript: `npx tsc --noEmit` passes with no errors
