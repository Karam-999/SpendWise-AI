import { getSupabase } from "@/lib/supabase";
import { generateSummary } from "@/lib/groq";
import type { AuditOutput, AuditFormData } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: "Database not available." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("audits")
    .select("results_json, tools_json")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Supabase fetch error in summary API:", error);
    return Response.json({ error: "Audit not found." }, { status: 404 });
  }

  const output = data.results_json as AuditOutput;
  const formData = data.tools_json as AuditFormData;

  const summary = await generateSummary(output, formData);

  return Response.json({ summary });
}
