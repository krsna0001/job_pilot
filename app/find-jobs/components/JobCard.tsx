'use client';

import { capture } from "@/lib/posthog";

export interface Job {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  redirect_url: string;
  created: string;
  adref: string;
}

interface JobCardProps {
  job: Job;
  onSave: (job: Job) => void;
  onUnsave: (jobId: string) => void;
  isSaved: boolean;
  isSaving: boolean;
}

export default function JobCard({ job, onSave, onUnsave, isSaved, isSaving }: JobCardProps) {
  const salary =
    job.salary_min && job.salary_max
      ? `£${(job.salary_min / 1000).toFixed(0)}k - £${(job.salary_max / 1000).toFixed(0)}k`
      : job.salary_min
        ? `From £${(job.salary_min / 1000).toFixed(0)}k`
        : "Salary not listed";

  const posted = new Date(job.created).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleToggleSave = () => {
    if (isSaved) {
      capture("job_unsaved", { job_id: job.id, title: job.title });
      onUnsave(job.id);
    } else {
      capture("job_saved", { job_id: job.id, title: job.title, company: job.company.display_name });
      onSave(job);
    }
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-text-darkest">{job.title}</h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">{job.company.display_name}</p>
          <p className="mt-0.5 text-xs text-text-muted">{job.location.display_name}</p>
        </div>
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isSaved
              ? "bg-accent-light text-accent hover:bg-accent hover:text-accent-foreground"
              : "border border-border bg-surface text-text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-text-dark">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
        <span className="font-medium text-text-primary">{salary}</span>
        <span>Posted {posted}</span>
        <a
          href={job.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto font-medium text-accent transition hover:text-accent-dark"
        >
          View on Adzuna →
        </a>
      </div>
    </div>
  );
}
