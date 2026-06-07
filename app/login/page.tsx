import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createInsforgeServer } from "../../lib/insforge-server";
import LoginCard from "./LoginCard";

// Public path: /login
export default async function LoginPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    console.warn("InsForge auth getCurrentUser error:", error);
  }

  if (data?.user) {
    redirect("/profile");
  }

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-6">
          <Link href="/" className="flex items-center gap-3 text-text-darkest transition hover:text-accent">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-accent text-accent-foreground">
              <Image src="/logo.png" alt="JobPilot logo" fill className="object-contain scale-75" sizes="44px" />
            </div>
            <span className="text-base font-semibold">JobPilot</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
          >
            Back to homepage
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-10 shadow-xl sm:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-accent-light/80 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-accent">
                Quick login for returning users
              </div>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-text-darkest sm:text-6xl">
                  Access your JobPilot account faster in the browser.
                </h1>
                <p className="max-w-2xl text-base font-medium leading-8 text-text-secondary">
                  Choose the provider you already use and sign in immediately without extra password steps.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#login-card"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-accent-dark"
                >
                  Quick login panel below
                </a>
                <Link
                  href="/find-jobs"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-surface-secondary"
                >
                  Explore as a guest
                </Link>
              </div>
            </div>

            <LoginCard />
          </div>
        </section>
      </div>
    </main>
  );
}
