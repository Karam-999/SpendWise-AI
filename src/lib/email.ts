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
      ? `With over $500/mo in savings potential, a SpendWise advisor will reach out within 24 hours to help you capture these savings through discounted AI credits.`
      : ``,
    ``,
  `-SpendWise\n ${' '}Karam`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: "SpendWise <onboarding@resend.dev>",
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
      from: "SpendWise Marketplace <onboarding@resend.dev>",
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

export async function sendPricingChangeEmail(
  email: string,
  affectedAudits: {
    auditId: string;
    changes: { tool: string; plan: string; oldPrice: number; newPrice: number }[];
    oldSavings: number;
    newSavings: number;
  }[]
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping pricing change email.");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


  const allChanges = affectedAudits.flatMap((a) => a.changes);
  const uniqueChanges = Array.from(
    new Map(allChanges.map((c) => [`${c.tool}-${c.plan}`, c])).values()
  );

  const changeLines = uniqueChanges.map(
    (c) => `  • ${c.tool} (${c.plan}): $${c.oldPrice}/mo → $${c.newPrice}/mo`
  );

  const auditLines = affectedAudits.map((a) => {
    const delta = a.newSavings - a.oldSavings;
    const deltaStr = delta >= 0 ? `+$${delta}` : `-$${Math.abs(delta)}`;
    return [
      `  Audit ${a.auditId}:`,
      `    Previous savings: $${a.oldSavings}/mo`,
      `    Updated savings: $${a.newSavings}/mo (${deltaStr}/mo)`,
      `    Re-run your audit: ${baseUrl}/audit/${a.auditId}/reaudit`,
    ].join("\n");
  });

  const text = [
    `Pricing has changed for tools in your AI stack.`,
    ``,
    `What changed:`,
    ...changeLines,
    ``,
    `How this affects your audit${affectedAudits.length > 1 ? "s" : ""}:`,
    ...auditLines,
    ``,
    `Click the link above to see a side-by-side comparison of your old and new audit results.`,
    ``,
    `- SpendWise`,
  ].join("\n");

  try {
    await resend.emails.send({
      from: "SpendWise <onboarding@resend.dev>",
      to: email,
      subject: `AI tool pricing changed — your audit has been updated`,
      text,
    });
    return true;
  } catch (err) {
    console.error("Resend pricing change email failed:", err);
    return false;
  }
}

