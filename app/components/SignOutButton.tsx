'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { capture } from "@/lib/posthog";
import { insforge } from "../../lib/insforge-client";

interface SignOutButtonProps {
  compact?: boolean;
}

export default function SignOutButton({ compact = false }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    setError(null);
    setIsLoading(true);

    const { error } = await insforge.auth.signOut();

    if (error) {
      setIsLoading(false);
      setError(error.message);
      return;
    }

    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to clear session cookies:", e);
    }

    setIsLoading(false);
    capture("sign_out", { method: "button" });
    router.push("/login");
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoading}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "..." : "Sign out"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface-secondary px-4 py-2 text-sm font-semibold text-text-dark transition hover:border-accent hover:bg-surface hover:text-text-darkest disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
