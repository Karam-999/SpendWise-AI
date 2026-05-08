"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuditFormData, ToolInput, ToolName, UseCase, AuditResponse } from "@/lib/types";
const PLAN_OPTIONS: Record<ToolName, string[]> = {
  cursor: ["hobby", "pro", "business"],
  github_copilot: ["individual", "business", "enterprise"],
  claude: ["pro", "max", "team"],
  chatgpt: ["plus", "team"],
  anthropic_api: ["pay-as-you-go"],
  openai_api: ["pay-as-you-go"],
  gemini: ["pro", "ultra"],
  windsurf: ["free", "pro", "teams"],
};
const TOOL_LABELS: Record<ToolName, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};
const TOOL_NAMES: ToolName[] = [
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
];
function createDefaultTool(tool: ToolName): ToolInput {
  return {
    tool,
    label: TOOL_LABELS[tool],
    active: false,
    plan: PLAN_OPTIONS[tool][0],
    monthlySpend: 0,
    seats: 0,
  };
}
function createDefaultFormData(): AuditFormData {
  return {
    tools: TOOL_NAMES.map(createDefaultTool),
    teamSize: 1,
    useCase: "coding",
  };
}
const STORAGE_KEY = "ai-spend-audit-form";
function ToolCard({
  tool,
  planOptions,
  onUpdate,
}: {
  tool: ToolInput;
  planOptions: string[];
  onUpdate: (updated: ToolInput) => void;
}) {
  const [expanded, setExpanded] = useState(tool.active);
  useEffect(() => {
    if (tool.active) setExpanded(true);
  }, [tool.active]);
  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        tool.active
          ? "border-foreground/20 bg-card shadow-sm"
          : "border-border bg-muted/30"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <label
            className="relative inline-flex cursor-pointer items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={tool.active}
              onChange={(e) =>
                onUpdate({ ...tool, active: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-foreground transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-background after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          <span className="font-medium text-sm">{tool.label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Plan</label>
            <select
              value={tool.plan}
              onChange={(e) => onUpdate({ ...tool, plan: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {planOptions.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">
              Monthly spend ($)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={tool.monthlySpend || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdate({
                  ...tool,
                  monthlySpend: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">
              Seats
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={tool.seats || ""}
              placeholder="0"
              onChange={(e) =>
                onUpdate({
                  ...tool,
                  seats: Math.max(0, Math.round(Number(e.target.value) || 0)),
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AuditFormData>(createDefaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
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
          if (idx !== -1) {
            merged.tools[idx] = { ...merged.tools[idx], ...savedTool };
          }
        }
        setFormData(merged);
      }
    } catch {
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData, hydrated]);
  const updateTool = useCallback((index: number, updated: ToolInput) => {
    setFormData((prev) => {
      const tools = [...prev.tools];
      tools[index] = updated;
      return { ...prev, tools };
    });
  }, []);
  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      const data: AuditResponse = await res.json();
      sessionStorage.setItem(`audit-${data.auditId}`, JSON.stringify(data.output));
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };
  const activeCount = formData.tools.filter((t) => t.active).length;
  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Spend Audit
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
            Find out if you&apos;re overpaying for AI tools. Toggle on the tools
            your team uses, fill in the details, and get instant recommendations.
          </p>
        </div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Team size
            </label>
            <input
              type="number"
              min={1}
              value={formData.teamSize}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  teamSize: Math.max(1, Number(e.target.value) || 1),
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Primary use case
            </label>
            <select
              value={formData.useCase}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  useCase: e.target.value as UseCase,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="data">Data</option>
              <option value="research">Research</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Your AI tools
          </p>
          {formData.tools.map((tool, i) => (
            <ToolCard
              key={tool.tool}
              tool={tool}
              planOptions={PLAN_OPTIONS[tool.tool]}
              onUpdate={(updated) => updateTool(i, updated)}
            />
          ))}
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button
          size="lg"
          className="w-full text-sm font-medium h-11"
          disabled={activeCount === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Running audit…
            </span>
          ) : (
            `Run audit${activeCount > 0 ? ` (${activeCount} tool${activeCount !== 1 ? "s" : ""})` : ""}`
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Free. No signup. Your data stays in your browser.
        </p>
      </main>
    </div>
  );
}
