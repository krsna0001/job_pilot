import Link from "next/link";
import { createInsforgeServer } from "../../lib/insforge-server";
import AuthenticatedHeader from "../components/AuthenticatedHeader";
import { JobsFoundAreaChart, MatchScoreBarChart, CompanyResearchBarChart } from "./components/DashboardCharts";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user;

  let totalJobsFound = 0;
  let avgMatchRate = 0;
  let companiesResearchedCount = 0;
  let jobsThisWeek = 0;

  if (user) {
    const { data: savedJobs } = await insforge.database
      .from("saved_jobs")
      .select("id, match_score, company_research, created_at")
      .eq("user_id", user.id);

    if (savedJobs) {
      totalJobsFound = savedJobs.length;

      const scoredJobs = savedJobs.filter((j: any) => j.match_score !== null);
      if (scoredJobs.length > 0) {
        avgMatchRate = Math.round(
          scoredJobs.reduce((sum: number, j: any) => sum + j.match_score, 0) / scoredJobs.length
        );
      }

      companiesResearchedCount = savedJobs.filter((j: any) => j.company_research !== null).length;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      jobsThisWeek = savedJobs.filter((j: any) => new Date(j.created_at) >= sevenDaysAgo).length;
    }
  }

  let jobsOverTimeData: any[] = [];
  let matchScoreData: any[] = [];
  let companyResearchData: any[] = [];

  if (user) {
    try {
      const { runHogQLQuery } = await import("../../lib/posthog-server");

      // 1. Company Research Data (last 7 days)
      const companyResearchedQuery = await runHogQLQuery(`
        SELECT toStartOfDay(timestamp) AS day, count() AS value 
        FROM events 
        WHERE event = 'company_researched' 
          AND distinct_id = '${user.id}' 
          AND timestamp >= now() - INTERVAL 7 DAY 
        GROUP BY day 
        ORDER BY day ASC
      `);
      if (companyResearchedQuery.results) {
        companyResearchData = companyResearchedQuery.results.map((row: any) => ({
          name: new Date(row[0]).toLocaleDateString("en-US", { weekday: "short" }),
          value: row[1]
        }));
      }

      // 2. Jobs Found Over Time (cumulative count last 7 days)
      const jobsFoundQuery = await runHogQLQuery(`
        SELECT day, sum(daily_count) OVER (ORDER BY day) AS cumulative_count
        FROM (
          SELECT toStartOfDay(timestamp) AS day, count() AS daily_count
          FROM events
          WHERE event = 'job_found'
            AND distinct_id = '${user.id}'
            AND timestamp >= now() - INTERVAL 7 DAY
          GROUP BY day
        )
        ORDER BY day ASC
      `);
      if (jobsFoundQuery.results) {
        jobsOverTimeData = jobsFoundQuery.results.map((row: any) => ({
          name: new Date(row[0]).toLocaleDateString("en-US", { weekday: "short" }),
          value: row[1]
        }));
      }

      // 3. Match Score Distribution
      const matchScoreQuery = await runHogQLQuery(`
        SELECT 
          multiIf(
            toFloat(JSONExtractRaw(properties, 'matchScore')) >= 90, '90-100%',
            toFloat(JSONExtractRaw(properties, 'matchScore')) >= 80, '80-90%',
            toFloat(JSONExtractRaw(properties, 'matchScore')) >= 70, '70-80%',
            toFloat(JSONExtractRaw(properties, 'matchScore')) >= 60, '60-70%',
            toFloat(JSONExtractRaw(properties, 'matchScore')) >= 50, '50-60%',
            '< 50%'
          ) AS score_bucket,
          count() AS value
        FROM events
        WHERE event = 'job_found'
          AND distinct_id = '${user.id}'
          AND JSONHas(properties, 'matchScore')
        GROUP BY score_bucket
        ORDER BY score_bucket DESC
      `);
      if (matchScoreQuery.results && matchScoreQuery.results.length > 0) {
        matchScoreData = matchScoreQuery.results.map((row: any) => ({
          name: row[0],
          value: row[1]
        }));
      }
    } catch (e) {
      console.error("Failed to load PostHog data", e);
    }
  }

  // Fallback dummy data if no data was found or PostHog failed
  if (companyResearchData.length === 0) {
    companyResearchData = [
      { name: "Mon", value: 1 },
      { name: "Tue", value: 3 },
      { name: "Wed", value: 2 },
      { name: "Thu", value: 5 },
      { name: "Fri", value: 4 },
      { name: "Sat", value: 0 },
      { name: "Sun", value: 1 },
    ];
  }
  
  if (jobsOverTimeData.length === 0) {
    jobsOverTimeData = [
      { name: "Mon", value: 4 },
      { name: "Tue", value: 12 },
      { name: "Wed", value: 25 },
      { name: "Thu", value: 31 },
      { name: "Fri", value: 45 },
      { name: "Sat", value: 48 },
      { name: "Sun", value: 52 },
    ];
  }

  if (matchScoreData.length === 0) {
    matchScoreData = [
      { name: "90-100%", value: 12 },
      { name: "80-90%", value: 24 },
      { name: "70-80%", value: 16 },
      { name: "60-70%", value: 4 },
      { name: "< 60%", value: 1 },
    ];
  }

  const recentActivity = [
    { type: "found", text: "Found 8 jobs for Frontend Engineer", time: "10 mins ago", color: "bg-violet-500" },
    { type: "researched", text: "Researched Stripe", time: "1 hour ago", color: "bg-blue-400" },
    { type: "found", text: "Found 12 jobs for React Developer", time: "2 hours ago", color: "bg-emerald-400" },
    { type: "researched", text: "Researched Vercel", time: "Yesterday", color: "bg-violet-500" },
    { type: "found", text: "Found 10 jobs for Full Stack Engineer", time: "Yesterday", color: "bg-emerald-400" },
  ];

  return (
    <>
      <AuthenticatedHeader email={user?.email} name={user?.profile?.name} />
      <main className="min-h-screen bg-[#fafafa] text-[#171717]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
          
          {/* Top Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-medium text-[#888888] mb-2">Total Jobs Found</p>
              <p className="text-[32px] font-bold text-[#171717] tracking-tight leading-none mb-3">{totalJobsFound}</p>
            </div>
            
            <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-medium text-[#888888] mb-2">Avg. Match Rate</p>
              <p className="text-[32px] font-bold text-[#171717] tracking-tight leading-none mb-3">{avgMatchRate}%</p>
            </div>

            <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-medium text-[#888888] mb-2">Companies Researched</p>
              <p className="text-[32px] font-bold text-[#171717] tracking-tight leading-none mb-3">{companiesResearchedCount}</p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#a1a1a1]">Total researched</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-medium text-[#888888] mb-2">Jobs This Week</p>
              <p className="text-[32px] font-bold text-[#171717] tracking-tight leading-none mb-3">{jobsThisWeek}</p>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#a1a1a1]">New this week</span>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid gap-6 lg:grid-cols-[2fr_3fr] mb-6">
            {/* Recent Activity */}
            <div className="rounded-xl border border-[#ebebeb] bg-white shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-[#ebebeb]">
                <h3 className="text-[15px] font-semibold text-[#171717]">Recent Activity</h3>
              </div>
              <div className="p-6 flex-1">
                <div className="relative pl-3 space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-[#ebebeb]" />
                  
                  {recentActivity.map((act, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={`z-10 mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full ${act.color} ring-4 ring-white`} />
                      <div>
                        <p className="text-[14px] font-medium text-[#171717] mb-1">{act.text}</p>
                        <p className="text-[12px] text-[#a1a1a1]">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Research Activity Chart */}
            <div className="rounded-xl border border-[#ebebeb] bg-white shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-[#ebebeb] mb-2">
                <h3 className="text-[15px] font-semibold text-[#171717]">Company Research Activity</h3>
              </div>
              <div className="p-6 pt-2 flex-1">
                <CompanyResearchBarChart data={companyResearchData} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            {/* Jobs Found Over Time Chart */}
            <div className="rounded-xl border border-[#ebebeb] bg-white shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-[#ebebeb] mb-2">
                <h3 className="text-[15px] font-semibold text-[#171717]">Jobs Found Over Time</h3>
              </div>
              <div className="p-6 pt-2 flex-1">
                <JobsFoundAreaChart data={jobsOverTimeData} />
              </div>
            </div>

            {/* Match Score Distribution Chart */}
            <div className="rounded-xl border border-[#ebebeb] bg-white shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-[#ebebeb] mb-2">
                <h3 className="text-[15px] font-semibold text-[#171717]">Match Score Distribution</h3>
              </div>
              <div className="p-6 pt-2 flex-1">
                <MatchScoreBarChart data={matchScoreData} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
