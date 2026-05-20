# Round 2 — Development Log

## 20-05-2026 11:30 — Start
Read the Round 2 assignment. Planning approach: need 4 features — persistent audit storage with pricing snapshot, pricing-change detection, notification emails, and diff view. ~30 min planning before code.

## 20-05-2026 12:00 — Decided on approach
Will extend existing Supabase schema (add `pricing_snapshot` JSONB and `email` TEXT columns to `audits`). Detection via manual `/api/detect-changes` endpoint with optional `pricing_overrides` in body — lets reviewers test without redeploying. Resend for emails (already set up from Round 1). Diff view at `/audit/[id]/reaudit`.

Key design decision: export the `PRICING` constant from `auditEngine.ts` and add `auditEngineWithPricing()` that accepts custom pricing. This lets me re-run audits with different pricing data without duplicating engine logic.

## 20-05-2026 12:10 — Started core engine refactor
Exported `PRICING` and its type `PricingData`. Added `evaluateToolWithPricing()` as the core evaluator that accepts a pricing parameter, made the original `evaluateTool()` a wrapper. 15 references to `PRICING.` inside the function body needed changing to `pricing.`. All existing tests still pass after refactor — no regressions.

## 20-05-2026 15:20 — Created pricingDiff utility
Built `src/lib/pricingDiff.ts` with three functions:
- `detectPricingChanges()` — compares two pricing snapshots, returns array of changes
- `hasRelevantChanges()` — boolean shortcut
- `mergePricingOverrides()` — deep merges partial pricing overrides into base pricing

## 20-05-2026 15:25 — Updated API routes
- `/api/audit`: now stores `pricing_snapshot: PRICING` alongside each audit
- `/api/leads`: now stamps `email` onto the audit row when lead is captured (for notification lookup)

## 20-05-2026 15:30 — Built detect-changes endpoint
Created `POST /api/detect-changes`. Accepts optional `pricing_overrides`, fetches all audits with email + pricing snapshot, compares, re-runs affected audits, groups by email, sends consolidated notifications. Returns summary JSON.

## 20-05-2026 15:35 — Added pricing change email
Extended `email.ts` with `sendPricingChangeEmail()`. Sends consolidated email per user listing what changed, how it affects each audit, and a one-click re-audit link.

## 20-05-2026 15:40 — Built diff view UI
Created `/audit/[id]/reaudit/page.tsx` (server) and `client.tsx`. Server component fetches original audit, re-runs with current pricing, computes pricing diff. Client renders:
- Savings delta headline (+$X or -$X)
- Pricing changes summary
- Side-by-side old vs new recommendations (changed rows highlighted, unchanged collapsed)
- Score comparison

## 20-05-2026 15:45 — Tests
Added 6 new tests in `pricingDiff.test.ts`:
- Change detection (no changes, increase, decrease)
- Pricing override merging
- `auditEngineWithPricing` produces different results with different pricing
- Backward compatibility with `auditEngine`

All 15 tests pass (9 original + 6 new). `npm run build` succeeds.

## 20-05-2026 15:50 — Supabase migration
Wrote migration SQL (`supabase/migration_round2.sql`). Need to run on live Supabase instance.

## 20-05-2026 23:30 — Documentation
Writing ROUND2_PR.md, ROUND2_DEVLOG.md, ROUND2_REFLECTION.md.
