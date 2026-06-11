import Link from "next/link";
import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";

interface SavedJobRow {
  job_data: {
    title: string;
    company: { display_name: string };
    location?: { display_name?: string };
    salary_min?: number;
    salary_max?: number;
    description?: string;
  };
  status: string;
  match_score: number | null;
  created_at: string;
}

function SalaryBar({ min, max, overallMin, overallMax }: { min: number; max: number; overallMin: number; overallMax: number }) {
  const range = overallMax - overallMin || 1;
  const left = ((min - overallMin) / range) * 100;
  const width = ((max - min) / range) * 100;
  return (
    <div className="relative h-2 w-full rounded-full bg-border-light">
      <div
        className="absolute h-full rounded-full bg-accent"
        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
      />
    </div>
  );
}

export default async function SalaryInsightsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  let salaryJobs: SavedJobRow[] = [];
  let roleGroups: Record<string, { salaries: { min: number; max: number }[]; count: number }> = {};

  if (user) {
    const { data: jobs } = await insforge.database
      .from("saved_jobs")
      .select("job_data, status, match_score, created_at");

    if (jobs) {
      const rows = jobs as SavedJobRow[];
      salaryJobs = rows.filter((j) => j.job_data.salary_min && j.job_data.salary_max);

      for (const job of salaryJobs) {
        const title = job.job_data.title;
        const category = title.split(" ").slice(0, 2).join(" ");
        if (!roleGroups[category]) roleGroups[category] = { salaries: [], count: 0 };
        roleGroups[category].salaries.push({
          min: job.job_data.salary_min!,
          max: job.job_data.salary_max!,
        });
        roleGroups[category].count++;
      }
    }
  }

  const allMins = salaryJobs.map((j) => j.job_data.salary_min!);
  const allMaxs = salaryJobs.map((j) => j.job_data.salary_max!);
  const overallMin = allMins.length > 0 ? Math.min(...allMins) : 0;
  const overallMax = allMaxs.length > 0 ? Math.max(...allMaxs) : 1;
  const avgSalary = salaryJobs.length > 0
    ? Math.round(salaryJobs.reduce((s, j) => s + (j.job_data.salary_min! + j.job_data.salary_max!) / 2, 0) / salaryJobs.length)
    : 0;

  const roleInsights = Object.entries(roleGroups)
    .map(([role, data]) => {
      const avg = Math.round(data.salaries.reduce((s, r) => s + (r.min + r.max) / 2, 0) / data.salaries.length);
      const min = Math.min(...data.salaries.map((r) => r.min));
      const max = Math.max(...data.salaries.map((r) => r.max));
      return { role, count: data.count, avg, min, max };
    })
    .sort((a, b) => b.count - a.count);

  if (error) console.warn("Auth error:", error);

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
          <div className="mb-8">
            <Link href="/dashboard" className="text-sm text-accent hover:text-accent-dark transition-colors inline-flex items-center gap-1">← Dashboard</Link>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-darkest mt-2">Salary Insights</h1>
            <p className="mt-2 text-sm text-text-secondary">Analyze salary ranges across your saved job listings.</p>
          </div>

          {salaryJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-sm">No salary data available yet. Save jobs with salary information to see insights.</p>
              <Link
                href="/find-jobs"
                className="mt-4 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-accent-dark shadow-sm"
              >
                Find Jobs
              </Link>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm text-center animate-fade-in-up delay-1">
                  <p className="text-2xl font-bold text-accent">${(avgSalary / 1000).toFixed(0)}k</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted">Average Salary</p>
                  <p className="mt-2 text-xs text-text-secondary">Across {salaryJobs.length} listings</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm text-center animate-fade-in-up delay-2">
                  <p className="text-2xl font-bold text-text-darkest">${(overallMin / 1000).toFixed(0)}k</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted">Lowest</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm text-center animate-fade-in-up delay-3">
                  <p className="text-2xl font-bold text-text-darkest">${(overallMax / 1000).toFixed(0)}k</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] font-semibold text-text-muted">Highest</p>
                </div>
              </div>

              {/* Salary Range Overview */}
              <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm mb-6 animate-fade-in-up delay-3">
                <h3 className="text-sm font-semibold text-text-darkest mb-5">Salary Range Overview</h3>
                <div className="relative mb-5">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <span>${(overallMin / 1000).toFixed(0)}k</span>
                    <span>${(overallMax / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="space-y-2">
                    {salaryJobs.slice(0, 15).map((job, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-36 sm:w-40 truncate text-xs font-medium text-text-secondary">{job.job_data.title}</span>
                        <div className="flex-1">
                          <SalaryBar
                            min={job.job_data.salary_min!}
                            max={job.job_data.salary_max!}
                            overallMin={overallMin}
                            overallMax={overallMax}
                          />
                        </div>
                        <span className="w-20 text-right text-xs font-semibold text-text-darkest shrink-0">
                          ${(job.job_data.salary_min! / 1000).toFixed(0)}k - ${(job.job_data.salary_max! / 1000).toFixed(0)}k
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By Role Category */}
              {roleInsights.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm mb-6 animate-fade-in-up delay-4">
                  <h3 className="text-sm font-semibold text-text-darkest mb-5">Salary by Role</h3>
                  <div className="space-y-3">
                    {roleInsights.map((r) => (
                      <div key={r.role} className="rounded-lg border border-border bg-surface-muted p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-text-darkest">{r.role}</p>
                            <p className="text-xs text-text-muted">{r.count} job{r.count !== 1 ? "s" : ""}</p>
                          </div>
                          <p className="text-lg font-bold text-accent">${(r.avg / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span>Min: ${(r.min / 1000).toFixed(0)}k</span>
                          <span className="text-border">|</span>
                          <span>Max: ${(r.max / 1000).toFixed(0)}k</span>
                          <span className="text-border">|</span>
                          <span>Range: ${((r.max - r.min) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All listings */}
              <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm animate-fade-in-up delay-5">
                <h3 className="text-sm font-semibold text-text-darkest mb-4">All Salary Listings</h3>
                <div className="space-y-1.5">
                  {salaryJobs.map((job, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-muted">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-darkest truncate">{job.job_data.title}</p>
                        <p className="text-xs text-text-secondary">{job.job_data.company?.display_name}</p>
                      </div>
                      <span className="text-sm font-semibold text-text-darkest shrink-0 ml-4">
                        ${(job.job_data.salary_min! / 1000).toFixed(0)}k - ${(job.job_data.salary_max! / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
