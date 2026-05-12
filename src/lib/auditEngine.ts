/**
 * Audit Engine — pure function, no side effects, no external calls.
 *
 * Takes a user's AI tool spend data and returns actionable recommendations.
 * All pricing is hardcoded from official vendor pages (see PRICING_DATA.md).
 *
 * Rules applied (in order):
 *   1. Team/Business plan for ≤2 users → downgrade to individual Pro
 *   2. Copilot Enterprise for ≤10 users → downgrade to Business
 *   3. Gemini Ultra for writing/research → downgrade to Gemini Pro
 *   4a. Low API spend (<$20/mo) → switch to a flat subscription (predictable billing)
 *   4b. High API spend (≥$20/mo) → buy discounted credits via Credex/SpendWise (~45% off)
 *   5. Duplicate coding tools → keep the highest-spend one, drop the rest
 *   6. Duplicate chat tools for same use case → keep the better-fit one
 *   7. Premium individual tiers that don't match stated use case → downgrade
 */

import type { AuditFormData, AuditOutput, ToolInput, ToolResult } from "./types";

// ---------------------------------------------------------------------------
// Pricing constants — verified against official vendor pages (see PRICING_DATA.md)
// All prices are per-user/month unless noted as flat.
// ---------------------------------------------------------------------------

const PRICING = {
  cursor: {
    hobby: 0,
    pro: 20,       // flat, single user
    pro_plus: 60,  // flat, single user — 3× usage
    ultra: 200,    // flat, single user — 20× usage
    teams: 40,     // per user/mo
    // enterprise: custom — not modelled
  },
  github_copilot: {
    free: 0,
    pro: 10,        // per user/mo
    pro_plus: 39,   // per user/mo — agents + more models
    business: 19,   // per user/mo
    enterprise: 39, // per user/mo
  },
  claude: {
    free: 0,
    pro: 20,   // flat, single user
    max: 100,  // flat, single user — 5× usage limits
    team: 20,  // per user/mo — 5-seat minimum ($100/mo minimum)
    // enterprise: custom — not modelled
  },
  chatgpt: {
    go: 5,        // flat (~₹399)
    plus: 20,     // flat, single user
    pro: 200,     // flat, single user — unlimited o1, o3, etc.
    business: 25, // per user/mo
    // enterprise: custom — not modelled
  },
  gemini: {
    plus: 5,   // flat (~₹399)
    pro: 20,   // flat (~₹1,950)
    ultra: 250, // NOTE: Google lists Ultra pricing as custom/variable;
                // $250 is the commonly-cited figure used here as a conservative floor.
                // See PRICING_DATA.md for source note.
  },
  windsurf: {
    free: 0,
    pro: 20,   // flat, single user
    max: 200,  // flat, single user — significantly higher quotas
    teams: 40, // per user/mo
    // enterprise: custom — not modelled
  },
} as const;

// Savings threshold above which Credex CTA becomes relevant
const CREDEX_CTA_THRESHOLD = 500;
// Savings threshold below which we call the spend "already optimised"
const WELL_OPTIMISED_THRESHOLD = 100;

// ---------------------------------------------------------------------------
// Tool groupings by purpose
// ---------------------------------------------------------------------------

const CODING_TOOLS: string[] = ["cursor", "github_copilot", "windsurf"];
const CHAT_TOOLS: string[]   = ["claude", "chatgpt"];
const API_TOOLS: string[]    = ["openai_api", "anthropic_api"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seats(tool: ToolInput): number {
  return Math.max(1, tool.seats ?? 1);
}

/** Map a savings amount to a priority tier for the UI. */
function toPriority(savings: number): "high" | "medium" | "low" {
  if (savings >= 100) return "high";
  if (savings >= 30)  return "medium";
  return "low";
}

// ---------------------------------------------------------------------------
// Per-tool evaluation rules
// ---------------------------------------------------------------------------

function evaluateTool(
  tool: ToolInput,
  teamSize: number,
  useCase: string,
  allTools: ToolInput[]
): ToolResult | null {
  // Pre-condition: skip inactive / zero-seat / zero-spend tools
  if (!tool.active || seats(tool) === 0 || tool.monthlySpend === 0) {
    return null;
  }

  const base: Omit<ToolResult, "recommendedAction" | "newSpend" | "savings" | "reason" | "priority"> = {
    tool:         tool.tool,
    label:        tool.label,
    currentPlan:  tool.plan,
    currentSpend: tool.monthlySpend,
  };

  // -----------------------------------------------------------------------
  // RULE 1: Team/Business plan for ≤2 users → downgrade to individual Pro
  // Rationale: team/business tiers exist for centralised billing & admin;
  //   for 1–2 people the overhead cost is never worth it.
  // -----------------------------------------------------------------------

  if (tool.tool === "cursor" && tool.plan === "teams" && seats(tool) <= 2) {
    const newSpend = seats(tool) * PRICING.cursor.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Cursor Pro (individual)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Teams plan ($40/user/mo) for only ${seats(tool)} seat${seats(tool) > 1 ? "s" : ""} adds $${40 - 20}/user/mo of overhead for admin features you don't need. Cursor Pro at $20/mo/user covers all coding features for small teams.`,
    };
  }

  if (tool.tool === "claude" && tool.plan === "team" && seats(tool) <= 2) {
    // Claude Team has a 5-seat minimum, so 1–2 seats means they're paying the $100/mo floor
    const newSpend = seats(tool) * PRICING.claude.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Switch to individual Claude Pro plans",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Claude Team requires a 5-seat minimum ($100/mo floor). For ${seats(tool)} user${seats(tool) > 1 ? "s" : ""}, two individual Pro plans at $20/user save money and provide the same model access.`,
    };
  }

  if (
    tool.tool === "chatgpt" &&
    (tool.plan === "team" || tool.plan === "business") &&
    seats(tool) <= 2
  ) {
    const newSpend = seats(tool) * PRICING.chatgpt.plus;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to ChatGPT Plus (individual)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Business plan ($25/user/mo) for ${seats(tool)} user${seats(tool) > 1 ? "s" : ""} is wasteful — team admin features aren't useful at this size. Plus at $20/mo gives identical model access.`,
    };
  }

  if (tool.tool === "github_copilot" && tool.plan === "enterprise" && seats(tool) <= 2) {
    const newSpend = seats(tool) * PRICING.github_copilot.business;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Copilot Business",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Enterprise ($39/user/mo) is designed for large orgs needing policy controls and audit logs. For ${seats(tool)} developer${seats(tool) > 1 ? "s" : ""}, Business at $19/user/mo provides the same coding completions at half the price.`,
    };
  }

  if (tool.tool === "windsurf" && tool.plan === "teams" && seats(tool) <= 2) {
    const newSpend = seats(tool) * PRICING.windsurf.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Windsurf Pro (individual)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Teams plan ($40/user/mo) for ${seats(tool)} seat${seats(tool) > 1 ? "s" : ""} — you're paying a per-seat premium for centralised billing that doesn't apply to a ${seats(tool)}-person setup. Pro at $20/mo covers individual quotas.`,
    };
  }

  // -----------------------------------------------------------------------
  // RULE 2: Copilot Enterprise for small teams (≤10) → Business
  // Rationale: Enterprise adds SAML SSO, audit logs, policy enforcement —
  //   features only relevant to companies with IT/compliance requirements.
  //   The price difference is $20/user/mo with zero capability loss for
  //   a typical 5–10 person engineering team.
  // -----------------------------------------------------------------------

  if (tool.tool === "github_copilot" && tool.plan === "enterprise" && teamSize <= 10) {
    const newSpend = seats(tool) * PRICING.github_copilot.business;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Switch to Copilot Business",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Copilot Enterprise ($39/user/mo) adds SSO, audit logs, and policy management — features that only matter at 50+ person orgs with dedicated IT. Business at $19/user/mo offers the same completions for a ${teamSize}-person team.`,
    };
  }

  // -----------------------------------------------------------------------
  // RULE 3: Gemini Ultra for writing or research → Gemini Pro
  // Rationale: Ultra adds higher API quotas and extended context primarily
  //   useful for developers building on the API. For writing and research
  //   workflows, Gemini Pro handles long docs, summarisation, and drafting
  //   equally well at 1/12 the price.
  // -----------------------------------------------------------------------

  if (
    tool.tool === "gemini" &&
    tool.plan === "ultra" &&
    (useCase === "writing" || useCase === "research")
  ) {
    const newSpend = PRICING.gemini.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Gemini Pro",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Gemini Ultra (~$250/mo) is built for developers integrating Gemini into products. For ${useCase} tasks, Gemini Pro at $20/mo accesses the same 1.5 Pro model with limits that a ${useCase} workflow will never hit.`,
    };
  }

  // -----------------------------------------------------------------------
  // RULE 4a: Low raw API spend (<$20/mo) → switch to a flat subscription
  // Rationale: API billing is per-token and unpredictable. Below $20/mo
  //   the user would get more value from a flat subscription that includes
  //   the same model, a polished chat UI, and no surprise billing.
  //
  // RULE 4b: High raw API spend (≥$20/mo) → buy discounted credits
  // Rationale: At this level the user is building on top of the API and
  //   can't substitute a chat UI. Discounted credits via Credex/SpendWise
  //   save ~45% with no workflow change.
  // -----------------------------------------------------------------------

  if (tool.tool === "openai_api") {
    if (tool.monthlySpend > 0 && tool.monthlySpend < 20) {
      const newSpend = PRICING.chatgpt.plus; // $20 flat
      const savings  = tool.monthlySpend - newSpend;
      // savings could be negative here (e.g. $10 API → $20 Plus) — but the
      // value gain (unlimited usage, no surprise billing) still makes sense.
      // We only surface this if it's actually cheaper OR very close.
      if (savings >= 0) {
        return {
          ...base,
          recommendedAction: "Switch to ChatGPT Plus ($20/mo flat)",
          newSpend,
          savings,
          priority: toPriority(savings),
          reason: `You're spending $${tool.monthlySpend}/mo on OpenAI API tokens — unpredictable billing for a low-volume use. ChatGPT Plus ($20/mo) gives unlimited access to GPT-4o and o4-mini with a polished UI and zero surprise invoices.`,
        };
      }
      // If the switch would cost more, skip — they're spending efficiently at the API tier
      return null;
    }

    if (tool.monthlySpend >= 20) {
      const savings  = Math.round(tool.monthlySpend * 0.45);
      const newSpend = tool.monthlySpend - savings;
      return {
        ...base,
        recommendedAction: "Buy discounted OpenAI API credits via Credex",
        newSpend,
        savings,
        priority: toPriority(savings),
        reason: `At $${tool.monthlySpend}/mo you're a real API user — you can't substitute a chat plan. Unused OpenAI API credits from over-forecasted companies sell at ~45% off retail. No integration change required.`,
      };
    }
  }

  if (tool.tool === "anthropic_api") {
    if (tool.monthlySpend > 0 && tool.monthlySpend < 20) {
      const newSpend = PRICING.claude.pro; // $20 flat
      const savings  = tool.monthlySpend - newSpend;
      if (savings >= 0) {
        return {
          ...base,
          recommendedAction: "Switch to Claude Pro ($20/mo flat)",
          newSpend,
          savings,
          priority: toPriority(savings),
          reason: `You're spending $${tool.monthlySpend}/mo on Anthropic API tokens — unpredictable for a low-volume use. Claude Pro ($20/mo flat) includes access to Claude Sonnet and Opus with no per-token billing.`,
        };
      }
      return null;
    }

    if (tool.monthlySpend >= 20) {
      const savings  = Math.round(tool.monthlySpend * 0.45);
      const newSpend = tool.monthlySpend - savings;
      return {
        ...base,
        recommendedAction: "Buy discounted Anthropic API credits via Credex",
        newSpend,
        savings,
        priority: toPriority(savings),
        reason: `At $${tool.monthlySpend}/mo you need the API — you can't swap in a chat interface. Discounted Anthropic API credits (sourced from companies that over-forecasted) cut this bill by ~45% with zero code changes.`,
      };
    }
  }

  // -----------------------------------------------------------------------
  // RULE 5: Duplicate coding tools → keep the highest-spend one
  // Rationale: Cursor, Copilot, and Windsurf are functionally equivalent
  //   for most teams. Running two or three in parallel means paying twice
  //   for the same completions, with most developers gravitating to one anyway.
  //   We keep the tool they invest most in (highest monthly spend) and
  //   recommend dropping the rest.
  // -----------------------------------------------------------------------

  if (CODING_TOOLS.includes(tool.tool)) {
    const activeCodingTools = allTools.filter(
      (t) => t.active && seats(t) > 0 && t.monthlySpend > 0 && CODING_TOOLS.includes(t.tool)
    );

    if (activeCodingTools.length >= 2) {
      const sorted   = [...activeCodingTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
      const cheapest = sorted[sorted.length - 1];

      if (tool.tool === cheapest.tool) {
        const topTool = sorted[0];
        return {
          ...base,
          recommendedAction: `Drop ${tool.label} — consolidate on ${topTool.label}`,
          newSpend: 0,
          savings: tool.monthlySpend,
          priority: toPriority(tool.monthlySpend),
          reason: `You're paying for ${activeCodingTools.length} AI coding assistants. Developers typically use one actively; the rest idle. Keep ${topTool.label} (your highest investment) and cancel ${tool.label} to stop paying for unused completions.`,
        };
      }
    }
  }

  // -----------------------------------------------------------------------
  // RULE 6: Duplicate chat tools → keep the better-fit one for the use case
  // Rationale: Claude and ChatGPT overlap heavily for general work. Paying
  //   for both makes sense only if workflows are clearly separated. For most
  //   teams they aren't — one ends up as the default and the other idles.
  //   Use-case fit heuristics: Claude → coding, ChatGPT → writing/creative.
  //   For data/research/mixed → keep the cheaper one to minimise waste.
  // -----------------------------------------------------------------------

  if (CHAT_TOOLS.includes(tool.tool)) {
    const activeChatTools = allTools.filter(
      (t) => t.active && seats(t) > 0 && t.monthlySpend > 0 && CHAT_TOOLS.includes(t.tool)
    );

    if (activeChatTools.length >= 2) {
      let toolToDrop: string | null = null;

      if (useCase === "coding") {
        // Claude is consistently better at code generation and explanation
        toolToDrop = "chatgpt";
      } else if (useCase === "writing") {
        // ChatGPT (GPT-4o) is generally preferred for long-form and creative writing
        toolToDrop = "claude";
      } else {
        // data / research / mixed — drop the more expensive one
        const sorted = [...activeChatTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
        toolToDrop = sorted[0].tool;
      }

      if (tool.tool === toolToDrop) {
        const keepTool = activeChatTools.find((t) => t.tool !== toolToDrop);
        return {
          ...base,
          recommendedAction: `Drop ${tool.label} — ${keepTool?.label ?? "the other chat tool"} covers your ${useCase} workflow`,
          newSpend: 0,
          savings: tool.monthlySpend,
          priority: toPriority(tool.monthlySpend),
          reason: `Both Claude and ChatGPT are active for a ${useCase} use case. Teams that audit their usage find one becomes the default within weeks. For ${useCase}, ${keepTool?.label ?? "the other tool"} is the stronger fit — cancelling ${tool.label} saves $${tool.monthlySpend}/mo with no real capability gap.`,
        };
      }
    }
  }

  // -----------------------------------------------------------------------
  // RULE 7: Premium single-user tiers that exceed stated needs
  // Rationale: These tiers are designed for power users or developers who
  //   need very high rate limits / extended context windows. For most use
  //   cases — especially writing and research — the standard Pro tier
  //   reaches the same quality at a fraction of the cost.
  // -----------------------------------------------------------------------

  // ChatGPT Pro ($200/mo) → Plus ($20/mo) for non-power users
  // Pro adds: unlimited o1 pro mode, o3, extended thinking — only useful
  // for very long chains of reasoning or heavy API prototype work.
  if (tool.tool === "chatgpt" && tool.plan === "pro") {
    const newSpend = PRICING.chatgpt.plus;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to ChatGPT Plus ($20/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `ChatGPT Pro ($200/mo) adds unlimited o1 pro-mode and extended thinking — features designed for researchers running very long reasoning chains. ChatGPT Plus ($20/mo) covers GPT-4o and standard o4-mini for everyday ${useCase} tasks at 1/10 the price.`,
    };
  }

  // Claude Max ($100/mo) → Pro ($20/mo) for non-power users
  // Max adds: 5× the usage limits of Pro. Only relevant if you're running
  // into Pro's daily message caps, which most individuals don't.
  if (tool.tool === "claude" && tool.plan === "max") {
    const newSpend = PRICING.claude.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Claude Pro ($20/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Claude Max ($100/mo) provides 5× higher usage limits than Pro. Unless you're consistently hitting Pro's daily message caps, you're paying for headroom you don't use. Claude Pro at $20/mo covers typical ${useCase} workflows with the same model access.`,
    };
  }

  // Cursor Ultra ($200/mo) → Pro ($20/mo)
  // Ultra = 20× usage limits. Nearly no individual developer saturates Pro's
  // limits in a month of normal coding.
  if (tool.tool === "cursor" && tool.plan === "ultra") {
    const newSpend = PRICING.cursor.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Cursor Pro ($20/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Cursor Ultra ($200/mo) offers 20× the usage of Pro — designed for teams running Cursor agents unattended 24/7. For a single developer or a small team doing interactive coding, Pro at $20/mo covers daily usage without hitting limits.`,
    };
  }

  // Cursor Pro+ ($60/mo) → Pro ($20/mo) for most use cases
  // Pro+ = 3× usage. Worth it only if you're hitting Pro limits consistently.
  if (tool.tool === "cursor" && tool.plan === "pro_plus") {
    const newSpend = PRICING.cursor.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Cursor Pro ($20/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Cursor Pro+ ($60/mo) gives 3× usage limits over Pro. Unless you're regularly running into Pro's agent request caps, the additional $40/mo isn't buying you anything. Start with Pro ($20/mo) and upgrade only if limits become a genuine blocker.`,
    };
  }

  // Windsurf Max ($200/mo) → Pro ($20/mo)
  // Similar logic to Cursor Ultra.
  if (tool.tool === "windsurf" && tool.plan === "max") {
    const newSpend = PRICING.windsurf.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Windsurf Pro ($20/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Windsurf Max ($200/mo) unlocks significantly higher prompt quotas — relevant only for teams running automated agentic pipelines. For interactive development, Windsurf Pro at $20/mo provides ample quota.`,
    };
  }

  // GitHub Copilot Pro+ ($39/mo individual) → Pro ($10/mo)
  // Pro+ adds agent capabilities and more model choices. For most developers
  // the standard completions in Pro are sufficient, and the $29 gap is large.
  if (tool.tool === "github_copilot" && tool.plan === "pro_plus" && seats(tool) === 1) {
    const newSpend = PRICING.github_copilot.pro;
    const savings  = tool.monthlySpend - newSpend;
    return {
      ...base,
      recommendedAction: "Downgrade to Copilot Pro ($10/mo)",
      newSpend,
      savings,
      priority: toPriority(savings),
      reason: `Copilot Pro+ ($39/mo) adds multi-model agents and extended context — useful primarily for developers actively using Copilot Workspace for autonomous tasks. Copilot Pro at $10/mo provides the core completions and chat that cover standard ${useCase} work.`,
    };
  }

  // No recommendation — tool spend appears reasonable for the context
  return null;
}

// ---------------------------------------------------------------------------
// Spend Score
// A score from 0–100 representing how efficiently the team is spending.
// 100 = no identified waste; 0 = all spend is flagged as saveable.
// ---------------------------------------------------------------------------

function calculateSpendScore(totalSpend: number, totalSavings: number): number {
  if (totalSpend === 0) return 100;
  const wasteRatio = totalSavings / totalSpend;
  return Math.max(0, Math.min(100, Math.round((1 - wasteRatio) * 100)));
}

// ---------------------------------------------------------------------------
// Build summary hints for the Groq/LLM summary generator
// Surfaces the most notable facts so the AI can write a specific paragraph.
// ---------------------------------------------------------------------------

function buildSummaryHints(
  results: ToolResult[],
  totalMonthlySavings: number,
  teamSize: number,
  useCase: string
): string[] {
  const hints: string[] = [];

  if (totalMonthlySavings > 0) {
    hints.push(`Total identified monthly savings: $${totalMonthlySavings} ($${totalMonthlySavings * 12}/year)`);
  }

  const highPriority = results.filter((r) => r.priority === "high");
  if (highPriority.length > 0) {
    hints.push(`Highest-impact action: ${highPriority[0].recommendedAction} — saves $${highPriority[0].savings}/mo`);
  }

  const apiResults = results.filter((r) => API_TOOLS.includes(r.tool));
  if (apiResults.length > 0) {
    hints.push(`Raw API spend detected — direct credit purchase opportunity`);
  }

  const redundantTools = results.filter((r) => r.newSpend === 0);
  if (redundantTools.length > 0) {
    const names = redundantTools.map((r) => r.label).join(", ");
    hints.push(`Redundant tools to cancel: ${names}`);
  }

  hints.push(`Team size: ${teamSize}, primary use case: ${useCase}`);

  return hints;
}

// ---------------------------------------------------------------------------
// Main audit engine
// ---------------------------------------------------------------------------

export function auditEngine(input: AuditFormData): AuditOutput {
  const activeTools = input.tools.filter(
    (t) => t.active && seats(t) > 0 && t.monthlySpend > 0
  );

  const results: ToolResult[] = [];

  for (const tool of activeTools) {
    const result = evaluateTool(tool, input.teamSize, input.useCase, input.tools);
    if (result) {
      results.push(result);
    }
  }

  // Sort results: high priority first, then by savings descending
  results.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    return pDiff !== 0 ? pDiff : b.savings - a.savings;
  });

  const savingsResults       = results.filter((r) => r.savings > 0);
  const totalMonthlySavings  = savingsResults.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings   = totalMonthlySavings * 12;
  const totalCurrentSpend    = activeTools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const spendScore           = calculateSpendScore(totalCurrentSpend, totalMonthlySavings);

  // Show Credex CTA only when the savings are large enough to justify it
  const showCredexCTA = totalMonthlySavings >= CREDEX_CTA_THRESHOLD;

  // "Spending well" = no actionable savings found (separate from low-savings)
  const spendingWell     = savingsResults.length === 0;
  // "Low savings" = savings exist but are minor — still capture the lead
  const lowSavingsFound  = !spendingWell && totalMonthlySavings < WELL_OPTIMISED_THRESHOLD;

  const summaryHints = buildSummaryHints(
    results,
    totalMonthlySavings,
    input.teamSize,
    input.useCase
  );

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    spendScore,
    showCredexCTA,
    spendingWell,
    lowSavingsFound,
    summaryHints,
  };
}