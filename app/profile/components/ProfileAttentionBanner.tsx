'use client';

interface ProfileAttentionBannerProps {
  hasResume: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasPreferences: boolean;
}

export default function ProfileAttentionBanner({
  hasResume,
  hasSkills,
  hasExperience,
  hasEducation,
  hasPreferences,
}: ProfileAttentionBannerProps) {
  // Compute completion score
  const items = [
    { label: "Resume", val: hasResume },
    { label: "Skills", val: hasSkills },
    { label: "Work Experience", val: hasExperience },
    { label: "Education", val: hasEducation },
    { label: "Job Preferences", val: hasPreferences },
  ];
  
  const completedCount = items.filter((item) => item.val).length;
  const score = Math.round((completedCount / items.length) * 100);
  const missingItems = items.filter((item) => !item.val);

  // SVG parameters
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        {/* SVG Circular Ring */}
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-border"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-accent transition-all duration-500 ease-out"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-darkest">{score}%</span>
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">Complete</span>
          </div>
        </div>

        {/* Text & Warning Badges */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-text-darkest">Profile Status</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {score === 100
              ? "Your profile is fully complete! You are ready for AI match scoring."
              : "Complete the remaining sections to achieve 100% and enable full AI match scoring."}
          </p>

          {missingItems.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Missing Information
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {missingItems.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning border border-warning/20"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                    Missing {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
