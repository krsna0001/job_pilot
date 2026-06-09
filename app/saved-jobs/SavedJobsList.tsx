"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";

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

  return (
    <span className={`text-sm font-semibold ${colors}`}>
      {score}% match
    </span>
  );
}

export default function SavedJobsList({ initialJobs }: { initialJobs: SavedJob[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [jobs, setJobs] = useState(initialJobs);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [researchingId, setResearchingId] = useState<string | null>(null);
  const [expandedDossierIds, setExpandedDossierIds] = useState<Set<string>>(new Set());
  const [skillsData, setSkillsData] = useState<Record<string, SkillsData>>({});

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
    } catch {
      // silently fail
    }
    setAnalyzingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              filter === s
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-surface p-12 text-center">
          <p className="text-base text-text-secondary">
            {filter === "all" ? "No saved jobs yet. Search and save jobs to get started." : `No jobs with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-text-darkest sm:text-lg">{job.job_data.title}</h3>
                    <MatchScoreBadge score={job.match_score} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-text-secondary">
                    {job.job_data.company.display_name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {job.job_data.location?.display_name ?? "Remote"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={job.status} />
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    disabled={updatingId === job.id}
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition hover:border-accent disabled:opacity-50"
                  >
                    {STATUSES.filter((s) => s !== "all").map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-text-dark">{job.job_data.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span>Saved {new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAnalyzeSkills(job.id)}
                    disabled={analyzingId === job.id}
                    className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {analyzingId === job.id ? "Analyzing..." : "Analyze Skills"}
                  </button>

                  {job.company_dossier ? (
                    <button
                      type="button"
                      onClick={() => toggleDossierExpanded(job.id)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                        expandedDossierIds.has(job.id)
                          ? "border-accent bg-accent-light text-accent"
                          : "border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
                      }`}
                    >
                      {expandedDossierIds.has(job.id) ? "Hide Dossier" : "Company Dossier"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResearchCompany(job.id)}
                      disabled={researchingId === job.id}
                      className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      {researchingId === job.id ? "Researching..." : "Research Company"}
                    </button>
                  )}

                  <a
                    href={job.job_data.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border bg-surface px-3 py-1.5 font-medium text-accent transition hover:border-accent hover:text-accent-dark"
                  >
                    View on Adzuna →
                  </a>
                </div>
              </div>

              {job.company_dossier && expandedDossierIds.has(job.id) ? (
                <div className="mt-4 rounded-2xl border border-border bg-surface-secondary p-6 space-y-6 animate-theme-transition">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Company Research Brief</span>
                      <h4 className="text-xl font-bold text-text-darkest mt-1">
                        {job.company_dossier.company_name}
                      </h4>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">Business Overview</span>
                    <p className="mt-1 text-sm leading-relaxed text-text-dark font-normal">
                      {job.company_dossier.business_summary}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block mb-3">Estimated Tech Stack</span>
                      {job.company_dossier.tech_stack.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {job.company_dossier.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-surface-secondary border border-border px-2.5 py-1 text-xs font-medium text-text-primary"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted">No tech stack details specified.</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block mb-3">Culture & Workplace Signals</span>
                      {job.company_dossier.culture_signals.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {job.company_dossier.culture_signals.map((signal) => (
                            <span
                              key={signal}
                              className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-medium text-accent"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted">No culture signals specified.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block">Interview Preparation Tips</span>
                      {job.company_dossier.interview_tips.length > 0 ? (
                        <ul className="list-inside list-disc space-y-1.5 text-sm text-text-dark">
                          {job.company_dossier.interview_tips.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed pl-1">
                              <span className="text-text-secondary">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-text-muted">No specific interview tips available.</p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted block">Strategic Talking Points</span>
                      {job.company_dossier.talking_points.length > 0 ? (
                        <ul className="list-inside list-disc space-y-1.5 text-sm text-text-dark">
                          {job.company_dossier.talking_points.map((point, idx) => (
                            <li key={idx} className="leading-relaxed pl-1">
                              <span className="text-text-secondary">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-text-muted">No specific talking points available.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {skillsData[job.id] ? (
                <div className="mt-4 rounded-2xl border border-border bg-surface-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary mb-3">
                    Skills Breakdown
                    <span className={`ml-2 normal-case ${skillsData[job.id].match_percentage >= 70 ? "text-success" : skillsData[job.id].match_percentage >= 40 ? "text-warning" : "text-error"}`}>
                      {skillsData[job.id].match_percentage}% match
                    </span>
                  </p>
                  {skillsData[job.id].matched_skills.length > 0 ? (
                    <div className="mb-3">
                      <p className="mb-1.5 text-xs font-medium text-text-muted">Matched</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsData[job.id].matched_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {skillsData[job.id].missing_skills.length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-text-muted">Missing</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsData[job.id].missing_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-error/10 px-2.5 py-1 text-xs font-medium text-error">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
