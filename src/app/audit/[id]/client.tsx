"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import type { AuditOutput } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
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
          <a href="/" className="text-sm underline underline-offset-4">
            Run a new audit →
          </a>
        </div>
      </div>
    );
  }

  const hasSavings = output.totalMonthlySavings > 0;

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          New audit
        </a>

        <div className="mb-8">
          {output.spendingWell ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <h1 className="text-xl font-semibold text-emerald-900">
                  You&apos;re spending well
                </h1>
              </div>
              <p className="text-sm text-emerald-700">
                Your AI tool stack looks well-optimized. No significant savings
                opportunities found right now.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Save{" "}
                <span className="text-emerald-600">
                  ${output.totalMonthlySavings.toLocaleString()}
                </span>
                /mo
              </h1>
              <p className="mt-1 text-lg text-muted-foreground">
                ${output.totalAnnualSavings.toLocaleString()} per year
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div
            className={`inline-flex items-center gap-2.5 rounded-lg border px-4 py-2.5 ${scoreColor(
              output.spendScore
            )}`}
          >
            <div className="text-2xl font-bold tabular-nums">
              {output.spendScore}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider leading-none">
                AI Spend Score
              </span>
              <span className="text-xs mt-0.5 opacity-75">
                {scoreLabel(output.spendScore)}
              </span>
            </div>
          </div>
        </div>

        {summaryLoading && (
          <div className="mb-6 rounded-lg border border-border bg-muted/20 p-4">
            <div className="h-3 w-3/4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        )}

        {summary && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              AI Summary
            </p>
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {output.results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recommendations
            </h2>
            <div className="flex flex-col gap-3">
              {output.results.map((r, i) => (
                <div
                  key={`${r.tool}-${i}`}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold">{r.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        Current: {r.currentPlan} · ${r.currentSpend}/mo
                      </p>
                    </div>
                    {r.savings > 0 && (
                      <span className="shrink-0 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700 tabular-nums">
                        −${r.savings}/mo
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">
                    → {r.recommendedAction}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasSavings && !output.spendingWell && (
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No specific recommendations for your current setup. Your stack
              looks reasonable.
            </p>
          </div>
        )}

        {output.showCredexCTA && (
          <div className="mb-8 rounded-lg border-2 border-foreground bg-foreground/5 p-6">
            <h2 className="text-base font-semibold mb-1">
              Save even more with Credex
            </h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              With over ${output.totalMonthlySavings.toLocaleString()}/mo in
              potential savings, Credex can help you access discounted AI credits
              from companies that overforecasted — same tools, lower price.
            </p>
            <Button
              size="lg"
              className="h-10 text-sm"
              onClick={() => window.open("https://credex.rocks", "_blank")}
            >
              Talk to Credex →
            </Button>
          </div>
        )}

        <div className="mb-8">
          <LeadCaptureForm auditId={auditId} />
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Audit ID: {auditId}
            </p>
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
