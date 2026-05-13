# Metrics

## North Star Metric

**Qualified consultations booked per week**

A "qualified consultation" is a user who:
1. Completed an audit showing >$500/mo in savings
2. Captured their email
3. Clicked the "Talk to SpendWise" CTA

This is the right North Star because it directly measures the tool's value to Credex as a business. Audits completed is a vanity metric, it only matters if those audits convert into revenue opportunities. Email captures are an intermediate signal. Consultations booked are the closest leading indicator to actual credit purchases.

## 3 Input Metrics That Drive the North Star

### 1. Audits completed per day
**Why:** Top-of-funnel volume. Without enough audits, nothing downstream matters. This metric tells us whether our distribution channels (HN, Reddit, Twitter, organic) are working.

**Target:** 50 audits/day in month 1, scaling to 200/day by month 3.

### 2. Average savings surfaced per audit ($)
**Why:** Quality signal. If the average savings is $0, our engine isn't finding real waste, either the rules are too conservative, the pricing data is stale, or our users are already well-optimized. If it's unrealistically high, we're manufacturing savings (bad for trust).

**Target:** $150-$400/month average across all audits. Below $100 suggests we need better rules or different user targeting. Above $500 suggests we're attracting high-value leads (great) or our engine is too aggressive (verify).

### 3. Email capture rate (emails captured / audits completed)
**Why:** Trust signal. Users who see real value give their email. A low capture rate means users don't trust the results, don't find them useful, or the capture UX is too intrusive.

**Target:** 10% in month 1, growing to 15% by month 3. Below 5% triggers a redesign (see pivot trigger below).

## What I'd Instrument First

In order of implementation priority:

1. **Audit completion event** - timestamp, number of tools toggled on, total spend entered, total savings found, spend score. This is the core funnel event.
2. **Email capture event** - audit ID, savings amount, whether Credex CTA was shown. Lets us measure capture rate segmented by savings level.
3. **Share URL click/generation** - how many audits generate a shareable link, and how many of those links are actually visited by someone else (referral tracking via UTM or `?ref=` parameter).
4. **Credex CTA click** - only fires for >$500/mo savings audits. Directly measures consultation intent.

All events would be sent to a lightweight analytics setup (Plausible or PostHog self-hosted), no Google Analytics, to avoid cookie consent friction.

## Pivot Trigger

**If email capture rate stays below 5% after 500 completed audits, something fundamental is broken.**

500 audits is a statistically meaningful sample. A <5% capture rate means fewer than 25 emails from 500 value-delivered interactions. Possible causes:

- **The savings aren't real:** Users see the numbers and don't believe them, so audit engine rules or pricing data need rework
- **The results aren't compelling:** The page doesn't communicate value clearly enough, so the results hero section needs a redesign
- **Wrong audience:** The users finding the tool don't have meaningful AI spend, so distribution channels need reorienting toward higher-spend personas

**Action:** Pause distribution, run 5 more user interviews specifically asking "why didn't you leave your email?", and redesign based on findings before resuming growth.
