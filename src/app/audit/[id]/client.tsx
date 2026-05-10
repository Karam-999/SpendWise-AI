"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import CredexLeadForms from "@/components/CredexLeadForms";
import type { AuditOutput } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-700";
  if (score >= 60) return "text-amber-700";
  return "text-red-700";
}

function scoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs attention";
  return "Critical";
}

function severityDot(savings: number): string {
  if (savings >= 100) return "bg-red-500";
  if (savings >= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

interface Props {
  auditId: string;
  serverOutput: AuditOutput | null;
}

export default function AuditResultClient({ auditId, serverOutput }: Props) {
  const [output, setOutput] = useState<AuditOutput | null>(serverOutput);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);

  useEffect(() => {
    if (output) return;
    const cached = sessionStorage.getItem(`audit-${auditId}`);
    if (cached) {
      try {
        setOutput(JSON.parse(cached) as AuditOutput);
      } catch {}
    }
  }, [auditId, output]);

  useEffect(() => {
    if (!output || summary) return;
    setSummaryLoading(true);
    fetch(`/api/summary/${auditId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [auditId, output, summary]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Audit not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This audit may have expired or the link is invalid.
          </p>
          <a href="/" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
            Run a new audit →
          </a>
        </div>
      </div>
    );
  }

  const hasSavings = output.totalMonthlySavings > 0;

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New audit
          </a>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Audit report
          </p>
        </div>

        {/* Savings Hero */}
        <div className="mb-10">
          {output.spendingWell ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-emerald-900 mb-1">
                    Your AI stack is well-optimized
                  </h1>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    No significant savings opportunities found. Your tool selection
                    and plan choices are appropriate for your team size and use case.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Potential savings identified
              </p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl tabular-nums">
                  <span className="text-savings">${output.totalMonthlySavings.toLocaleString()}</span>
                </h1>
                <span className="text-lg text-muted-foreground font-medium">/month</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
                ${output.totalAnnualSavings.toLocaleString()} per year · {output.results.length} recommendation{output.results.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Spend Score */}
        <div className="mb-10 rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              AI Spend Efficiency Score
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold tabular-nums ${scoreColor(output.spendScore)}`}>
                {output.spendScore}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreBg(output.spendScore)}`}
              style={{ width: `${output.spendScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {scoreLabel(output.spendScore)} — {output.spendScore >= 85
              ? "your spend is well-optimized"
              : output.spendScore >= 60
              ? "some optimization opportunities exist"
              : "significant savings potential detected"}
          </p>
        </div>

        {/* AI Summary */}
        {summaryLoading && (
          <div className="mb-8 rounded-md border border-border bg-card p-5">
            <div className="h-3 w-32 bg-muted rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}

        {summary && (
          <div className="mb-8 rounded-md border border-border bg-card p-5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2.5">
              AI-Generated Analysis
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
          </div>
        )}

        {/* Recommendations */}
        {output.results.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-4">
              Recommendations ({output.results.length})
            </h2>
            <div className="flex flex-col gap-3">
              {output.results.map((r, i) => (
                <div
                  key={`${r.tool}-${i}`}
                  className="rounded-md border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${severityDot(r.savings)}`} />
                      <div>
                        <h3 className="text-sm font-semibold">{r.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Currently on {r.currentPlan} plan · ${r.currentSpend}/mo
                        </p>
                      </div>
                    </div>
                    {r.savings > 0 && (
                      <div className="text-right flex-shrink-0">
                        <span className="inline-block rounded bg-savings-muted px-2 py-1 text-xs font-semibold text-savings-foreground tabular-nums">
                          −${r.savings}/mo
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          ${(r.savings * 12).toLocaleString()}/yr
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-[18px] border-l-2 border-border pl-4">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {r.recommendedAction}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {r.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No recommendations state */}
        {!hasSavings && !output.spendingWell && (
          <div className="mb-10 rounded-md border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No specific recommendations for your current setup. Your stack
              looks reasonable for your use case.
            </p>
          </div>
        )}

        {/* Dynamic CTA and Forms */}
        <div className="mb-10 space-y-6">
          {!showBuyForm && !showSellForm && (
            <>
              {/* Contextual CTA Cards - Both Buy and Sell always available */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-base font-semibold text-emerald-900 mb-1">
                      Buy Discounted Credits
                    </h2>
                    <p className="text-xs text-emerald-800/80 mb-4 leading-relaxed">
                      SpendWise offers verified AI credits at steep discounts. Same APIs, lower price.
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => { setShowBuyForm(true); setShowSellForm(false); }}
                  >
                    Buy Credits
                  </Button>
                </div>
                
                <div className="rounded-md border border-neutral-200 bg-white p-5 flex flex-col justify-between h-full shadow-sm">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900 mb-1">
                      Sell Unused Credits
                    </h2>
                    <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                      Have unused enterprise seats or cloud credits? You can sell them securely on our marketplace.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    onClick={() => { setShowSellForm(true); setShowBuyForm(false); }}
                  >
                    Sell Credits
                  </Button>
                </div>
              </div>

              {/* Standard Lead capture */}
              <LeadCaptureForm auditId={auditId} hasSavings={hasSavings} />
            </>
          )}

          {/* Credex Lead Forms (rendered when toggled) */}
          {showBuyForm && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-4">
                <Button variant="ghost" size="sm" onClick={() => setShowBuyForm(false)} className="text-neutral-500 hover:text-neutral-900">
                  ← Back to audit results
                </Button>
              </div>
              <CredexLeadForms auditId={auditId} mode="buy" />
            </div>
          )}

          {showSellForm && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-4">
                <Button variant="ghost" size="sm" onClick={() => setShowSellForm(false)} className="text-neutral-500 hover:text-neutral-900">
                  ← Back to audit results
                </Button>
              </div>
              <CredexLeadForms auditId={auditId} mode="sell" />
            </div>
          )}
        </div>

        {/* Trust footer */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span>Pricing verified from official vendor pages</span>
          <span className="hidden sm:inline">·</span>
          <span>No data shared publicly</span>
          <span className="hidden sm:inline">·</span>
          <span>Deterministic audit rules</span>
        </div>

        {/* Share / ID footer */}
        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground tabular-nums">
              {auditId}
            </p>
            <button
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleCopy}
              aria-label="Copy audit link"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Share this audit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
