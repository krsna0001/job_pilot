'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import { getCurrencySymbol } from "@/lib/currency";
import { ProgressRing } from "@/app/components/DonutChart";

interface SkillsBreakdown {
  job_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
}

import { CompanyDossier } from "@/types/dossier";
import { CompanyResearch } from "./CompanyResearch";
import { ResearchCompanyButton } from "./ResearchCompanyButton";

interface JobDetail {
  source_id: string;
  source: string;
  title: string;
  company_name: string;
  location?: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  url?: string;
  raw_data?: any;
  match_score?: number | null;
  skills_breakdown?: any;
  company_research?: any;
  match_reasoning?: string | null;
}

interface JobDetailsClientProps {
  job: JobDetail | null;
  jobId: string;
  user: { email?: string; profile?: { name?: string } | null; id?: string } | null;
  initialIsSaved: boolean;
  initialSavedJobId: string | null;
  initialStatus: string;
  initialMatchScore: number | null;
  initialMatchReasoning: string | null;
  initialCompanyResearch: CompanyDossier | null;
}

const TRACKING_STATUSES = ["saved", "applied", "interviewing", "rejected"] as const;

export default function JobDetailsClient({
  job: initialJob,
  jobId,
  user,
  initialIsSaved,
  initialSavedJobId,
  initialStatus,
  initialMatchScore,
  initialMatchReasoning,
  initialCompanyResearch,
}: JobDetailsClientProps) {
  const [job, setJob] = useState<JobDetail | null>(initialJob);

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text-darkest">Job Not Found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          We couldn't find the details for this job. It may have expired or is not cached.
        </p>
        <div className="mt-6">
          <Link
            href="/find-jobs"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark shadow-sm hover:shadow"
          >
            Back to Find Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <JobDetailsContent 
      job={job}
      user={user}
      initialIsSaved={initialIsSaved}
      initialSavedJobId={initialSavedJobId}
      initialStatus={initialStatus}
      initialMatchScore={initialMatchScore}
      initialMatchReasoning={initialMatchReasoning}
      initialCompanyResearch={initialCompanyResearch}
    />
  );
}

function JobDetailsContent({
  job,
  user,
  initialIsSaved,
  initialSavedJobId,
  initialStatus,
  initialMatchScore,
  initialMatchReasoning,
  initialCompanyResearch,
}: Omit<JobDetailsClientProps, "jobId"> & { job: JobDetail }) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [savedJobId, setSavedJobId] = useState<string | null>(initialSavedJobId);
  const [status, setStatus] = useState(initialStatus);
  const [matchScore, setMatchScore] = useState<number | null>(initialMatchScore);
  const [matchReasoning, setMatchReasoning] = useState<string | null>(initialMatchReasoning);
  const [companyResearch, setCompanyResearch] = useState<CompanyDossier | null>(initialCompanyResearch);

  // Parse initial skills breakdown from jobs table if it matches schema
  const getInitialSkills = (): SkillsBreakdown | null => {
    if (job.skills_breakdown && !Array.isArray(job.skills_breakdown) && job.skills_breakdown.job_skills) {
      return job.skills_breakdown as SkillsBreakdown;
    }
    return null;
  };
  const [skillsBreakdown, setSkillsBreakdown] = useState<SkillsBreakdown | null>(getInitialSkills());

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [isResearchingCompany, setIsResearchingCompany] = useState(false);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyResult, setAutoApplyResult] = useState<{
    cover_letter: string;
    talking_points: string[];
    suggested_answers: { question: string; answer: string }[];
    key_skills: string[];
  } | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [isQuickApplying, setIsQuickApplying] = useState(false);
  const [quickApplyCoverLetter, setQuickApplyCoverLetter] = useState<string | null>(null);
  const [isOptimizingResume, setIsOptimizingResume] = useState(false);
  const [resumeTips, setResumeTips] = useState<any>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [standaloneCoverLetter, setStandaloneCoverLetter] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accordion states
  const [isDossierExpanded, setIsDossierExpanded] = useState(true);

  // Currency rendering
  const activeCurrency = job.location ? getCurrencySymbol(job.location) : "£";
  const salaryText =
    job.salary_min && job.salary_max
      ? `${activeCurrency}${(job.salary_min / 1000).toFixed(0)}k - ${activeCurrency}${(job.salary_max / 1000).toFixed(0)}k`
      : job.salary_min
        ? `From ${activeCurrency}${(job.salary_min / 1000).toFixed(0)}k`
        : "Salary not listed";

  const postedDate = job.raw_data?.created
    ? new Date(job.raw_data.created).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const getJobType = () => {
    const ct = job.raw_data?.contract_time || job.raw_data?.contract_type;
    if (!ct) return "Full Time";
    return ct.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return { bg: "bg-surface-muted", text: "text-text-muted" };
    if (score >= 80) return { bg: "bg-[#10b981]/10", text: "text-[#10b981]" };
    if (score >= 60) return { bg: "bg-[#3b82f6]/10", text: "text-[#3b82f6]" };
    return { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]" };
  };

  const getAdzunaUrl = () => {
    if (job.url) return job.url;
    if (job.raw_data?.redirect_url) return job.raw_data.redirect_url;
    if (job.raw_data?.url) return job.raw_data.url;
    if (typeof job.raw_data === 'string') {
      try {
        const parsed = JSON.parse(job.raw_data);
        if (parsed.redirect_url) return parsed.redirect_url;
      } catch (e) {}
    }
    return null;
  };
  const adzunaUrl = getAdzunaUrl();

  // Trigger all AI services for a saved job
  const triggerAllAnalysis = async (dbSavedJobId: string) => {
    // 1. Match Score
    setIsScoring(true);
    fetch("/api/score-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedJobId: dbSavedJobId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.score !== undefined) {
          setMatchScore(data.score);
        }
        if (data.reasoning) {
          setMatchReasoning(data.reasoning);
        }
      })
      .catch((err) => console.error("Error fetching match score:", err))
      .finally(() => setIsScoring(false));

    // 2. Skills Breakdown
    setIsExtractingSkills(true);
    fetch("/api/extract-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedJobId: dbSavedJobId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.job_skills) {
          setSkillsBreakdown(data);
        }
      })
      .catch((err) => console.error("Error fetching skills:", err))
      .finally(() => setIsExtractingSkills(false));

    // 3. Company Dossier
    setIsResearchingCompany(true);
    fetch("/api/agent/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedJobId: dbSavedJobId, jobId: job.source_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setCompanyResearch(data);
        }
      })
      .catch((err) => console.error("Error researching company:", err))
      .finally(() => setIsResearchingCompany(false));
  };

  const handleSaveToggle = async () => {
    if (!user) {
      alert("Please sign in to save jobs.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    if (isSaved && savedJobId) {
      // Unsave
      const { error } = await insforge.database
        .from("saved_jobs")
        .delete()
        .eq("id", savedJobId);

      if (error) {
        setErrorMessage("Failed to unsave job. Please try again.");
      } else {
        setIsSaved(false);
        setSavedJobId(null);
        capture("job_unsaved", { job_id: job.source_id, title: job.title });
      }
    } else {
      // Save
      const rawJobData = job.raw_data || {
        id: job.source_id,
        title: job.title,
        company: { display_name: job.company_name },
        location: { display_name: job.location || "Remote" },
        description: job.description,
        redirect_url: job.url || "",
        created: new Date().toISOString(),
        adref: job.source === "mock" ? "mock" : "adzuna",
      };

      const { data, error } = await insforge.database
        .from("saved_jobs")
        .insert([{ job_data: rawJobData, user_id: user.id }])
        .select()
        .single();

      if (error || !data) {
        setErrorMessage("Failed to save job. Please try again.");
      } else {
        setIsSaved(true);
        setSavedJobId(data.id);
        setStatus("saved");
        capture("job_saved", { job_id: job.source_id, title: job.title, company: job.company_name });
        
        // Auto trigger AI enrichments on first save
        await triggerAllAnalysis(data.id);
      }
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!savedJobId) return;
    setIsUpdatingStatus(true);
    const { error } = await insforge.database
      .from("saved_jobs")
      .update({ status: newStatus })
      .eq("id", savedJobId);

    if (error) {
      setErrorMessage("Failed to update status.");
    } else {
      setStatus(newStatus);
    }
    setIsUpdatingStatus(false);
  };

  const ensureSavedAndGetId = async (): Promise<string | null> => {
    if (savedJobId) return savedJobId;
    if (!user) {
      setErrorMessage("Please sign in to save jobs and use AI features.");
      return null;
    }

    const rawJobData = job.raw_data || {
      id: job.source_id,
      title: job.title,
      company: { display_name: job.company_name },
      location: { display_name: job.location || "Remote" },
      description: job.description,
      redirect_url: adzunaUrl || "",
      created: new Date().toISOString(),
      adref: job.source === "mock" ? "mock" : "adzuna",
    };

    const { data, error } = await insforge.database
      .from("saved_jobs")
      .insert([{ job_data: rawJobData, user_id: user.id }])
      .select()
      .single();

    if (error || !data) {
      setErrorMessage("Failed to auto-save job for AI analysis.");
      return null;
    }

    setIsSaved(true);
    setSavedJobId(data.id);
    setStatus("saved");
    capture("job_saved_auto", { job_id: job.source_id, title: job.title });
    return data.id;
  };

  const runMatchScoring = async () => {
    setIsScoring(true);
    const targetId = await ensureSavedAndGetId();
    if (!targetId) {
      setIsScoring(false);
      return;
    }
    try {
      const res = await fetch("/api/score-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: targetId }),
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setMatchScore(data.score);
      }
      if (data.reasoning) {
        setMatchReasoning(data.reasoning);
      }
    } catch {
      setErrorMessage("Failed to calculate match score.");
    }
    setIsScoring(false);
  };

  const runSkillsAnalysis = async () => {
    setIsExtractingSkills(true);
    const targetId = await ensureSavedAndGetId();
    if (!targetId) {
      setIsExtractingSkills(false);
      return;
    }
    try {
      const res = await fetch("/api/extract-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: targetId }),
      });
      const data = await res.json();
      if (data.job_skills) {
        setSkillsBreakdown(data);
      }
    } catch {
      setErrorMessage("Failed to analyze skills.");
    }
    setIsExtractingSkills(false);
  };

  const runCompanyResearch = async () => {
    setIsResearchingCompany(true);
    const targetId = await ensureSavedAndGetId();
    if (!targetId) {
      setIsResearchingCompany(false);
      return;
    }
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId: targetId, jobId: job.source_id }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setCompanyResearch(data);
        capture("company_researched", { user_id: user?.id, job_id: job.source_id, company: job.company_name });
      }
    } catch {
      setErrorMessage("Failed to research company.");
    }
    setIsResearchingCompany(false);
  };

  const runAutoApply = async () => {
    if (!savedJobId) return;
    setIsAutoApplying(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        setAutoApplyResult(data);
        setShowCoverLetter(true);
        setStatus("applied");
      }
    } catch {
      setErrorMessage("Auto-apply failed. Please try again.");
    }
    setIsAutoApplying(false);
  };

  const runQuickApply = async () => {
    if (!user || !adzunaUrl) return;
    setIsQuickApplying(true);
    setErrorMessage(null);

    if (!savedJobId) {
      const rawJobData = {
        id: job.source_id,
        title: job.title,
        company: { display_name: job.company_name },
        location: { display_name: job.location || "Remote" },
        description: job.description,
        redirect_url: job.url || "",
        created: new Date().toISOString(),
        adref: job.source === "mock" ? "mock" : "adzuna",
      };
      const { data: saved } = await insforge.database
        .from("saved_jobs")
        .insert([{ job_data: rawJobData, user_id: user.id, status: "applied" }])
        .select()
        .single();

      if (saved) {
        setSavedJobId(saved.id);
        setIsSaved(true);
        setStatus("applied");

        const res = await fetch("/api/cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ savedJobId: saved.id }),
        });
        const data = await res.json();
        if (data.cover_letter) setQuickApplyCoverLetter(data.cover_letter);
        window.open(adzunaUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      await insforge.database.from("saved_jobs").update({ status: "applied" }).eq("id", savedJobId);
      setStatus("applied");

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId }),
      });
      const data = await res.json();
      if (data.cover_letter) setQuickApplyCoverLetter(data.cover_letter);
      window.open(adzunaUrl, "_blank", "noopener,noreferrer");
    }
    setIsQuickApplying(false);
  };

  const runResumeOptimize = async () => {
    if (!savedJobId) return;
    setIsOptimizingResume(true);
    try {
      const res = await fetch("/api/resume-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId }),
      });
      const data = await res.json();
      if (!data.error) setResumeTips(data);
    } catch { }
    setIsOptimizingResume(false);
  };

  const runCoverLetterGen = async () => {
    if (!savedJobId) return;
    setIsGeneratingCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedJobId }),
      });
      const data = await res.json();
      if (data.cover_letter) setStandaloneCoverLetter(data.cover_letter);
    } catch { }
    setIsGeneratingCoverLetter(false);
  };

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 animate-fade-in pb-24">
      {/* Back Link */}
      <Link href="/find-jobs" className="group inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </Link>

      {errorMessage && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error animate-fade-in-down">
          {errorMessage}
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-muted border border-border">
             <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-darkest tracking-tight">{job.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary">{job.company_name}</span>
              <span className="text-text-muted">•</span>
              {matchScore !== null ? (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getScoreColor(matchScore).bg} ${getScoreColor(matchScore).text}`}>
                  {matchScore}% Match Score
                </span>
              ) : (
                <button onClick={runMatchScoring} className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary hover:text-accent transition">
                  {isScoring ? "Scoring..." : "Get Match Score"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
              isSaved
                ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
                : "border-border bg-surface text-text-darkest hover:border-text-muted"
            }`}
          >
            {isSaving ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            ) : isSaved ? (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                Saved
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                Save Job
              </>
            )}
          </button>
          <a href={adzunaUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-darkest transition hover:border-text-muted">
            <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Job
          </a>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Salary */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">{salaryText}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Salary Est.</p>
           </div>
        </div>
        {/* Location */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate" title={job.location || "Remote"}>{job.location || "Remote"}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Location</p>
           </div>
        </div>
        {/* Job Type */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">{getJobType()}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Job Type</p>
           </div>
        </div>
        {/* Date Found */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted border border-border text-text-secondary shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">{postedDate}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Date Found</p>
           </div>
        </div>
      </div>

      {/* AI MATCH REASONING Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success/10 text-success shrink-0">
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
               </svg>
            </div>
            <span className="text-xs uppercase tracking-[0.1em] font-semibold text-text-secondary">AI Match Reasoning</span>
         </div>
         <p className="text-sm text-text-darkest leading-relaxed font-medium">
            {matchReasoning 
              ? matchReasoning 
              : skillsBreakdown 
                ? `The candidate possesses a strong background matching ${skillsBreakdown.match_percentage}% of the job's technical requirements. ${skillsBreakdown.matched_skills.length > 0 ? `They have expertise in ${skillsBreakdown.matched_skills.slice(0, 4).join(", ")}, aligning well with the role.` : ''} ${skillsBreakdown.missing_skills.length > 0 ? `However, a lack of explicit experience in ${skillsBreakdown.missing_skills.slice(0, 2).join(", ")} represents a gap in the job's demands.` : ''}` 
                : "AI reasoning not available. Click 'Get Match Score' or 'Analyze Skills' to generate."}
         </p>
      </div>

      {/* REQUIRED SKILLS VS YOUR PROFILE Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="mb-6">
            <span className="text-xs uppercase tracking-[0.1em] font-semibold text-text-secondary">Required Skills vs Your Profile</span>
         </div>
         
         {!skillsBreakdown ? (
            <div className="text-center py-4">
               <p className="text-sm text-text-secondary mb-3">Analyze the job requirements against your parsed skills.</p>
               <button onClick={runSkillsAnalysis} disabled={isExtractingSkills} className="rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-darkest hover:border-accent hover:text-accent transition shadow-sm">
                  {isExtractingSkills ? "Analyzing..." : "Analyze Skills"}
               </button>
            </div>
         ) : (
            <div className="space-y-6">
               <div>
                  <p className="text-[11px] font-semibold text-text-muted mb-2">You have</p>
                  <div className="flex flex-wrap gap-2">
                     {skillsBreakdown.matched_skills.length > 0 ? skillsBreakdown.matched_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                           {skill}
                        </span>
                     )) : <span className="text-sm text-text-secondary">None found</span>}
                  </div>
               </div>
               <div>
                  <p className="text-[11px] font-semibold text-text-muted mb-2">Gap skills</p>
                  <div className="flex flex-wrap gap-2">
                     {skillsBreakdown.missing_skills.length > 0 ? skillsBreakdown.missing_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                           {skill}
                        </span>
                     )) : <span className="text-sm text-text-secondary">No gap skills!</span>}
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Job Description Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-muted border border-border text-text-secondary shrink-0">
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-darkest">Job Description</h2>
         </div>
         <div 
           className="text-sm text-text-darkest leading-relaxed [&>p]:mb-4 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>li]:mb-1 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>a]:text-accent [&>a]:underline hover:[&>a]:text-accent-dark [&>br]:mb-2"
           dangerouslySetInnerHTML={{ __html: job.description }}
         />
      </div>

      {/* Company Research Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
               <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
               </div>
               <h2 className="text-sm font-semibold text-text-darkest">Company Research</h2>
            </div>
            {!companyResearch && (
               <ResearchCompanyButton 
                 isResearchingCompany={isResearchingCompany} 
                 runCompanyResearch={runCompanyResearch} 
               />
            )}
         </div>
         
         <CompanyResearch companyDossier={companyResearch} companyName={job.company_name} />
      </div>

      {/* Sticky Bottom Apply Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/80 backdrop-blur-xl p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
         <div className="mx-auto max-w-4xl flex items-center justify-center gap-4">
            {adzunaUrl ? (
               <>
                 <button 
                   onClick={runQuickApply}
                   disabled={isQuickApplying}
                   className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent-dark transition disabled:opacity-50"
                 >
                   {isQuickApplying ? (
                     <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                   ) : "⚡ Quick Apply"}
                 </button>
                 <a href={adzunaUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-text-darkest shadow-sm hover:border-text-muted transition">
                    Standard Apply
                 </a>
               </>
            ) : (
               <button disabled className="w-full text-center rounded-xl bg-accent/50 px-6 py-3.5 text-sm font-semibold text-accent-foreground cursor-not-allowed">
                  Application Link Unavailable
               </button>
            )}
         </div>
      </div>
    </div>
  );
}