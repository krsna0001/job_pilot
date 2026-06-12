const ADZUNA_API_BASE = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID") ?? "";
const ADZUNA_API_KEY = Deno.env.get("ADZUNA_APP_KEY") ?? Deno.env.get("ADZUNA_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MOCK_JOBS = [
  {
    id: "mock-job-1", title: "React Developer", company: { display_name: "Vercel" }, location: { display_name: "London" },
    description: "Join our core team building Next.js and React interfaces. We build fast, responsive user experiences using Tailwind CSS, TypeScript, and standard design tokens.", salary_min: 60000, salary_max: 85000,
    created: new Date().toISOString(), redirect_url: "https://vercel.com", adref: "mock", contract_type: "full-time", contract_time: "permanent", source: "mock",
  },
  {
    id: "mock-job-2", title: "Senior Next.js Engineer", company: { display_name: "Supabase" }, location: { display_name: "Remote" },
    description: "Looking for a senior engineer to own our dashboard DX. React, TypeScript, SSR, SQL. Fully remote.", salary_min: 90000, salary_max: 130000,
    created: new Date(Date.now() - 86400000).toISOString(), redirect_url: "https://supabase.com", adref: "mock", contract_type: "full-time", contract_time: "permanent", source: "mock",
  },
  {
    id: "mock-job-3", title: "Fullstack Node.js Developer", company: { display_name: "Stripe" }, location: { display_name: "Dublin" },
    description: "Fullstack developer for dashboard and merchant tools. Node.js, Express, React, REST APIs. Hybrid.", salary_min: 75000, salary_max: 110000,
    created: new Date(Date.now() - 172800000).toISOString(), redirect_url: "https://stripe.com", adref: "mock", contract_type: "full-time", contract_time: "permanent", source: "mock",
  },
  {
    id: "mock-job-4", title: "Frontend Tailwind CSS Developer", company: { display_name: "Tailwind Labs" }, location: { display_name: "Chicago" },
    description: "Design responsive layouts with Tailwind CSS, React, and CSS tokens. On-site Chicago.", salary_min: 50000, salary_max: 80000,
    created: new Date(Date.now() - 259200000).toISOString(), redirect_url: "https://tailwindcss.com", adref: "mock", contract_type: "full-time", contract_time: "permanent", source: "mock",
  },
  {
    id: "mock-job-5", title: "Senior Python Backend Engineer", company: { display_name: "OpenAI" }, location: { display_name: "San Francisco" },
    description: "Build scalable backend APIs and orchestrate AI models. Python, FastAPI, Postgres, Docker. On-site.", salary_min: 120000, salary_max: 180000,
    created: new Date(Date.now() - 345600000).toISOString(), redirect_url: "https://openai.com", adref: "mock", contract_type: "full-time", contract_time: "permanent", source: "mock",
  },
];

interface NormalizedJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  redirect_url: string;
  created: string;
  adref: string;
  source: string;
  contract_type?: string;
  contract_time?: string;
}

function deduplicate(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}|${job.company.display_name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchAdzuna(what: string, where: string, page: string, country: string, resultsPerPage: string): Promise<{ results: NormalizedJob[]; count: number }> {
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) return { results: [], count: 0 };
  const url = `${ADZUNA_API_BASE}/${country}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&results_per_page=${resultsPerPage}&sort_by=date&content-type=application/json`;
  try {
    const resp = await fetch(url);
    if (resp.status !== 200) return { results: [], count: 0 };
    const data = await resp.json();
    const results: NormalizedJob[] = (data.results ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      title: r.title as string,
      company: r.company as { display_name: string } ?? { display_name: "" },
      location: r.location as { display_name: string } ?? { display_name: "" },
      description: r.description as string ?? "",
      salary_min: r.salary_min as number | undefined,
      salary_max: r.salary_max as number | undefined,
      salary_is_predicted: r.salary_is_predicted as string | undefined,
      redirect_url: r.redirect_url as string ?? "",
      created: r.created as string ?? new Date().toISOString(),
      adref: r.adref as string ?? r.id as string,
      source: "Adzuna",
      contract_type: r.contract_type as string | undefined,
      contract_time: r.contract_time as string | undefined,
    }));
    return { results, count: data.count as number ?? 0 };
  } catch {
    return { results: [], count: 0 };
  }
}

async function fetchRemotive(what: string): Promise<NormalizedJob[]> {
  try {
    const resp = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(what)}&limit=10`);
    if (resp.status !== 200) return [];
    const data = await resp.json();
    return ((data.jobs as Record<string, unknown>[]) ?? []).map((j) => ({
      id: `remotive-${j.id}`,
      title: j.title as string,
      company: { display_name: j.company_name as string },
      location: { display_name: (j.candidate_required_location as string) || "Remote" },
      description: j.description as string ?? "",
      salary_min: undefined,
      salary_max: undefined,
      redirect_url: j.url as string,
      created: j.publication_date as string ?? new Date().toISOString(),
      adref: `remotive-${j.id}`,
      source: "Remotive",
    }));
  } catch {
    return [];
  }
}

async function fetchArbeitnow(what: string): Promise<NormalizedJob[]> {
  try {
    const resp = await fetch(`https://arbeitnow.com/api/job-board-api?search=${encodeURIComponent(what)}&limit=10`);
    if (resp.status !== 200) return [];
    const body = await resp.json();
    return ((body.data as Record<string, unknown>[]) ?? []).map((j) => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title as string,
      company: { display_name: j.company_name as string },
      location: { display_name: (j.location as string) || (j.remote ? "Remote" : "Not specified") },
      description: j.description as string ?? "",
      salary_min: j.salary_min as number | undefined,
      salary_max: j.salary_max as number | undefined,
      redirect_url: j.url as string,
      created: j.created_at as string ?? new Date().toISOString(),
      adref: `arbeitnow-${j.slug}`,
      source: "Arbeitnow",
    }));
  } catch {
    return [];
  }
}

function mockFallback(what: string): NormalizedJob[] {
  const query = what.toLowerCase().trim();
  return MOCK_JOBS.filter(
    (job) =>
      job.title.toLowerCase().includes(query) ||
      job.company.display_name.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query),
  );
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let what = "software engineer";
  let where = "";
  let page = "1";
  let country = "gb";
  let resultsPerPage = "50";

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

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.log("[DEBUG] Adzuna API credentials not configured. Serving mock + global job fallback.");
    const mockResults = mockFallback(what);
    const [remotive, arbeitnow] = await Promise.all([fetchRemotive(what), fetchArbeitnow(what)]);
    const merged = deduplicate([...mockResults, ...remotive, ...arbeitnow]);
    return new Response(
      JSON.stringify({ results: merged, count: merged.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const [adzunaResult, remotive, arbeitnow] = await Promise.all([
    fetchAdzuna(what, where, page, country, resultsPerPage),
    page === "1" ? fetchRemotive(what) : Promise.resolve([] as NormalizedJob[]),
    page === "1" ? fetchArbeitnow(what) : Promise.resolve([] as NormalizedJob[]),
  ]);

  const allResults = deduplicate([...adzunaResult.results, ...remotive, ...arbeitnow]);
  
  // Always sort recent listings to the top
  allResults.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const count = Math.max(adzunaResult.count, allResults.length);

  if (allResults.length === 0) {
    console.log("[DEBUG] No results from any source. Serving mock fallback.");
    return new Response(
      JSON.stringify({ results: mockFallback(what), count: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ results: allResults, count }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
