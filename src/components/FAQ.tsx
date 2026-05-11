"use client";
import { useState } from "react";

const FAQS = [
  { q: "What is SpendWise?", a: "SpendWise is a marketplace for discounted AI and cloud credits. It connects buyers with unused credits, helping startups and agencies save up to 50% on top platforms like OpenAI, Anthropic, AWS, and GCP." },
  { q: "What kinds of credits can I buy, and how much do I save?", a: "Popular options include OpenAI, Anthropic, AWS, and GCP. Buyers typically save about 45-50% compared to standard list prices." },
  { q: "Will performance or rate limits change if I buy through SpendWise?", a: "No. It would be the same as you opening your own account on these platforms. We source top-tier accounts with enterprise rate limits, so your calls perform as expected." },
  { q: "How do you transfer credits or access?", a: "Two ways: (a) ownership transfer to your designated email, or (b) root admin/credentials transfer. You then change the password and enable 2FA for full control and privacy." },
  { q: "Will my identity be shared?", a: "No, your identity will not be shared, a Mutual NDA is executed. The seller signs an NDA with SpendWise and Buyer also signs an NDA with SpendWise. This preserves confidentiality for both sides." },
  { q: "How long does this take?", a: "Plan for about a week for paperwork. After payment is ready, the ownership/credentials transfer typically completes within ~24 hours. If your legal team is quick to revert then we can wrap up the entire process within 24 hours." },
  { q: "Can I verify the account before paying?", a: "Yes. We provide screenshots showing credit balance, validity, and rate limits. For extra assurance, we can arrange read-only access so your team can generate API keys and run test calls." },
  { q: "What if the access later breaks or credits become unusable?", a: "If access becomes unavailable within the validity period, SpendWise will replace credits or refund the unused balance after verification." },
  { q: "Where do these credits come from?", a: "From companies that over-purchased or startups that received grant credits via accelerators/incubators and no longer need them (e.g., shut down or pivoted). SpendWise buys those accounts and passes the savings to buyers." },
  { q: "How do you keep deals safe and clean?", a: "Four ways: vendor verification, ownership auditing (credit history), transaction transparency (escrow + history + support chat), and in-house authentication tools." },
  { q: "What's the payment + escrow flow?", a: "Buyer request → payment → secure transfer of access → buyer confirms usage → seller payout (with escrow protection throughout)." },
  { q: "Do I need to change my code or infrastructure?", a: "No. Use your existing SDKs/endpoints. It's full API compatibility with zero code changes." },
  { q: "Any real-world examples of impact?", a: "A fast-scaling agency cut LLM spend by up to 50%, improved project margins by ~50%, and made no code changes, just predictable usage pricing." },
  { q: "What paperwork do you need from us? Any taxes?", a: "For invoicing: legal entity name, address, invoice emails, and (if applicable) GST No. (India, +18% as input credit) or TRN/VAT (UAE, +5% as input)." },
  { q: "Why talk about sustainability here?", a: "Letting credits expire is digital waste. SpendWise helps reclaim spend and reduce waste \"impact-led SaaS sustainability.\"" },
  { q: "Is the SpendWise Audit actually free?", a: "Yes. No credit card, no trial, no catch. The audit runs entirely on deterministic rules with verified pricing data. We make money when high-savings users connect with our marketplace for discounted credits." },
  { q: "How accurate are the savings numbers in the audit?", a: "Every price in the engine traces back to an official vendor pricing page, verified within the current week. The logic is rule-based and deterministic — no AI-generated recommendations." },
  { q: "Do you store my audit data?", a: "Your form data stays in your browser via localStorage. Audit results are saved to our database only when you submit the form. The shareable URL strips identifying details like email and company name." },
  { q: "How long does the audit take?", a: "Under 60 seconds. Toggle on your tools, fill in plan and spend details, and get instant results. No waiting, no email gates before seeing your results." },
  { q: "Can I share my audit results?", a: "Yes. Every audit gets a unique public URL with Open Graph tags for clean link previews on Twitter, Slack, and LinkedIn. Identifying details are stripped from the public version." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-b-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-neutral-900 hover:text-emerald-700 transition-colors outline-none"
      >
        <span className={open ? "text-emerald-700" : ""}>{q}</span>
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? "rotate-180 text-emerald-500" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 mb-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-neutral-600 leading-relaxed pr-8">{a}</p>
        </div>
      </div>
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
