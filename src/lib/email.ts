import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function sendAuditEmail(
  email: string,
  auditId: string,
  totalSavings: number
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email.");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const auditUrl = `${baseUrl}/audit/${auditId}`;

  const highSavings = totalSavings > 500;

  const text = [
    `Your AI Spend Audit is ready.`,
    ``,
    `View your full results: ${auditUrl}`,
    ``,
    totalSavings > 0
      ? `We found $${totalSavings}/mo in potential savings ($${totalSavings * 12}/yr).`
      : `Your AI stack looks well-optimized — no significant savings found.`,
    ``,
    highSavings
      ? `With over $500/mo in savings potential, a Credex advisor will reach out within 24 hours to help you capture these savings through discounted AI credits.`
      : ``,
    ``,
    `—SpendWise-AI\n Karam`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: "SpendWise-AI <onboarding@resend.dev>",
      to: email,
      subject: totalSavings > 0
        ? `Your AI audit: save $${totalSavings}/mo`
        : `Your AI audit results are ready`,
      text,
    });
    return true;
  } catch (err) {
    console.error("Resend email failed:", err);
    return false;
  }
}

export async function notifyAdminOfMarketplaceLead(
  adminEmail: string,
  lead: {
    mode: "buy" | "sell";
    fullName: string;
    email: string;
    company: string;
    phone?: string;
    platform?: string;
    message?: string;
  }
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping admin email.");
    return false;
  }

  const text = [
    `New Marketplace Lead (${lead.mode.toUpperCase()} Credits)`,
    ``,
    `Name: ${lead.fullName}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    `Phone: ${lead.phone || "N/A"}`,
    `Platform: ${lead.platform || "N/A"}`,
    `Message: ${lead.message || "N/A"}`,
  ].join("\n");

  try {
    await resend.emails.send({
      from: "SpendWise-AI Marketplace <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New ${lead.mode.toUpperCase()} Request: ${lead.company} (${lead.fullName})`,
      text,
    });
    return true;
  } catch (err) {
    console.error("Resend admin email failed:", err);
    return false;
  }
}
