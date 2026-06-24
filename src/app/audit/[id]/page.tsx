import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import type { AuditOutput } from "@/lib/types";
import AuditResultClient from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const supabase = getSupabase();
  if (!supabase) {
    return { title: "AI Spend Audit" };
  }

  const { data } = await supabase
    .from("audits")
    .select("results_json, total_savings")
    .eq("id", id)
    .single();

  if (!data) {
    return { title: "Audit not found - AI Spend Audit" };
  }

  const output = data.results_json as AuditOutput;
  const savings = data.total_savings as number;

  const topRec = output.results[0];
  const description = topRec
    ? `Top recommendation: ${topRec.recommendedAction} - saves $${topRec.savings}/mo`
    : "AI tool stack is well-optimized";

  return {
    title: savings > 0
      ? `I could save $${savings}/month on AI tools`
      : "My AI stack is optimized - AI Spend Audit",
    description,
    openGraph: {
      title: savings > 0
        ? `I could save $${savings}/month on AI tools - see my audit`
        : "My AI stack is optimized - see my audit",
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: savings > 0
        ? `I could save $${savings}/month on AI tools`
        : "My AI stack is optimized",
      description,
    },
  };
}

export default async function AuditResultPage({ params }: PageProps) {
  const { id } = await params;

  let serverOutput: AuditOutput | null = null;

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("audits")
      .select("results_json")
      .eq("id", id)
      .single();

    if (data) {
      serverOutput = data.results_json as AuditOutput;
    }
  }

  return <AuditResultClient auditId={id} serverOutput={serverOutput} />;
}
