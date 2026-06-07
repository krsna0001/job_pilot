import Link from "next/link";
import { createInsforgeServer } from "../../lib/insforge-server";
import SignOutButton from "../components/SignOutButton";
import AuthenticatedHeader from "../components/AuthenticatedHeader";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;
  const email = user?.email ?? "Guest";

  let savedCount = 0;
  let recentJobs: { title: string; company: string; status: string }[] = [];

  if (user) {
    const { data: jobs } = await insforge.database
      .from("saved_jobs")
      .select("job_data, status")
      .order("created_at", { ascending: false })
      .limit(5);

    if (jobs) {
      savedCount = jobs.length;
      recentJobs = (jobs as { job_data: { title: string; company: { display_name: string } }; status: string }[]).map(
        (j) => ({
          title: j.job_data.title,
          company: j.job_data.company?.display_name ?? "Unknown",
          status: j.status,
        }),
      );
    }
  }

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Protected path: /dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-text-darkest">Dashboard</h1>
            <p className="mt-3 text-base text-text-secondary">Welcome back, {email}.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Link
              href="/find-jobs"
              className="rounded-[1.75rem] border border-border bg-surface p-6 text-center transition hover:border-accent hover:bg-surface-secondary"
            >
              <p className="text-3xl font-semibold text-text-darkest">{savedCount}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-accent">Saved Jobs</p>
              <p className="mt-4 text-sm text-text-secondary">Search new roles or review your saved jobs.</p>
            </Link>
            <Link
              href="/profile"
              className="rounded-[1.75rem] border border-border bg-surface p-6 text-center transition hover:border-accent hover:bg-surface-secondary"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Profile</p>
              <p className="mt-4 text-sm text-text-secondary">Edit your profile, upload a resume, and keep your info up to date.</p>
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="mt-8 rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Recent Saved Jobs</p>
              <div className="mt-6 space-y-4">
                {recentJobs.map((job, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-text-darkest">{job.title}</p>
                      <p className="text-xs text-text-secondary">{job.company}</p>
                    </div>
                    <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-medium capitalize text-accent">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/find-jobs"
                  className="text-sm font-medium text-accent transition hover:text-accent-dark"
                >
                  View all saved jobs →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
