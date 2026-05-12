"use client";

const TRUST_ITEMS = [
  "Verified pricing data",
  "No signup required",
  "Buy/Sell Credits",
  "Built for Startups/Teams",
  "Shareable audit reports",
  "AI-powered summaries",
  "Deterministic Audit",
  "Transparent Pricing",
  "Real-time Savings Calculation"
];

export default function TrustStrip() {
  return (
    <div className="border-b border-neutral-200 bg-white overflow-hidden">
      <div className="flex animate-[scroll_25s_linear_infinite] whitespace-nowrap py-2.5">
        {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-5 text-[11px] text-neutral-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
