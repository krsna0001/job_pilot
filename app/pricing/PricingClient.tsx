"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";

export default function PricingClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userData, error: userError } = await insforge.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("You must be logged in to upgrade.");
      }

      // Create a Stripe checkout session via InsForge
      const { data, error: apiError } = await insforge.payments.createCheckoutSession("test", {
        mode: "subscription",
        lineItems: [{ stripePriceId: "price_premium_tier_123", quantity: 1 }],
        successUrl: `${window.location.origin}/pricing/success`,
        cancelUrl: `${window.location.origin}/pricing`,
        subject: {
          type: "user",
          id: userData.user.id
        },
        customerEmail: userData.user.email
      });

      if (apiError) {
        throw new Error(apiError.message);
      }

      if (data?.checkoutSession?.url) {
        window.location.assign(data.checkoutSession.url);
      } else {
        throw new Error("Failed to generate checkout URL");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free Plan */}
        <div className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-text-darkest">Basic</h3>
            <p className="mt-2 text-sm text-text-secondary">Essential tools for your job search.</p>
          </div>
          <div className="mb-6 flex items-baseline">
            <span className="text-4xl font-extrabold text-text-darkest">$0</span>
            <span className="ml-1 text-sm font-medium text-text-muted">/month</span>
          </div>
          <ul className="mb-8 space-y-4 text-sm text-text-secondary">
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Basic job search and matching
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save up to 50 jobs
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Manual application tracking
            </li>
            <li className="flex items-start gap-3 opacity-50">
              <svg className="h-5 w-5 text-border shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              AI Company Dossiers
            </li>
            <li className="flex items-start gap-3 opacity-50">
              <svg className="h-5 w-5 text-border shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Automated Cover Letters
            </li>
          </ul>
          <button
            disabled
            className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-muted cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative rounded-[2.5rem] border-2 border-accent bg-surface p-8 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-accent px-3 py-1 text-center text-xs font-bold text-white uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-accent">Pro</h3>
            <p className="mt-2 text-sm text-text-secondary">AI-powered supercharger for fast hires.</p>
          </div>
          <div className="mb-6 flex items-baseline">
            <span className="text-4xl font-extrabold text-text-darkest">$19</span>
            <span className="ml-1 text-sm font-medium text-text-muted">/month</span>
          </div>
          <ul className="mb-8 space-y-4 text-sm text-text-dark">
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium">Unlimited</span> saved jobs
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Advanced AI match reasoning
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium">AI Company Dossiers</span> for deep insights
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Automated tailored <span className="font-medium">Cover Letters</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Realtime job alerts
            </li>
          </ul>
          
          {error && <div className="mb-4 text-sm text-error bg-error/10 p-3 rounded-lg text-center">{error}</div>}
          
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition-all hover:bg-accent-dark hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Preparing Checkout..." : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
