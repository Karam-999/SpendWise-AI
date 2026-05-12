"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LeadFormsProps {
  auditId: string;
  mode: "buy" | "sell";
}

const PLATFORM_OPTIONS = [
  "OpenAI",
  "Anthropic",
  "Google Cloud",
  "AWS",
  "Azure",
  "Cursor",
  "GitHub Copilot",
];

export default function LeadForms({ auditId, mode }: LeadFormsProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    platform: "",
    otherPlatform: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/marketplace-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          fullName: formData.fullName, // Hidden field for tracking
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          platform: formData.platform === "other" ? formData.otherPlatform : formData.platform,
          message: formData.message,
          website: formData.website,
        }),
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

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Request Received</h3>
        <p className="text-sm text-emerald-700">
          Our team will review your request and get back to you at {formData.email} within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 max-w-3xl mx-auto shadow-sm">
      <div className="text-center mb-8">
        <h2 className="font-mono text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          {mode === "buy" ? "Buy Discounted Credits" : "Sell Unused Credits"}
        </h2>
        <p className="text-sm text-neutral-500">
          Fill out the form below and our team will get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Karam Syed"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="company"
              required
              placeholder="Acme Corp"
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">Select Platform</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
          >
            <option value="">Select platform...</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        {formData.platform === "other" && (
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">Others (Please specify)</label>
            <input
              type="text"
              name="otherPlatform"
              placeholder="e.g. Gemma AI, etc."
              value={formData.otherPlatform}
              onChange={handleChange}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">Message (Optional)</label>
          <textarea
            name="message"
            rows={4}
            placeholder="How can we help you?"
            value={formData.message}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-bold tracking-wider text-xs uppercase rounded-md transition-colors"
          disabled={status === "loading" || !formData.email || !formData.fullName}
        >
          {status === "loading" ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
