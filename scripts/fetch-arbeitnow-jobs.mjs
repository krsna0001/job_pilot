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
  console.log("Fetching jobs from Arbeitnow API...");
  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api");
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }
    
    const data = await response.json();
    const jobs = data.data || [];
    console.log(`Successfully fetched ${jobs.length} jobs.`);
    
    if (jobs.length === 0) {
      console.log("No jobs to process. Exiting.");
      return;
    }
    
    console.log("Mapping and inserting jobs to InsForge...");
    let successCount = 0;
    let errorCount = 0;
    
    // We will process them sequentially
    for (const job of jobs) {
      const hash = crypto.createHash('md5').update(job.slug).digest('hex');
      const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
      const rawData = {
        id: job.slug,
        title: job.title,
        company: { display_name: job.company_name },
        location: { display_name: job.location },
        description: job.description, // already contains HTML!
        redirect_url: job.url,
        created: new Date(job.created_at * 1000).toISOString(),
        adref: "arbeitnow",
        salary_min: null,
        salary_max: null,
        source: "Arbeitnow"
      };

      try {
        const { data, error } = await insforge.database
          .from("jobs")
          .upsert([{ 
            id: uuid, 
            source_id: job.slug,
            title: job.title,
            company_name: job.company_name,
            location: job.location,
            description: job.description,
            url: job.url,
            source: "Arbeitnow",
            raw_data: rawData,
            match_score: null
          }], { onConflict: "id" })
          .select();
          
        if (error) {
          console.error(`Failed to insert job ${job.slug}:`, error);
          errorCount++;
        } else {
          console.log(`Success:`, data);
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing job ${job.slug}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\nFinished! Successfully inserted/updated ${successCount} jobs.`);
    if (errorCount > 0) {
      console.log(`Failed to process ${errorCount} jobs.`);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}

fetchJobs();
