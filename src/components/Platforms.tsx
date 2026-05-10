"use client";

const PLATFORMS = [
  { name: "Cursor", category: "Coding Assistant", tiers: "Hobby · Pro · Teams · Ultra" },
  { name: "GitHub Copilot", category: "Coding Assistant", tiers: "Free · Pro · Business · Enterprise" },
  { name: "Windsurf", category: "Coding Assistant", tiers: "Free · Pro · Max · Teams" },
  { name: "Claude", category: "Chat & Research", tiers: "Free · Pro · Max · Team" },
  { name: "ChatGPT", category: "Chat & Research", tiers: "Go · Plus · Pro · Business" },
  { name: "Gemini", category: "Chat & Research", tiers: "Plus · Pro · Ultra" },
  { name: "OpenAI API", category: "Direct API", tiers: "Pay-as-you-go" },
  { name: "Anthropic API", category: "Direct API", tiers: "Pay-as-you-go" },
];

export default function Platforms() {
  return (
    <section id="platforms" className="bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-2">Supported platforms</p>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight">Same tools you already use</h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-lg">
              Pricing verified weekly from official vendor pages. No infrastructure changes required.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="border border-neutral-700 rounded-xl px-5 py-5 bg-neutral-800/50 hover:bg-neutral-800 transition-colors">
              <p className="text-sm font-semibold text-white mb-0.5">{p.name}</p>
              <p className="text-[11px] text-emerald-400 font-medium mb-2">{p.category}</p>
              <p className="text-[11px] text-neutral-500">{p.tiers}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-neutral-700 bg-neutral-800/30 p-6 text-center">
          <p className="text-sm text-neutral-300 font-medium">Same platforms you already use, no infrastructure changes</p>
          <p className="text-xs text-neutral-500 mt-1">All pricing data sourced from official vendor pages and verified weekly</p>
        </div>
      </div>
    </section>
  );
}
