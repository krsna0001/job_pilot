'use client';

import { useState } from "react";
import Link from "next/link";
import ResumeUpload from "../components/ResumeUpload";

interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  current: boolean;
  description: string;
}

interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  current: boolean;
}

interface ProfileData {
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  github_url?: string;
  linkedin_url?: string;
}

interface ResumePreviewClientProps {
  user: { email: string };
  profile: ProfileData;
}

type Theme = "classic" | "odysseus";

export default function ResumePreviewClient({ user, profile }: ResumePreviewClientProps) {
  const [theme, setTheme] = useState<Theme>("classic");

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('resume-content');
    if (!element) return;

    try {
      const { toPng } = await import('dom-to-image-more');
      const jsPDF = (await import('jspdf')).default;
      const dataUrl = await toPng(element, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const aspect = element.offsetWidth / element.offsetHeight;
      let iw = pw;
      let ih = pw / aspect;
      if (ih > ph) { ih = ph; iw = ph * aspect; }
      pdf.addImage(dataUrl, 'PNG', (pw - iw) / 2, 0, iw, ih);
      pdf.save('resume.pdf');
    } catch (e) {
      console.error('PDF failed, falling back to print', e);
      window.print();
    }
  };

  const handleUploadPreview = async () => {
    try {
      const element = document.getElementById('resume-content');
      if (!element) return;
      const text = element.innerText || element.textContent || "";

      const res = await fetch('/api/upload-resume-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Upload failed: ${data.error || 'Unknown error'}`);
        return;
      }
      alert('Resume preview uploaded successfully!');
    } catch (e) {
      console.error('Unexpected error during upload', e);
      alert(`Upload error: ${e instanceof Error ? e.message : 'Unexpected error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted text-text-primary print:bg-white print:text-black">
      {/* Print stylesheet style injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
        }
      `}} />

      {/* Control Toolbar (Hidden during Print) */}
      <div className="no-print sticky top-0 z-50 border-b border-border bg-surface/90 px-6 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-accent"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
            <span className="h-5 w-px bg-border" />
            <h1 className="text-base font-semibold text-text-darkest">Resume Preview</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Tabs */}
            <div className="flex rounded-xl bg-surface-secondary p-1 border border-border">
              <button
                type="button"
                onClick={() => setTheme("classic")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  theme === "classic"
                    ? "bg-surface text-text-darkest shadow-sm border border-border"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Classic Vercel
              </button>
              <button
                type="button"
                onClick={() => setTheme("odysseus")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  theme === "odysseus"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Odysseus Teal
              </button>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex gap-2">
              {/* Save / Print Buttons */}
              <button
                onClick={handleDownload}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-md transition hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-lg active:translate-y-0 cursor-pointer"
                aria-label="Download resume as PDF"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0 0l-3-3m3 3l3-3" />
                </svg>
                Save PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface-secondary border border-border text-text-primary hover:bg-surface hover:text-accent transition shadow-md"
                aria-label="Print resume"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-14V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
                </svg>
                Print
              </button>
              {/* Upload Button */}
              <button
                onClick={handleUploadPreview}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                aria-label="Upload resume to cloud"
              >
                Upload
              </button>
            </div>
            {/* Upload Component */}
            <div className="mt-2">
              <ResumeUpload userId={user.email} />
            </div>
          </div>
        </div>
      </div>

      {/* Resume Document Area */}
      <div className="mx-auto max-w-5xl px-6 py-12 print:px-0 print:py-0">
        <div id="resume-content" className="print-container mx-auto min-h-[297mm] w-full max-w-[210mm] border border-border bg-white p-16 shadow-xl transition-all duration-300 print:w-full print:border-none print:p-0 print:shadow-none">
          {theme === "classic" ? (
            /* =================================================== */
            /* THEME: CLASSIC VERCEL (Minimal, sleek ATS format)   */
            /* =================================================== */
            <div className="space-y-10 text-black font-sans leading-relaxed">
              {/* Header */}
              <div className="border-b border-black pb-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-black">{profile.name || "Your Name"}</h2>
                <p className="mt-2 text-md font-mono uppercase tracking-[0.2em] text-gray-500">{profile.headline || "Professional Headline"}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 font-mono">
                  {user.email && (
                    <span className="flex items-center gap-1">
                      <span>Email:</span>
                      <a href={`mailto:${user.email}`} className="underline">{user.email}</a>
                    </span>
                  )}
                  {profile.github_url && (
                    <span className="flex items-center gap-1">
                      <span>GitHub:</span>
                      <a href={profile.github_url} target="_blank" rel="noreferrer" className="underline">
                        {profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                      </a>
                    </span>
                  )}
                  {profile.linkedin_url && (
                    <span className="flex items-center gap-1">
                      <span>LinkedIn:</span>
                      <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="underline">
                        {profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                      </a>
                    </span>
                  )}
                </div>
              </div>

              {/* Bio / Summary */}
              {profile.bio && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">About / Summary</h3>
                  <p className="text-sm text-gray-800 leading-6">{profile.bio}</p>
                </div>
              )}

              {/* Work Experience */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-gray-400 font-bold border-b border-gray-200 pb-2">Experience</h3>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-md font-bold text-black">{exp.title || "Job Title"}</h4>
                            <p className="text-sm font-medium text-gray-700">{exp.company || "Company"}{exp.location ? ` — ${exp.location}` : ""}</p>
                          </div>
                          <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
                            {exp.startMonth} {exp.startYear} – {exp.current ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No work experience entries listed.</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-gray-400 font-bold border-b border-gray-200 pb-2">Skills</h3>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-2">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-gray-100 border border-gray-200/60 px-3 py-1 text-xs font-mono text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No skills listed.</p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-gray-400 font-bold border-b border-gray-200 pb-2">Education</h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-5">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-md font-bold text-black">{edu.degree || "Degree"} in {edu.field || "Field of Study"}</h4>
                          <p className="text-sm text-gray-700">{edu.school || "School / University"}</p>
                        </div>
                        <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
                          {edu.startYear} – {edu.current ? "Present" : edu.endYear}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No education entries listed.</p>
                )}
              </div>
            </div>
          ) : (
            /* =================================================== */
            /* THEME: ODYSSEUS TEAL (Modern tech-accent CV)        */
            /* =================================================== */
            <div className="space-y-10 text-slate-800 font-sans leading-relaxed">
              {/* Header Box */}
              <div className="rounded-2xl bg-slate-900 p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 print:bg-slate-900 print:text-white">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight text-white">{profile.name || "Your Name"}</h2>
                  <p className="text-md font-medium text-teal-400">{profile.headline || "Professional Headline"}</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono md:text-right">
                  {user.email && (
                    <p className="flex items-center md:justify-end gap-1.5">
                      <span className="text-teal-400 font-bold">@</span>
                      <a href={`mailto:${user.email}`} className="hover:text-white hover:underline">{user.email}</a>
                    </p>
                  )}
                  {profile.github_url && (
                    <p className="flex items-center md:justify-end gap-1.5">
                      <span className="text-teal-400 font-bold">GH</span>
                      <a href={profile.github_url} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                        {profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                      </a>
                    </p>
                  )}
                  {profile.linkedin_url && (
                    <p className="flex items-center md:justify-end gap-1.5">
                      <span className="text-teal-400 font-bold">IN</span>
                      <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                        {profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Grid split */}
              <div className="grid gap-8 md:grid-cols-[2fr_1fr] print:grid-cols-[2fr_1fr]">
                {/* Main Block (Experience) */}
                <div className="space-y-8">
                  {/* Bio */}
                  {profile.bio && (
                    <div className="space-y-3">
                      <h3 className="text-xs uppercase tracking-[0.25em] text-teal-600 font-extrabold">Executive Summary</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Work Experience */}
                  <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-[0.25em] text-teal-600 font-extrabold border-b border-teal-100 pb-2">Professional Experience</h3>
                    {profile.experience && profile.experience.length > 0 ? (
                      <div className="space-y-6">
                        {profile.experience.map((exp, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="text-md font-bold text-slate-900">{exp.title || "Job Title"}</h4>
                              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-auto print:bg-teal-50">
                                {exp.startMonth.slice(0, 3)} {exp.startYear} – {exp.current ? "Present" : `${exp.endMonth.slice(0, 3)} ${exp.endYear}`}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{exp.company || "Company"}{exp.location ? ` • ${exp.location}` : ""}</p>
                            {exp.description && (
                              <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line pt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No work experience entries listed.</p>
                    )}
                  </div>
                </div>

                {/* Sidebar (Skills & Education) */}
                <div className="space-y-8 border-l border-slate-100 pl-8 print:pl-8">
                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.25em] text-teal-600 font-extrabold border-b border-teal-100 pb-2">Competencies</h3>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 border border-slate-200/50 print:bg-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No skills listed.</p>
                    )}
                  </div>

                  {/* Education Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.25em] text-teal-600 font-extrabold border-b border-teal-100 pb-2">Academic History</h3>
                    {profile.education && profile.education.length > 0 ? (
                      <div className="space-y-5">
                        {profile.education.map((edu, idx) => (
                          <div key={idx} className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">{edu.degree || "Degree"}</h4>
                            <p className="text-xs font-semibold text-slate-600">{edu.field || "Field of Study"}</p>
                            <p className="text-[11px] text-slate-500">{edu.school || "School / University"}</p>
                            <p className="text-[10px] text-teal-600 font-mono pt-0.5">{edu.startYear} – {edu.current ? "Present" : edu.endYear}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No education entries listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
