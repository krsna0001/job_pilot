import { createInsforgeServer } from "@/lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import SavedJobsList from "./SavedJobsList";

export default async function SavedJobsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  let savedJobs: {
    id: string;
    job_data: { title: string; company: { display_name: string }; description: string; redirect_url: string; created: string; location: { display_name: string } };
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
  }[] = [];

  if (user) {
    const { data: jobs } = await insforge.database
      .from("saved_jobs")
      .select("id, job_data, status, match_score, company_dossier, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (jobs) {
      savedJobs = jobs as typeof savedJobs;
    }
  }

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16">
          <div className="mb-8 rounded-[2rem] border border-border bg-surface p-6 sm:p-10 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Job Tracking</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-text-darkest">Saved Jobs</h1>
            <p className="mt-3 text-base text-text-secondary">
              Track your applications and update status as you progress.
            </p>
          </div>
          <SavedJobsList initialJobs={savedJobs} />
        </div>
      </main>
    </>
  );
}
