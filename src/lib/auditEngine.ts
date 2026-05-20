import type { AuditFormData, AuditOutput, ToolInput, ToolResult } from "./types";

export const PRICING = {
  cursor: {
    hobby: 0,
    pro: 20,
    pro_plus: 60,
    ultra: 200,
    teams: 40,
  },
  github_copilot: {
    free: 0,
    pro: 10,
    pro_plus: 39,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 20,
  },
  chatgpt: {
    go: 5,
    plus: 20,
    pro: 200,
    business: 25,
  },
  gemini: {
    plus: 5,
    pro: 20,
    ultra: 250,
  },
  windsurf: {
    free: 0,
    pro: 20,
    max: 200,
    teams: 40,
  },
} as const;

export type PricingData = typeof PRICING;

const CONSULTATION_THRESHOLD = 500;
const WELL_OPTIMISED_THRESHOLD = 100;

const CODING_TOOLS: string[] = ["cursor", "github_copilot", "windsurf"];
const CHAT_TOOLS: string[]   = ["claude", "chatgpt"];
const API_TOOLS: string[]    = ["openai_api", "anthropic_api"];

function seats(tool: ToolInput): number {
  return Math.max(1, tool.seats ?? 1);
}

function toPriority(savings: number): "high" | "medium" | "low" {
  if (savings >= 100) return "high";
  if (savings >= 30)  return "medium";
  return "low";
}

function evaluateTool(
  tool: ToolInput,
  teamSize: number,
  useCase: string,
  allTools: ToolInput[]
): ToolResult | null {
  return evaluateToolWithPricing(tool, teamSize, useCase, allTools, PRICING);
}

function evaluateToolWithPricing(
  tool: ToolInput,
  teamSize: number,
  useCase: string,
  allTools: ToolInput[],
  pricing: PricingData
): ToolResult | null {
  if (!tool.active || seats(tool) === 0 || tool.monthlySpend === 0) {
    return null;
  }

  const base: Omit<ToolResult, "recommendedAction" | "newSpend" | "savings" | "reason" | "priority"> = {
    tool:         tool.tool,
    label:        tool.label,
    currentPlan:  tool.plan,
    currentSpend: tool.monthlySpend,
  };

  if (tool.tool === "cursor" && tool.plan === "teams" && seats(tool) <= 2) {
    const newSpend = seats(tool) * pricing.cursor.pro;
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
    const newSpend = seats(tool) * pricing.claude.pro;
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
    const newSpend = seats(tool) * pricing.chatgpt.plus;
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
    const newSpend = seats(tool) * pricing.github_copilot.business;
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
    const newSpend = seats(tool) * pricing.windsurf.pro;
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

  if (tool.tool === "github_copilot" && tool.plan === "enterprise" && teamSize <= 10) {
    const newSpend = seats(tool) * pricing.github_copilot.business;
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

  if (
    tool.tool === "gemini" &&
    tool.plan === "ultra" &&
    (useCase === "writing" || useCase === "research")
  ) {
    const newSpend = pricing.gemini.pro;
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

  if (tool.tool === "openai_api") {
    if (tool.monthlySpend > 0 && tool.monthlySpend < 20) {
      const newSpend = pricing.chatgpt.plus;
      const savings  = tool.monthlySpend - newSpend;
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
      return null;
    }

    if (tool.monthlySpend >= 20) {
      const savings  = Math.round(tool.monthlySpend * 0.45);
      const newSpend = tool.monthlySpend - savings;
      return {
        ...base,
        recommendedAction: "Buy discounted OpenAI API credits via SpendWise",
        newSpend,
        savings,
        priority: toPriority(savings),
        reason: `At $${tool.monthlySpend}/mo you're a real API user — you can't substitute a chat plan. Unused OpenAI API credits from over-forecasted companies sell at ~45% off retail. No integration change required.`,
      };
    }
  }

  if (tool.tool === "anthropic_api") {
    if (tool.monthlySpend > 0 && tool.monthlySpend < 20) {
      const newSpend = pricing.claude.pro;
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
        recommendedAction: "Buy discounted Anthropic API credits via SpendWise",
        newSpend,
        savings,
        priority: toPriority(savings),
        reason: `At $${tool.monthlySpend}/mo you need the API — you can't swap in a chat interface. Discounted Anthropic API credits (sourced from companies that over-forecasted) cut this bill by ~45% with zero code changes.`,
      };
    }
  }

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

  if (CHAT_TOOLS.includes(tool.tool)) {
    const activeChatTools = allTools.filter(
      (t) => t.active && seats(t) > 0 && t.monthlySpend > 0 && CHAT_TOOLS.includes(t.tool)
    );

    if (activeChatTools.length >= 2) {
      let toolToDrop: string | null = null;

      if (useCase === "coding") {
        toolToDrop = "chatgpt";
      } else if (useCase === "writing") {
        toolToDrop = "claude";
      } else {
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

  if (tool.tool === "chatgpt" && tool.plan === "pro") {
    const newSpend = pricing.chatgpt.plus;
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

  if (tool.tool === "claude" && tool.plan === "max") {
    const newSpend = pricing.claude.pro;
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

  if (tool.tool === "cursor" && tool.plan === "ultra") {
    const newSpend = pricing.cursor.pro;
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

  if (tool.tool === "cursor" && tool.plan === "pro_plus") {
    const newSpend = pricing.cursor.pro;
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

  if (tool.tool === "windsurf" && tool.plan === "max") {
    const newSpend = pricing.windsurf.pro;
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

  if (tool.tool === "github_copilot" && tool.plan === "pro_plus" && seats(tool) === 1) {
    const newSpend = pricing.github_copilot.pro;
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

  return null;
}

function calculateSpendScore(totalSpend: number, totalSavings: number): number {
  if (totalSpend === 0) return 100;
  const wasteRatio = totalSavings / totalSpend;
  return Math.max(0, Math.min(100, Math.round((1 - wasteRatio) * 100)));
}

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

export function auditEngine(input: AuditFormData): AuditOutput {
  return auditEngineWithPricing(input, PRICING);
}

export function auditEngineWithPricing(input: AuditFormData, pricing: PricingData): AuditOutput {
  const activeTools = input.tools.filter(
    (t) => t.active && seats(t) > 0 && t.monthlySpend > 0
  );

  const results: ToolResult[] = [];

  for (const tool of activeTools) {
    const result = evaluateToolWithPricing(tool, input.teamSize, input.useCase, input.tools, pricing);
    if (result) {
      results.push(result);
    }
  }

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

  const showConsultationCTA = totalMonthlySavings >= CONSULTATION_THRESHOLD;

  const spendingWell     = savingsResults.length === 0;
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
    showConsultationCTA,
    spendingWell,
    lowSavingsFound,
    summaryHints,
  };
}