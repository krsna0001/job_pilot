import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@insforge/sdk@latest"
import { Resend } from "npm:resend@latest"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const insforgeUrl = Deno.env.get('INSFORGE_URL') ?? ''
    const insforgeAnonKey = Deno.env.get('INSFORGE_ANON_KEY') ?? ''
    
    // Create a client with the anon key and use service role or anon depending on permissions
    // Since we need to read all profiles, we need service_role key
    const insforgeServiceRoleKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY') ?? ''
    
    const insforge = createClient(insforgeUrl, insforgeServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Fetch users with email_alerts_enabled = true
    const { data: profiles, error: profilesError } = await insforge
      .from('profiles')
      .select('user_id, headline, email_alerts_frequency')
      .eq('email_alerts_enabled', true)

    if (profilesError) throw profilesError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users opted in for alerts" }), { status: 200 })
    }

    // 2. Fetch recent jobs (last 24 hours for daily)
    // In a real app we'd match jobs to user skills, but for v1 we'll just fetch latest jobs
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: recentJobs, error: jobsError } = await insforge
      .from('jobs')
      .select('id, title, company_name, location')
      .gte('created_at', yesterday.toISOString())
      .limit(10)

    if (jobsError) throw jobsError
    if (!recentJobs || recentJobs.length === 0) {
      return new Response(JSON.stringify({ message: "No new jobs found today" }), { status: 200 })
    }

    // 3. For each user, get their email and send
    let emailsSent = 0;
    
    for (const profile of profiles) {
      // Get user's email from auth.users (requires service role)
      const { data: userData, error: userError } = await insforge.auth.admin.getUserById(profile.user_id)
      
      if (userError || !userData?.user?.email) continue;
      
      const userEmail = userData.user.email;

      // Generate HTML email
      const jobsHtml = recentJobs.map(job => 
        `<li><strong>${job.title}</strong> at ${job.company_name} (${job.location})</li>`
      ).join('')

      const html = `
        <h2>JobPilot Daily Alerts</h2>
        <p>Here are the latest jobs added in the last 24 hours:</p>
        <ul>${jobsHtml}</ul>
        <p><br/><small>You are receiving this because you enabled Email Alerts in your JobPilot Profile.</small></p>
      `

      // Send via Resend
      const { error: resendError } = await resend.emails.send({
        from: 'JobPilot <alerts@yourdomain.com>', // User will need to configure verified domain in Resend
        to: [userEmail],
        subject: `JobPilot: ${recentJobs.length} new jobs found`,
        html: html
      })

      if (!resendError) {
        emailsSent++;
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
