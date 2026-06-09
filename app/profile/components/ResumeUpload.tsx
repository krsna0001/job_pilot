'use client';

import { useState, useEffect, type FormEvent } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";

interface ResumeInfo {
  resume_url: string | null;
  resume_key: string | null;
}

export default function ResumeUpload({ userId }: { userId: string }) {
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadResume();
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
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
    // Automatically upload after selection
    await uploadFile(f);
  };

  const uploadFile = async (f: File) => {
    setIsUploading(true);
    const key = `${userId}/resume.pdf`;
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(key, f);
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

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">Resume</p>

      {resume?.resume_url ? (
        <div className="rounded-xl border border-border bg-surface-secondary p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-darkest">Current Resume</p>
              <a
                href={resume.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-accent transition hover:text-accent-dark"
              >
                View file →
              </a>
            </div>
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

      <div className="mt-4 space-y-4">
          {!resume?.resume_url && (
            <p className="text-sm text-text-secondary">Upload your resume (PDF, max 5MB) to enable AI match scoring.</p>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-text-secondary file:mr-4 file:cursor-pointer file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-sm file:font-medium file:text-text-primary file:transition hover:file:border-accent hover:file:text-accent"
          />
          {isUploading && <p className="mt-2 text-sm text-text-primary">Uploading...</p>}
        </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-error/10 px-4 py-2 text-sm text-error">{error}</p>
      ) : null}
    </div>
  );
}
