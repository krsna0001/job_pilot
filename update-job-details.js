const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'find-jobs', '[id]', 'JobDetailsClient.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Find the start of the return statement for JobDetailsContent
// It should be around line 501
const returnIndex = lines.findIndex((line, index) => index > 400 && line.trim() === 'return (' && lines[index+1].includes('space-y-6 animate-fade-in'));

if (returnIndex === -1) {
    console.error('Could not find the return statement');
    process.exit(1);
}

const newReturn = `  return (
    <div className="relative mx-auto max-w-4xl space-y-6 animate-fade-in pb-24">
      {/* Back Link */}
      <Link href="/find-jobs" className="group inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </Link>

      {errorMessage && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error animate-fade-in-down">
          {errorMessage}
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-muted border border-border">
             <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-darkest tracking-tight">{job.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary">{job.company_name}</span>
              <span className="text-text-muted">•</span>
              {matchScore !== null ? (
                <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  {matchScore}% Match Score
                </span>
              ) : (
                <button onClick={runMatchScoring} className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary hover:text-accent transition">
                  {isScoring ? "Scoring..." : "Get Match Score"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-darkest transition hover:border-text-muted">
            <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Job Post
          </a>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Salary */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">{salaryText}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Salary Est.</p>
           </div>
        </div>
        {/* Location */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate" title={job.location || "Remote"}>{job.location || "Remote"}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Location</p>
           </div>
        </div>
        {/* Job Type */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">—</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Job Type</p>
           </div>
        </div>
        {/* Date Found */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted border border-border text-text-secondary shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
           </div>
           <div className="min-w-0">
              <p className="text-sm font-bold text-text-darkest truncate">{postedDate}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5">Date Found</p>
           </div>
        </div>
      </div>

      {/* AI MATCH REASONING Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success/10 text-success shrink-0">
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
               </svg>
            </div>
            <span className="text-xs uppercase tracking-[0.1em] font-semibold text-text-secondary">AI Match Reasoning</span>
         </div>
         <p className="text-sm text-text-darkest leading-relaxed font-medium">
            {skillsBreakdown ? \`The candidate possesses a strong background matching \${skillsBreakdown.match_percentage}% of the job's technical requirements. \${skillsBreakdown.matched_skills.length > 0 ? \`They have expertise in \${skillsBreakdown.matched_skills.slice(0, 4).join(", ")}, aligning well with the role.\` : ''} \${skillsBreakdown.missing_skills.length > 0 ? \`However, a lack of explicit experience in \${skillsBreakdown.missing_skills.slice(0, 2).join(", ")} represents a gap in the job's demands.\` : ''}\` : "AI reasoning not available. Analyze skills to generate."}
         </p>
      </div>

      {/* REQUIRED SKILLS VS YOUR PROFILE Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="mb-6">
            <span className="text-xs uppercase tracking-[0.1em] font-semibold text-text-secondary">Required Skills vs Your Profile</span>
         </div>
         
         {!skillsBreakdown ? (
            <div className="text-center py-4">
               <p className="text-sm text-text-secondary mb-3">Analyze the job requirements against your parsed skills.</p>
               <button onClick={runSkillsAnalysis} disabled={isExtractingSkills} className="rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-darkest hover:border-accent hover:text-accent transition shadow-sm">
                  {isExtractingSkills ? "Analyzing..." : "Analyze Skills"}
               </button>
            </div>
         ) : (
            <div className="space-y-6">
               <div>
                  <p className="text-[11px] font-semibold text-text-muted mb-2">You have</p>
                  <div className="flex flex-wrap gap-2">
                     {skillsBreakdown.matched_skills.length > 0 ? skillsBreakdown.matched_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                           {skill}
                        </span>
                     )) : <span className="text-sm text-text-secondary">None found</span>}
                  </div>
               </div>
               <div>
                  <p className="text-[11px] font-semibold text-text-muted mb-2">Gap skills</p>
                  <div className="flex flex-wrap gap-2">
                     {skillsBreakdown.missing_skills.length > 0 ? skillsBreakdown.missing_skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                           {skill}
                        </span>
                     )) : <span className="text-sm text-text-secondary">No gap skills!</span>}
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Job Description Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-muted border border-border text-text-secondary shrink-0">
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-darkest">Job Description</h2>
         </div>
         <div className="text-sm text-text-darkest leading-7 whitespace-pre-line">
            {job.description}
         </div>
      </div>

      {/* Company Research Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
               <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
               </div>
               <h2 className="text-sm font-semibold text-text-darkest">Company Research</h2>
            </div>
            {!companyDossier && (
               <button onClick={runCompanyResearch} disabled={isResearchingCompany} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent-dark transition">
                  {isResearchingCompany ? (
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                  )}
                  Research Company
               </button>
            )}
         </div>
         
         {!companyDossier ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted border border-border text-text-muted mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
               </div>
               <p className="text-sm font-semibold text-text-darkest">No research yet</p>
               <p className="mt-1 text-[13px] text-text-muted max-w-[250px] leading-relaxed">Click "Research Company" to let the AI browse {job.company_name}'s public pages and build a dossier.</p>
            </div>
         ) : (
            <div className="space-y-4 text-sm animate-fade-in border-t border-border pt-4 mt-2">
               <div className="space-y-1">
                 <span className="text-xs font-bold text-text-muted uppercase tracking-wider">About the Company</span>
                 <p className="text-sm text-text-secondary leading-relaxed">{companyDossier.business_summary}</p>
               </div>
               {companyDossier.tech_stack?.length > 0 && (
                 <div className="space-y-1.5">
                   <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Tech Stack</span>
                   <div className="flex flex-wrap gap-1">
                     {companyDossier.tech_stack.map((tech) => (
                       <span key={tech} className="rounded bg-surface-secondary border border-border px-1.5 py-0.5 text-[10px] font-semibold text-text-dark font-mono">{tech}</span>
                     ))}
                   </div>
                 </div>
               )}
               {companyDossier.culture_signals?.length > 0 && (
                 <div className="space-y-1.5">
                   <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Culture & Work Values</span>
                   <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
                     {companyDossier.culture_signals.map((signal) => <li key={signal}>{signal}</li>)}
                   </ul>
                 </div>
               )}
            </div>
         )}
      </div>

      {/* Sticky Bottom Apply Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/80 backdrop-blur-xl p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
         <div className="mx-auto max-w-4xl flex justify-center">
            {job.url ? (
               <a href={job.url} target="_blank" rel="noopener noreferrer" className="w-full text-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent-dark transition">
                  Apply Now at {job.company_name}
               </a>
            ) : (
               <button disabled className="w-full text-center rounded-xl bg-accent/50 px-6 py-3.5 text-sm font-semibold text-accent-foreground cursor-not-allowed">
                  Application Link Unavailable
               </button>
            )}
         </div>
      </div>
    </div>
  );
}`;

const newLines = lines.slice(0, returnIndex);
newLines.push(newReturn);
newLines.push('}');

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Successfully updated JobDetailsClient.tsx');
