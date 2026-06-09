'use client';

import { useState, useEffect, useCallback } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import { getCurrencySymbol } from "@/lib/currency";
import JobSearchForm from "./JobSearchForm";
import JobCard from "./JobCard";
import type { Job } from "./JobCard";

interface SearchDashboardProps {
  user: { email?: string; profile?: { name?: string } | null; id?: string } | null;
  initialSavedCount: number;
  initialStatusCounts: { saved: number; applied: number; interviewing: number };
  initialSavedIds: string[];
  initialProfileLocations?: string[];
}

interface SavedJobRow {
  id: string;
  job_data: Job;
  status: string;
}

export default function SearchDashboard({
  user,
  initialSavedCount,
  initialStatusCounts,
  initialSavedIds,
  initialProfileLocations = [],
}: SearchDashboardProps) {
  const [results, setResults] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});

  // Active Currency Selection
  const getActiveCurrency = () => {
    if (currentLocation) {
      return getCurrencySymbol(currentLocation);
    }
    if (Array.isArray(initialProfileLocations) && initialProfileLocations.length > 0) {
      return getCurrencySymbol(initialProfileLocations[0]);
    }
    return "$"; // Fallback default
  };
  const currencySymbol = getActiveCurrency();

  // Filters State
  const [filterKeyword, setFilterKeyword] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<string>>(new Set());
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<Set<string>>(new Set());
  const [selectedWorkModes, setSelectedWorkModes] = useState<Set<string>>(new Set());
  const [minSalary, setMinSalary] = useState(20000);
  const [sortBy, setSortBy] = useState("Relevance");

  const loadSavedJobs = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await insforge.database
      .from("saved_jobs")
      .select("job_data, status")
      .eq("user_id", user.id);

    if (data) {
      const rows = data as SavedJobRow[];
      const ids = new Set(rows.map((r) => r.job_data.id));
      setSavedIds(ids);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  useEffect(() => {
    if (initialSavedCount > 0) {
      setSavedIds(new Set(initialSavedIds));
    }
  }, []);

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
    if (!user) {
      alert("Please sign in to save jobs.");
      return;
    }

    setSavingIds((prev) => new Set(prev).add(job.id));
    setSavedIds((prev) => new Set(prev).add(job.id));

    const { error } = await insforge.database
      .from("saved_jobs")
      .insert([{ job_data: job, user_id: user.id }]);

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
    capture("job_saved", { job_id: job.id, title: job.title, company: job.company.display_name });
    await loadSavedJobs();

    const savedRow = await insforge.database
      .from("saved_jobs")
      .select("id")
      .eq("job_data->>id", job.id)
      .maybeSingle();

    if (savedRow.data) {
      const { id } = savedRow.data as { id: string };
      fetch("/api/score-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.score !== undefined) {
            setMatchScores((prev) => ({ ...prev, [job.id]: data.score }));
          }
        })
        .catch(() => {});
    }
  };

  const handleUnsave = async (jobId: string) => {
    if (!user) return;
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
    capture("job_unsaved", { job_id: jobId });
    await loadSavedJobs();
  };

  const handleCheckboxToggle = (
    set: Set<string>,
    setter: (s: Set<string>) => void,
    val: string
  ) => {
    const next = new Set(set);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setter(next);
  };

  const handleClearAll = () => {
    setFilterKeyword("");
    setSelectedJobTypes(new Set());
    setSelectedExperienceLevels(new Set());
    setSelectedWorkModes(new Set());
    setMinSalary(20000);
  };

  // Client-side filtering & sorting logic
  const getFilteredAndSortedResults = useCallback(() => {
    let temp = [...results];

    // Filter by keyword input in sidebar
    if (filterKeyword.trim()) {
      const kw = filterKeyword.toLowerCase().trim();
      temp = temp.filter(
        (job) =>
          job.title.toLowerCase().includes(kw) ||
          job.company.display_name.toLowerCase().includes(kw) ||
          job.description.toLowerCase().includes(kw)
      );
    }

    // Filter by Job Type
    if (selectedJobTypes.size > 0) {
      temp = temp.filter((job) => {
        const text = (job.title + " " + job.description).toLowerCase();
        let matches = false;
        if (selectedJobTypes.has("Full-time") && (text.includes("full-time") || text.includes("full time") || text.includes("permanent"))) {
          matches = true;
        }
        if (selectedJobTypes.has("Part-time") && (text.includes("part-time") || text.includes("part time"))) {
          matches = true;
        }
        if (selectedJobTypes.has("Contract") && (text.includes("contract") || text.includes("contractor") || text.includes("freelance"))) {
          matches = true;
        }
        if (selectedJobTypes.has("Internship") && (text.includes("intern") || text.includes("internship") || text.includes("placement"))) {
          matches = true;
        }
        return matches;
      });
    }

    // Filter by Experience Level
    if (selectedExperienceLevels.size > 0) {
      temp = temp.filter((job) => {
        const text = (job.title + " " + job.description).toLowerCase();
        let matches = false;
        if (selectedExperienceLevels.has("Entry level") && (text.includes("entry level") || text.includes("junior") || text.includes("graduate") || text.includes("entry-level") || text.includes("trainee") || text.includes("associate"))) {
          matches = true;
        }
        if (selectedExperienceLevels.has("Mid level") && (text.includes("mid level") || text.includes("mid-level") || text.includes("intermediate") || text.includes("mid weight") || text.includes("midweight"))) {
          matches = true;
        }
        if (selectedExperienceLevels.has("Senior") && (text.includes("senior") || text.includes("sr.") || text.includes("sr ") || text.includes("experienced"))) {
          matches = true;
        }
        if (selectedExperienceLevels.has("Lead/Manager") && (text.includes("lead") || text.includes("principal") || text.includes("manager") || text.includes("director") || text.includes("head of") || text.includes("architect"))) {
          matches = true;
        }
        return matches;
      });
    }

    // Filter by Work Mode
    if (selectedWorkModes.size > 0) {
      temp = temp.filter((job) => {
        const text = (job.title + " " + job.description).toLowerCase();
        let matches = false;
        if (selectedWorkModes.has("Remote") && (text.includes("remote") || text.includes("work from home") || text.includes("wfh") || text.includes("telecommute"))) {
          matches = true;
        }
        if (selectedWorkModes.has("Hybrid") && (text.includes("hybrid") || text.includes("flexible working") || text.includes("remote/on-site"))) {
          matches = true;
        }
        if (selectedWorkModes.has("On-site") && (!text.includes("remote") && !text.includes("wfh") && !text.includes("hybrid") || text.includes("on-site") || text.includes("onsite") || text.includes("office based"))) {
          matches = true;
        }
        return matches;
      });
    }

    // Filter by Salary Range (if salary is listed, it must be >= minSalary)
    if (minSalary > 20000) {
      temp = temp.filter((job) => {
        if (!job.salary_min && !job.salary_max) return true; // Show unlisted salaries by default
        const jobMin = job.salary_min ?? 0;
        const jobMax = job.salary_max ?? Infinity;
        return jobMin >= minSalary || jobMax >= minSalary;
      });
    }

    // Sorting
    if (sortBy === "Latest") {
      temp.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } else if (sortBy === "Salary") {
      temp.sort((a, b) => {
        const salaryA = a.salary_max ?? a.salary_min ?? 0;
        const salaryB = b.salary_max ?? b.salary_min ?? 0;
        return salaryB - salaryA;
      });
    }

    return temp;
  }, [results, filterKeyword, selectedJobTypes, selectedExperienceLevels, selectedWorkModes, minSalary, sortBy]);

  const filteredResults = getFilteredAndSortedResults();
  const totalPages = Math.min(Math.ceil(count / 20), 50);

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <div className="rounded-[2rem] border border-border bg-surface-secondary p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-semibold text-text-darkest tracking-tight">
            Find Your Dream Job
          </h1>
          <p className="mt-3 text-sm md:text-base text-text-secondary">
            Find your next career opportunity with our curated job list.
          </p>

          <div className="mt-8">
            <JobSearchForm
              onSearch={handleSearch}
              isLoading={isLoading}
              initialWhat={currentQuery}
              initialWhere={currentLocation}
            />
          </div>

          {/* Popular Searches */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-muted font-medium">Popular Searches:</span>
            {["React", "Tailwind", "Node", "Next.js"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setCurrentQuery(term);
                  handleSearch(term, currentLocation);
                }}
                className="rounded-full bg-surface border border-border px-3 py-1 text-text-secondary hover:border-accent hover:text-accent transition duration-200 cursor-pointer font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Job Listings */}
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-semibold text-text-darkest">Filters</h3>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-accent hover:text-accent-dark underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Filter */}
            <div className="py-4 border-b border-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Search in results
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="w-full rounded-xl border border-border bg-surface pl-3 pr-8 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                {filterKeyword && (
                  <button
                    type="button"
                    onClick={() => setFilterKeyword("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs font-semibold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Job Type Checkboxes */}
            <div className="py-4 border-b border-border">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                Job Type
              </span>
              <div className="space-y-2">
                {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 text-sm text-text-dark cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.has(type)}
                      onChange={() => handleCheckboxToggle(selectedJobTypes, setSelectedJobTypes, type)}
                      className="rounded border-border text-accent focus:ring-accent h-4 w-4 bg-surface cursor-pointer"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level Checkboxes */}
            <div className="py-4 border-b border-border">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                Experience Level
              </span>
              <div className="space-y-2">
                {["Entry level", "Mid level", "Senior", "Lead/Manager"].map((exp) => (
                  <label key={exp} className="flex items-center gap-2.5 text-sm text-text-dark cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedExperienceLevels.has(exp)}
                      onChange={() => handleCheckboxToggle(selectedExperienceLevels, setSelectedExperienceLevels, exp)}
                      className="rounded border-border text-accent focus:ring-accent h-4 w-4 bg-surface cursor-pointer"
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode Checkboxes */}
            <div className="py-4 border-b border-border">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                Work Mode
              </span>
              <div className="space-y-2">
                {["On-site", "Hybrid", "Remote"].map((mode) => (
                  <label key={mode} className="flex items-center gap-2.5 text-sm text-text-dark cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedWorkModes.has(mode)}
                      onChange={() => handleCheckboxToggle(selectedWorkModes, setSelectedWorkModes, mode)}
                      className="rounded border-border text-accent focus:ring-accent h-4 w-4 bg-surface cursor-pointer"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range Slider */}
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Min Salary
                </span>
                <span className="text-xs font-semibold text-accent">
                  {currencySymbol}{(minSalary / 1000).toFixed(0)}k+
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={150000}
                step={5000}
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>{currencySymbol}20k</span>
                <span>{currencySymbol}150k+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings Column */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="rounded-[1.75rem] border border-border bg-error/10 p-6 text-sm text-error">
              {error === "Adzuna API not configured"
                ? "Job search is not yet configured. The Adzuna API credentials need to be set up."
                : error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && !currentQuery && (
            <div className="rounded-[1.75rem] border border-border bg-surface p-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-darkest">Search IT Roles</h3>
              <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
                Search for technology jobs by title and location above, then use filters to narrow down matches.
              </p>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && currentQuery && (
            <div className="rounded-[1.75rem] border border-border bg-surface p-12 text-center shadow-sm">
              <h3 className="text-base font-semibold text-text-darkest">No jobs found</h3>
              <p className="mt-2 text-sm text-text-secondary">
                We couldn't find any results for "{currentQuery}" in Adzuna. Try expanding your search terms.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                  <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-surface-secondary" />
                  <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-surface-secondary" />
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-surface-secondary" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-surface-secondary" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              {/* Header Bar: Filtered Count + Sort controls */}
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-text-secondary">
                  Showing {filteredResults.length} of {count} jobs
                </p>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-xs font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary focus:border-accent focus:outline-none cursor-pointer"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Latest">Latest</option>
                    <option value="Salary">Salary (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Job Listings List */}
              {filteredResults.length === 0 ? (
                <div className="rounded-[1.75rem] border border-border bg-surface p-12 text-center shadow-sm">
                  <h3 className="text-base font-semibold text-text-darkest">No matching results</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Adjust or clear your filters to display matches from the active page results.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSave}
                      onUnsave={handleUnsave}
                      isSaved={savedIds.has(job.id)}
                      isSaving={savingIds.has(job.id)}
                      matchScore={matchScores[job.id]}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || isLoading}
                    className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
