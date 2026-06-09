export default function FindJobsLoading() {
  return (
    <main className="min-h-screen bg-background text-text-primary animate-pulse">
      {/* Mock Header spacing */}
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
        {/* Title welcome card skeleton */}
        <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <div className="h-3 w-32 rounded bg-surface-secondary" />
          <div className="mt-4 h-10 w-44 rounded bg-surface-tertiary" />
          <div className="mt-3 h-5 w-60 rounded bg-surface-secondary" />
        </div>

        {/* Dashboard 3-column + sidebar layout grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main search side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stat Cards Grid skeleton */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-border bg-surface p-6">
                <div className="h-3 w-20 rounded bg-surface-secondary" />
                <div className="mt-4 h-8 w-12 rounded bg-surface-tertiary" />
                <div className="mt-2 h-3 w-28 rounded bg-surface-secondary" />
              </div>
              <div className="rounded-[1.75rem] border border-border bg-surface p-6">
                <div className="h-3 w-16 rounded bg-surface-secondary" />
                <div className="mt-4 h-8 w-10 rounded bg-surface-tertiary" />
                <div className="mt-2 h-3 w-24 rounded bg-surface-secondary" />
              </div>
              {/* Donut Chart mock card */}
              <div className="rounded-[1.75rem] border border-border bg-surface p-6 flex flex-col justify-between">
                <div className="h-3 w-28 rounded bg-surface-secondary" />
                <div className="mt-4 h-10 w-10 rounded-full bg-surface-tertiary" />
              </div>
            </div>

            {/* Search form box skeleton */}
            <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-surface-secondary" />
                  <div className="h-10 w-full rounded-lg bg-surface-tertiary" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-surface-secondary" />
                  <div className="h-10 w-full rounded-lg bg-surface-tertiary" />
                </div>
              </div>
              <div className="h-12 w-full rounded-lg bg-surface-tertiary" />

              {/* Mock Listings Cards */}
              <div className="mt-8 space-y-4 pt-6 border-t border-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-[1.75rem] border border-border bg-surface p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-60 rounded bg-surface-tertiary" />
                        <div className="h-4 w-40 rounded bg-surface-secondary" />
                      </div>
                      <div className="h-10 w-24 rounded-lg bg-surface-tertiary" />
                    </div>
                    <div className="h-4 w-32 rounded bg-surface-secondary" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-surface-secondary" />
                      <div className="h-3 w-4/5 rounded bg-surface-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick tools sidebar side */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
              <div className="h-3 w-24 rounded bg-surface-secondary" />
              <div className="mt-6 space-y-3">
                <div className="h-14 w-full rounded-xl bg-surface-secondary" />
                <div className="h-14 w-full rounded-xl bg-surface-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
