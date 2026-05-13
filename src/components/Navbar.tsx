"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar({ onAuditClick, setShowBuyForm, setShowSellForm  }: { onAuditClick: () => void, setShowBuyForm: (show: boolean) => void, setShowSellForm: (show: boolean) => void  }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = () => { if (mql.matches) setIsMobileMenuOpen(false); };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleNavClick = () => {
    setShowBuyForm(false);
    setShowSellForm(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 p-3">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 flex items-center justify-between h-12">
        <Link href="/" className="flex items-center shrink-0 mr-4" onClick={handleNavClick}>
          <Image 
            src="/logo.svg" 
            alt="SpendWise" 
            width={480} 
            height={480} 
            className="h-20 w-auto object-contain hidden lg:block" 
            priority
          />
          <Image 
            src="/logo-mobile.svg" 
            alt="SpendWise" 
            width={48} 
            height={48} 
            className="h-20 w-auto object-contain block lg:hidden" 
            priority
          />
        </Link>
        <div className="flex items-center gap-2 lg:gap-5 text-[13px] text-neutral-500 overflow-hidden">
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Button size="sm" className="w-auto cursor-pointer rounded-md h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-sm" onClick={() => { setShowBuyForm(true); setShowSellForm(false); }}>Buy Credits</Button>
            <Button size="sm" className="w-auto cursor-pointer h-8 px-4 rounded-md bg-sky-600 hover:bg-sky-700 text-white shadow-sm text-sm" onClick={() => { setShowBuyForm(false); setShowSellForm(true); }}>Sell Credits</Button>
          </div>
          <a href="#how-it-works" onClick={handleNavClick} className="hover:text-neutral-900 rounded-full bg-gray-200 px-3 py-1.5 transition-colors hidden lg:block whitespace-nowrap">How it Works</a>
          <a href="#platforms" onClick={handleNavClick} className="hover:text-neutral-900 transition-colors rounded-full bg-gray-200 px-3 py-1.5 hidden lg:block whitespace-nowrap">Platforms</a>
          <a href="#guarantee" onClick={handleNavClick} className="hover:text-neutral-900 transition-colors rounded-full bg-gray-200 px-3 py-1.5 hidden lg:block whitespace-nowrap">Guarantee</a>
          <a href="#faq" onClick={handleNavClick} className="hover:text-neutral-900 transition-colors rounded-full bg-gray-200 px-3 py-1.5 hidden lg:block whitespace-nowrap">FAQ</a>
          
          <Button size="sm" className="h-8 text-xs bg-black hover:bg-black text-white rounded-full px-4 shrink-0" onClick={() => { handleNavClick(); onAuditClick(); }}>
            Run Audit
          </Button>

          <button 
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 cursor-pointer shrink-0 pb-3" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t mt-2 border-neutral-200 bg-white">
          <div className="flex flex-col px-4 py-6 space-y-4">
            <div className="flex gap-3 pb-2">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setShowBuyForm(true); setShowSellForm(false); setIsMobileMenuOpen(false); }}>
                Buy Credits
              </Button>
              <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white" onClick={() => { setShowBuyForm(false); setShowSellForm(true); setIsMobileMenuOpen(false); }}>
                Sell Credits
              </Button>
            </div>
            <a href="#how-it-works" onClick={handleNavClick} className="text-base font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50">How it Works</a>
            <a href="#platforms" onClick={handleNavClick} className="text-base font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50">Platforms</a>
            <a href="#guarantee" onClick={handleNavClick} className="text-base font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50">Guarantee</a>
            <a href="#faq" onClick={handleNavClick} className="text-base font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50">FAQ</a>
          </div>
        </div>
      )}
    </nav>
  );
}
