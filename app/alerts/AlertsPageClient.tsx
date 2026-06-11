"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge-client";
import EmptyState from "@/app/components/EmptyState";

interface Alert {
  id: string;
  query: string;
  location: string;
  frequency: string;
  active: boolean;
  last_checked: string | null;
  created_at: string;
}

export default function AlertsPageClient({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsCreating(true);
    const { data } = await insforge.database
      .from("alerts")
      .insert([{ query: query.trim(), location: location.trim(), frequency }])
      .select()
      .single();
    if (data) {
      setAlerts((prev) => [data as Alert, ...prev]);
      setQuery("");
      setLocation("");
      setFrequency("daily");
      setShowForm(false);
    }
    setIsCreating(false);
  };

  const handleToggle = async (alert: Alert) => {
    setTogglingId(alert.id);
    const { error } = await insforge.database
      .from("alerts")
      .update({ active: !alert.active })
      .eq("id", alert.id);
    if (!error) {
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, active: !a.active } : a)));
    }
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await insforge.database.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text-darkest">Smart Alerts</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm space-y-4 animate-theme-transition">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React Developer"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London (optional)"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isCreating || !query.trim()}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Alert"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          description="Create alerts to get notified when matching jobs appear."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-[1.75rem] border p-6 shadow-sm transition ${alert.active ? "border-border bg-surface" : "border-border/50 bg-surface/50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-text-darkest">{alert.query}</h3>
                    {alert.location && (
                      <span className="text-xs text-text-muted">📍 {alert.location}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className={`rounded-full px-2.5 py-0.5 font-medium ${
                      alert.frequency === "realtime" ? "bg-accent/10 text-accent" : "bg-surface-muted"
                    }`}>
                      {alert.frequency}
                    </span>
                    <span>Created {new Date(alert.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    {alert.last_checked && (
                      <span>Last checked {new Date(alert.last_checked).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(alert)}
                    disabled={togglingId === alert.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition disabled:opacity-50 ${
                      alert.active ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                      alert.active ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(alert.id)}
                    disabled={deletingId === alert.id}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
