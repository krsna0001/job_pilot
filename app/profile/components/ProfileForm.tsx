'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import type { ExtractedProfile } from "@/lib/extract-profile";

interface ProfileFormProps {
  userId: string;
  onSaveSuccess?: () => void;
}

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

interface JobPreferences {
  roleTitle: string;
  locations: string[];
  jobTypes: string[];
  salaryExpectation: string;
}

export interface ProfileFormHandle {
  applyExtracted: (data: ExtractedProfile) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

const ProfileForm = forwardRef<ProfileFormHandle, ProfileFormProps>(function ProfileForm({ userId, onSaveSuccess }: ProfileFormProps, ref) {
  // Load State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  // 1. Personal
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // 2. Location
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [remotePref, setRemotePref] = useState("onsite");
  const [workAuth, setWorkAuth] = useState("");

  // 3. Professional (Skills Tag Input)
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // 4. Work Experience
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);

  // 5. Education
  const [education, setEducation] = useState<EducationEntry[]>([]);

  // 6. Job Preferences
  const [prefRole, setPrefRole] = useState("");
  const [prefLocations, setPrefLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [prefJobTypes, setPrefJobTypes] = useState<string[]>([]);
  const [salaryExpectation, setSalaryExpectation] = useState("");

  // 7. Settings
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [emailAlertsFrequency, setEmailAlertsFrequency] = useState("daily");

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadProfileData = async () => {
    try {
      // Get auth user info for name
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (userData?.user?.profile?.name) {
        setName(userData.user.profile.name);
      }

      // Get profile fields
      const { data: profile } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        if (profile.name) setName(profile.name);
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setGithubUrl(profile.github_url || "");
        setLinkedinUrl(profile.linkedin_url || "");
        setCountry(profile.country || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setRemotePref(profile.remote_preference || "onsite");
        setWorkAuth(profile.work_authorization || "");
        setSkills(Array.isArray(profile.skills) ? profile.skills : []);
        setExperience(Array.isArray(profile.experience) ? profile.experience : []);
        setEducation(Array.isArray(profile.education) ? profile.education : []);
        
        const prefs = profile.job_preferences as JobPreferences | null;
        if (prefs) {
          setPrefRole(prefs.roleTitle || "");
          setPrefLocations(Array.isArray(prefs.locations) ? prefs.locations : []);
          setPrefJobTypes(Array.isArray(prefs.jobTypes) ? prefs.jobTypes : []);
          setSalaryExpectation(prefs.salaryExpectation || "");
        }

        setEmailAlertsEnabled(profile.email_alerts_enabled || false);
        setEmailAlertsFrequency(profile.email_alerts_frequency || "daily");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add / Remove Skills
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,/g, "");
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Add / Remove Locations
  const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && locationInput.trim()) {
      e.preventDefault();
      const newLoc = locationInput.trim().replace(/,/g, "");
      if (newLoc && !prefLocations.includes(newLoc)) {
        setPrefLocations([...prefLocations, newLoc]);
      }
      setLocationInput("");
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setPrefLocations(prefLocations.filter((l) => l !== loc));
  };

  // Job Type Toggles
  const handleJobTypeToggle = (type: string) => {
    if (prefJobTypes.includes(type)) {
      setPrefJobTypes(prefJobTypes.filter((t) => t !== type));
    } else {
      setPrefJobTypes([...prefJobTypes, type]);
    }
  };

  // Work Experience Handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        title: "",
        company: "",
        location: "",
        startMonth: "January",
        startYear: String(new Date().getFullYear()),
        endMonth: "January",
        endYear: String(new Date().getFullYear()),
        current: false,
        description: "",
      },
    ]);
  };

  const handleUpdateExperience = (index: number, key: keyof ExperienceEntry, value: any) => {
    const nextExp = [...experience];
    nextExp[index] = { ...nextExp[index], [key]: value };
    setExperience(nextExp);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Education Handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        school: "",
        degree: "",
        field: "",
        startMonth: "January",
        startYear: String(new Date().getFullYear()),
        endMonth: "January",
        endYear: String(new Date().getFullYear()),
        current: false,
      },
    ]);
  };

  const handleUpdateEducation = (index: number, key: keyof EducationEntry, value: any) => {
    const nextEd = [...education];
    nextEd[index] = { ...nextEd[index], [key]: value };
    setEducation(nextEd);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Save Profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Save profiles record
      const jobPreferences: JobPreferences = {
        roleTitle: prefRole,
        locations: prefLocations,
        jobTypes: prefJobTypes,
        salaryExpectation,
      };

      const { error } = await insforge.database
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            name,
            headline,
            bio,
            country,
            city,
            state,
            remote_preference: remotePref,
            work_authorization: workAuth,
            skills,
            experience,
            education,
            job_preferences: jobPreferences,
            github_url: githubUrl,
            linkedin_url: linkedinUrl,
            email_alerts_enabled: emailAlertsEnabled,
            email_alerts_frequency: emailAlertsFrequency,
          },
          { onConflict: "user_id" },
        );

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      capture("profile_updated", {});
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    applyExtracted(data: ExtractedProfile) {
      if (data.name) setName(data.name);
      if (data.headline) setHeadline(data.headline);
      if (data.bio) setBio(data.bio);
      if (data.skills.length > 0) setSkills(data.skills);
      if (data.experience.length > 0) setExperience(data.experience);
      if (data.education.length > 0) setEducation(data.education);
      if (data.github_url) setGithubUrl(data.github_url);
      if (data.linkedin_url) setLinkedinUrl(data.linkedin_url);
      if (data.country) setCountry(data.country);
      if (data.city) setCity(data.city);
      if (data.remote_preference) setRemotePref(data.remote_preference);
      if (data.job_preferences.roleTitle) {
        setPrefRole(data.job_preferences.roleTitle);
        if (data.job_preferences.locations.length > 0) setPrefLocations(data.job_preferences.locations);
        if (data.job_preferences.jobTypes.length > 0) setPrefJobTypes(data.job_preferences.jobTypes);
        if (data.job_preferences.salaryExpectation) setSalaryExpectation(data.job_preferences.salaryExpectation);
      }
    },
  }), []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[2rem] bg-surface-secondary" />
        <div className="h-96 animate-pulse rounded-[2rem] bg-surface-secondary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Personal & Links */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Section 1</p>
        <h3 className="text-lg font-semibold text-text-darkest mb-6">Personal & Links</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-text-darkest">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. Krishna Kumar"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. Senior Fullstack Developer"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-text-darkest">Professional Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="Tell companies about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">LinkedIn URL</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>

      {/* 2. Location & Work Details */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Section 2</p>
        <h3 className="text-lg font-semibold text-text-darkest mb-6">Location & Work Details</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-text-darkest">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. United States"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. San Francisco"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">State / Region</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. California"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-text-darkest mb-3">Work Preference</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "onsite", label: "On-site" },
                { value: "hybrid", label: "Hybrid" },
                { value: "remote", label: "Remote Only" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRemotePref(opt.value)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                    remotePref === opt.value
                      ? "border-accent bg-accent-light text-accent"
                      : "border-border bg-surface-secondary text-text-secondary hover:border-accent/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-darkest">Work Authorization</label>
            <input
              type="text"
              value={workAuth}
              onChange={(e) => setWorkAuth(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. US Citizen, EU Passport, Visa Required"
            />
          </div>
        </div>
      </div>

      {/* 3. Professional Skills */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Section 3</p>
        <h3 className="text-lg font-semibold text-text-darkest mb-2">Professional Skills</h3>
        <p className="text-sm text-text-secondary mb-6">
          Add skills that highlight your expertise. Press Enter or comma to create a tag.
        </p>

        <div>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            className="block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            placeholder="Type skill and press Enter (e.g. React, Node.js)"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-accent-light px-3.5 py-1.5 text-xs font-semibold text-accent"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-accent/70 hover:text-accent focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Work Experience */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Section 4</p>
            <h3 className="text-lg font-semibold text-text-darkest">Work Experience</h3>
          </div>
          <button
            type="button"
            onClick={handleAddExperience}
            className="rounded-xl border border-accent/20 bg-accent-light px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground"
          >
            + Add Position
          </button>
        </div>

        {experience.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-secondary p-8 text-center text-sm text-text-secondary">
            No work experience added yet. Click "+ Add Position" to start building your work history.
          </div>
        ) : (
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index} className="relative rounded-2xl border border-border bg-surface-secondary p-6">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className="absolute right-4 top-4 text-xs font-medium text-error hover:underline"
                >
                  Remove
                </button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-text-dark">Job Title</label>
                    <input
                      type="text"
                      required
                      value={exp.title}
                      onChange={(e) => handleUpdateExperience(index, "title", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. Frontend Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark">Company</label>
                    <input
                      type="text"
                      required
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(index, "location", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. London, UK (or Remote)"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end pb-3">
                    <input
                      type="checkbox"
                      id={`exp-current-${index}`}
                      checked={exp.current}
                      onChange={(e) => handleUpdateExperience(index, "current", e.target.checked)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <label htmlFor={`exp-current-${index}`} className="text-xs font-bold text-text-dark select-none">
                      I currently work here
                    </label>
                  </div>

                  <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-text-dark">Start Date</label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <select
                          value={exp.startMonth}
                          onChange={(e) => handleUpdateExperience(index, "startMonth", e.target.value)}
                          className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                        >
                          {MONTHS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={exp.startYear}
                          onChange={(e) => handleUpdateExperience(index, "startYear", e.target.value)}
                          className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!exp.current && (
                      <div>
                        <label className="block text-xs font-bold text-text-dark">End Date</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={exp.endMonth}
                            onChange={(e) => handleUpdateExperience(index, "endMonth", e.target.value)}
                            className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={exp.endYear}
                            onChange={(e) => handleUpdateExperience(index, "endYear", e.target.value)}
                            className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-text-dark">Description</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="Describe your achievements and tasks..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Education */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">Section 5</p>
            <h3 className="text-lg font-semibold text-text-darkest">Education</h3>
          </div>
          <button
            type="button"
            onClick={handleAddEducation}
            className="rounded-xl border border-accent/20 bg-accent-light px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground"
          >
            + Add Education
          </button>
        </div>

        {education.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-secondary p-8 text-center text-sm text-text-secondary">
            No education history added yet. Click "+ Add Education" to start building your academic history.
          </div>
        ) : (
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="relative rounded-2xl border border-border bg-surface-secondary p-6">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="absolute right-4 top-4 text-xs font-medium text-error hover:underline"
                >
                  Remove
                </button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-text-dark">School / University</label>
                    <input
                      type="text"
                      required
                      value={edu.school}
                      onChange={(e) => handleUpdateEducation(index, "school", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. Oxford University"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark">Degree</label>
                    <input
                      type="text"
                      required
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark">Field of Study</label>
                    <input
                      type="text"
                      required
                      value={edu.field}
                      onChange={(e) => handleUpdateEducation(index, "field", e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end pb-3">
                    <input
                      type="checkbox"
                      id={`edu-current-${index}`}
                      checked={edu.current}
                      onChange={(e) => handleUpdateEducation(index, "current", e.target.checked)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <label htmlFor={`edu-current-${index}`} className="text-xs font-bold text-text-dark select-none">
                      I am currently studying here
                    </label>
                  </div>

                  <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-text-dark">Start Date</label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <select
                          value={edu.startMonth}
                          onChange={(e) => handleUpdateEducation(index, "startMonth", e.target.value)}
                          className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                        >
                          {MONTHS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={edu.startYear}
                          onChange={(e) => handleUpdateEducation(index, "startYear", e.target.value)}
                          className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!edu.current && (
                      <div>
                        <label className="block text-xs font-bold text-text-dark">End Date (or Expected)</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select
                            value={edu.endMonth}
                            onChange={(e) => handleUpdateEducation(index, "endMonth", e.target.value)}
                            className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={edu.endYear}
                            onChange={(e) => handleUpdateEducation(index, "endYear", e.target.value)}
                            className="block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Job Preferences */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Section 6</p>
        <h3 className="text-lg font-semibold text-text-darkest mb-6">Job Preferences</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-text-darkest">Preferred Job Role</label>
            <input
              type="text"
              value={prefRole}
              onChange={(e) => setPrefRole(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. Backend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-darkest">Salary Expectation (Annual, GBP)</label>
            <input
              type="number"
              value={salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g. 60000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-text-darkest mb-2">Preferred Locations</label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleAddLocation}
              className="block w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="Type preferred location and press Enter (e.g. London, Remote)"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {prefLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-light px-3.5 py-1.5 text-xs font-semibold text-accent"
                >
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="ml-1 text-accent/70 hover:text-accent focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-text-darkest mb-3">Job Types</label>
            <div className="flex flex-wrap gap-3">
              {["Full-time", "Part-time", "Contract", "Internship", "Remote"].map((type) => {
                const isSelected = prefJobTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleJobTypeToggle(type)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? "border-accent bg-accent-light text-accent"
                        : "border-border bg-surface-secondary text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Settings */}
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm transition hover:shadow-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Section 7</p>
        <h3 className="text-lg font-semibold text-text-darkest mb-6">Settings & Notifications</h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="email-alerts-enabled"
              checked={emailAlertsEnabled}
              onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="email-alerts-enabled" className="text-sm font-semibold text-text-darkest select-none">
              Enable Scheduled Email Alerts
            </label>
          </div>

          {emailAlertsEnabled && (
            <div>
              <label className="block text-sm font-semibold text-text-darkest mb-3">Alert Frequency</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setEmailAlertsFrequency(opt.value)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                      emailAlertsFrequency === opt.value
                        ? "border-accent bg-accent-light text-accent"
                        : "border-border bg-surface-secondary text-text-secondary hover:border-accent/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button & Feedback Message */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {message && (
          <p
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${
              message.type === "success" ? "bg-success-light text-success-foreground" : "bg-error/10 text-error"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="ml-auto rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>
    </form>
  );
});

export default ProfileForm;
