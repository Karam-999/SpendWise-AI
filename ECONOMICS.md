# Unit Economics

## What Is a Converted Lead Worth to Credex?

Credex sells discounted AI credits sourced from companies that overforecasted. A typical transaction:

- **Average order value (AOV):** $3,000 in credits per deal. Based on a startup buying 3-6 months of runway for one platform (e.g., $500/mo x 6 months of OpenAI API credits).
- **Credex margin:** ~20%. Credex buys credits at ~60% of retail and sells at ~55% discount to the buyer. The 15-20% spread is Credex's margin.
- **Revenue per converted lead:** $3,000 x 20% = **$600**.

For larger deals (enterprise customers buying $10k+ in credits), the revenue per lead scales significantly, but I'll use the conservative $600 figure for planning.

## Funnel Conversion Rates

| Stage | Rate | Reasoning |
|---|---|---|
| Visitor -> Audit completed | 40% | Free, no signup, instant value. High intent visitors from HN/Reddit |
| Audit completed -> Email captured | 10% | Email gate appears *after* showing results. Only captures genuinely interested users |
| Email captured -> Consultation booked | 15% | Only audits with >$500/mo savings show the Credex CTA. Pre-qualified |
| Consultation -> Purchase | 30% | Lead already knows their savings number. Credex offer is concrete |
| **End-to-end: Visitor -> Purchase** | **0.18%** | 40% x 10% x 15% x 30% |
| **End-to-end: Audit -> Purchase** | **0.45%** | 10% x 15% x 30% |

## CAC by Channel

| Channel | Cost per audit | Audits per conversion | CAC |
|---|---|---|---|
| Hacker News (Show HN) | $0 (organic) | 222 audits per purchase (0.45%) | **$0** |
| Reddit (r/startups post) | $0 (organic) | 222 | **$0** |
| Twitter DMs (founder outreach) | $0 (time cost only) | 222 | **$0** |
| Credex existing customer email | $0 (warm list) | ~50 (higher conversion, ~2%) | **$0** |
| Paid Twitter/X ads | ~$2 CPC x 2.5 clicks/audit | 222 | **$1,110** |
| Google Ads ("reduce AI costs") | ~$5 CPC x 3 clicks/audit | 222 | **$3,330** |

**Insight:** Organic channels dominate. Paid acquisition only makes sense after organic channels are saturated and the conversion funnel is validated. The Credex existing customer list is the most efficient channel by far, warm leads with 4x higher conversion.

## Revenue Model

At steady state:

| Metric | Monthly | Annual |
|---|---|---|
| Audits completed | 2,000 | 24,000 |
| Email captures (10%) | 200 | 2,400 |
| Consultations booked (15% of captures) | 30 | 360 |
| Purchases (30% of consultations) | 9 | 108 |
| Revenue per purchase | $600 | $600 |
| **Monthly revenue** | **$5,400** | - |
| **Annual revenue** | - | **$64,800** |

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR = $83,333/month in revenue.

At $600 revenue per purchase:
- Need **139 purchases/month**
- At 0.45% audit-to-purchase rate: need **30,889 audits/month** (~1,030/day)
- At 40% visitor-to-audit rate: need **77,222 visitors/month** (~2,574/day)

**Is 1,030 audits/day achievable?**

Probably not from organic alone. Three things would need to be true:

1. **Viral loop works.** If 5% of audit completers share their URL, and each share generates 2 new visitors, that's a 0.1x viral coefficient. Not viral, but it compounds. With 500 daily organic audits, viral sharing adds ~50 more.

2. **Average deal size increases.** If Credex targets mid-market companies buying $10k+ in credits (revenue per purchase = $2,000), the required audits drop to ~9,260/month (~309/day). Much more achievable.

3. **SEO compounds.** Each shareable audit URL is a unique page with relevant content (AI tool names, savings numbers). Over 18 months, 500,000+ pages create significant long-tail SEO value for queries like "cursor pricing 2026" and "claude team vs pro cost."

**The most realistic path to $1M ARR:** Organic acquisition + Credex's existing customer base + gradual upmarket movement toward higher-value enterprise deals. The audit tool is the top-of-funnel. It doesn't need to be the direct revenue driver at that scale; it needs to generate enough qualified leads that Credex's sales team can close.
