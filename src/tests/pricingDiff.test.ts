import { describe, it, expect } from "vitest";
import { detectPricingChanges, hasRelevantChanges, mergePricingOverrides } from "@/lib/pricingDiff";
import { PRICING, auditEngineWithPricing, auditEngine } from "@/lib/auditEngine";

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

describe("pricingDiff", () => {
  it("detects no changes when pricing is identical", () => {
    const changes = detectPricingChanges(PRICING, PRICING);
    expect(changes).toHaveLength(0);
    expect(hasRelevantChanges(PRICING, PRICING)).toBe(false);
  });

  it("detects a price increase", () => {
    const newPricing = mergePricingOverrides(PRICING, { cursor: { pro: 25 } });
    const changes = detectPricingChanges(PRICING, newPricing);

    expect(changes.length).toBeGreaterThan(0);
    const cursorChange = changes.find((c) => c.tool === "cursor" && c.plan === "pro");
    expect(cursorChange).toBeDefined();
    expect(cursorChange!.oldPrice).toBe(20);
    expect(cursorChange!.newPrice).toBe(25);
  });

  it("detects a price decrease", () => {
    const newPricing = mergePricingOverrides(PRICING, { claude: { pro: 15 } });
    const changes = detectPricingChanges(PRICING, newPricing);

    const claudeChange = changes.find((c) => c.tool === "claude" && c.plan === "pro");
    expect(claudeChange).toBeDefined();
    expect(claudeChange!.oldPrice).toBe(20);
    expect(claudeChange!.newPrice).toBe(15);
  });

  it("merges pricing overrides correctly", () => {
    const merged = mergePricingOverrides(PRICING, { cursor: { pro: 30 } });
    expect((merged as unknown as Record<string, Record<string, number>>).cursor.pro).toBe(30);

    expect((merged as unknown as Record<string, Record<string, number>>).cursor.ultra).toBe(200);
    expect((merged as unknown as Record<string, Record<string, number>>).claude.pro).toBe(20);
  });
});

describe("auditEngineWithPricing", () => {
  it("produces different savings when pricing changes", () => {
    const form: AuditFormData = {
      tools: [makeTool({ tool: "cursor", plan: "teams", monthlySpend: 40, seats: 1 })],
      teamSize: 1,
      useCase: "coding",
    };

    const outputDefault = auditEngineWithPricing(form, PRICING);

    expect(outputDefault.results[0].savings).toBe(20);


    const newPricing = mergePricingOverrides(PRICING, { cursor: { pro: 30 } });
    const outputNew = auditEngineWithPricing(form, newPricing);
    expect(outputNew.results[0].savings).toBe(10);
  });

  it("backward compatible with auditEngine", () => {
    const form: AuditFormData = {
      tools: [makeTool({ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 })],
      teamSize: 5,
      useCase: "coding",
    };

    const out1 = auditEngine(form);
    const out2 = auditEngineWithPricing(form, PRICING);
    expect(out1.totalMonthlySavings).toBe(out2.totalMonthlySavings);
    expect(out1.results.length).toBe(out2.results.length);
  });
});
