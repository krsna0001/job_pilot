import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import SearchDashboard from "./components/SearchDashboard";

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  let savedCount = 0;
  let statusCounts = { saved: 0, applied: 0, interviewing: 0 };
  let initialSavedIds: string[] = [];
  let initialProfileLocations: string[] = [];
  let initialCountry = "";
  let initialCity = "";
  let initialRemotePref = "onsite";

  if (user) {
    const { data: jobs } = await insforge.database
      .from("saved_jobs")
      .select("job_data, status")
      .eq("user_id", user.id);

    if (jobs) {
      savedCount = jobs.length;
      initialSavedIds = jobs.map((j: { job_data: { id: string } }) => j.job_data.id);
      statusCounts = {
        saved: jobs.filter((j: { status?: string }) => !j.status || j.status === "saved").length,
        applied: jobs.filter((j: { status?: string }) => j.status === "applied").length,
        interviewing: jobs.filter((j: { status?: string }) => j.status === "interviewing").length,
      };
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("job_preferences, country, city, remote_preference")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      initialCountry = profile.country || "";
      initialCity = profile.city || "";
      initialRemotePref = profile.remote_preference || "onsite";

      const prefs = profile.job_preferences as { locations?: string[] } | null;
      if (prefs && Array.isArray(prefs.locations)) {
        initialProfileLocations = prefs.locations;
      }
    }
  }

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <SearchDashboard
            user={user}
            initialSavedCount={savedCount}
            initialStatusCounts={statusCounts}
            initialSavedIds={initialSavedIds}
            initialProfileLocations={initialProfileLocations}
            initialCountry={initialCountry}
            initialCity={initialCity}
            initialRemotePref={initialRemotePref}
          />
        </div>
      </main>
    </>
  );
}
