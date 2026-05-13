"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Hero({ onAuditClick, onBuyClick: _onBuyClick }: { onAuditClick: () => void, onBuyClick?: () => void }) {
  return (
    <section className="relative bg-white border-b border-neutral-200 overflow-hidden min-h-[600px] flex items-center justify-center pt-16 sm:pt-10 pb-24 sm:pb-32">
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-20 left-[12%] rotate-[-12deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_6s_ease-in-out_infinite]">
          <Image src="/gemini-color.svg" alt="Gemini" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <div className="absolute top-[45%] left-[5%] rotate-[-5deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_6s_ease-in-out_infinite]">
          <Image src="/windsurf.svg" alt="Windsurf" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <div className="absolute bottom-24 left-[15%] rotate-[18deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_7s_ease-in-out_infinite_1s]">
          <Image src="/claude-color.svg" alt="Claude" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <div className="absolute top-24 right-[12%] rotate-[15deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_8s_ease-in-out_infinite_2s]">
          <Image src="/cursor.svg" alt="Cursor" width={48} height={48} className="w-12 h-12 object-contain" style={{ filter: "brightness(0) saturate(100%) invert(0%)" }} />
        </div>
        <div className="absolute top-[40%] right-[5%] rotate-[15deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_8s_ease-in-out_infinite_2s]">
          <Image src="/copilot-icon.svg" alt="Copilot" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <div className="absolute bottom-32 right-[18%] rotate-[-15deg] bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-neutral-100 animate-[float_6s_ease-in-out_infinite_1.5s]">
          <Image src="/openai.svg" alt="OpenAI" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white shadow-sm px-4 py-1.5 text-[11px] font-medium text-neutral-600 mb-8 tracking-wide uppercase">
          NO REGRETS <span className="font-normal text-neutral-400 normal-case ml-1 hidden sm:inline">Safe transfer, Anonymous exchange</span>
        </div>
        
        <h1 className="font-sans text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
          Run Free Audit <br className="hidden sm:block" />
          and Save Up To 60% <br className="hidden sm:block" />
          <span className="text-emerald-600">On AI Models & Cloud Credits</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-[17px] text-neutral-600 leading-relaxed mb-10">
          Free audit that checks your AI stack against verified vendor pricing.
          Buy verified OpenAI, Claude, AWS, Azure and other credits from trusted sellers.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-14 px-10 text-[15px] font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-xl transition-transform hover:scale-105 cursor-pointer z-20 pointer-events-auto" onClick={onAuditClick}>
            Run free audit
          </Button>
          <a href="#how-it-works" className="text-[15px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-6 py-3 cursor-pointer z-20 pointer-events-auto">
            How it Works →
          </a>
        </div>
      </div>
    </section>
  );
}
