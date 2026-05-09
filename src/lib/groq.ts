import Groq from "groq-sdk";
import type { AuditOutput, AuditFormData } from "./types";

let _groq: Groq | null = null;
function getGroq(): Groq | null {
  if (_groq) return _groq;
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  _groq = new Groq({ apiKey: key });
  return _groq;
}

function fallbackSummary(output: AuditOutput, formData: AuditFormData): string {
  if (output.spendingWell) {
    return `Your ${formData.useCase} AI stack looks well-optimized for a team of ${formData.teamSize}. No significant savings opportunities were found. Keep an eye on usage as your team grows, plan tiers that make sense today may not fit at 2x the headcount.`;
  }
  const topRec = output.results[0];
  return `Based on your ${formData.useCase} stack for ${formData.teamSize} people, we found $${output.totalMonthlySavings}/mo in potential savings ($${output.totalAnnualSavings}/yr). Your top opportunity: ${topRec.recommendedAction} for ${topRec.label}, saving $${topRec.savings}/mo. ${output.results.length > 1 ? `We found ${output.results.length} total recommendations across your tools.` : ""} Your AI Spend Score is ${output.spendScore}/100.`;
}

export async function generateSummary(
  output: AuditOutput,
  formData: AuditFormData
): Promise<string> {
  const groq = getGroq();
  if (!groq) {
    return fallbackSummary(output, formData);
  }

  const toolList = output.results
    .map((r) => `${r.label}: ${r.recommendedAction} (saves $${r.savings}/mo)`)
    .join("\n");

  const prompt = `You are a concise AI spend analyst writing for startup founders. Based on this audit:

Team size: ${formData.teamSize}
Use case: ${formData.useCase}
Total monthly savings: $${output.totalMonthlySavings}
AI Spend Score: ${output.spendScore}/100
${output.spendingWell ? "Result: stack is well-optimized, no major savings found." : `Recommendations:\n${toolList}`}

Write a ${output.spendingWell ? "reassuring" : "direct, actionable"} 80–100 word summary. Be specific about their tools and numbers. No generic advice. No bullet points. No greeting.`;

  try {
    const res = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    const content = res.choices[0]?.message?.content;
    if (!content || content.trim().length < 20) {
      return fallbackSummary(output, formData);
    }
    return content.trim();
  } catch {
    return fallbackSummary(output, formData);
  }
}
