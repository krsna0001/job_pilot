'use client';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-surface p-12 text-center shadow-sm">
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-darkest">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
