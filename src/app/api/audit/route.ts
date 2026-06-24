import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { auditEngine, PRICING } from "@/lib/auditEngine";
import { getSupabase } from "@/lib/supabase";
import type { AuditFormData, AuditResponse } from "@/lib/types";
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; 
const RATE_LIMIT_MAX = 10; 
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }
  let body: AuditFormData;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.tools || !Array.isArray(body.tools) || !body.teamSize || !body.useCase) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }
  const output = auditEngine(body);
  const auditId = nanoid(10);
  try {
    const supabase = getSupabase();
    if (supabase) {

      const { error } = await supabase.from("audits").insert({
        id: auditId,
        tools_json: body,
        results_json: output,
        total_savings: output.totalMonthlySavings,
        pricing_snapshot: PRICING,
      });
      if (error) {

        if (error.message?.includes("pricing_snapshot")) {
          const { error: fallbackError } = await supabase.from("audits").insert({
            id: auditId,
            tools_json: body,
            results_json: output,
            total_savings: output.totalMonthlySavings,
          });
          if (fallbackError) console.error("Supabase insert error:", fallbackError);
        } else {
          console.error("Supabase insert error:", error);
        }
      }
    }
  } catch (err) {
    console.error("Failed to save audit to Supabase:", err);
  }
  const response: AuditResponse = { auditId, output };
  return Response.json(response);
}
