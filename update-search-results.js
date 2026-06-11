const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'find-jobs', 'components', 'SearchDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The issue is that filteredResults is not rendered.
// Let's replace the whole {/* Main Job Listings */} div with a conditional render
// that shows filteredResults using JobCard if a search is active, else dbJobs.

const mainListingsStart = content.indexOf('{/* Main Job Listings */}');
if (mainListingsStart === -1) {
    console.error('Could not find Main Job Listings section');
    process.exit(1);
}

const beforeListings = content.substring(0, mainListingsStart);

const newListings = `{/* Main Job Listings */}
      <div className="space-y-5">
        {isLoading && (
            <div className="space-y-3 animate-fade-in">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-5 sm:p-6"
                  style={{ animationDelay: \`\${i * 60}ms\` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block h-11 w-11 skeleton-shimmer rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                           <div className="h-4 w-3/4 skeleton-shimmer rounded-md" />
                           <div className="h-3.5 w-1/3 skeleton-shimmer rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {!isLoading && (results.length > 0 || currentQuery) ? (
          <div className="space-y-4 animate-fade-in">
             <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h2 className="text-lg font-semibold text-text-darkest">Search Results ({count})</h2>
             </div>
             {filteredResults.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  title="No matching jobs found"
                  description="Try adjusting your filters to see more results."
                />
             ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredResults.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onSave={handleSave} 
                      onUnsave={handleUnsave} 
                      isSaved={savedIds.has(job.id)} 
                      isSaving={savingIds.has(job.id)} 
                      matchScore={matchScores[job.id]}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>
             )}
             
             {/* Pagination for Search Results */}
             {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/50">
                  <div className="text-[13px] text-text-muted">
                    Page <span className="font-semibold text-text-primary">{page}</span> of <span className="font-semibold text-text-primary">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page <= 1 || isLoading}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages || isLoading}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
             )}
          </div>
        ) : (
          !isLoading && dbJobs.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No matching jobs found"
              description="Try adjusting your filters or use the search above to find and score new jobs."
            />
          ) : !isLoading && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                 <h2 className="text-lg font-semibold text-text-darkest">Recently Saved Jobs</h2>
              </div>
              <div key={\`sort-\${sortByDB}\`} className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
                <div className="min-w-full divide-y divide-border">
                  {dbJobs.map((dbJob, i) => {
                    const job = dbJob.job_data;
                    const scoreValue = dbJob.match_score ?? null;
                    const scoreColor = scoreValue === null ? "bg-border" : scoreValue >= 75 ? "bg-success" : scoreValue >= 50 ? "bg-warning" : "bg-error";
                    const scoreTextColor = scoreValue === null ? "text-text-muted" : scoreValue >= 75 ? "text-success" : scoreValue >= 50 ? "text-warning" : "text-error";
                    
                    const rawMin = job.salary_min ?? job.salaryMin;
                    const rawMax = job.salary_max ?? job.salaryMax;
                    const parsedMin = Number(rawMin) || 0;
                    const parsedMax = Number(rawMax) || 0;
                    const hasSalary = parsedMin > 0 || parsedMax > 0;
                    const activeCurrency = currencySymbol || "$";
                    const salaryLabel = hasSalary ? (parsedMin > 0 && parsedMax > 0 && parsedMin !== parsedMax ? \`\${activeCurrency}\${(parsedMin / 1000).toFixed(0)}k - \${activeCurrency}\${(parsedMax / 1000).toFixed(0)}k\` : \`\${activeCurrency}\${((parsedMax || parsedMin) / 1000).toFixed(0)}k\`) : null;
                    
                    const daysAgo = Math.floor((Date.now() - new Date(dbJob.created_at || new Date()).getTime()) / 86400000);
                    const freshnessLabel = daysAgo === 0 ? "Just now" : daysAgo === 1 ? "Yesterday" : \`\${daysAgo}d ago\`;
                    const sourceName = job.source || "Search";
                    
                    return (
                      <div
                        key={dbJob.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-surface-hover transition-colors group cursor-pointer animate-fade-in"
                        style={{ animationDelay: \`\${(i % 10) * 50}ms\`, animationFillMode: "both" }}
                        onClick={() => window.location.href = \`/find-jobs/\${job.id}\`}
                      >
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3 flex items-center gap-4 truncate pr-4">
                            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-surface-muted border border-border text-text-secondary text-sm font-semibold group-hover:border-accent/20 transition-colors">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-text-darkest truncate text-[14px]">{job.company?.display_name || 'Unknown'}</span>
                          </div>
                          
                          <div className="col-span-3 truncate text-[14px] font-medium text-text-primary pr-4">
                            {job.title}
                          </div>
                          
                          <div className="col-span-2 flex items-center gap-3 pr-4">
                            {scoreValue !== null ? (
                              <>
                                <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                                  <div className={\`h-full rounded-full \${scoreColor}\`} style={{ width: \`\${scoreValue}%\` }} />
                                </div>
                                <span className={\`text-[13px] font-bold w-9 \${scoreTextColor}\`}>{scoreValue}%</span>
                              </>
                            ) : (
                              <div className="h-1.5 w-16 skeleton-shimmer rounded-full" />
                            )}
                          </div>
                          
                          <div className="col-span-2 text-[13px] font-semibold text-text-primary truncate">
                            {salaryLabel || <span className="text-text-muted font-normal">Not listed</span>}
                          </div>
                          
                          <div className="col-span-1 flex justify-center">
                            <span className="inline-flex items-center rounded-full bg-[#f3e8ff] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#7e22ce] whitespace-nowrap">
                              {sourceName}
                            </span>
                          </div>
                          
                          <div className="col-span-1 text-right text-[12px] text-text-muted font-medium truncate">
                            {freshnessLabel}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {Math.ceil(dbTotalCount / 20) > 1 && (
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/50">
                  <div className="text-[13px] text-text-muted">
                    Showing <span className="font-semibold text-text-primary">{Math.min((dbPage - 1) * 20 + 1, dbTotalCount === 0 ? 0 : dbTotalCount)}</span> to <span className="font-semibold text-text-primary">{Math.min(dbPage * 20, dbTotalCount)}</span> of <span className="font-semibold text-text-primary">{dbTotalCount}</span> results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDbPage(Math.max(1, dbPage - 1))}
                      disabled={dbPage <= 1 || isLoading}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDbPage(dbPage + 1)}
                      disabled={dbPage >= Math.ceil(dbTotalCount / 20) || isLoading}
                      className="flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync(filePath, beforeListings + newListings);
console.log('Successfully updated SearchDashboard.tsx to render search results');
