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
  console.log("Fetching jobs from Remotive API...");
  try {
    // Fetch jobs across all categories
    const url = `https://remotive.com/api/remote-jobs?limit=150`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Remotive jobs: ${response.statusText}`);
    }
    
    const data = await response.json();
    const jobs = data.jobs || [];
    console.log(`Successfully fetched ${jobs.length} jobs.`);
    
    if (jobs.length === 0) {
      console.log("No jobs to process. Exiting.");
      return;
    }
    
    console.log("Mapping and inserting Remotive jobs to InsForge...");
    let successCount = 0;
    let errorCount = 0;
    
    for (const job of jobs) {
      const hash = crypto.createHash('md5').update(job.id.toString() + 'remotive').digest('hex');
      const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
      
      const locationName = job.candidate_required_location || "Remote Worldwide";
      const companyName = job.company_name || "Unknown Company";
      
      const rawData = {
        id: job.id.toString(),
        title: job.title,
        company: { display_name: companyName, logo_url: job.company_logo },
        location: { display_name: locationName },
        description: job.description, // Remotive gives rich HTML!
        redirect_url: job.url,
        created: job.publication_date,
        adref: "remotive",
        salary: job.salary,
        salary_min: null,
        salary_max: null,
        source: "Remotive"
      };

      try {
        const { data, error } = await insforge.database
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
          }], { onConflict: "id" })
          .select();
          
        if (error) {
          console.error(`Failed to insert Remotive job ${job.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing Remotive job ${job.id}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\nFinished! Successfully inserted/updated ${successCount} Remotive jobs with rich HTML details.`);
    if (errorCount > 0) {
      console.log(`Failed to process ${errorCount} jobs.`);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}

fetchJobs();
