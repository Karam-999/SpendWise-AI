"use client";
import { Button } from "@/components/ui/button";

export default function CTASection({ onAuditClick }: { onAuditClick: () => void }) {
  return (
    <section className="bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-4">Get started</p>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Ready to optimize your AI spend?
          </h2>
          <p className="text-sm text-neutral-400 mb-8 max-w-md mx-auto leading-relaxed">
            Run a free audit in 60 seconds. No signup, no sales calls.
            Just real savings backed by verified pricing data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
              onClick={onAuditClick}
            >
              Run free audit
            </Button>
            <a
              href="#"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Learn about SpendWise →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
