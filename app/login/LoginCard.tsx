'use client';

import { useState, useEffect } from "react";
import { insforge } from "../../lib/insforge-client";

const providers = [
  {
    label: "Continue with Google",
    provider: "google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.35 11.1H12v2.8h5.35c-.23 1.4-.94 2.62-2.02 3.43v2.84h3.27c1.92-1.77 3.03-4.37 3.03-7.53 0-.5-.05-.98-.14-1.45z" fill="#4285F4" />
        <path d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.27-2.84c-.9.6-2.03.95-3.35.95-2.58 0-4.77-1.74-5.56-4.08H3.02v2.56C4.66 19.96 8.05 22 12 22z" fill="#34A853" />
        <path d="M6.44 13.59c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.44.35-2.09V6.85H3.02A9.99 9.99 0 002 12c0 1.6.38 3.12 1.02 4.44l3.4-2.85z" fill="#FBBC05" />
        <path d="M12 5.38c1.47 0 2.8.51 3.84 1.51l2.87-2.87C16.94 2.36 14.7 1.5 12 1.5 8.05 1.5 4.66 3.54 3.02 6.85l3.4 2.56C7.23 7.12 9.42 5.38 12 5.38z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    label: "Continue with GitHub",
    provider: "github",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0.5C5.648 0.5.5 5.648.5 12.001c0 5.088 3.292 9.399 7.862 10.914.575.106.786-.25.786-.556 0-.274-.01-1-.015-1.963-3.197.695-3.873-1.54-3.873-1.54-.523-1.33-1.277-1.683-1.277-1.683-1.044-.714.08-.7.08-.7 1.154.082 1.762 1.185 1.762 1.185 1.026 1.757 2.693 1.25 3.347.956.104-.744.402-1.25.732-1.538-2.553-.29-5.236-1.276-5.236-5.679 0-1.254.448-2.277 1.183-3.078-.119-.29-.512-1.455.112-3.032 0 0 .965-.309 3.161 1.175.917-.255 1.9-.383 2.877-.388.977.005 1.96.133 2.877.388 2.194-1.485 3.158-1.175 3.158-1.175.626 1.577.233 2.742.114 3.032.737.801 1.183 1.824 1.183 3.078 0 4.414-2.688 5.386-5.25 5.67.413.355.781 1.053.781 2.123 0 1.532-.014 2.767-.014 3.145 0 .31.208.668.792.554C20.708 21.397 24 17.088 24 12.001 24 5.648 18.352.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: "Continue with LinkedIn",
    provider: "linkedin",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
];

export default function LoginCard() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"google" | "github" | "linkedin" | null>(null);

  // The SDK stores the PKCE code_verifier in sessionStorage during signInWithOAuth().
  // When the OAuth provider redirects back to /api/auth/callback?insforge_code=xxx,
  // our server route passes it through to /login?insforge_code=xxx (this page).
  // detectAuthCallback() reads the code from the URL + the verifier from sessionStorage,
  // exchanges them with InsForge, and sets the session in the SDK's in-memory state.
  // We then sync that session to httpOnly cookies via /api/auth/session so middleware works.
  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.has("insforge_code");
      const hasPending = sessionStorage.getItem("insforge_pending_oauth") === "true";

      if (!hasCode && !hasPending) return;

      setIsExchanging(true);

      // SDK's constructor calls detectAuthCallback() automatically on page load
      // and exchanges the OAuth code. We just poll for the session.

      // Poll until the SDK has a valid session, then sync cookies + redirect
      let attempts = 0;
      const interval = setInterval(async () => {
        if (cancelled) { clearInterval(interval); return; }
        attempts++;

        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          clearInterval(interval);
          sessionStorage.removeItem("insforge_pending_oauth");

          // Sync tokens to httpOnly cookies so middleware can verify the session
          try {
            const tokenManager = (insforge as any).tokenManager;
            const http = (insforge as any).http;
            const accessToken = tokenManager?.getAccessToken?.();
            const refreshToken = http?.refreshToken;
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken, refreshToken }),
            });
          } catch (e) {
            console.error("Failed to sync session cookies:", e);
          }

          window.location.href = "/dashboard";
          return;
        }

        if (attempts > 40) {
          clearInterval(interval);
          sessionStorage.removeItem("insforge_pending_oauth");
          setIsExchanging(false);
          setError("Login timed out. Please try again.");
        }
      }, 300);
    }

    handleCallback();
    return () => { cancelled = true; };
  }, []);


  const handleOAuth = async (provider: "google" | "github" | "linkedin") => {
    setError(null);
    setActiveProvider(provider);
    setIsLoading(true);

    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      // IMPORTANT: redirectTo MUST be a URL listed in insforge.toml allowed_redirect_urls.
      // /api/auth/callback is listed there. /login is NOT \u2014 do not use /login here.
      redirectTo: `${window.location.origin}/api/auth/callback`,
      skipBrowserRedirect: true,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      setActiveProvider(null);
      return;
    }

    if (data?.url) {
      sessionStorage.setItem("insforge_pending_oauth", "true");
      window.location.assign(data.url);
      return;
    }

    setIsLoading(false);
    setActiveProvider(null);
    setError("Unable to start auth flow. Please try again.");
  };

  if (isExchanging) {
    return (
      <div className="rounded-[2rem] border border-border bg-surface-secondary p-10 shadow-xl flex flex-col items-center justify-center gap-6 min-h-[280px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-light border-t-accent" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text-darkest">Completing login…</h3>
          <p className="mt-2 text-sm text-text-secondary">Securing your session with InsForge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border bg-surface-secondary p-10 shadow-xl">
      <div className="space-y-6 text-center">
        <h2 className="text-3xl font-semibold text-text-darkest">Quick login to JobPilot</h2>
        <p className="mx-auto max-w-xl text-sm font-medium leading-7 text-text-secondary">
          Already have an account? Choose the provider you used before and sign in instantly in your browser.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {providers.map((item) => {
          const providerLabel = item.provider === "google" ? "Google" : item.provider === "github" ? "GitHub" : "LinkedIn";
          return (
            <button
              key={item.provider}
              type="button"
              onClick={() => handleOAuth(item.provider as "google" | "github" | "linkedin")}
              disabled={isLoading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.75rem] border border-border bg-surface px-6 text-sm font-semibold text-text-primary transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-surface-secondary disabled:cursor-progress disabled:opacity-70"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-current">{item.icon}</span>
              <span>{isLoading && activeProvider === item.provider ? `Opening ${providerLabel}...` : item.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading && activeProvider ? (
        <p className="mt-6 text-center text-sm font-medium text-text-secondary">
          Opening {activeProvider === "google" ? "Google" : activeProvider === "github" ? "GitHub" : "LinkedIn"} login…
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
      ) : null}

      <p className="mt-6 text-center text-xs text-text-secondary">
        By signing in, you agree to use JobPilot responsibly. Your auth session is stored securely by InsForge.
      </p>
    </div>
  );
}
