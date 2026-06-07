const ADZUNA_API_BASE = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID") ?? "";
const ADZUNA_API_KEY = Deno.env.get("ADZUNA_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Adzuna API not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let what = "software engineer";
  let where = "";
  let page = "1";
  let country = "gb";
  let resultsPerPage = "20";

  const url = new URL(req.url);

  if (req.method === "GET") {
    what = url.searchParams.get("what") ?? what;
    where = url.searchParams.get("where") ?? where;
    page = url.searchParams.get("page") ?? page;
    country = url.searchParams.get("country") ?? country;
    resultsPerPage = url.searchParams.get("results_per_page") ?? resultsPerPage;
  } else {
    try {
      const body = await req.json();
      what = body.what ?? what;
      where = body.where ?? where;
      page = body.page ?? page;
      country = body.country ?? country;
      resultsPerPage = body.results_per_page ?? resultsPerPage;
    } catch {
      // ignore parse errors
    }
  }

  const adzunaUrl = `${ADZUNA_API_BASE}/${country}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&results_per_page=${resultsPerPage}&content-type=application/json`;

  try {
    const resp = await fetch(adzunaUrl);
    const data = await resp.json();

    return new Response(
      JSON.stringify({
        results: data.results ?? [],
        count: data.count ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch jobs", details: err.message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}
