const INSFORGE_URL = "https://59m666gk.ap-southeast.insforge.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AlertInput {
  query: string;
  location?: string;
}

interface JobHit {
  title: string;
  company: string;
  location: string;
  salary_range: string;
  url: string;
}

function jobsMatchQuery(jobs: any[], query: string): any[] {
  const q = query.toLowerCase();
  return jobs.filter((j) => {
    const text = (j.title + " " + j.description + " " + (j.company?.display_name || "")).toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    return terms.every((t) => text.includes(t));
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const body: { alerts?: AlertInput[] } = await req.json().catch(() => ({}));
  const alerts = body.alerts ?? [];

  if (alerts.length === 0) {
    return new Response(
      JSON.stringify({ error: "No alerts provided. Send { alerts: [{ query, location }] }" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const results: { alert: AlertInput; new_jobs: JobHit[]; error?: string }[] = [];

  for (const alert of alerts) {
    try {
      const searchUrl = `${INSFORGE_URL}/functions/jobs-search`;
      const res = await fetch(searchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ what: alert.query, where: alert.location || "", page: "1", results_per_page: "10" }),
      });

      if (!res.ok) {
        results.push({ alert, new_jobs: [], error: `Search returned ${res.status}` });
        continue;
      }

      const data = await res.json();
      const matching = jobsMatchQuery(data.results ?? [], alert.query);

      const hits: JobHit[] = matching.map((j: any) => ({
        title: j.title,
        company: j.company?.display_name || "Unknown",
        location: j.location?.display_name || "Remote",
        salary_range: j.salary_min && j.salary_max
          ? `$${(j.salary_min / 1000).toFixed(0)}k-$${(j.salary_max / 1000).toFixed(0)}k`
          : "Not listed",
        url: j.redirect_url || "",
      }));

      results.push({ alert, new_jobs: hits });
    } catch (err: any) {
      results.push({ alert, new_jobs: [], error: err.message });
    }
  }

  return new Response(
    JSON.stringify({ checked: alerts.length, results }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
