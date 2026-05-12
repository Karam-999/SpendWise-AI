"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Image src="/logo-mobile.svg" alt="SpendWise" width={150} height={50} className="h-14 w-auto object-contain mb-2" />
            <p className="text-xs text-neutral-500 mt-2 max-w-xs leading-relaxed">
              AI infrastructure spend optimization tool. Find discounts on AI and cloud credits from companies that overforecasted.
            </p>
            <a href="mailto:connect.with.karam25@gmail.com" className="text-xs text-neutral-400 mt-3">connect.with.karam25@gmail.com</a>
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
            <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-2 block">Location</span>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-neutral-700">Remote</p>
             
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
          <p>&copy; {new Date().getFullYear()} SpendWise</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-neutral-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-700 transition-colors">Privacy</a>
            <a href="https://www.linkedin.com/in/karam46" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 transition-colors">
             <Image src="linkedin-svgrepo-com.svg" alt="LinkedIn" width={20} height={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
