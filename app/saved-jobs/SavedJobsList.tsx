"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";
import EmptyState from "@/app/components/EmptyState";
import Link from "next/link";

interface SkillsData {
  job_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
}

interface SavedJob {
  id: string;
  job_data: {
    title: string;
    company: { display_name: string };
    description: string;
    redirect_url: string;
    created: string;
    location: { display_name: string };
  };
  status: string;
  match_score: number | null;
  company_dossier: {
    company_name: string;
    business_summary: string;
    tech_stack: string[];
    culture_signals: string[];
    interview_tips: string[];
    talking_points: string[];
  } | null;
  created_at: string;
}

const STATUSES = ["all", "saved", "applied", "interviewing", "rejected"] as const;
const BOARD_COLUMNS = [
  { key: "saved", label: "Saved", color: "border-l-accent" },
  { key: "applied", label: "Applied", color: "border-l-info" },
  { key: "interviewing", label: "Interviewing", color: "border-l-warning" },
  { key: "rejected", label: "Rejected", color: "border-l-error" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    saved: "bg-accent-light text-accent",
    applied: "bg-info-light text-info",
    interviewing: "bg-warning/10 text-warning",
    rejected: "bg-error/10 text-error",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colors[status] ?? "bg-surface-secondary text-text-secondary"}`}>
      {status}
    </span>
  );
}

function MatchScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const colors = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-error";
  return <span className={`text-sm font-semibold ${colors}`}>{score}%</span>;
}

export default function SavedJobsList({ initialJobs }: { initialJobs: SavedJob[] }) {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filter, setFilter] = useState<string>("all");
  const [jobs, setJobs] = useState(initialJobs);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [autoApplyingId, setAutoApplyingId] = useState<string | null>(null);
  const [expandedDossierIds, setExpandedDossierIds] = useState<Set<string>>(new Set());
  const [expandedAutoApplyIds, setExpandedAutoApplyIds] = useState<Set<string>>(new Set());
  const [skillsData, setSkillsData] = useState<Record<string, SkillsData>>({});
  const [autoApplyData, setAutoApplyData] = useState<Record<string, any>>({});

  const handleResearchCompany = async (jobId: string) => {
    setResearchingId(jobId);
    try {
      const res = await fetch("/api/company-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: jobId }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, company_dossier: data } : j))
        );
        setExpandedDossierIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResearchingId(null);
    }
  };

  const handleAutoApply = async (jobId: string) => {
    setAutoApplyingId(jobId);
    try {
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: jobId }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setAutoApplyData((prev) => ({ ...prev, [jobId]: data }));
        setExpandedAutoApplyIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "applied" } : j))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAutoApplyingId(null);
    }
  };

  const toggleDossierExpanded = (jobId: string) => {
    setExpandedDossierIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const filteredJobs = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    const { error } = await insforge.database
      .from("saved_jobs")
      .update({ status: newStatus })
      .eq("id", jobId);
    if (error) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: j.status } : j)));
    }
    setUpdatingId(null);
  };

  const handleAnalyzeSkills = async (jobId: string) => {
    setAnalyzingId(jobId);
    try {
      const res = await fetch("/api/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: jobId }),
      });
      const data = await res.json();
      if (data.job_skills) {
        setSkillsData((prev) => ({ ...prev, [jobId]: data }));
      }
    } catch { }
    setAnalyzingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Toggle + Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
            {(["board", "list"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 capitalize ${
                  viewMode === mode
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="w-px h-5 bg-border mx-1" />
          <div className="flex flex-wrap gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                  filter === s
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-text-muted">{jobs.length} total</span>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No saved jobs yet" : `No jobs with status "${filter}"`}
          description={filter === "all" ? "Search and save jobs to get started." : "Try a different status filter to see more jobs."}
        />
      ) : viewMode === "board" && filter === "all" ? (
        /* Kanban Board */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {BOARD_COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.key);
            return (
              <div key={col.key} className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
                <div className={`border-l-[3px] ${col.color} px-4 py-3 flex items-center justify-between`}>
                  <h3 className="text-sm font-semibold text-text-darkest">{col.label}</h3>
                  <span className="rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                    {colJobs.length}
                  </span>
                </div>
                <div className="p-2.5 space-y-2 max-h-[70vh] overflow-y-auto">
                  {colJobs.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-5">No jobs</p>
                  ) : (
                    colJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-lg border border-border bg-surface-muted p-3 space-y-2.5 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      >
                        <Link href={`/find-jobs/${job.id}`} className="block space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-text-darkest leading-snug line-clamp-2">
                              {job.job_data.title}
                            </p>
                            <MatchScoreBadge score={job.match_score} />
                          </div>
                          <p className="text-xs text-text-secondary">{job.job_data.company.display_name}</p>
                          <p className="text-[11px] text-text-muted">
                            {job.job_data.location?.display_name ?? "Remote"}
                          </p>
                        </Link>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                            disabled={updatingId === job.id}
                            className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-primary focus:outline-none disabled:opacity-50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {["saved", "applied", "interviewing", "rejected"].map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleAutoApply(job.id); }}
                            disabled={autoApplyingId === job.id}
                            className="rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200 disabled:opacity-50"
                          >
                            {autoApplyingId === job.id ? "..." : autoApplyData[job.id] ? "Applied" : "Apply"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3 animate-fade-in">
          {filteredJobs.map((job, i) => (
            <div
              key={job.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${(i % 10) * 50}ms` }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/find-jobs/${job.id}`} className="block">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-text-darkest hover:text-accent transition-colors">{job.job_data.title}</h3>
                      <MatchScoreBadge score={job.match_score} />
                    </div>
                  </Link>
                  <p className="mt-1 text-sm text-text-secondary">
                    {job.job_data.company.display_name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {job.job_data.location?.display_name ?? "Remote"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <StatusBadge status={job.status} />
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    disabled={updatingId === job.id}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:border-accent disabled:opacity-50"
                  >
                    {["saved", "applied", "interviewing", "rejected"].map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-dark">{job.job_data.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span>Saved {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAnalyzeSkills(job.id)}
                    disabled={analyzingId === job.id}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {analyzingId === job.id ? "Analyzing..." : "Skills"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoApply(job.id)}
                    disabled={autoApplyingId === job.id}
                    className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  >
                    {autoApplyingId === job.id ? "Generating..." : autoApplyData[job.id] ? "Applied" : "Auto-Apply"}
                  </button>

                  {job.company_dossier ? (
                    <button
                      type="button"
                      onClick={() => toggleDossierExpanded(job.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        expandedDossierIds.has(job.id)
                          ? "border-accent bg-accent-light text-accent"
                          : "border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
                      }`}
                    >
                      {expandedDossierIds.has(job.id) ? "Hide Dossier" : "Dossier"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResearchCompany(job.id)}
                      disabled={researchingId === job.id}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      {researchingId === job.id ? "Researching..." : "Research"}
                    </button>
                  )}

                  <a
                    href={job.job_data.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-accent transition-all duration-200 hover:border-accent hover:text-accent-dark"
                  >
                    Apply →
                  </a>
                </div>
              </div>

              {job.company_dossier && expandedDossierIds.has(job.id) ? (
                <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-5 space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Company Research Brief</span>
                      <h4 className="text-lg font-semibold text-text-darkest mt-1">{job.company_dossier.company_name}</h4>
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Business Overview</span>
                    <p className="mt-1 text-sm leading-relaxed text-text-dark">{job.company_dossier.business_summary}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-surface p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block mb-3">Estimated Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.company_dossier.tech_stack.map((tech) => (
                          <span key={tech} className="rounded-md bg-surface-secondary border border-border px-2 py-1 text-xs font-medium text-text-primary">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-surface p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block mb-3">Culture & Workplace Signals</span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.company_dossier.culture_signals.map((signal) => (
                          <span key={signal} className="rounded-md bg-accent-light px-2 py-1 text-xs font-medium text-accent">{signal}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block">Interview Preparation Tips</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-sm text-text-dark">
                        {job.company_dossier.interview_tips.map((tip, idx) => (
                          <li key={idx} className="leading-relaxed"><span className="text-text-secondary">{tip}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block">Strategic Talking Points</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-sm text-text-dark">
                        {job.company_dossier.talking_points.map((point, idx) => (
                          <li key={idx} className="leading-relaxed"><span className="text-text-secondary">{point}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              {autoApplyData[job.id] && expandedAutoApplyIds.has(job.id) ? (
                <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Auto-Apply</span>
                      <p className="text-xs text-text-muted mt-1">AI-generated application materials tailored to this job</p>
                    </div>
                    <button type="button" onClick={() => { const n = new Set(expandedAutoApplyIds); n.delete(job.id); setExpandedAutoApplyIds(n); }} className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-accent hover:text-accent transition">Hide</button>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Cover Letter</span>
                    <div className="rounded-lg bg-surface border border-border p-4 text-sm text-text-secondary leading-relaxed whitespace-pre-line">{autoApplyData[job.id].cover_letter}</div>
                  </div>
                  {autoApplyData[job.id].key_skills?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Key Skills Highlighted</span>
                      <div className="flex flex-wrap gap-1.5">
                        {autoApplyData[job.id].key_skills.map((skill: string) => (
                          <span key={skill} className="rounded-md bg-accent/10 border border-accent/10 px-2.5 py-1 text-xs font-medium text-accent">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {autoApplyData[job.id].talking_points?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Interview Talking Points</span>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-text-dark">
                        {autoApplyData[job.id].talking_points.map((point: string, i: number) => (
                          <li key={i} className="text-text-secondary">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {autoApplyData[job.id].suggested_answers?.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Likely Interview Questions</span>
                      {autoApplyData[job.id].suggested_answers.map((qa: { question: string; answer: string }, i: number) => (
                        <div key={i} className="rounded-lg border border-border/60 bg-surface p-3 space-y-1">
                          <p className="text-xs font-semibold text-text-darkest">Q: {qa.question}</p>
                          <p className="text-xs text-text-secondary">A: {qa.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {skillsData[job.id] ? (
                <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-4 animate-fade-in">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary mb-3">
                    Skills Breakdown
                    <span className={`ml-2 normal-case ${skillsData[job.id].match_percentage >= 70 ? "text-success" : skillsData[job.id].match_percentage >= 40 ? "text-warning" : "text-error"}`}>
                      {skillsData[job.id].match_percentage}% match
                    </span>
                  </p>
                  {skillsData[job.id].matched_skills.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1.5 text-xs font-medium text-text-muted">Matched</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsData[job.id].matched_skills.map((skill) => (
                          <span key={skill} className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skillsData[job.id].missing_skills.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-text-muted">Missing</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsData[job.id].missing_skills.map((skill) => (
                          <span key={skill} className="rounded-md bg-error/10 px-2.5 py-1 text-xs font-medium text-error">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
