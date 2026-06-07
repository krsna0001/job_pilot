'use client';

import { useState, type FormEvent } from "react";
import { capture } from "@/lib/posthog";

interface JobSearchFormProps {
  onSearch: (what: string, where: string) => void;
  isLoading: boolean;
}

export default function JobSearchForm({ onSearch, isLoading }: JobSearchFormProps) {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!what.trim()) return;
    capture("job_search", { query: what, location: where });
    onSearch(what.trim(), where.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="what" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Job Title / Keyword
          </label>
          <input
            id="what"
            type="text"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="e.g. software engineer"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="where" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Location
          </label>
          <input
            id="where"
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g. London"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading || !what.trim()}
            className="inline-flex h-[46px] w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  );
}
