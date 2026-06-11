import { CompanyDossier } from "@/types/dossier";

export function CompanyResearch({
  companyDossier,
  companyName,
}: {
  companyDossier: CompanyDossier | null;
  companyName: string;
}) {
  if (!companyDossier) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted border border-border text-text-muted mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
         </div>
         <p className="text-sm font-semibold text-text-darkest">No research yet</p>
         <p className="mt-1 text-[13px] text-text-muted max-w-[250px] leading-relaxed">Click "Research Company" to let the AI browse {companyName}'s public pages and build a dossier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm animate-fade-in border-t border-border pt-6 mt-2">
       <div className="space-y-1">
         <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Company Overview</span>
         <p className="text-sm text-text-secondary leading-relaxed">{companyDossier.companyOverview}</p>
       </div>
       {companyDossier.techStack?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Tech Stack</span>
           <div className="flex flex-wrap gap-1">
             {companyDossier.techStack.map((tech) => (
               <span key={tech} className="rounded bg-surface-secondary border border-border px-1.5 py-0.5 text-[10px] font-semibold text-text-dark font-mono">{tech}</span>
             ))}
           </div>
         </div>
       )}
       {companyDossier.culture?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Culture & Values</span>
           <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
             {companyDossier.culture.map((signal) => <li key={signal}>{signal}</li>)}
           </ul>
         </div>
       )}
       {companyDossier.whyThisRole && (
         <div className="space-y-1">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Why This Role</span>
           <p className="text-sm text-text-secondary leading-relaxed">{companyDossier.whyThisRole}</p>
         </div>
       )}
       {companyDossier.yourEdge?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Edge</span>
           <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
             {companyDossier.yourEdge.map((edge) => <li key={edge}>{edge}</li>)}
           </ul>
         </div>
       )}
       {companyDossier.gapsToAddress?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Gaps to Address</span>
           <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
             {companyDossier.gapsToAddress.map((gap) => <li key={gap}>{gap}</li>)}
           </ul>
         </div>
       )}
       {companyDossier.smartQuestions?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Smart Questions</span>
           <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
             {companyDossier.smartQuestions.map((q) => <li key={q}>{q}</li>)}
           </ul>
         </div>
       )}
       {companyDossier.interviewPrep?.length > 0 && (
         <div className="space-y-1.5">
           <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Interview Prep</span>
           <ul className="list-disc pl-4 space-y-1 text-sm text-text-secondary">
             {companyDossier.interviewPrep.map((prep) => <li key={prep}>{prep}</li>)}
           </ul>
         </div>
       )}
       {companyDossier.sources?.length > 0 && (
         <div className="space-y-1.5 mt-4 pt-4 border-t border-border/50">
           <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sources</span>
           <div className="flex flex-col gap-1">
             {companyDossier.sources.map((src, i) => (
               <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent hover:underline break-all">
                 {src}
               </a>
             ))}
           </div>
         </div>
       )}
    </div>
  );
}
