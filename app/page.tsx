import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Find Jobs", href: "/find-jobs" },
  { title: "Profile", href: "/profile" },
];

function Home() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-col items-start justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-accent text-accent-foreground">
              <Image
                src="/logo.png"
                alt="JobPilot logo"
                fill
                className="object-cover object-left"
                sizes="44px"
              />
            </div>
            <span className="text-lg font-semibold text-text-darkest">JobPilot</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4">
                      <nav className="hidden items-center gap-8 text-sm font-medium text-text-dark sm:flex">
                        {navItems.map((item) => (
                          <Link key={item.title} href={item.href} className="transition hover:text-accent">
                            {item.title}
                          </Link>
                        ))}
                      </nav>
                      <ThemeToggle />
                      <Link
              href="/login"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            >
              Start for free
            </Link>
          </div>
        </header>

        <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-border bg-surface p-8 shadow-xl sm:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-accent-light/80 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-accent">
                AI-powered job search for developers
              </div>
              <div className="space-y-6">
                <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-text-darkest sm:text-6xl">
                  Job hunting is hard. Your tools shouldn't be.
                </h1>
                <p className="max-w-xl text-base font-medium leading-8 text-text-secondary">
                  Stop scrolling through endless job boards. JobPilot finds the best roles, scores each match, and researches companies so you can apply with confidence.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition transform hover:-translate-y-0.5 hover:shadow-lg hover:bg-accent-dark"
                >
                  Get Started
                </Link>
                <Link
                  href="/find-jobs"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary transition transform hover:-translate-y-0.5 hover:shadow-lg hover:bg-surface-secondary"
                >
                  Find Your First Match
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border bg-surface p-4 text-center shadow-sm">
                  <p className="text-3xl font-semibold text-text-darkest">8x</p>
                  <p className="text-sm text-text-secondary">Faster job discovery</p>
                </div>
                <div className="rounded-3xl border border-border bg-surface p-4 text-center shadow-sm">
                  <p className="text-3xl font-semibold text-text-darkest">92%</p>
                  <p className="text-sm text-text-secondary">Match accuracy</p>
                </div>
                <div className="rounded-3xl border border-border bg-surface p-4 text-center shadow-sm">
                  <p className="text-3xl font-semibold text-text-darkest">100+</p>
                  <p className="text-sm text-text-secondary">Company dossiers generated</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-surface-secondary p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                <span>jobpilot.ai/dashboard</span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                  Preview
                </span>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-surface">
                <Image
                  src="/images/dashboard-demo.png"
                  alt="Dashboard preview"
                  width={740}
                  height={530}
                  className="block w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-8">
            <div className="max-w-xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                Built for busy developers
              </p>
              <h2 className="text-3xl font-semibold text-text-darkest sm:text-4xl">
                One workflow for search, match, and research.
              </h2>
              <p className="text-base font-medium leading-7 text-text-secondary">
                Save time with a single AI assistant that scores your fit, highlights strengths, and compiles company research before you even open the application.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  Discover jobs
                </p>
                <p className="mt-3 text-base font-medium text-text-dark">
                  Search Adzuna IT roles by title and location, then review the strongest matches instantly.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  Match score
                </p>
                <p className="mt-3 text-base font-medium text-text-dark">
                  Every job includes a match score, skills breakdown, and AI reasoning so you know exactly why it suits you.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  Company research
                </p>
                <p className="mt-3 text-base font-medium text-text-dark">
                  Generate structured company dossiers from public pages to understand the role, culture, and interview talking points.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  One-click focus
                </p>
                <p className="mt-3 text-base font-medium text-text-dark">
                  Keep your job hunt organized with a clean dashboard, recent activity, and intelligent data at every step.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
            <Image
              src="/images/jobs-lists.png"
              alt="Job list preview"
              width={760}
              height={610}
              className="block w-full"
            />
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="mb-6 rounded-3xl border border-border bg-surface-secondary p-6">
              <div className="mb-4 flex items-center gap-3 text-sm text-text-secondary">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                Agent Research Workflow
              </div>
              <div className="overflow-hidden rounded-3xl border border-border bg-surface">
                <Image
                  src="/images/agnet-log.png"
                  alt="Company research agent preview"
                  width={720}
                  height={420}
                  className="block w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                Research smarter
              </p>
              <h3 className="text-3xl font-semibold text-text-darkest">
                Company insights without the busywork.
              </h3>
              <p className="text-base font-medium leading-7 text-text-secondary">
                JobPilot crawls company pages, finds the most relevant signals, and turns them into a clean dossier that helps you prepare for interviews and applications.
              </p>
            </div>
          </div>

            <div className="space-y-4 rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="rounded-3xl border border-border bg-surface-secondary p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                Why it matters
              </p>
              <ul className="mt-6 space-y-4 text-base font-medium text-text-dark">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  Matches jobs to your real profile without guesswork.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  Highlights skills you already have and shows what to improve.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  Gives you business context before you apply.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                Success story
              </p>
              <blockquote className="text-3xl font-semibold leading-tight text-text-darkest">
                “JobPilot turned my job search into a productive workflow. I knew exactly which roles fit my strengths, and the company research made interviews easy.”
              </blockquote>
            </div>
            <div className="flex items-center gap-4 rounded-[1.5rem] border border-border bg-surface-secondary p-6">
              <Image
                src="/images/user-icon.png"
                alt="User testimonial avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <p className="text-base font-semibold text-text-darkest">Maya Patel</p>
                <p className="text-sm text-text-secondary">Software Engineer</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-16 overflow-hidden rounded-[2rem] border border-border bg-surface p-12 shadow-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-info-light/70 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Ready to stop applying blind?
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-text-darkest sm:text-5xl">
              Get the most out of every job search.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-text-secondary">
              Build your profile once, upload your resume, and let JobPilot handle discovery, scoring, and company research for every role.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3 text-sm font-medium text-accent-foreground transition transform hover:-translate-y-0.5 hover:shadow-lg hover:bg-accent-dark"
              >
                Get started
              </Link>
              <Link
                href="/find-jobs"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-7 py-3 text-sm font-medium text-text-primary transition transform hover:-translate-y-0.5 hover:shadow-lg hover:bg-surface-secondary"
              >
                Find your first match
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-8 pb-4 text-sm text-text-secondary">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <span>© 2026 JobPilot. All rights reserved.</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="transition hover:text-accent">
                Terms
              </Link>
              <Link href="/" className="transition hover:text-accent">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Home;
