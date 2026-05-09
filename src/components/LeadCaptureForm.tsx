"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LeadCaptureFormProps {
  auditId: string;
}

export default function LeadCaptureForm({ auditId }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-center">
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium mb-1">Get your audit by email</p>
      <p className="text-xs text-muted-foreground mb-3">
        We&apos;ll send a summary with your results and a link to this page.
      </p>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
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
          {status === "loading" ? "Sending…" : "Send my audit"}
        </Button>
      </div>
    </form>
  );
}
