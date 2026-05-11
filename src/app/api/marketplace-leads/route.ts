import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { notifyAdminOfMarketplaceLead } from "@/lib/email";

export async function POST(request: NextRequest) {
  let body: {
    mode: "buy" | "sell";
    fullName: string;
    email: string;
    company: string;
    phone?: string;
    platform?: string;
    message?: string;
    website?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.email || !body.fullName || !body.mode || !body.company) {
    return Response.json({ error: "Required fields missing." }, { status: 400 });
  }

  if (body.website) {
    return Response.json({ ok: true });
  }

  const supabase = getSupabase();

  if (supabase) {
    try {
      await supabase.from("marketplace_leads").insert({
        mode: body.mode,
        full_name: body.fullName,
        email: body.email,
        company: body.company,
        phone: body.phone || null,
        platform: body.platform || null,
        message: body.message || null,
      });
    } catch (err) {
      console.error("Failed to save marketplace lead:", err);
    }
  }

  await notifyAdminOfMarketplaceLead("karam.sayed2024@gmail.com", body);

  return Response.json({ ok: true });
}
