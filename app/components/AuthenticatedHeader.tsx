import Link from "next/link";
import SignOutButton from "./SignOutButton";

interface AuthenticatedHeaderProps {
  email?: string;
  name?: string;
}

export default function AuthenticatedHeader({
  email = "Account",
  name,
}: AuthenticatedHeaderProps) {
  const displayName = name || email || "Account";

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-text-darkest transition hover:text-accent">
          <div className="text-base font-semibold">JobPilot</div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-semibold text-text-darkest">{displayName}</p>
            {email && <p className="text-xs text-text-secondary">{email}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition hover:border-accent hover:text-accent"
            >
              Profile
            </Link>
            <SignOutButton compact />
          </div>
        </div>
      </div>
    </header>
  );
}
