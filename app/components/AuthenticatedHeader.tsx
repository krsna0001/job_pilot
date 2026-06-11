'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { insforge } from "@/lib/insforge-client";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "./SignOutButton";

interface AuthenticatedHeaderProps {
  email?: string;
  name?: string;
}

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Find Jobs", href: "/find-jobs" },
  { title: "Saved Jobs", href: "/saved-jobs" },
  { title: "Salary", href: "/salary-insights" },
  { title: "Alerts", href: "/alerts" },
  { title: "Profile", href: "/profile" },
];

export default function AuthenticatedHeader({
  email = "Account",
  name,
}: AuthenticatedHeaderProps) {
  const displayName = name || email || "Account";
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await insforge.database
          .from("alert_notifications")
          .select("id", { count: "exact", head: true })
          .eq("seen", false);
        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnreadCount();

    const initRealtime = async () => {
      try {
        await insforge.realtime.connect();
        await insforge.realtime.subscribe("public:alert_notifications");
        
        insforge.realtime.on("postgres_changes", (payload: any) => {
          if (payload?.table === "alert_notifications") {
            if (payload.event === "INSERT" && payload.new?.seen === false) {
              setUnreadCount((prev) => prev + 1);
            } else if (payload.event === "UPDATE") {
              if (payload.new?.seen && !payload.old?.seen) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              } else if (!payload.new?.seen && payload.old?.seen) {
                setUnreadCount((prev) => prev + 1);
              }
            }
          }
        });
      } catch (err) {
        console.error("Realtime subscription failed:", err);
      }
    };
    
    initRealtime();

    return () => {
      insforge.realtime.unsubscribe("public:alert_notifications");
    };
  }, []);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link
            href="/"
            className="shrink-0 text-base font-semibold text-text-darkest transition hover:text-accent"
          >
            JobPilot
          </Link>

          {/* Desktop nav — hidden below md */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative transition-colors duration-200 hover:text-accent whitespace-nowrap flex items-center gap-1.5 ${
                    isActive ? "text-accent font-semibold" : "text-text-secondary"
                  }`}
                >
                  {item.title}
                  {item.href === "/alerts" && unreadCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-white shadow-sm animate-fade-in">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-3">
          {/* User name/email — hidden on xs */}
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <p className="text-sm font-semibold text-text-darkest leading-tight">{displayName}</p>
            {email && (
              <p className="text-xs text-text-secondary leading-tight">{email}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/pricing" 
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Upgrade
            </Link>
            <ThemeToggle />
            <SignOutButton compact />
          </div>

          {/* Hamburger — visible below md */}
          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center rounded-lg border border-border bg-surface p-2 text-text-secondary transition hover:border-accent hover:text-accent"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer — slides in below header */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3">
          {/* User info in mobile */}
          <div className="mb-3 pb-3 border-b border-border sm:hidden">
            <p className="text-sm font-semibold text-text-darkest">{displayName}</p>
            {email && <p className="text-xs text-text-muted mt-0.5">{email}</p>}
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-light text-accent font-semibold"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  {item.title}
                  {item.href === "/alerts" && unreadCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-white shadow-sm animate-fade-in">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/10"
            >
              <span>Upgrade to Pro</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
