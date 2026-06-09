'use client';

import { useState, useEffect, useRef, type FormEvent, type DragEvent } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import type { ExtractedProfile } from "@/lib/extract-profile";

interface ResumeInfo {
  resume_url: string | null;
  resume_key: string | null;
}

interface ResumeSectionProps {
  userId: string;
  onExtracted?: (data: ExtractedProfile) => void;
}

export default function ResumeSection({ userId, onExtracted }: ResumeSectionProps) {
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      loadResume();
    }
  }, [userId]);

  const loadResume = async () => {
    const { data } = await insforge.database
      .from("profiles")
      .select("resume_url, resume_key")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setResume(data as ResumeInfo);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (!f.type.includes("pdf")) {
      setError("Only PDF files are accepted");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      validateAndSetFile(f);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      validateAndSetFile(f);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const key = `${userId}/resume.pdf`;

    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(key, file);

    if (uploadError || !uploadData) {
      setError(uploadError?.message ?? "Upload failed");
      setIsUploading(false);
      return;
    }

    const { error: upsertError } = await insforge.database
      .from("profiles")
      .upsert(
        { user_id: userId, resume_url: uploadData.url, resume_key: uploadData.key },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      setError(upsertError.message);
      setIsUploading(false);
      return;
    }

    setResume({ resume_url: uploadData.url, resume_key: uploadData.key });
    setFile(null);
    setIsUploading(false);
    capture("resume_uploaded", {});
  };

  const handleDelete = async () => {
    if (!resume?.resume_key) return;

    setIsDeleting(true);
    setError(null);

    const { error: removeError } = await insforge.storage
      .from("resumes")
      .remove(resume.resume_key);

    if (removeError) {
      setError(removeError.message);
      setIsDeleting(false);
      return;
    }

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({ resume_url: null, resume_key: null })
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setIsDeleting(false);
      return;
    }

    setResume(null);
    setIsDeleting(false);
    capture("resume_removed", {});
  };

  const handleGenerateResume = () => {
    window.open("/profile/resume-preview", "_blank");
  };

  const handleExtractProfile = () => {
    setError(null);
    setIsExtracting(true);
    fetch("/api/extract-profile", { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        setIsExtracting(false);
        if (json.error) {
          console.error("Extract profile error:", json.error, json.stack);
          setError(json.error);
          return;
        }
        if (json.data && onExtracted) {
          onExtracted(json.data as ExtractedProfile);
        }
      })
      .catch((err) => {
        setIsExtracting(false);
        console.error("Extract profile fetch error:", err);
        setError(err.message ?? "Failed to extract profile");
      });
  };

  return (
    <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Resume Documents</p>
          <h3 className="mt-1 text-lg font-semibold text-text-darkest">Your Resume</h3>
        </div>
        <button
          type="button"
          onClick={handleGenerateResume}
          disabled={generating}
          className="rounded-xl border border-accent/20 bg-accent-light px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {generating ? "Initializing..." : "Generate with AI"}
        </button>
      </div>

      {resume?.resume_url ? (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-secondary p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-darkest">Current Resume</p>
            <a
              href={resume.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block text-sm text-accent transition hover:text-accent-dark"
            >
              View uploaded file →
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExtractProfile}
              disabled={isExtracting}
              className="rounded-xl border border-accent/20 bg-accent-light px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {isExtracting ? "Extracting..." : "Extract Profile"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-error transition hover:bg-error hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleUpload} className="flex items-end gap-4">
        <div className="flex-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition duration-300 ${
              isDragging
                ? "border-accent bg-accent-light/35 scale-[1.01]"
                : "border-border bg-surface-secondary hover:border-accent/40"
            }`}
          >
            <svg className="h-6 w-6 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-text-darkest">
                {file ? file.name : "Drop PDF here or click to browse"}
              </p>
              <p className="text-xs text-text-secondary">Maximum file size: 5MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <button
          type="submit"
          disabled={!file || isUploading}
          className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-xl bg-error/10 px-4 py-2 text-xs font-medium text-error">{error}</p>
      ) : null}
    </div>
  );
}
