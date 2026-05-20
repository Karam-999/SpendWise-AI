import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { PRICING, auditEngineWithPricing } from "@/lib/auditEngine";
import type { PricingData } from "@/lib/auditEngine";
import type { AuditFormData } from "@/lib/types";
import { detectPricingChanges, mergePricingOverrides } from "@/lib/pricingDiff";
import { sendPricingChangeEmail } from "@/lib/email";

/**
 * POST /api/detect-changes
 *
 * Detects which stored audits are affected by pricing changes and emails users.
 *
 * Body (optional):
 *   { "pricing_overrides": { "cursor": { "pro": 25 } } }
 *
 * If no body is provided, compares stored snapshots against current PRICING.
 * If pricing_overrides is provided, merges them with current PRICING first.
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: "Database not configured." }, { status: 500 });
  }

  // Parse optional pricing overrides
  let effectivePricing: PricingData = PRICING;
  try {
    const body = await request.json();
    if (body?.pricing_overrides) {
      effectivePricing = mergePricingOverrides(PRICING, body.pricing_overrides);
    }
  } catch {
    // No body or invalid JSON — use current PRICING as-is
  }

  // Fetch all audits that have an email and a pricing snapshot
  const { data: audits, error } = await supabase
    .from("audits")
    .select("id, email, tools_json, results_json, pricing_snapshot, total_savings")
    .not("email", "is", null)
    .not("pricing_snapshot", "is", null);

  if (error) {
    console.error("Failed to fetch audits:", error);
    return Response.json({ error: "Database query failed." }, { status: 500 });
  }

  if (!audits || audits.length === 0) {
    return Response.json({
      message: "No audits with emails and pricing snapshots found.",
      affected_audits: 0,
      emails_sent: 0,
    });
  }

  // Find affected audits
  interface AffectedAudit {
    auditId: string;
    email: string;
    changes: { tool: string; plan: string; oldPrice: number; newPrice: number }[];
    oldSavings: number;
    newSavings: number;
    oldRecommendations: string[];
    newRecommendations: string[];
  }

  const affectedAudits: AffectedAudit[] = [];

  for (const audit of audits) {
    const storedPricing = audit.pricing_snapshot as PricingData;
    const changes = detectPricingChanges(storedPricing, effectivePricing);

    if (changes.length === 0) continue;

    // Re-run the audit with new pricing
    const toolsInput = audit.tools_json as AuditFormData;
    const newOutput = auditEngineWithPricing(toolsInput, effectivePricing);
    const oldSavings = audit.total_savings as number;
    const newSavings = newOutput.totalMonthlySavings;

    // Check if recommendations actually changed
    const oldRecs = (audit.results_json as { results: { recommendedAction: string }[] })
      .results.map((r) => r.recommendedAction);
    const newRecs = newOutput.results.map((r) => r.recommendedAction);

    const recsChanged = JSON.stringify(oldRecs) !== JSON.stringify(newRecs) || oldSavings !== newSavings;

    if (recsChanged) {
      affectedAudits.push({
        auditId: audit.id,
        email: audit.email,
        changes,
        oldSavings,
        newSavings,
        oldRecommendations: oldRecs,
        newRecommendations: newRecs,
      });
    }
  }

  if (affectedAudits.length === 0) {
    return Response.json({
      message: "Pricing changes detected but no audit recommendations were affected.",
      affected_audits: 0,
      emails_sent: 0,
    });
  }

  // Group by email for consolidated notifications
  const byEmail = new Map<string, AffectedAudit[]>();
  for (const audit of affectedAudits) {
    const existing = byEmail.get(audit.email) ?? [];
    existing.push(audit);
    byEmail.set(audit.email, existing);
  }

  let emailsSent = 0;
  const emailResults: { email: string; auditsAffected: number; sent: boolean }[] = [];

  for (const [email, audits] of byEmail.entries()) {
    const sent = await sendPricingChangeEmail(email, audits.map((a) => ({
      auditId: a.auditId,
      changes: a.changes,
      oldSavings: a.oldSavings,
      newSavings: a.newSavings,
    })));

    if (sent) emailsSent++;
    emailResults.push({ email, auditsAffected: audits.length, sent });

    // Log the notification
    try {
      await supabase.from("reaudit_notifications").insert({
        email,
        audit_ids: audits.map((a) => a.auditId),
        changes: audits[0].changes,
      });
    } catch (err) {
      console.error("Failed to log notification:", err);
    }
  }

  // Update the pricing snapshot on affected audits to the new pricing
  for (const audit of affectedAudits) {
    try {
      await supabase
        .from("audits")
        .update({ pricing_snapshot: effectivePricing })
        .eq("id", audit.auditId);
    } catch (err) {
      console.error("Failed to update pricing snapshot:", err);
    }
  }

  return Response.json({
    message: `Detected ${affectedAudits.length} affected audit(s). Sent ${emailsSent} email(s).`,
    affected_audits: affectedAudits.length,
    emails_sent: emailsSent,
    details: emailResults,
    pricing_changes: detectPricingChanges(PRICING, effectivePricing),
  });
}
