"use client";
import { Button } from "@/components/ui/button";

export default function Hero({ onAuditClick }: { onAuditClick: () => void }) {
  return (
    <section className="bg-white border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-600 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI infrastructure optimization
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.1] text-neutral-900">
              Stop overpaying for<br />AI tools your team<br />already outgrew
            </h1>
            <p className="mt-5 text-[15px] text-neutral-600 leading-relaxed max-w-md">
              Free audit that checks your AI stack against verified vendor pricing.
              Get actionable savings recommendations in 60 seconds — no signup, no sales calls.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" className="h-12 px-7 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full" onClick={onAuditClick}>
                Run free audit
              </Button>
              <a href="#how-it-works" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors ml-1">
                How it works →
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-900 text-white p-6">
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-emerald-400">$840</p>
              <p className="text-xs text-neutral-400 mt-1.5">Avg. monthly savings found</p>
            </div>
            <div className="rounded-xl bg-neutral-900 text-white p-6">
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums">6</p>
              <p className="text-xs text-neutral-400 mt-1.5">Optimization rules</p>
            </div>
            <div className="rounded-xl bg-neutral-900 text-white p-6">
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums">8</p>
              <p className="text-xs text-neutral-400 mt-1.5">Platforms analyzed</p>
            </div>
            <div className="rounded-xl bg-emerald-600 text-white p-6">
              <p className="text-3xl sm:text-4xl font-bold font-mono">60s</p>
              <p className="text-xs text-emerald-100 mt-1.5">Time to full audit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
