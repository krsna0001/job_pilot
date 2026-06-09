'use client';

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge-client";

interface ConnectedAccountsProps {
  user: {
    providers?: string[];
    [key: string]: any;
  } | null | undefined;
}

const LINKEDIN_SKIP_KEY = "jobpilot-linkedin-skipped";

export default function ConnectedAccounts({ user }: ConnectedAccountsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinkedinSkipped, setIsLinkedinSkipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isLinkedinConnected = !!user?.providers?.includes("linkedin");
  const isGithubConnected = !!user?.providers?.includes("github");

  useEffect(() => {
    setIsMounted(true);
    const skipped = localStorage.getItem(LINKEDIN_SKIP_KEY) === "true";
    setIsLinkedinSkipped(skipped);
  }, []);

  const handleSkipLinkedin = () => {
    setIsLinkedinSkipped(true);
    localStorage.setItem(LINKEDIN_SKIP_KEY, "true");
  };

  const handleUndoSkipLinkedin = () => {
    setIsLinkedinSkipped(false);
    localStorage.removeItem(LINKEDIN_SKIP_KEY);
  };

  const handleConnect = async (provider: "linkedin" | "github") => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo: window.location.href,
        skipBrowserRedirect: true,
      });

      if (oauthError) {
        setError(oauthError.message);
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Unable to connect. Please try again.");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
      <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Connected Accounts</p>
      <h3 className="text-lg font-semibold text-text-darkest">Integrations</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Connect your developer profiles and professional networks to sync information.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-error/10 p-3 text-xs text-error">
          {error}
        </div>
      )}

      <div className="mt-6 divide-y divide-border">
        {/* LinkedIn Row */}
        <div className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Custom SVG LinkedIn Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linkedin-light text-linkedin">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-darkest">LinkedIn</p>
                <p className="text-xs text-text-secondary">
                  {isLinkedinConnected ? "Connected" : isLinkedinSkipped ? "Skipped (Not connected)" : "Not connected"}
                </p>
              </div>
            </div>
            {isLinkedinConnected ? (
              <span className="inline-flex rounded-full bg-success-light px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-success self-start sm:self-auto">
                Authorized
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleConnect("linkedin")}
                disabled={isLoading}
                className="bg-linkedin text-linkedin-foreground hover:opacity-90 shadow-sm rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Connecting..." : "Connect LinkedIn"}
              </button>
            )}
          </div>

          {/* Skip LinkedIn option and advice */}
          {isMounted && !isLinkedinConnected && (
            <div className="mt-4">
              {!isLinkedinSkipped ? (
                <div className="rounded-2xl border border-accent/20 bg-accent-light/50 p-4 text-xs text-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="leading-relaxed font-medium">
                    💡 <strong>Selection Advice:</strong> Connecting your LinkedIn profile provides verified social proof of your professional network, which <strong>significantly improves your chances of selection</strong> by hiring companies.
                  </p>
                  <button
                    type="button"
                    onClick={handleSkipLinkedin}
                    className="text-xs font-semibold underline text-accent hover:text-accent-dark whitespace-nowrap self-start md:self-auto cursor-pointer"
                  >
                    Skip linking for now
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-accent/20 bg-accent-light/50 p-4 text-xs text-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="leading-relaxed font-medium m-0">
                    💡 <strong>Selection Advice:</strong> Connecting your LinkedIn profile provides verified social proof of your professional network, which <strong>significantly improves your chances of selection</strong> by hiring companies.
                  </p>
                  <div className="flex gap-2 items-center">
                    <button type="button" onClick={() => handleConnect("linkedin")} disabled={isLoading} className="bg-linkedin text-linkedin-foreground hover:opacity-90 shadow-sm rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                      {isLoading ? "Connecting..." : "Connect LinkedIn"}
                    </button>
                    <button type="button" onClick={handleUndoSkipLinkedin} className="text-xs font-semibold underline text-accent hover:text-accent-dark cursor-pointer">
                      Undo skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GitHub Row */}
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary text-text-primary border border-border">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-darkest">GitHub</p>
              <p className="text-xs text-text-secondary">
                {isGithubConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          {isGithubConnected ? (
            <span className="inline-flex rounded-full bg-success-light px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-success self-start sm:self-auto">
              Authorized
            </span>
          ) : (
            <button
              type="button"
              onClick={() => handleConnect("github")}
              disabled={isLoading}
              className="bg-surface text-text-primary hover:bg-surface-secondary border border-border shadow-sm rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connecting..." : "Connect GitHub"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
