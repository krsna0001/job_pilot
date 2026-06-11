import Link from "next/link";

export default function PricingSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-surface rounded-[2.5rem] border border-border shadow-sm text-center animate-fade-in-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-text-darkest mb-4">Welcome to Pro!</h1>
        <p className="text-text-secondary mb-8">
          Thank you for subscribing to JobPilot Pro. Your account has been upgraded, and all premium features are now unlocked.
        </p>
        <Link 
          href="/dashboard"
          className="inline-block w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition-all hover:bg-accent-dark hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
