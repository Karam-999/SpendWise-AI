# Pricing Data

All pricing verified against official vendor pages. Prices are per-user/month unless noted.

## Cursor

| Plan | Price | Notes |
|------|-------|-------|
| Hobby | $0 | Free |
| Pro | $20/mo | Extended limits on Agent |
| Pro+ | $60/mo | 3x usage |
| Ultra | $200/mo | 20x usage |
| Teams | $40/user/mo | Centralized team billing |
| Enterprise | Custom | Pooled usage, SSO |

**Source:** https://cursor.sh/pricing
**Verified:** 2026-05-09

---

## GitHub Copilot

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Fast way to get started |
| Pro | $10/mo | Accelerate workflows |
| Pro+ | $39/mo | Scale with agents and more models |
| Business | $19/user/mo | Accelerate workflows for teams |
| Enterprise | $39/user/mo | Scale with agents for organizations |

**Source:** https://github.com/features/copilot
**Verified:** 2026-05-09

---

## Claude (Anthropic)

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Try Claude |
| Pro | $20/mo | For everyday productivity |
| Max | $100/mo | Get the most out of Claude |
| Team | $20/user/mo | For teams of 5 to 150 |
| Enterprise | Custom | For large businesses operating at scale |

**Source:** https://anthropic.com/pricing
**Verified:** 2026-05-09

---

## ChatGPT (OpenAI)

| Plan | Price | Notes |
|------|-------|-------|
| Go | ~$5/mo (₹399) | Expanded access |
| Plus | ~$20/mo (₹1,999) | Advanced intelligence |
| Pro | ~$200/mo (₹10,699) | Maximize productivity |
| Business | ~$25/user/mo (₹1,800) | Collaborative workspace |

**Source:** https://openai.com/chatgpt/pricing
**Verified:** 2026-05-09

---

## Gemini (Google)

| Plan | Price | Notes |
|------|-------|-------|
| Plus | ~$5/mo (₹399) | Boost productivity |
| Pro | ~$20/mo (₹1,950) | Higher access |
| Ultra | Custom | Highest level of access |

**Source:** https://gemini.google.com/subscriptions/
**Verified:** 2026-05-09

---

## Windsurf

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Light quota |
| Pro | $20/mo | Increased quotas |
| Max | $200/mo | Significantly higher quotas |
| Teams | $40/user/mo | Centralized billing |
| Enterprise | Custom | Let's talk |

**Source:** https://windsurf.com/pricing
**Verified:** 2026-05-09

---

## API Pricing (Pay-as-you-go)

OpenAI API and Anthropic API are usage-based (per-token). The audit engine flags any API spend as candidates for discounted credits through SpendWise, as an API user cannot simply downgrade to a chat interface. This typically yields ~45% savings.

## What the audit engine uses

The engine only uses the plans that are relevant for cost optimization rules. It doesn't model every plan - just the ones where a clear downgrade or consolidation saves money. See `src/lib/auditEngine.ts` for the exact pricing constants.
