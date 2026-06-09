'use client';

import ErrorState from "./components/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <ErrorState error={error} reset={reset} title="Application Error" />
        </div>
      </div>
    </main>
  );
}
