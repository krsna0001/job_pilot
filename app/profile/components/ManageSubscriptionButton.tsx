"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";

export default function ManageSubscriptionButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManage = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await insforge.payments.createCustomerPortalSession("test", {
        subject: { type: "user", id: userId },
        returnUrl: `${window.location.origin}/profile`,
      });

      if (apiError) throw new Error(apiError.message);
      if (data?.customerPortalSession?.url) {
        window.location.assign(data.customerPortalSession.url);
      } else {
        throw new Error("Failed to generate portal URL");
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      setError(err.message || "An error occurred opening the billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      {error && <div className="text-sm text-error">{error}</div>}
      <button
        onClick={handleManage}
        disabled={loading}
        className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : "Manage Subscription"}
      </button>
      <p className="text-sm text-text-muted">Update your payment methods and subscription plan securely via Stripe.</p>
    </div>
  );
}
