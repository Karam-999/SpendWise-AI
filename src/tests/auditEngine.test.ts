import { describe, it, expect } from "vitest";
import { auditEngine } from "@/lib/auditEngine";
import type { AuditFormData, ToolInput, ToolName } from "@/lib/types";

function makeTool(overrides: Partial<ToolInput> & { tool: ToolName }): ToolInput {
  return {
    label: overrides.tool,
    active: true,
    plan: "pro",
    monthlySpend: 20,
    seats: 1,
    ...overrides,
  };
}

function makeForm(tools: ToolInput[], teamSize = 5, useCase: AuditFormData["useCase"] = "coding"): AuditFormData {
  return { tools, teamSize, useCase };
}

describe("auditEngine", () => {
  it("recommends downgrade when team plan is used by 1 user", () => {
    const form = makeForm([
      makeTool({ tool: "cursor", plan: "teams", monthlySpend: 40, seats: 1 }),
    ]);

    const output = auditEngine(form);

    expect(output.results).toHaveLength(1);
    expect(output.results[0].recommendedAction).toContain("Downgrade");
    expect(output.results[0].savings).toBe(20); // $40 - $20
  });

  it("recommends dropping one tool when Cursor Pro + Copilot Individual are both active for coding", () => {
    const form = makeForm(
      [
        makeTool({ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }),
        makeTool({ tool: "github_copilot", plan: "individual", monthlySpend: 10, seats: 1 }),
      ],
      5,
      "coding"
    );

    const output = auditEngine(form);

    expect(output.results.length).toBeGreaterThanOrEqual(1);
    const dropRec = output.results.find((r) => r.tool === "github_copilot");
    expect(dropRec).toBeDefined();
    expect(dropRec!.savings).toBe(10);
  });

  it("sets showCredexCTA to true when savings exceed $500/mo", () => {
    const form = makeForm(
      [
        makeTool({ tool: "github_copilot", plan: "enterprise", monthlySpend: 780, seats: 20 }),
        makeTool({ tool: "gemini", plan: "ultra", monthlySpend: 250, seats: 1 }),
      ],
      8,
      "writing"
    );

    const output = auditEngine(form);

    expect(output.totalMonthlySavings).toBeGreaterThan(500);
    expect(output.showCredexCTA).toBe(true);
  });

  it("returns spendingWell true when all tools are optimal", () => {
    const form = makeForm(
      [
        makeTool({ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }),
      ],
      5,
      "coding"
    );

    const output = auditEngine(form);

    expect(output.results).toHaveLength(0);
    expect(output.spendingWell).toBe(true);
    expect(output.spendScore).toBe(100);
  });

  it("recommends discounted credits when OpenAI API is used", () => {
    const form = makeForm([
      makeTool({ tool: "openai_api", plan: "pay-as-you-go", monthlySpend: 100, seats: 1 }),
    ]);

    const output = auditEngine(form);

    expect(output.results).toHaveLength(1);
    expect(output.results[0].recommendedAction).toContain("Buy discounted");
    expect(output.results[0].savings).toBe(45); // 45% of 100
  });

  it("recommends discounted credits when Anthropic API is used", () => {
    const form = makeForm([
      makeTool({ tool: "anthropic_api", plan: "pay-as-you-go", monthlySpend: 100, seats: 1 }),
    ]);

    const output = auditEngine(form);

    expect(output.results).toHaveLength(1);
    expect(output.results[0].recommendedAction).toContain("Buy discounted");
    expect(output.results[0].savings).toBe(45); // 45% of 100
  });

  it("recommends Gemini Pro when Ultra is used for writing", () => {
    const form = makeForm(
      [makeTool({ tool: "gemini", plan: "ultra", monthlySpend: 250, seats: 1 })],
      5,
      "writing"
    );

    const output = auditEngine(form);

    expect(output.results).toHaveLength(1);
    expect(output.results[0].recommendedAction).toContain("Gemini Pro");
    expect(output.results[0].savings).toBe(230);
  });

  it("drops ChatGPT when both Claude and ChatGPT are active for coding", () => {
    const form = makeForm(
      [
        makeTool({ tool: "claude", plan: "pro", monthlySpend: 20, seats: 1 }),
        makeTool({ tool: "chatgpt", plan: "plus", monthlySpend: 20, seats: 1 }),
      ],
      5,
      "coding"
    );

    const output = auditEngine(form);

    const dropRec = output.results.find((r) => r.tool === "chatgpt");
    expect(dropRec).toBeDefined();
    expect(dropRec!.savings).toBe(20);
  });

  it("ignores inactive tools", () => {
    const form = makeForm([
      makeTool({ tool: "cursor", plan: "teams", monthlySpend: 40, seats: 1, active: false }),
      makeTool({ tool: "github_copilot", plan: "enterprise", monthlySpend: 390, seats: 10, active: false }),
    ]);

    const output = auditEngine(form);

    expect(output.results).toHaveLength(0);
    expect(output.totalMonthlySavings).toBe(0);
    expect(output.spendingWell).toBe(true);
  });
});
