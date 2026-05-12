"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  auditId: string;
  hasSavings?: boolean;
}

export default function LeadCaptureForm({ auditId, hasSavings = true }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // Hidden field for tracking
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-5 text-center">
        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-900">Check your inbox</p>
        <p className="text-xs text-emerald-700 mt-1">
          We sent your audit summary to {email}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, company, role, website }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-card p-5">
      <p className="text-sm font-semibold mb-1">
        {hasSavings ? "Get your audit by email" : "Get notified about new optimizations"}
      </p>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {hasSavings
          ? "We\u0027ll send a summary with your results and a permanent link to this report."
          : "We\u0027ll notify you when new savings apply to your stack — no spam, just relevant updates."}
      </p>
      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            aria-label="Company name"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Role"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        {status === "error" && (
          <p className="text-xs text-destructive">{errorMsg}</p>
        )}
        <Button
          type="submit"
          size="sm"
          className="h-9 text-sm"
          disabled={status === "loading" || !email}
        >
          {status === "loading" ? "Sending…" : hasSavings ? "Send my audit" : "Notify me"}
        </Button>
      </div>
    </form>
  );
}
