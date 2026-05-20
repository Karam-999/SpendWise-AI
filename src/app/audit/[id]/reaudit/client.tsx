"use client";

import Link from "next/link";
import type { AuditOutput, ToolResult } from "@/lib/types";

interface PricingChange {
  tool: string;
  plan: string;
  oldPrice: number;
  newPrice: number;
}

interface Props {
  auditId: string;
  oldOutput: AuditOutput | null;
  newOutput: AuditOutput | null;
  pricingChanges: PricingChange[];
}

function toolLabel(tool: string): string {
  const labels: Record<string, string> = {
    cursor: "Cursor", github_copilot: "GitHub Copilot", claude: "Claude",
    chatgpt: "ChatGPT", anthropic_api: "Anthropic API", openai_api: "OpenAI API",
    gemini: "Gemini", windsurf: "Windsurf",
  };
  return labels[tool] ?? tool;
}

type DiffStatus = "changed" | "added" | "removed" | "unchanged";

interface DiffRow {
  tool: string;
  label: string;
  status: DiffStatus;
  old: ToolResult | null;
  new: ToolResult | null;
}

function buildDiffRows(oldResults: ToolResult[], newResults: ToolResult[]): DiffRow[] {
  const rows: DiffRow[] = [];
  const allTools = new Set([
    ...oldResults.map((r) => r.tool),
    ...newResults.map((r) => r.tool),
  ]);

  for (const tool of allTools) {
    const oldR = oldResults.find((r) => r.tool === tool) ?? null;
    const newR = newResults.find((r) => r.tool === tool) ?? null;

    let status: DiffStatus;
    if (oldR && newR) {
      status = oldR.recommendedAction !== newR.recommendedAction ||
               oldR.savings !== newR.savings
        ? "changed"
        : "unchanged";
    } else if (newR) {
      status = "added";
    } else {
      status = "removed";
    }

    rows.push({
      tool,
      label: oldR?.label ?? newR?.label ?? toolLabel(tool),
      status,
      old: oldR,
      new: newR,
    });
  }

  // Sort: changed first, then added, then removed, then unchanged
  const order: Record<DiffStatus, number> = { changed: 0, added: 1, removed: 2, unchanged: 3 };
  rows.sort((a, b) => order[a.status] - order[b.status]);
  return rows;
}

function statusBadge(status: DiffStatus) {
  const styles: Record<DiffStatus, string> = {
    changed: "bg-amber-100 text-amber-800 border-amber-200",
    added: "bg-emerald-100 text-emerald-800 border-emerald-200",
    removed: "bg-red-100 text-red-800 border-red-200",
    unchanged: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function ReauditDiffClient({ auditId, oldOutput, newOutput, pricingChanges }: Props) {
  if (!oldOutput || !newOutput) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Audit not found</h2>
          <p className="text-sm text-neutral-500 mb-4">
            This audit may have expired or the link is invalid.
          </p>
          <Link href="/" className="text-sm underline underline-offset-4 hover:text-neutral-900 transition-colors">
            Run a new audit →
          </Link>
        </div>
      </div>
    );
  }

  const savingsDelta = newOutput.totalMonthlySavings - oldOutput.totalMonthlySavings;
  const diffRows = buildDiffRows(oldOutput.results, newOutput.results);
  const changedRows = diffRows.filter((r) => r.status !== "unchanged");
  const unchangedRows = diffRows.filter((r) => r.status === "unchanged");

  return (
    <div className="flex flex-col flex-1 bg-[#fafafa]">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href={`/audit/${auditId}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Original audit
          </Link>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">
            Re-audit comparison
          </p>
        </div>

        {/* Savings Delta Headline */}
        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-2">
            Savings impact
          </p>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {savingsDelta >= 0 ? (
                <span className="text-emerald-600">+${savingsDelta}</span>
              ) : (
                <span className="text-red-600">−${Math.abs(savingsDelta)}</span>
              )}
            </span>
            <span className="text-lg text-neutral-500 font-medium">/month</span>
          </div>
          <div className="flex gap-6 text-sm text-neutral-600">
            <div>
              <span className="text-neutral-400">Before: </span>
              <span className="font-medium tabular-nums">${oldOutput.totalMonthlySavings}/mo</span>
            </div>
            <div>
              <span className="text-neutral-400">After: </span>
              <span className="font-medium tabular-nums">${newOutput.totalMonthlySavings}/mo</span>
            </div>
          </div>
        </div>

        {/* Pricing Changes */}
        {pricingChanges.length > 0 && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-amber-800 mb-3">
              Pricing changes detected ({pricingChanges.length})
            </h2>
            <div className="space-y-1.5">
              {pricingChanges.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-amber-900">{toolLabel(c.tool)}</span>
                  <span className="text-amber-700">({c.plan})</span>
                  <span className="text-amber-600">
                    ${c.oldPrice} → ${c.newPrice}/mo
                  </span>
                  {c.newPrice > c.oldPrice ? (
                    <span className="text-red-600 text-xs font-semibold">↑ +${c.newPrice - c.oldPrice}</span>
                  ) : (
                    <span className="text-emerald-600 text-xs font-semibold">↓ −${c.oldPrice - c.newPrice}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diff Rows — Changed */}
        {changedRows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-[0.1em] mb-4">
              Changed recommendations ({changedRows.length})
            </h2>
            <div className="flex flex-col gap-3">
              {changedRows.map((row) => (
                <div key={row.tool} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">{row.label}</h3>
                    {statusBadge(row.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Old */}
                    <div className="rounded-md border border-red-100 bg-red-50/40 p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-red-400 mb-2">Previous</p>
                      {row.old ? (
                        <>
                          <p className="text-sm font-medium text-red-900 mb-1">{row.old.recommendedAction}</p>
                          <div className="flex items-center gap-2 text-xs text-red-700">
                            <span className="tabular-nums">${row.old.currentSpend}/mo → ${row.old.newSpend}/mo</span>
                            <span className="font-semibold tabular-nums">saves ${row.old.savings}/mo</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-red-400 italic">No recommendation</p>
                      )}
                    </div>

                    {/* New */}
                    <div className="rounded-md border border-emerald-100 bg-emerald-50/40 p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400 mb-2">Updated</p>
                      {row.new ? (
                        <>
                          <p className="text-sm font-medium text-emerald-900 mb-1">{row.new.recommendedAction}</p>
                          <div className="flex items-center gap-2 text-xs text-emerald-700">
                            <span className="tabular-nums">${row.new.currentSpend}/mo → ${row.new.newSpend}/mo</span>
                            <span className="font-semibold tabular-nums">saves ${row.new.savings}/mo</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-emerald-400 italic">No recommendation needed</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unchanged Rows — Collapsed */}
        {unchangedRows.length > 0 && (
          <div className="mb-8">
            <details className="group">
              <summary className="cursor-pointer text-[11px] font-medium text-neutral-400 uppercase tracking-[0.1em] mb-3 hover:text-neutral-600 transition-colors">
                Unchanged recommendations ({unchangedRows.length})
                <span className="ml-1 group-open:hidden">▸</span>
                <span className="ml-1 hidden group-open:inline">▾</span>
              </summary>
              <div className="flex flex-col gap-2">
                {unchangedRows.map((row) => (
                  <div key={row.tool} className="rounded-md border border-neutral-100 bg-neutral-50/60 p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-neutral-600">{row.label}</span>
                        {row.old && (
                          <span className="ml-2 text-xs text-neutral-400">
                            {row.old.recommendedAction} · saves ${row.old.savings}/mo
                          </span>
                        )}
                      </div>
                      {statusBadge(row.status)}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Score Comparison */}
        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500 mb-3">
            Spend efficiency score
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-neutral-400">{oldOutput.spendScore}</p>
              <p className="text-[10px] text-neutral-400 uppercase">Before</p>
            </div>
            <div className="text-neutral-300 text-lg">→</div>
            <div className="text-center">
              <p className={`text-2xl font-bold tabular-nums ${newOutput.spendScore >= oldOutput.spendScore ? "text-emerald-600" : "text-red-600"}`}>
                {newOutput.spendScore}
              </p>
              <p className="text-[10px] text-neutral-500 uppercase">After</p>
            </div>
            <div className="text-xs text-neutral-400">/100</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/audit/${auditId}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            View original audit
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Run a new audit
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 pt-5">
          <p className="text-[11px] text-neutral-400 tabular-nums">
            Re-audit comparison for {auditId}
          </p>
        </div>
      </main>
    </div>
  );
}
