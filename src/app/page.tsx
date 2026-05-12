"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuditFormData, ToolInput, ToolName, UseCase, AuditResponse } from "@/lib/types";

import Navbar from "@/components/Navbar";
import TrustStrip from "@/components/TrustStrip";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Platforms from "@/components/Platforms";
import Guarantee from "@/components/Guarantee";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

import LeadForms from "@/components/LeadForms";

const PLAN_OPTIONS: Record<ToolName, string[]> = {
  cursor: ["hobby", "pro", "pro-plus", "ultra", "teams", "enterprise"],
  github_copilot: ["free", "pro", "pro-plus", "business", "enterprise"],
  claude: ["free", "pro", "max", "team", "enterprise"],
  chatgpt: ["free", "go", "plus", "pro", "business"],
  anthropic_api: ["pay-as-you-go"],
  openai_api: ["pay-as-you-go"],
  gemini: ["free", "plus", "pro", "ultra"],
  windsurf: ["free", "pro", "max", "teams", "enterprise"],
};
const TOOL_LABELS: Record<ToolName, string> = {
  cursor: "Cursor", github_copilot: "GitHub Copilot", claude: "Claude",
  chatgpt: "ChatGPT", anthropic_api: "Anthropic API", openai_api: "OpenAI API",
  gemini: "Gemini", windsurf: "Windsurf",
};
const TOOL_CATEGORIES: Record<string, ToolName[]> = {
  "Coding Assistants": ["cursor", "github_copilot", "windsurf"],
  "Chat & Research": ["claude", "chatgpt", "gemini"],
  "Direct API": ["anthropic_api", "openai_api"],
};
const ALL_TOOLS: ToolName[] = Object.values(TOOL_CATEGORIES).flat();
function createDefaultTool(tool: ToolName): ToolInput {
  return { tool, label: TOOL_LABELS[tool], active: false, plan: PLAN_OPTIONS[tool][0], monthlySpend: 0, seats: 0 };
}
function createDefaultFormData(): AuditFormData {
  return { tools: ALL_TOOLS.map(createDefaultTool), teamSize: 1, useCase: "coding" };
}
const STORAGE_KEY = "ai-spend-audit-form";

function ToolCard({ tool, planOptions, onUpdate }: { tool: ToolInput; planOptions: string[]; onUpdate: (u: ToolInput) => void }) {
  return (
    <div className={`border rounded-md transition-all duration-150 ${tool.active ? "border-neutral-300 bg-white shadow-sm" : "border-neutral-200 bg-transparent"}`}>
      <div className="flex w-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center" aria-label={`Toggle ${tool.label}`}>
            <input type="checkbox" checked={tool.active} onChange={(e) => onUpdate({ ...tool, active: e.target.checked })} className="peer sr-only" />
            <div className="h-5 w-9 rounded-full bg-neutral-200 peer-checked:bg-neutral-900 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          <span className={`text-sm font-medium transition-colors ${tool.active ? "text-neutral-900" : "text-neutral-500"}`}>{tool.label}</span>
        </div>
        {tool.active && tool.monthlySpend > 0 && <span className="text-xs text-neutral-500 tabular-nums">${tool.monthlySpend}/mo</span>}
      </div>
      {tool.active && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 sm:flex-row sm:gap-4 border-t border-neutral-100">
          <div className="flex-1 pt-3">
            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Plan</label>
            <select value={tool.plan} onChange={(e) => onUpdate({ ...tool, plan: e.target.value })} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400">
              {planOptions.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}</option>))}
            </select>
          </div>
          <div className="flex-1 sm:pt-3">
            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Monthly spend ($)</label>
            <input type="number" min={0} step={1} value={tool.monthlySpend || ""} placeholder="0" onChange={(e) => onUpdate({ ...tool, monthlySpend: Math.max(0, Number(e.target.value) || 0) })} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-neutral-400" />
          </div>
          <div className="w-24 sm:pt-3">
            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Seats</label>
            <input type="number" min={0} step={1} value={tool.seats || ""} placeholder="0" onChange={(e) => onUpdate({ ...tool, seats: Math.max(0, Math.round(Number(e.target.value) || 0)) })} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-neutral-400" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<AuditFormData>(createDefaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuditFormData;
        const merged = createDefaultFormData();
        merged.teamSize = parsed.teamSize ?? 1;
        merged.useCase = parsed.useCase ?? "coding";
        for (const savedTool of parsed.tools ?? []) {
          const idx = merged.tools.findIndex((t) => t.tool === savedTool.tool);
          if (idx !== -1) merged.tools[idx] = { ...merged.tools[idx], ...savedTool };
        }
        setFormData(merged);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, hydrated]);

  const updateTool = useCallback((toolName: ToolName, updated: ToolInput) => {
    setFormData((prev) => ({ ...prev, tools: prev.tools.map((t) => (t.tool === toolName ? updated : t)) }));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? "Something went wrong."); }
      const data: AuditResponse = await res.json();
      sessionStorage.setItem(`audit-${data.auditId}`, JSON.stringify(data.output));
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });
  const activeCount = formData.tools.filter((t) => t.active).length;
  const totalSpend = formData.tools.filter((t) => t.active).reduce((sum, t) => sum + t.monthlySpend, 0);

  if (!hydrated) {
    return <div className="flex flex-1 items-center justify-center min-h-screen"><div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" /></div>;
  }

  return (
    <div className="flex flex-col flex-1 bg-[#fafafa]">
      <Navbar onAuditClick={scrollToForm} setShowBuyForm={setShowBuyForm} setShowSellForm={setShowSellForm} />
      
      {showBuyForm || showSellForm ? (
        <div className="py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4">
            <Button variant="ghost" size="sm" onClick={() => { setShowBuyForm(false); setShowSellForm(false); }} className="text-neutral-500 hover:text-neutral-900">
              ← Back to home
            </Button>
          </div>
          <LeadForms auditId="homepage-lead" mode={showBuyForm ? "buy" : "sell"} />
        </div>
      ) : (
        <>
          <TrustStrip />
          <Hero onAuditClick={scrollToForm} onBuyClick={() => { setShowBuyForm(true); setShowSellForm(false); }} />
          <HowItWorks />
          <Platforms />
      
      <section ref={formRef} id="audit" className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-2">Run your audit</p>
              <h2 className="font-mono text-2xl font-bold tracking-tight text-neutral-900 mb-4">Configure your AI stack</h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                Toggle on the tools your team pays for, fill in plan details, and get an instant audit.
                Your data stays in your browser.
              </p>
              <div className="space-y-3 text-xs text-neutral-500">
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Form state persists across reloads</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Results are shareable via unique URL</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Summary of spend included</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Email delivery optional</div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-6">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Team size</label>
                    <input type="number" min={1} value={formData.teamSize} onChange={(e) => setFormData((prev) => ({ ...prev, teamSize: Math.max(1, Number(e.target.value) || 1) }))} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Primary use case</label>
                    <select value={formData.useCase} onChange={(e) => setFormData((prev) => ({ ...prev, useCase: e.target.value as UseCase }))} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400">
                      <option value="coding">Coding</option><option value="writing">Writing</option><option value="data">Data</option><option value="research">Research</option><option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  {ALL_TOOLS.map((tn) => {
                    const tool = formData.tools.find((t) => t.tool === tn);
                    if (!tool) return null;
                    return <ToolCard key={tn} tool={tool} planOptions={PLAN_OPTIONS[tn]} onUpdate={(u) => updateTool(tn, u)} />;
                  })}
                </div>
                {activeCount > 0 && (
                  <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between text-sm">
                    <span className="text-neutral-500">{activeCount} tool{activeCount !== 1 ? "s" : ""} selected</span>
                    <span className="font-medium tabular-nums">${totalSpend.toLocaleString()}/mo</span>
                  </div>
                )}
                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <Button size="lg" className="w-full text-sm font-medium h-11 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md" disabled={activeCount === 0 || submitting} onClick={handleSubmit} aria-label="Run AI spend audit">
                  {submitting ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Running audit…</span> : `Run audit${activeCount > 0 ? ` · ${activeCount} tool${activeCount !== 1 ? "s" : ""}` : ""}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Guarantee />
      <FAQ />
      <CTASection onAuditClick={scrollToForm} />
      </>
      )}
      <Footer />
    </div>
  );
}
