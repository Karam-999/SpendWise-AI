/**
 * Audit Engine — pure function, no side effects, no external calls.
 *
 * Takes a user's AI tool spend data and returns actionable recommendations.
 * All pricing is hardcoded from official vendor pages (see PRICING_DATA.md).
 */

import type { AuditFormData, AuditOutput, ToolInput, ToolResult } from "./types";

// ---------------------------------------------------------------------------
// Hardcoded pricing (verified against vendor pages — see PRICING_DATA.md)
// ---------------------------------------------------------------------------

const PRICING = {
  cursor: { hobby: 0, pro: 20, pro_plus: 60, ultra: 200, teams: 40 },
  github_copilot: { free: 0, pro: 10, pro_plus: 39, business: 19, enterprise: 39 },
  claude: { free: 0, pro: 20, max: 100, team: 20 },
  chatgpt: { go: 5, plus: 20, pro: 200, business: 25 },
  gemini: { plus: 5, pro: 20, ultra: 250 },
  windsurf: { free: 0, pro: 20, max: 200, teams: 40 },
} as const;

// ---------------------------------------------------------------------------
// Helper: tools that overlap by purpose
// ---------------------------------------------------------------------------

const CODING_TOOLS: string[] = ["cursor", "github_copilot", "windsurf"];
const CHAT_TOOLS: string[] = ["claude", "chatgpt"];

// ---------------------------------------------------------------------------
// Per-tool evaluation rules
// ---------------------------------------------------------------------------

function evaluateTool(
  tool: ToolInput,
  teamSize: number,
  useCase: string,
  activeTools: ToolInput[]
): ToolResult | null {
  // Rule 0: Skip inactive, zero-seat, or zero-spend tools
  if (!tool.active || tool.seats === 0 || tool.monthlySpend === 0) {
    return null;
  }

  const base: Omit<ToolResult, "recommendedAction" | "newSpend" | "savings" | "reason"> = {
    tool: tool.tool,
    label: tool.label,
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
  };

  // -----------------------------------------------------------------------
  // Rule 1: Team/Business plan for ≤2 users → downgrade to Pro/Individual
  // -----------------------------------------------------------------------
  if (tool.tool === "cursor" && (tool.plan === "business" || tool.plan === "teams") && tool.seats <= 2) {
    const newSpend = tool.seats * PRICING.cursor.pro;
    return {
      ...base,
      recommendedAction: "Downgrade to Cursor Pro",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Teams plan at $40/user for only ${tool.seats} user(s). Pro at $20/user covers most features for small teams.`,
    };
  }

  if (tool.tool === "claude" && tool.plan === "team" && tool.seats <= 2) {
    const newSpend = tool.seats * PRICING.claude.pro;
    return {
      ...base,
      recommendedAction: "Downgrade to Claude Pro",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Team plan requires a 5-seat minimum ($100/mo). For only ${tool.seats} user(s), individual Pro plans at $20/user save money.`,
    };
  }

  if (tool.tool === "chatgpt" && (tool.plan === "team" || tool.plan === "business") && tool.seats <= 2) {
    const newSpend = tool.seats * PRICING.chatgpt.plus;
    return {
      ...base,
      recommendedAction: "Downgrade to ChatGPT Plus",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Business plan at $25/user for only ${tool.seats} user(s). Plus at $20/user saves without losing much for small teams.`,
    };
  }

  if (tool.tool === "github_copilot" && tool.plan === "enterprise" && tool.seats <= 2) {
    const newSpend = tool.seats * PRICING.github_copilot.business;
    return {
      ...base,
      recommendedAction: "Downgrade to Copilot Business",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Enterprise at $39/user for only ${tool.seats} user(s). Business at $19/user is sufficient for small teams.`,
    };
  }

  if (tool.tool === "windsurf" && tool.plan === "teams" && tool.seats <= 2) {
    const newSpend = tool.seats * PRICING.windsurf.pro;
    return {
      ...base,
      recommendedAction: "Downgrade to Windsurf Pro",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Teams plan at $40/user for only ${tool.seats} user(s). Pro at $20/user covers individual needs.`,
    };
  }

  // -----------------------------------------------------------------------
  // Rule 2: Copilot Enterprise for small teams (≤10) → Business
  // -----------------------------------------------------------------------
  if (tool.tool === "github_copilot" && tool.plan === "enterprise" && teamSize <= 10) {
    const newSpend = tool.seats * PRICING.github_copilot.business;
    return {
      ...base,
      recommendedAction: "Switch to Copilot Business",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Enterprise at $39/user is designed for large orgs. Business at $19/user has the features a ${teamSize}-person team needs.`,
    };
  }

  // -----------------------------------------------------------------------
  // Rule 3: Gemini Ultra for basic writing → Pro
  // -----------------------------------------------------------------------
  if (tool.tool === "gemini" && tool.plan === "ultra" && (useCase === "writing" || useCase === "research")) {
    const newSpend = PRICING.gemini.pro;
    return {
      ...base,
      recommendedAction: "Downgrade to Gemini Pro",
      newSpend,
      savings: tool.monthlySpend - newSpend,
      reason: `Ultra at $250/mo is overkill for ${useCase}. Pro at $20/mo handles writing and research well.`,
    };
  }

  // -----------------------------------------------------------------------
  // Rule 4: API direct spend under $20 → flat plan
  // -----------------------------------------------------------------------
  if (tool.tool === "openai_api" && tool.monthlySpend < 20) {
    return {
      ...base,
      recommendedAction: "Switch to ChatGPT Plus ($20/mo)",
      newSpend: PRICING.chatgpt.plus,
      savings: Math.max(0, tool.monthlySpend - PRICING.chatgpt.plus),
      reason: `Spending $${tool.monthlySpend}/mo on OpenAI API. ChatGPT Plus at $20/mo gives generous usage with a predictable bill.`,
    };
  }

  if (tool.tool === "anthropic_api" && tool.monthlySpend < 20) {
    return {
      ...base,
      recommendedAction: "Switch to Claude Pro ($20/mo)",
      newSpend: PRICING.claude.pro,
      savings: Math.max(0, tool.monthlySpend - PRICING.claude.pro),
      reason: `Spending $${tool.monthlySpend}/mo on Anthropic API. Claude Pro at $20/mo gives generous usage with a predictable bill.`,
    };
  }

  // -----------------------------------------------------------------------
  // Rule 5: Duplicate coding tools → recommend keeping one
  // -----------------------------------------------------------------------
  if (CODING_TOOLS.includes(tool.tool) && useCase === "coding") {
    const activeCodingTools = activeTools.filter(
      (t) => t.active && t.seats > 0 && t.monthlySpend > 0 && CODING_TOOLS.includes(t.tool)
    );

    if (activeCodingTools.length >= 2) {
      // Recommend dropping the cheaper tool (keep the one they're paying more for)
      const sorted = [...activeCodingTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
      const cheapest = sorted[sorted.length - 1];

      if (tool.tool === cheapest.tool && activeCodingTools.length >= 2) {
        return {
          ...base,
          recommendedAction: `Drop ${tool.label} — redundant with other coding tools`,
          newSpend: 0,
          savings: tool.monthlySpend,
          reason: `You're paying for ${activeCodingTools.length} coding assistants. One good tool is enough — consolidate to save.`,
        };
      }
    }
  }

  // -----------------------------------------------------------------------
  // Rule 6: Duplicate chat tools for same use case → recommend one
  // -----------------------------------------------------------------------
  if (CHAT_TOOLS.includes(tool.tool)) {
    const activeChatTools = activeTools.filter(
      (t) => t.active && t.seats > 0 && t.monthlySpend > 0 && CHAT_TOOLS.includes(t.tool)
    );

    if (activeChatTools.length >= 2) {
      // For coding use case, recommend Claude. For writing, recommend ChatGPT.
      // For other use cases, recommend the cheaper one.
      let toolToDropName: string | null = null;

      if (useCase === "coding") {
        toolToDropName = "chatgpt"; // Claude is generally better for code
      } else if (useCase === "writing") {
        toolToDropName = "claude"; // ChatGPT is generally preferred for writing
      } else {
        // For data/research/mixed — drop the more expensive one
        const sorted = [...activeChatTools].sort((a, b) => a.monthlySpend - b.monthlySpend);
        toolToDropName = sorted[sorted.length - 1].tool;
      }

      if (tool.tool === toolToDropName) {
        const keepTool = activeChatTools.find((t) => t.tool !== toolToDropName);
        return {
          ...base,
          recommendedAction: `Drop ${tool.label} — ${keepTool?.label ?? "the other tool"} covers your ${useCase} needs`,
          newSpend: 0,
          savings: tool.monthlySpend,
          reason: `Paying for both Claude and ChatGPT for ${useCase}. One is enough — pick the one that fits your workflow.`,
        };
      }
    }
  }

  // No recommendation — tool is fine
  return null;
}

// ---------------------------------------------------------------------------
// AI Spend Score calculation
// ---------------------------------------------------------------------------

function calculateSpendScore(totalSpend: number, totalSavings: number): number {
  if (totalSpend === 0) return 100;

  // Score = percentage of spend that is NOT wasted
  const wasteRatio = totalSavings / totalSpend;
  const score = Math.round((1 - wasteRatio) * 100);

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Main audit engine
// ---------------------------------------------------------------------------

export function auditEngine(input: AuditFormData): AuditOutput {
  const activeTools = input.tools.filter(
    (t) => t.active && t.seats > 0 && t.monthlySpend > 0
  );

  const results: ToolResult[] = [];

  for (const tool of activeTools) {
    const result = evaluateTool(tool, input.teamSize, input.useCase, input.tools);
    if (result) {
      results.push(result);
    }
  }

  const savingsResults = results.filter((r) => r.savings > 0);
  const totalMonthlySavings = savingsResults.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  const totalCurrentSpend = activeTools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const spendScore = calculateSpendScore(totalCurrentSpend, totalMonthlySavings);

  const showCredexCTA = totalMonthlySavings > 500;
  const spendingWell = totalMonthlySavings < 100 && savingsResults.length === 0;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    showCredexCTA,
    spendingWell,
    spendScore,
  };
}
