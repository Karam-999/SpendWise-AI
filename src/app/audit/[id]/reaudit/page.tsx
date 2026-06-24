import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { auditEngine, PRICING } from "@/lib/auditEngine";
import type { AuditFormData, AuditOutput } from "@/lib/types";
import ReauditDiffClient from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Re-audit Comparison - SpendWise",
    description: "See how pricing changes affect your AI spend audit results.",
  };
}

export default async function ReauditPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = getSupabase();
  if (!supabase) {
    return <ReauditDiffClient auditId={id} oldOutput={null} newOutput={null} pricingChanges={[]} />;
  }


  const { data } = await supabase
    .from("audits")
    .select("tools_json, results_json, pricing_snapshot")
    .eq("id", id)
    .single();

  if (!data) {
    return <ReauditDiffClient auditId={id} oldOutput={null} newOutput={null} pricingChanges={[]} />;
  }

  const oldOutput = data.results_json as AuditOutput;
  const toolsInput = data.tools_json as AuditFormData;


  const newOutput = auditEngine(toolsInput);


  const oldPricing = (data.pricing_snapshot ?? PRICING) as Record<string, Record<string, number>>;
  const newPricing = PRICING as unknown as Record<string, Record<string, number>>;

  const pricingChanges: { tool: string; plan: string; oldPrice: number; newPrice: number }[] = [];
  for (const tool of Object.keys(newPricing)) {
    const oldPlans = oldPricing[tool] ?? {};
    const newPlans = newPricing[tool] ?? {};
    for (const plan of new Set([...Object.keys(oldPlans), ...Object.keys(newPlans)])) {
      const op = oldPlans[plan] ?? 0;
      const np = newPlans[plan] ?? 0;
      if (op !== np) {
        pricingChanges.push({ tool, plan, oldPrice: op, newPrice: np });
      }
    }
  }

  return (
    <ReauditDiffClient
      auditId={id}
      oldOutput={oldOutput}
      newOutput={newOutput}
      pricingChanges={pricingChanges}
    />
  );
}
