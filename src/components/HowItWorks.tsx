"use client";

import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Input your stack",
      desc: "Toggle on the AI tools your team uses. Select the plan, enter monthly spend and seat count for each tool.",
    },
    {
      step: "02",
      title: "Engine analyzes spend",
      desc: "Our Audit Engine analyzes your spend patterns to identify overpayments, unused seats, and pricing inefficiencies.",
    },
    {
      step: "03",
      title: "Get recommendations",
      desc: "Receive actionable insights, potential savings, and a clear efficiency score, all in a shareable report.",
    },
    {
      step: "04",
      title: "Buy/Sell Credits",
      desc: "Buy credits at a discount and sell unused credits to other teams for maximum savings. Refer FAQs for more details.",
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-2">Process</p>
        <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-10">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((item) => (
            <div key={item.step} className="border border-neutral-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 text-xs font-mono font-bold text-emerald-600 mb-4">
                {item.step}
              </span>
              <h3 className="font-mono text-sm font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
