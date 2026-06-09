export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background text-text-primary animate-pulse">
      {/* Mock Header skeleton */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        <div className="flex h-16 items-center justify-between border-b border-border pb-4 opacity-50">
          <div className="h-6 w-24 rounded bg-surface-tertiary" />
          <div className="flex gap-4">
            <div className="h-5 w-16 rounded bg-surface-tertiary" />
            <div className="h-5 w-16 rounded bg-surface-tertiary" />
            <div className="h-5 w-16 rounded bg-surface-tertiary" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Card Skeleton */}
        <div className="mb-8 rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <div className="h-3 w-32 rounded bg-surface-secondary" />
          <div className="mt-4 h-10 w-64 rounded-lg bg-surface-tertiary" />
          <div className="mt-3 h-5 w-48 rounded bg-surface-secondary" />
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 text-center">
            <div className="mx-auto h-8 w-12 rounded bg-surface-tertiary" />
            <div className="mx-auto mt-2 h-3 w-24 rounded bg-surface-secondary" />
            <div className="mx-auto mt-5 h-4 w-40 rounded bg-surface-secondary" />
          </div>
          {/* Card 2 */}
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 text-center">
            <div className="mx-auto h-3 w-20 rounded bg-surface-secondary" />
            <div className="mx-auto mt-6 h-4 w-48 rounded bg-surface-tertiary" />
          </div>
          {/* Card 3 (matching blank or sign out) */}
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 text-center opacity-40">
            <div className="mx-auto h-3 w-24 rounded bg-surface-secondary" />
            <div className="mx-auto mt-6 h-4 w-44 rounded bg-surface-tertiary" />
          </div>
        </div>

        {/* Recent Jobs Skeleton */}
        <div className="mt-8 rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
          <div className="h-4 w-40 rounded bg-surface-tertiary" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-5 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-48 rounded bg-surface-tertiary" />
                  <div className="h-3 w-32 rounded bg-surface-muted" />
                </div>
                <div className="h-6 w-16 rounded-full bg-surface-tertiary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
