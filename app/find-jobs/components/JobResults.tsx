'use client';

import { useState, useEffect, useCallback } from "react";
import { insforge } from "@/lib/insforge-client";
import JobSearchForm from "./JobSearchForm";
import JobCard from "./JobCard";
import type { Job } from "./JobCard";

interface SavedJobRow {
  id: string;
  job_data: Job;
}

export default function JobResults() {
  const [results, setResults] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    const { data } = await insforge.database
      .from("saved_jobs")
      .select("id, job_data");

    if (data) {
      const ids = new Set((data as SavedJobRow[]).map((r) => r.job_data.id));
      setSavedIds(ids);
    }
  };

  const handleSearch = useCallback(async (what: string, where: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(what);
    setCurrentLocation(where);
    setPage(1);

    const { data, error } = await insforge.functions.invoke("jobs-search", {
      body: { what, where, page: "1" },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setResults(data.results ?? []);
    setCount(data.count ?? 0);
    setIsLoading(false);
  }, []);

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    setError(null);
    setPage(newPage);

    const { data, error } = await insforge.functions.invoke("jobs-search", {
      body: { what: currentQuery, where: currentLocation, page: String(newPage) },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setResults(data.results ?? []);
    setIsLoading(false);
  };

  const handleSave = async (job: Job) => {
    setSavingIds((prev) => new Set(prev).add(job.id));
    setSavedIds((prev) => new Set(prev).add(job.id));

    const { error } = await insforge.database
      .from("saved_jobs")
      .insert([{ job_data: job }]);

    if (error) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });
  };

  const handleUnsave = async (jobId: string) => {
    setSavingIds((prev) => new Set(prev).add(jobId));

    const { data: rows } = await insforge.database
      .from("saved_jobs")
      .select("id")
      .eq("job_data->>id", jobId)
      .maybeSingle();

    if (rows) {
      const savedId = (rows as { id: string }).id;
      await insforge.database.from("saved_jobs").delete().eq("id", savedId);
    }

    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  };

  const totalPages = Math.min(Math.ceil(count / 20), 50);

  return (
    <div className="space-y-6">
      <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error ? (
        <div className="rounded-[1.75rem] border border-border bg-error/10 p-6 text-sm text-error">
          {error === "Adzuna API not configured"
            ? "Job search is not yet configured. The Adzuna API key needs to be set up."
            : error}
        </div>
      ) : null}

      {!isLoading && !error && results.length === 0 && !currentQuery ? (
        <div className="rounded-[1.75rem] border border-border bg-surface p-10 text-center">
          <p className="text-base text-text-secondary">
            Search for IT roles by title and location to find your next opportunity.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && results.length === 0 && currentQuery ? (
        <div className="rounded-[1.75rem] border border-border bg-surface p-10 text-center">
          <p className="text-base text-text-secondary">No jobs found for your search.</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[1.75rem] border border-border bg-surface p-6">
              <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-surface-secondary" />
              <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-surface-secondary" />
              <div className="mb-4 h-3 w-1/3 animate-pulse rounded bg-surface-secondary" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-surface-secondary" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-surface-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && results.length > 0 ? (
        <>
          <p className="text-sm text-text-secondary">
            Found {count} job{count !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSave}
                onUnsave={handleUnsave}
                isSaved={savedIds.has(job.id)}
                isSaving={savingIds.has(job.id)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isLoading}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
