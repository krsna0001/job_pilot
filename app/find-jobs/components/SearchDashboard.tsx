'use client';

import { useState, useEffect, useCallback } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import { getCurrencySymbol } from "@/lib/currency";
import type { Job } from "./JobCard";

interface SearchDashboardProps {
  user: { email?: string; profile?: { name?: string } | null; id?: string } | null;
  initialSavedCount: number;
  initialStatusCounts: { saved: number; applied: number; interviewing: number };
  initialSavedIds: string[];
  initialProfileLocations?: string[];
  initialCountry?: string;
  initialCity?: string;
  initialRemotePref?: string;
}

interface SavedJobRow {
  id: string;
  job_data: Job & { salaryMin?: number; salaryMax?: number; source?: string };
  match_score: number | null;
  created_at: string;
}

export default function SearchDashboard({
  user,
  initialProfileLocations = [],
}: SearchDashboardProps) {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [filterText, setFilterText] = useState("");
  const [matchFilter, setMatchFilter] = useState("All Matches");
  const [sortByDB, setSortByDB] = useState("Match Score");
  const [dbPage, setDbPage] = useState(1);
  const [dbTotalCount, setDbTotalCount] = useState(0);
  const [dbJobs, setDbJobs] = useState<SavedJobRow[]>([]);
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});
  const [isScoring, setIsScoring] = useState(false);
  
  // Active Currency Selection
  const getActiveCurrency = () => {
    if (where) return getCurrencySymbol(where);
    if (Array.isArray(initialProfileLocations) && initialProfileLocations.length > 0) {
      return getCurrencySymbol(initialProfileLocations[0]);
    }
    return "$"; 
  };
  const currencySymbol = getActiveCurrency();

  const loadDBJobs = useCallback(async () => {
    let query = insforge.database
      .from("jobs")
      .select("id, job_data:raw_data, match_score, created_at", { count: "exact" });

    if (what) {
      query = query.or(`raw_data->>title.ilike.%${what}%,raw_data->company->>display_name.ilike.%${what}%`);
    }
    if (where) {
      query = query.ilike('raw_data->location->>display_name', `%${where}%`);
    }
    if (filterText) {
      query = query.or(`raw_data->>title.ilike.%${filterText}%,raw_data->company->>display_name.ilike.%${filterText}%`);
    }

    if (sortByDB === "Match Score") {
      query = query.order("match_score", { ascending: false, nullsFirst: false });
    } else if (sortByDB === "Newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortByDB === "Oldest") {
      query = query.order("created_at", { ascending: true });
    }

    const from = (dbPage - 1) * 20;
    const to = from + 19;
    query = query.range(from, to);

    const { data, count } = await query;
    if (data) {
      setDbJobs(data as unknown as SavedJobRow[]);
      setDbTotalCount(count || 0);
    }
  }, [what, where, filterText, matchFilter, sortByDB, dbPage]);

  // Real-time local search/filtering without loading states
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDBJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [what, where, filterText, matchFilter, sortByDB, dbPage, loadDBJobs]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return { bg: "bg-border", text: "text-text-muted" };
    if (score >= 80) return { bg: "bg-[#10b981]", text: "text-[#10b981]" }; // Green
    if (score >= 60) return { bg: "bg-[#3b82f6]", text: "text-[#3b82f6]" }; // Blue
    return { bg: "bg-[#f59e0b]", text: "text-[#f59e0b]" }; // Orange
  };

  const handleCalculateScores = async () => {
    if (dbJobs.length === 0) return;
    setIsScoring(true);
    try {
      const payload = dbJobs.map(dbJob => ({
        id: dbJob.id,
        title: dbJob.job_data.title || "Unknown Title",
        company: (dbJob.job_data as any).company_name || dbJob.job_data.company || "Unknown Company",
        description: dbJob.job_data.description || "No description",
        location: dbJob.job_data.location,
        salary_min: dbJob.job_data.salary_min || dbJob.job_data.salaryMin,
        salary_max: dbJob.job_data.salary_max || dbJob.job_data.salaryMax,
      }));
      
      const res = await fetch("/api/batch-score-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: payload })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.scores) {
          setLiveScores(prev => ({ ...prev, ...data.scores }));
        }
      }
    } catch (err) {
      console.error("Error calculating scores:", err);
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search Card */}
      <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="mb-2 block text-[11px] font-semibold text-text-muted uppercase tracking-wider">Job Title</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Frontend Developer" 
                value={what}
                onChange={(e) => {
                  setWhat(e.target.value);
                  setDbPage(1);
                }}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none" 
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="mb-2 block text-[11px] font-semibold text-text-muted uppercase tracking-wider">Location</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
              <input 
                type="text" 
                placeholder="US" 
                value={where}
                onChange={(e) => {
                  setWhere(e.target.value);
                  setDbPage(1);
                }}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none" 
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <button 
              onClick={handleCalculateScores}
              disabled={isScoring || dbJobs.length === 0}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition shadow-sm ${
                isScoring 
                  ? 'bg-surface-hover text-text-muted cursor-not-allowed'
                  : 'bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer'
              }`}
            >
              {isScoring ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {isScoring ? "Scoring..." : "Calculate AI Scores"}
            </button>
            <button 
              onClick={() => {
                capture("job_search", { query: what, location: where });
                setDbPage(1);
                loadDBJobs();
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9] shadow-sm cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Jobs
            </button>
          </div>
        </div>

        {dbTotalCount > 0 && (
          <div className="mt-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm font-medium text-[#065f46] flex items-center gap-2">
            ✨ Found {dbTotalCount} jobs. No high matches yet — try a broader search.
          </div>
        )}
      </div>

      {/* Filter & Table Card */}
      <div className="rounded-[24px] border border-border bg-surface overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4">
          <div className="flex items-center gap-2 w-full max-w-md">
            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Filter by company or role..." 
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setDbPage(1);
              }}
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none" 
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <select 
              value={matchFilter}
              onChange={(e) => {
                setMatchFilter(e.target.value);
                setDbPage(1);
              }}
              className="rounded-xl border border-border bg-[#f3e8ff]/40 px-4 py-2 text-sm font-medium text-text-dark focus:outline-none cursor-pointer hover:bg-[#f3e8ff]/60 transition"
            >
              <option value="All Matches">All Matches</option>
              <option value="High Match">High Match</option>
              <option value="Low Match">Low Match</option>
            </select>
            <select 
              value={sortByDB}
              onChange={(e) => {
                setSortByDB(e.target.value);
                setDbPage(1);
              }}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-dark focus:outline-none cursor-pointer hover:bg-surface-hover transition"
            >
              <option value="Match Score">Match Score</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-surface/30 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          <div className="col-span-4 lg:col-span-3">Company</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Match Score</div>
          <div className="col-span-2">Salary Est.</div>
          <div className="col-span-1 hidden lg:block text-center">Source</div>
          <div className="col-span-1 text-right">Date Found</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {dbJobs
            .slice()
            .filter((dbJob) => {
               if (matchFilter === "All Matches") return true;
               const score = liveScores[dbJob.id] !== undefined ? liveScores[dbJob.id] : (dbJob.match_score ?? -1);
               if (matchFilter === "High Match") return score >= 70;
               if (matchFilter === "Low Match") return score >= 0 && score < 70;
               return true;
            })
            .sort((a, b) => {
               if (sortByDB !== "Match Score") return 0;
               const scoreA = liveScores[a.id] !== undefined ? liveScores[a.id] : (a.match_score ?? -1);
               const scoreB = liveScores[b.id] !== undefined ? liveScores[b.id] : (b.match_score ?? -1);
               return scoreB - scoreA;
            })
            .map((dbJob) => {
            const job = dbJob.job_data;
            const scoreValue = liveScores[dbJob.id] !== undefined ? liveScores[dbJob.id] : (dbJob.match_score ?? null);
            const { bg: scoreBg, text: scoreText } = getScoreColor(scoreValue);
            
            const rawMin = job.salary_min ?? job.salaryMin;
            const rawMax = job.salary_max ?? job.salaryMax;
            const parsedMin = Number(rawMin) || 0;
            const parsedMax = Number(rawMax) || 0;
            const hasSalary = parsedMin > 0 || parsedMax > 0;
            const activeCurrency = currencySymbol || "$";
            const salaryLabel = hasSalary ? (parsedMin > 0 && parsedMax > 0 && parsedMin !== parsedMax ? `${activeCurrency}${(parsedMin / 1000).toFixed(0)}k - ${activeCurrency}${(parsedMax / 1000).toFixed(0)}k` : `${activeCurrency}${((parsedMax || parsedMin) / 1000).toFixed(0)}k`) : null;
            
            const daysAgo = Math.floor((Date.now() - new Date(dbJob.created_at || new Date()).getTime()) / 86400000);
            const freshnessLabel = daysAgo === 0 ? "Just now" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;
            const sourceName = job.source || "Search";

            const getAdzunaUrl = () => {
              const j = job as any;
              if (j.url) return j.url;
              if (j.redirect_url) return j.redirect_url;
              if (j.raw_data?.redirect_url) return j.raw_data.redirect_url;
              if (j.raw_data?.url) return j.raw_data.url;
              if (typeof j.raw_data === 'string') {
                try {
                  const parsed = JSON.parse(j.raw_data);
                  if (parsed.redirect_url) return parsed.redirect_url;
                } catch (e) {}
              }
              return "#";
            };
            const adzunaUrl = getAdzunaUrl();

            return (
              <div 
                key={dbJob.id} 
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-hover transition-colors group cursor-pointer" 
                onClick={() => window.location.href = `/find-jobs/${job.id}`}
              >
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 lg:col-span-3 flex items-center gap-3 truncate pr-4">
                    <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-surface-muted border border-border text-text-secondary text-sm font-semibold">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-text-darkest truncate text-[14px]">{job.company?.display_name || 'Unknown'}</span>
                  </div>
                  
                  <div className="col-span-3 truncate text-[14px] font-medium text-text-primary pr-4">
                    {job.title}
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-3 pr-4">
                    {scoreValue !== null ? (
                      <>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${scoreValue}%` }} />
                        </div>
                        <span className={`text-[13px] font-semibold w-9 ${scoreText}`}>{scoreValue}%</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-text-muted">Unscored</span>
                    )}
                  </div>
                  
                  <div className="col-span-2 text-[13px] font-semibold text-text-primary truncate">
                    {salaryLabel || <span className="text-text-muted font-normal">Not listed</span>}
                  </div>
                  
                  <div className="col-span-1 hidden lg:flex justify-center pr-2">
                    <span className="inline-flex items-center rounded-full bg-[#f3e8ff] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#7e22ce] whitespace-nowrap">
                      {sourceName}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-end text-right text-[12px] text-text-muted font-medium truncate gap-3">
                    <span className="hidden xl:inline-block">{freshnessLabel}</span>
                    <a 
                      href={adzunaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground"
                      title="Apply on Adzuna"
                    >
                      Apply
                      <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          {dbJobs.length === 0 && (
            <div className="p-8 text-center text-sm text-text-muted">
              No jobs found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(dbTotalCount / 20) > 1 && (
          <div className="flex items-center justify-between p-5 border-t border-border bg-surface/50">
            <div className="text-[13px] text-text-muted">
              Showing <span className="font-semibold text-text-primary">{Math.min((dbPage - 1) * 20 + 1, dbTotalCount === 0 ? 0 : dbTotalCount)}</span> to <span className="font-semibold text-text-primary">{Math.min(dbPage * 20, dbTotalCount)}</span> of <span className="font-semibold text-text-primary">{dbTotalCount}</span> results
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDbPage(Math.max(1, dbPage - 1))} 
                disabled={dbPage <= 1} 
                className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#7c3aed] text-white text-[13px] font-bold shadow-sm">
                {dbPage}
              </div>

              <button 
                onClick={() => setDbPage(dbPage + 1)} 
                disabled={dbPage >= Math.ceil(dbTotalCount / 20)} 
                className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}