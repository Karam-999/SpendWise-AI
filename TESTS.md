# Tests

All tests are written with [Vitest](https://vitest.dev/) and cover the audit engine, the core business logic of SpendWise.

## How to Run

```bash
# Run all tests
npm test

# Or directly
npx vitest run

# Watch mode (during development)
npx vitest
```

## Test Inventory

### `src/tests/auditEngine.test.ts`

| # | Test Name | What It Covers |
|---|---|---|
| 1 | recommends downgrade when team plan is used by 1 user | **Rule 1 (Small Team Downgrades):** Cursor Business plan with 1 seat -> recommends Cursor Pro, expects $20 savings |
| 2 | recommends dropping one tool when Cursor + Copilot are both active | **Rule 5 (Redundant Coding Tools):** Two coding assistants active -> drops the cheaper one (Copilot at $10/mo) |
| 3 | sets showCredexCTA to true when savings exceed $500/mo | **Credex CTA threshold:** Copilot Enterprise (20 seats) + Gemini Ultra -> total savings > $500, `showCredexCTA` must be true |
| 4 | returns spendingWell true when all tools are optimal | **Happy path / no waste:** Single Cursor Pro user -> no recommendations, `spendingWell: true`, `spendScore: 100` |
| 5 | recommends discounted credits when OpenAI API is used | **Rule 4b (High API Spend):** $100/mo OpenAI API -> recommends buying discounted credits, expects $45 savings (45%) |
| 6 | recommends discounted credits when Anthropic API is used | **Rule 4b (High API Spend):** $100/mo Anthropic API -> same 45% discount recommendation |
| 7 | recommends Gemini Pro when Ultra is used for writing | **Rule 3 (Overpowered Models):** Gemini Ultra ($250/mo) for writing -> Gemini Pro ($20/mo), expects $230 savings |
| 8 | drops ChatGPT when both Claude and ChatGPT are active for coding | **Rule 6 (Redundant Chat Tools):** Claude + ChatGPT both active for coding -> drops ChatGPT (Claude is the better coding fit) |
| 9 | ignores inactive tools | **Edge case:** Tools with `active: false` are completely ignored, no savings generated, `spendingWell: true` |

## CI Integration

Tests run automatically on every push to `main` via GitHub Actions (`.github/workflows/ci.yml`):

```yaml
- run: npx vitest run
```

The CI pipeline also runs `npm run lint` before tests.
