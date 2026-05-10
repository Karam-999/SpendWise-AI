"use client";
import { useState } from "react";

const FAQS = [
  { q: "Is this actually free?", a: "Yes. No credit card, no trial, no catch. The audit runs entirely on deterministic rules with verified pricing data. We make money when high-savings users connect with our marketplace for discounted credits." },
  { q: "How accurate are the savings numbers?", a: "Every price in the engine traces back to an official vendor pricing page, verified within the current week. The logic is rule-based and deterministic — no AI-generated recommendations." },
  { q: "Do you store my data?", a: "Your form data stays in your browser via localStorage. Audit results are saved to our database only when you submit the form. The shareable URL strips identifying details like email and company name." },
  { q: "What is the SpendWise Marketplace?", a: "Our marketplace offers discounted AI and cloud credits sourced from companies that overforecasted or pivoted. Same tools, same API access, lower price. SpendWise is a free audit tool that helps surface savings opportunities." },
  { q: "Why would I talk to a SpendWise advisor?", a: "If your audit surfaces over $500/mo in potential savings, an advisor may be able to reduce your costs further through discounted credit packages for tools like OpenAI, Claude, and Cursor." },
  { q: "How long does the audit take?", a: "Under 60 seconds. Toggle on your tools, fill in plan and spend details, and get instant results. No waiting, no email gates before seeing your results." },
  { q: "Can I share my audit results?", a: "Yes. Every audit gets a unique public URL with Open Graph tags for clean link previews on Twitter, Slack, and LinkedIn. Identifying details are stripped from the public version." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
      >
        <span className={open ? "text-emerald-700" : ""}>{q}</span>
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform flex-shrink-0 ml-4 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-neutral-600 leading-relaxed pr-8">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="border-b border-neutral-200">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-2">FAQ</p>
          <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Your Questions. Answered.</h2>
          <p className="text-sm text-neutral-500 mt-2">Answers to all your questions, quickly and clearly</p>
        </div>
        <div className="border-t border-neutral-200">
          {FAQS.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </section>
  );
}
