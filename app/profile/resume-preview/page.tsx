import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import ResumePreviewClient from "./ResumePreviewClient";

export default async function ResumePreviewPage() {
  const insforge = await createInsforgeServer();
  const { data: userData, error: authError } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch complete profile details
  const { data: profile, error: dbError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dbError) {
    console.error("Failed to load profile for resume:", dbError);
  }

  // Fallback to empty details if profile doesn't exist
  const resumeProfile = profile || {
    name: user.profile?.name || "",
    headline: "",
    bio: "",
    skills: [],
    experience: [],
    education: [],
    github_url: "",
    linkedin_url: "",
  };

  return (
    <ResumePreviewClient
      user={{ email: user.email }}
      profile={resumeProfile}
    />
  );
}
