"use client";
import { Button } from "@/components/ui/button";

export default function Navbar({ onAuditClick }: { onAuditClick: () => void }) {
  return (
    <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-14">
        <a href="/" className="font-mono text-sm font-bold tracking-tight text-neutral-900">
          ⚡ SpendWise
        </a>
        <div className="flex items-center gap-5 text-[13px] text-neutral-500">
          <a href="#how-it-works" className="hover:text-neutral-900 transition-colors hidden sm:block">How it Works</a>
          <a href="#platforms" className="hover:text-neutral-900 transition-colors hidden sm:block">Platforms</a>
          <a href="#guarantee" className="hover:text-neutral-900 transition-colors hidden sm:block">Guarantee</a>
          <a href="#faq" className="hover:text-neutral-900 transition-colors hidden sm:block">FAQ</a>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4" onClick={onAuditClick}>
            Run Audit
          </Button>
        </div>
      </div>
    </nav>
  );
}
