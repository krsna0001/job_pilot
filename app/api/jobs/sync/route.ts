import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import crypto from 'crypto';

export const maxDuration = 60; // Allow up to 60 seconds on Vercel

export async function GET(request: NextRequest) {
  // Check authorization key or active user session
  const authHeader = request.headers.get("Authorization");
  const url = new URL(request.url);
  const secretKey = url.searchParams.get("key") || (authHeader ? authHeader.replace("Bearer ", "") : "");

  const expectedKey = process.env.INSFORGE_API_KEY;
  let isAuthorized = false;

  if (expectedKey && secretKey === expectedKey) {
    isAuthorized = true;
  } else {
    // Fallback: check if the user is authenticated with InsForge
    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.getCurrentUser();
    if (!error && data?.user) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const syncResults = await runSync();
    return NextResponse.json(syncResults);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

async function runSync() {
  const insforge = await createInsforgeServer();
  const summary = {
    remoteok: { success: 0, error: 0, total: 0 },
    remotive: { success: 0, error: 0, total: 0 },
    arbeitnow: { success: 0, error: 0, total: 0 }
  };

  // 1. RemoteOK Sync (top 40 jobs)
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const rawJobs = Array.isArray(data) ? data.slice(1, 41) : [];
      summary.remoteok.total = rawJobs.length;

      for (const job of rawJobs) {
        if (!job.id || !job.position) continue;
        const hash = crypto.createHash('md5').update(job.id.toString() + 'remoteok').digest('hex');
        const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
        
        const locationName = job.location || "Remote";
        const companyName = job.company || "Unknown Company";
        
        const rawData = {
          id: job.id.toString(),
          title: job.position,
          company: { display_name: companyName, logo_url: job.company_logo || job.logo || "" },
          location: { display_name: locationName },
          description: job.description || "",
          redirect_url: job.apply_url || job.url || "",
          created: job.date || new Date(job.epoch * 1000).toISOString(),
          adref: "remoteok",
          salary_min: job.salary_min || null,
          salary_max: job.salary_max || null,
          source: "RemoteOK"
        };

        const { error } = await insforge.database
          .from("jobs")
          .upsert([{ 
            id: uuid, 
            source_id: job.id.toString(),
            title: job.position,
            company_name: companyName,
            location: locationName,
            description: job.description || "",
            url: job.apply_url || job.url || "",
            source: "RemoteOK",
            raw_data: rawData,
            match_score: null
          }], { onConflict: "id" });

        if (error) summary.remoteok.error++;
        else summary.remoteok.success++;
      }
    }
  } catch (err) {
    console.error("RemoteOK sync error:", err);
  }

  // 2. Remotive Sync (top 40 jobs)
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=40");
    if (res.ok) {
      const data = await res.json();
      const rawJobs = data.jobs || [];
      summary.remotive.total = rawJobs.length;

      for (const job of rawJobs) {
        if (!job.id || !job.title) continue;
        const hash = crypto.createHash('md5').update(job.id.toString() + 'remotive').digest('hex');
        const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
        
        const locationName = job.candidate_required_location || "Remote Worldwide";
        const companyName = job.company_name || "Unknown Company";
        
        const rawData = {
          id: job.id.toString(),
          title: job.title,
          company: { display_name: companyName, logo_url: job.company_logo },
          location: { display_name: locationName },
          description: job.description,
          redirect_url: job.url,
          created: job.publication_date,
          adref: "remotive",
          salary: job.salary,
          salary_min: null,
          salary_max: null,
          source: "Remotive"
        };

        const { error } = await insforge.database
          .from("jobs")
          .upsert([{ 
            id: uuid, 
            source_id: job.id.toString(),
            title: job.title,
            company_name: companyName,
            location: locationName,
            description: job.description,
            url: job.url,
            source: "Remotive",
            raw_data: rawData,
            match_score: null
          }], { onConflict: "id" });

        if (error) summary.remotive.error++;
        else summary.remotive.success++;
      }
    }
  } catch (err) {
    console.error("Remotive sync error:", err);
  }

  // 3. Arbeitnow Sync (top 40 jobs)
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
    if (res.ok) {
      const data = await res.json();
      const rawJobs = (data.data || []).slice(0, 40);
      summary.arbeitnow.total = rawJobs.length;

      for (const job of rawJobs) {
        if (!job.slug || !job.title) continue;
        const hash = crypto.createHash('md5').update(job.slug).digest('hex');
        const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
        
        const locationName = job.location || "Remote";
        const companyName = job.company_name || "Unknown Company";

        const rawData = {
          id: job.slug,
          title: job.title,
          company: { display_name: companyName },
          location: { display_name: locationName },
          description: job.description,
          redirect_url: job.url,
          created: new Date(job.created_at * 1000).toISOString(),
          adref: "arbeitnow",
          salary_min: null,
          salary_max: null,
          source: "Arbeitnow"
        };

        const { error } = await insforge.database
          .from("jobs")
          .upsert([{ 
            id: uuid, 
            source_id: job.slug,
            title: job.title,
            company_name: companyName,
            location: locationName,
            description: job.description,
            url: job.url,
            source: "Arbeitnow",
            raw_data: rawData,
            match_score: null
          }], { onConflict: "id" });

        if (error) summary.arbeitnow.error++;
        else summary.arbeitnow.success++;
      }
    }
  } catch (err) {
    console.error("Arbeitnow sync error:", err);
  }

  return { success: true, timestamp: new Date().toISOString(), summary };
}
