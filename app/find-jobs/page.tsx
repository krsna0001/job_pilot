import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import JobResults from "./components/JobResults";

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Protected path: /find-jobs</p>
            <h1 className="mt-3 text-4xl font-semibold text-text-darkest">Find Jobs</h1>
            <p className="mt-3 text-base text-text-secondary">
              {user ? `Searching as ${user.email}` : "Sign in to search jobs"}
            </p>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <JobResults />
          </div>
        </div>
      </main>
    </>
  );
}
