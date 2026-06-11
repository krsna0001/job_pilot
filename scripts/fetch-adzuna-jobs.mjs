import { createClient } from '@insforge/sdk';
import crypto from 'crypto';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const adzunaAppId = process.env.ADZUNA_APP_ID;
const adzunaAppKey = process.env.ADZUNA_APP_KEY;

if (!insforgeUrl || !insforgeKey || !adzunaAppId || !adzunaAppKey) {
  console.error("Missing required environment variables in .env.local");
  process.exit(1);
}

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function fetchJobs() {
  const countries = ['in', 'us', 'gb', 'ca', 'au'];
  console.log(`Fetching jobs from Adzuna API for countries: ${countries.join(', ')}...`);
  
  let totalSuccess = 0;
  let totalError = 0;

  for (const country of countries) {
    try {
      console.log(`\n--- Fetching jobs for ${country.toUpperCase()} ---`);
      // Fetch top 50 software/tech jobs in this country
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=50&what=software&what_and=developer%20engineer%20data&sort_by=relevance`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch Adzuna jobs for ${country}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const jobs = data.results || [];
      console.log(`Successfully fetched ${jobs.length} jobs for ${country}.`);
      
      if (jobs.length === 0) {
        console.log(`No jobs to process for ${country}. Skipping.`);
        continue;
      }
      
      console.log(`Mapping and inserting ${country} jobs to InsForge...`);
      
      for (const job of jobs) {
        const hash = crypto.createHash('md5').update(job.id.toString()).digest('hex');
        const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
        
        const locationName = job.location && job.location.display_name ? job.location.display_name : "Remote / Unknown";
        const companyName = job.company && job.company.display_name ? job.company.display_name : "Unknown Company";
        
        const rawData = {
          id: job.id.toString(),
          title: job.title,
          company: { display_name: companyName },
          location: { display_name: locationName },
          description: `<p>${job.description}</p>`,
          redirect_url: job.redirect_url,
          created: job.created,
          adref: job.adref || "adzuna",
          salary_min: job.salary_min || null,
          salary_max: job.salary_max || null,
          source: "Adzuna"
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
              description: `<p>${job.description}</p>`,
              url: job.redirect_url,
              source: "Adzuna",
              raw_data: rawData,
              match_score: null
            }], { onConflict: "id" })
            .select();
            
          if (error) {
            console.error(`Failed to insert Adzuna job ${job.id}:`, error);
            totalError++;
          } else {
            totalSuccess++;
          }
        } catch (err) {
          console.error(`Error processing Adzuna job ${job.id}:`, err);
          totalError++;
        }
      }
    } catch (error) {
      console.error(`Error fetching jobs for ${country}:`, error);
    }
  }

  console.log(`\nFinished! Successfully inserted/updated ${totalSuccess} Adzuna jobs globally.`);
  if (totalError > 0) {
    console.log(`Failed to process ${totalError} jobs.`);
  }
}

fetchJobs();
