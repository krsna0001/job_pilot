import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import AlertsPageClient from "./AlertsPageClient";

export default async function AlertsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  let alerts: any[] = [];

  if (user) {
    const { data: userAlerts } = await insforge.database
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (userAlerts) alerts = userAlerts;
  }

  if (error) console.warn("Auth error:", error);

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-background text-text-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-darkest">Smart Alerts</h1>
            <p className="mt-2 text-base text-text-secondary">
              Get notified when new jobs match your saved searches.
            </p>
          </div>
          <AlertsPageClient initialAlerts={alerts} />
        </div>
      </main>
    </>
  );
}
