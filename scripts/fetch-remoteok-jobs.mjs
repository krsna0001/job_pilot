import { createClient } from '@insforge/sdk';
import crypto from 'crypto';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!insforgeUrl || !insforgeKey) {
  console.error("Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY in .env.local");
  process.exit(1);
}

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function fetchJobs() {
  console.log("Fetching jobs from RemoteOK API...");
  try {
    const response = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://remoteok.com/",
        "Cache-Control": "no-cache",
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RemoteOK jobs: ${response.statusText}`);
    }
    
    const data = await response.json();
    // The first item is a legal header, skip it!
    const rawJobs = Array.isArray(data) ? data.slice(1) : [];
    console.log(`Successfully fetched ${rawJobs.length} jobs from RemoteOK.`);
    
    if (rawJobs.length === 0) {
      console.log("No jobs to process. Exiting.");
      return;
    }
    
    console.log("Mapping and inserting RemoteOK jobs to InsForge...");
    let successCount = 0;
    let errorCount = 0;
    
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

      try {
        const { data: insertedData, error } = await insforge.database
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
          }], { onConflict: "id" })
          .select();
          
        if (error) {
          console.error(`Failed to insert RemoteOK job ${job.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing RemoteOK job ${job.id}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\nFinished! Successfully inserted/updated ${successCount} RemoteOK jobs.`);
    if (errorCount > 0) {
      console.log(`Failed to process ${errorCount} jobs.`);
    }
  } catch (error) {
    console.error("Error fetching RemoteOK jobs:", error);
  }
}

fetchJobs();
