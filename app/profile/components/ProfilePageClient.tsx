'use client';

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm, { type ProfileFormHandle } from "./ProfileForm";
import ResumeSection from "./ResumeSection";
import type { ExtractedProfile } from "@/lib/extract-profile";

interface ProfilePageClientProps {
  userId: string;
}

export default function ProfilePageClient({ userId }: ProfilePageClientProps) {
  const router = useRouter();
  const formRef = useRef<ProfileFormHandle>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'resume'>('manual');

  const handleSaveSuccess = () => {
    router.refresh();
  };

  const handleExtracted = (data: ExtractedProfile) => {
    formRef.current?.applyExtracted(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'manual' ? 'bg-accent text-white' : 'bg-surface-secondary text-text-primary'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'resume' ? 'bg-accent text-white' : 'bg-surface-secondary text-text-primary'}`}
          onClick={() => setActiveTab('resume')}
        >
          Upload Resume
        </button>
      </div>
      {activeTab === 'resume' && (
        <ResumeSection userId={userId} onExtracted={handleExtracted} />
      )}
      {activeTab === 'manual' && (
        <ProfileForm ref={formRef} userId={userId} onSaveSuccess={handleSaveSuccess} />
      )}
    </div>
  );
}
