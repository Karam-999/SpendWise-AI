"use client";

export default function Guarantee() {
  return (
    <section id="guarantee" className="border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-2">Our guarantee</p>
            <h2 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-4">
              Accurate, defensible, transparent
            </h2>
            <p className="text-[15px] text-neutral-600 leading-relaxed mb-6">
              Every recommendation traces back to verified vendor pricing. The audit engine is deterministic —
              same input always produces the same output. No AI hallucinations in the math.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Verified pricing", desc: "Every number traces to an official vendor pricing page, checked weekly." },
              { title: "Deterministic rules", desc: "No AI guesswork in the audit logic. Six explainable rules with clear reasoning." },
              { title: "No data sharing", desc: "Your stack details stay in your browser. Audit results are only stored if you opt in." },
              { title: "Open methodology", desc: "The audit engine logic is fully documented. A finance person can verify every recommendation." },
            ].map((item) => (
              <div key={item.title} className="border border-neutral-200 rounded-xl p-5 bg-white">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mb-3" />
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
