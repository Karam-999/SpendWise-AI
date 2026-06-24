import type { PricingData } from "./auditEngine";

export interface PriceChange {
  tool: string;
  plan: string;
  oldPrice: number;
  newPrice: number;
}


export function detectPricingChanges(
  oldPricing: PricingData,
  newPricing: PricingData
): PriceChange[] {
  const changes: PriceChange[] = [];

  const allTools = new Set([
    ...Object.keys(oldPricing),
    ...Object.keys(newPricing),
  ]);

  for (const tool of allTools) {
    const oldPlans = (oldPricing as Record<string, Record<string, number>>)[tool] ?? {};
    const newPlans = (newPricing as Record<string, Record<string, number>>)[tool] ?? {};

    const allPlans = new Set([
      ...Object.keys(oldPlans),
      ...Object.keys(newPlans),
    ]);

    for (const plan of allPlans) {
      const oldPrice = oldPlans[plan] ?? 0;
      const newPrice = newPlans[plan] ?? 0;

      if (oldPrice !== newPrice) {
        changes.push({ tool, plan, oldPrice, newPrice });
      }
    }
  }

  return changes;
}


export function hasRelevantChanges(
  oldPricing: PricingData,
  newPricing: PricingData
): boolean {
  return detectPricingChanges(oldPricing, newPricing).length > 0;
}


export function mergePricingOverrides(
  basePricing: PricingData,
  overrides: Record<string, Record<string, number>>
): PricingData {
  const merged = JSON.parse(JSON.stringify(basePricing)) as Record<string, Record<string, number>>;

  for (const [tool, plans] of Object.entries(overrides)) {
    if (!merged[tool]) {
      merged[tool] = {};
    }
    for (const [plan, price] of Object.entries(plans)) {
      merged[tool][plan] = price;
    }
  }

  return merged as unknown as PricingData;
}
