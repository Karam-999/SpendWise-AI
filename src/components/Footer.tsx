"use client";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <span className="font-mono text-sm font-bold tracking-tight text-neutral-900">⚡ SpendWise</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs leading-relaxed">
              AI infrastructure spend optimization tool. Find discounts on AI and cloud credits from companies that overforecasted.
            </p>
            <p className="text-xs text-neutral-400 mt-3">team@spendwise.rocks</p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-1">Product</span>
              <a href="#audit" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Run Audit</a>
              <a href="#how-it-works" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">How it Works</a>
              <a href="#platforms" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Platforms</a>
              <a href="#guarantee" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Guarantee</a>
              <a href="#faq" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">FAQ</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-1">Company</span>
              <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">SpendWise</a>
              <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Buy Credits</a>
              <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Sell Credits</a>
            </div>
          </div>
          <div>
            <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-2 block">SpendWise HQ</span>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-neutral-700">Remote</p>
                <p className="text-xs text-neutral-500 leading-relaxed">Global Team</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
          <p>&copy; 2026 SpendWise</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-neutral-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-700 transition-colors">Privacy</a>
            <a href="https://www.linkedin.com/in/karam46" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
