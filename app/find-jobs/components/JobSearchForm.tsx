'use client';

import { useState, useEffect, type FormEvent } from "react";
import { capture } from "@/lib/posthog";

interface JobSearchFormProps {
  onSearch: (what: string, where: string) => void;
  isLoading: boolean;
  initialWhat?: string;
  initialWhere?: string;
}

export default function JobSearchForm({
  onSearch,
  isLoading,
  initialWhat = "",
  initialWhere = "",
}: JobSearchFormProps) {
  const [what, setWhat] = useState(initialWhat);
  const [where, setWhere] = useState(initialWhere);

  useEffect(() => {
    setWhat(initialWhat);
  }, [initialWhat]);

  useEffect(() => {
    setWhere(initialWhere);
  }, [initialWhere]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!what.trim()) return;
    capture("job_search", { query: what, location: where });
    onSearch(what.trim(), where.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-2 shadow-sm md:flex-row md:items-center md:gap-0 md:divide-x md:divide-border md:rounded-full">
        {/* Job Title / Company input */}
        <div className="flex flex-1 items-center gap-3 px-4 py-2 md:py-0">
          <svg
            className="h-5 w-5 text-text-muted shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="what"
            type="text"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="Job title, keywords, or company"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Location input */}
        <div className="flex flex-1 items-center gap-3 px-4 py-2 md:py-0">
          <svg
            className="h-5 w-5 text-text-muted shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            id="where"
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="City, state, or country"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Search button */}
        <div className="px-2 shrink-0 md:pl-4">
          <button
            type="submit"
            disabled={isLoading || !what.trim()}
            className="w-full cursor-pointer inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 md:rounded-full"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  );
}
