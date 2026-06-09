import { redirect } from "next/navigation";
import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import ProfileAttentionBanner from "./components/ProfileAttentionBanner";
import ProfilePageClient from "./components/ProfilePageClient";
import SignOutButton from "../components/SignOutButton";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasResume = !!profile?.resume_url;
  const hasSkills = !!(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0);
  const hasExperience = !!(profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0);
  const hasEducation = !!(profile?.education && Array.isArray(profile.education) && profile.education.length > 0);
  
  const prefs = profile?.job_preferences as Record<string, any> | null;
  const hasPreferences = !!(prefs && typeof prefs === "object" && prefs.roleTitle);

  return (
    <>
      <AuthenticatedHeader email={user.email} name={user.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 space-y-8">
          
          <div className="rounded-[2rem] border border-border bg-surface p-6 sm:p-10 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Developer Profile</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-text-darkest">Your Profile</h1>
            <p className="mt-2 text-base text-text-secondary">
              Manage your personal info, resumes, integrations, and preferences.
            </p>
          </div>

          <ProfileAttentionBanner
            hasResume={hasResume}
            hasSkills={hasSkills}
            hasExperience={hasExperience}
            hasEducation={hasEducation}
            hasPreferences={hasPreferences}
          />

          <ProfilePageClient userId={user.id} />

          <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Session</p>
            <SignOutButton />
          </div>

        </div>
      </main>
    </>
  );
}
