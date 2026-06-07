'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "../../lib/insforge-client";
import { capture } from "@/lib/posthog";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const [isExchanging, setIsExchanging] = useState(false);

  useEffect(() => {
    const pending = sessionStorage.getItem("insforge_pending_oauth");

    if (pending === "true") {
      setIsExchanging(true);

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const { data, error } = await insforge.auth.getCurrentUser();

        if (data?.user) {
          clearInterval(interval);

          const tokenManager = (insforge as any).tokenManager;
          const http = (insforge as any).http;
          const accessToken = tokenManager?.getAccessToken?.();
          const refreshToken = http?.refreshToken;

          try {
            await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ accessToken, refreshToken }),
            });
          } catch (e) {
            console.error("Failed to sync session to cookies:", e);
          }

          sessionStorage.removeItem("insforge_pending_oauth");
          setIsExchanging(false);
          capture("login_success", { method: "callback" });
          router.refresh();
        } else if (error || attempts > 60) {
          clearInterval(interval);
          sessionStorage.removeItem("insforge_pending_oauth");
          setIsExchanging(false);
          router.push("/login");
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [router]);

  if (!isExchanging) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center p-8 text-center max-w-sm rounded-[2rem] border border-border bg-surface shadow-2xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-light border-t-accent" />
        <h3 className="mt-6 text-xl font-semibold text-text-darkest">Securing your session</h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          We are finalizing your login with InsForge. You will be redirected to your profile shortly.
        </p>
      </div>
    </div>
  );
}
