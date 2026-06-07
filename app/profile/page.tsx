import Link from "next/link";
import { createInsforgeServer } from "../../lib/insforge-server";
import SignOutButton from "../components/SignOutButton";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import ResumeUpload from "./components/ResumeUpload";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;
  const userName = user?.profile?.name ?? user?.email ?? "Not set";

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Your Account</p>
            <h1 className="mt-3 text-4xl font-semibold text-text-darkest">Profile</h1>
            <p className="mt-3 text-base text-text-secondary">
              {user ? `Welcome, ${user.email}` : "No user session found."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Account Information</p>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-text-darkest">Full Name</p>
                    <p className="mt-2 text-base text-text-secondary">{userName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-darkest">Email Address</p>
                    <p className="mt-2 text-base text-text-secondary">{user?.email ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-darkest">User ID</p>
                    <p className="mt-2 text-base font-mono text-text-secondary text-xs">{user?.id ?? "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <ResumeUpload userId={user?.id ?? ""} />
              </div>

              <div className="border-t border-border pt-8">
                <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">Session Management</p>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
