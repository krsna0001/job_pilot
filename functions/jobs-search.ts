const ADZUNA_API_BASE = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID") ?? "";
const ADZUNA_API_KEY = Deno.env.get("ADZUNA_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MOCK_JOBS = [
  {
    id: "mock-job-1",
    title: "React Developer",
    company: { display_name: "Vercel" },
    location: { display_name: "London" },
    description: "Join our core team building Next.js and React interfaces. We build fast, responsive user experiences using Tailwind CSS, TypeScript, and standard design tokens. You will work on optimizing client-side performance, state management, and contributing to open-source developer tooling. Experience with remote collaboration is a plus.",
    salary_min: 60000,
    salary_max: 85000,
    created: new Date().toISOString(),
    redirect_url: "https://vercel.com",
    adref: "mock"
  },
  {
    id: "mock-job-2",
    title: "Senior Next.js Engineer",
    company: { display_name: "Supabase" },
    location: { display_name: "Remote" },
    description: "We are seeking a senior engineer to own our dashboard developer experience. Experience with React, TypeScript, server-side rendering, and SQL database interactions is essential. You will build highly collaborative realtime tables and charts using Tailwind and SVG elements. This is a fully remote position.",
    salary_min: 90000,
    salary_max: 130000,
    created: new Date(Date.now() - 86400000).toISOString(),
    redirect_url: "https://supabase.com",
    adref: "mock"
  },
  {
    id: "mock-job-3",
    title: "Fullstack Node.js Developer",
    company: { display_name: "Stripe" },
    location: { display_name: "Dublin" },
    description: "Looking for a fullstack developer to work on our dashboard and merchant tools. Strong skills in Node.js, Express, React, and RESTful API design. Hybrid role combining office collaboration with flexible remote work policies.",
    salary_min: 75000,
    salary_max: 110000,
    created: new Date(Date.now() - 172800000).toISOString(),
    redirect_url: "https://stripe.com",
    adref: "mock"
  },
  {
    id: "mock-job-4",
    title: "Frontend Tailwind CSS Developer",
    company: { display_name: "Tailwind Labs" },
    location: { display_name: "Chicago" },
    description: "Design and implement responsive layout components and modern landing pages using Tailwind CSS, React, and CSS theme tokens. Strong eye for details, typography, and micro-animations is highly desired. This is an on-site role in our Chicago office.",
    salary_min: 50000,
    salary_max: 80000,
    created: new Date(Date.now() - 259200000).toISOString(),
    redirect_url: "https://tailwindcss.com",
    adref: "mock"
  },
  {
    id: "mock-job-5",
    title: "Senior Python Backend Engineer",
    company: { display_name: "OpenAI" },
    location: { display_name: "San Francisco" },
    description: "Build scalable backend APIs and orchestrate AI models. Strong experience with Python, FastAPI, Postgres, and Docker. This is a senior role working on-site to build modern developer platform systems.",
    salary_min: 120000,
    salary_max: 180000,
    created: new Date(Date.now() - 345600000).toISOString(),
    redirect_url: "https://openai.com",
    adref: "mock"
  }
];

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
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

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.log("[DEBUG] Adzuna API credentials not configured. Serving mock fallback jobs.");
    const query = what.toLowerCase().trim();
    const results = MOCK_JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.display_name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
    );
    return new Response(
      JSON.stringify({ results, count: results.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const adzunaUrl = `${ADZUNA_API_BASE}/${country}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&results_per_page=${resultsPerPage}&content-type=application/json`;

  try {
    const resp = await fetch(adzunaUrl);
    console.log(`[DEBUG] Adzuna API fetch status: ${resp.status}`);
    
    let results = [];
    let count = 0;

    if (resp.status === 200) {
      const data = await resp.json();
      results = data.results ?? [];
      count = data.count ?? 0;
    } else {
      console.log(`[DEBUG] Adzuna API returned error code ${resp.status}. Serving mock fallback jobs.`);
      const query = what.toLowerCase().trim();
      results = MOCK_JOBS.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.display_name.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
      count = results.length;
    }

    return new Response(
      JSON.stringify({ results, count }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.log(`[DEBUG] Fetch failed: ${err.message}. Serving mock fallback jobs.`);
    const query = what.toLowerCase().trim();
    const results = MOCK_JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.display_name.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
    );
    return new Response(
      JSON.stringify({ results, count: results.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}
