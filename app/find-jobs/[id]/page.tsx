import { createInsforgeServer } from "../../../lib/insforge-server";
import AuthenticatedHeader from "../../components/AuthenticatedHeader";
import JobDetailsClient from "./JobDetailsClient";
import Link from "next/link";

interface PageParams {
  params: {
    id: string;
  };
}

export default async function JobDetailsPage({ params }: PageParams) {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  const { id } = params;

  // 1. Fetch from jobs table (source_id = id)
  const { data: job } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("source_id", id)
    .maybeSingle();

  let displayJob = job;

  // 2. Fallback to saved_jobs if not found in master catalog
  if (!displayJob) {
    const { data: savedJob } = await insforge.database
      .from("saved_jobs")
      .select("*")
      .eq("job_data->>id", id)
      .maybeSingle();

    if (savedJob) {
      displayJob = {
        source_id: id,
        source: savedJob.job_data.adref === "mock" ? "mock" : "adzuna",
        title: savedJob.job_data.title,
        company_name: savedJob.job_data.company?.display_name || "",
        location: savedJob.job_data.location?.display_name || "",
        description: savedJob.job_data.description,
        salary_min: savedJob.job_data.salary_min || null,
        salary_max: savedJob.job_data.salary_max || null,
        salary_currency: "GBP",
        url: savedJob.job_data.redirect_url,
        raw_data: savedJob.job_data,
        match_score: savedJob.match_score,
        company_research: savedJob.company_research,
      };
    }
  }

  // 3. Check if user has saved this job
  let isSaved = false;
  let savedJobId = null;
  let currentStatus = "saved";
  let matchScore = displayJob?.match_score || null;
  let matchReasoning = displayJob?.match_reasoning || null;
  let companyResearch = displayJob?.company_research || null;

  if (user && displayJob) {
    const { data: savedJob } = await insforge.database
      .from("saved_jobs")
      .select("id, status, match_score, match_reasoning, company_research")
      .eq("job_data->>id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (savedJob) {
      isSaved = true;
      savedJobId = savedJob.id;
      currentStatus = savedJob.status;
      if (savedJob.match_score !== null && savedJob.match_score !== undefined) {
        matchScore = savedJob.match_score;
      }
      if (savedJob.match_reasoning) {
        matchReasoning = savedJob.match_reasoning;
      }
      if (savedJob.company_research) {
        companyResearch = savedJob.company_research;
      }
    }
  }

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <JobDetailsClient
            job={displayJob}
            jobId={id}
            user={user}
            initialIsSaved={isSaved}
            initialSavedJobId={savedJobId}
            initialStatus={currentStatus}
            initialMatchScore={matchScore}
            initialMatchReasoning={matchReasoning}
            initialCompanyResearch={companyResearch}
          />
        </div>
      </main>
    </>
  );
}
