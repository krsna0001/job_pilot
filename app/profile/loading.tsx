export default function ProfileLoading() {
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

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Title Card Skeleton */}
        <div className="rounded-[2rem] border border-border bg-surface p-10 shadow-sm">
          <div className="h-3 w-32 rounded bg-surface-secondary" />
          <div className="mt-4 h-10 w-48 rounded bg-surface-tertiary" />
          <div className="mt-3 h-5 w-80 rounded bg-surface-secondary" />
        </div>

        {/* Attention Banner Skeleton */}
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className="h-28 w-28 shrink-0 rounded-full bg-surface-tertiary" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-5 w-48 rounded bg-surface-tertiary" />
            <div className="h-4 w-72 rounded bg-surface-secondary" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 rounded-full bg-surface-secondary" />
              <div className="h-6 w-16 rounded-full bg-surface-secondary" />
              <div className="h-6 w-16 rounded-full bg-surface-secondary" />
            </div>
          </div>
        </div>

        {/* Profile Details Form Wrapper Skeleton */}
        <div className="rounded-[2rem] border border-border bg-surface p-10 shadow-sm space-y-8">
          {/* Resume Upload Box */}
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
            <div className="mx-auto h-8 w-8 rounded bg-surface-tertiary" />
            <div className="mx-auto mt-4 h-4 w-60 rounded bg-surface-tertiary" />
            <div className="mx-auto mt-2 h-3 w-40 rounded bg-surface-secondary" />
          </div>

          {/* Form Fields Planners */}
          <div className="space-y-6 pt-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-surface-secondary" />
                <div className="h-10 w-full rounded-lg bg-surface-tertiary" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-surface-secondary" />
                <div className="h-10 w-full rounded-lg bg-surface-tertiary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-surface-secondary" />
              <div className="h-20 w-full rounded-lg bg-surface-tertiary" />
            </div>
          </div>
        </div>

        {/* Session Card skeleton */}
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
          <div className="h-3 w-20 rounded bg-surface-secondary" />
          <div className="mt-4 h-10 w-32 rounded-lg bg-surface-tertiary" />
        </div>
      </div>
    </main>
  );
}
