'use client';

import Link from "next/link";
import { useEffect } from "react";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export default function ErrorState({ error, reset, title = "Something went wrong" }: ErrorStateProps) {
  useEffect(() => {
    // Log the error to console for diagnostic purposes
    console.error("Bound error captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-12 text-center animate-fade-in">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-error">System Error</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-darkest">{title}</h2>
      
      <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
        {error.message || "An unexpected error occurred. Our team has been notified. Please try again."}
      </p>

      {error.digest && (
        <p className="mt-2 text-xs font-mono text-text-muted">
          Digest: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-accent-dark active:translate-y-0 cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-surface-secondary active:translate-y-0"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
