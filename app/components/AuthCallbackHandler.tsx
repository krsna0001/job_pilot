'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "../../lib/insforge-client";
import { capture } from "@/lib/posthog";

const ACCESS_TOKEN_COOKIE = "insforge_access_token";

function hasAuthCookie(): boolean {
  return document.cookie.includes(`${ACCESS_TOKEN_COOKIE}=`);
}

export default function AuthCallbackHandler() {
  const router = useRouter();
  const [isExchanging, setIsExchanging] = useState(false);

  useEffect(() => {
    const pending = sessionStorage.getItem("insforge_pending_oauth");

    if (pending !== "true") return;

    if (hasAuthCookie()) {
      sessionStorage.removeItem("insforge_pending_oauth");
      router.refresh();
      return;
    }

    setIsExchanging(true);

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;

      if (hasAuthCookie()) {
        clearInterval(interval);
        sessionStorage.removeItem("insforge_pending_oauth");
        setIsExchanging(false);
        router.refresh();
        return;
      }

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
        if (error) {
          console.error("Auth callback polling failed:", error);
        }
      }
    }, 300);

    return () => clearInterval(interval);
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
