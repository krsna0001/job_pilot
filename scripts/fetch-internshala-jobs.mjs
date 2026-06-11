import { createClient } from '@insforge/sdk';
import crypto from 'crypto';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!insforgeUrl || !insforgeKey) {
  console.error("Missing required environment variables in .env.local");
  process.exit(1);
}

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function fetchJobs() {
  console.log("Fetching jobs from Internshala...");
  try {
    const url = 'https://internshala.com/jobs/it-jobs/';
    const html = fs.readFileSync('internshala.html', 'utf8');
    const $ = cheerio.load(html);
    const jobs = [];
    console.log("Found jobs div count:", $('.individual_internship').length);
    $('.individual_internship').each((i, el) => {
      const title = $(el).find('.job-internship-name').text().trim();
      const company = $(el).find('.company-name').text().trim();
      const location = $(el).find('.locations').text().trim() || 'India';
      let link = $(el).find('a').first().attr('href') || url;
      
      if (link && !link.startsWith('http')) {
        link = `https://internshala.com${link}`;
      }
      
      const slug = $(el).attr('internshipid') || $(el).attr('jobid') || $(el).attr('id') || `internshala-${i}`;
      
      if (title && company) {
        jobs.push({
          id: slug.toString(),
          title,
          company_name: company,
          location: location || 'India',
          url: link || url,
          description: `<p>Apply on Internshala to view the full details of this position at ${company}.</p>`,
        });
      } else {
        console.log('Skipping missing title/company:', { title, company });
      }
    });
    
    console.log(`Successfully scraped ${jobs.length} jobs.`);
    
    if (jobs.length === 0) {
      console.log("No jobs to process. Exiting.");
      return;
    }
    
    console.log("Mapping and inserting jobs to InsForge...");
    let successCount = 0;
    let errorCount = 0;
    
    for (const job of jobs) {
      const hash = crypto.createHash('md5').update(job.id).digest('hex');
      const uuid = `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
      
      const rawData = {
        id: job.id,
        title: job.title,
        company: { display_name: job.company_name },
        location: { display_name: job.location },
        description: job.description,
        redirect_url: job.url,
        created: new Date().toISOString(),
        adref: "internshala",
        salary_min: null,
        salary_max: null,
        source: "Internshala"
      };

      try {
        const { data, error } = await insforge.database
          .from("jobs")
          .upsert([{ 
            id: uuid, 
            source_id: job.id,
            title: job.title,
            company_name: job.company_name,
            location: job.location,
            description: job.description,
            url: job.url,
            source: "Internshala",
            raw_data: rawData,
            match_score: null
          }], { onConflict: "id" })
          .select();
          
        if (error) {
          console.error(`Failed to insert Internshala job ${job.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing Internshala job ${job.id}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\nFinished! Successfully inserted/updated ${successCount} Internshala jobs.`);
    if (errorCount > 0) {
      console.log(`Failed to process ${errorCount} jobs.`);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}

fetchJobs();
