import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendAuditEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  let body: { auditId: string; email: string; company?: string; role?: string; website?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.email || !body.auditId) {
    return Response.json({ error: "Email and audit ID required." }, { status: 400 });
  }

  if (body.website) {
    return Response.json({ ok: true });
  }

  let totalSavings = 0;
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data: audit } = await supabase
        .from("audits")
        .select("total_savings")
        .eq("id", body.auditId)
        .single();

      totalSavings = audit?.total_savings ?? 0;

      await supabase.from("leads").insert({
        audit_id: body.auditId,
        email: body.email,
        company: body.company || null,
        role: body.role || null,
        team_size: null,
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  }

  await sendAuditEmail(body.email, body.auditId, totalSavings);

  return Response.json({ ok: true });
}
