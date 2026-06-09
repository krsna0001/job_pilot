export default function SavedJobsLoading() {
  return (
    <main className="min-h-screen bg-background text-text-primary animate-pulse">
      {/* Header spacing */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        <div className="flex h-16 items-center justify-between border-b border-border pb-4 opacity-50">
          <div className="h-6 w-24 rounded bg-surface-tertiary" />
          <div className="flex gap-4">
            <div className="h-5 w-16 rounded bg-surface-tertiary" />
            <div className="h-5 w-16 rounded bg-surface-tertiary" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Card Skeleton */}
        <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <div className="h-3 w-28 rounded bg-surface-secondary" />
          <div className="mt-4 h-10 w-48 rounded bg-surface-tertiary" />
          <div className="mt-3 h-5 w-80 rounded bg-surface-secondary" />
        </div>

        <div className="space-y-6">
          {/* Status Buttons placeholders */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-20 rounded-full bg-surface-secondary" />
            ))}
          </div>

          {/* Jobs loading items stack */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[1.75rem] border border-border bg-surface p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-64 rounded bg-surface-tertiary" />
                      <div className="h-4 w-16 rounded bg-surface-secondary" />
                    </div>
                    <div className="h-4 w-40 rounded bg-surface-secondary" />
                    <div className="h-3 w-32 rounded bg-surface-muted" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-16 rounded-full bg-surface-secondary" />
                    <div className="h-9 w-24 rounded-xl bg-surface-tertiary" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full rounded bg-surface-secondary" />
                  <div className="h-3.5 w-5/6 rounded bg-surface-secondary" />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <div className="h-3 w-24 rounded bg-surface-muted" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-8 w-24 rounded-xl bg-surface-tertiary" />
                    <div className="h-8 w-28 rounded-xl bg-surface-tertiary" />
                    <div className="h-8 w-32 rounded-xl bg-surface-tertiary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
