'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = "accent" }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    accent: "bg-accent-light text-accent",
    success: "bg-success-light text-success",
    info: "bg-info-light text-info",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-text-darkest">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] ${colorClasses[color] ?? colorClasses.accent}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
