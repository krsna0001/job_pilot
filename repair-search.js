const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'find-jobs', 'components', 'SearchDashboard.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Find the index of "export default function SearchDashboard"
const exportIndex = lines.findIndex(line => line.includes('export default function SearchDashboard'));

if (exportIndex === -1) {
    console.error('Could not find export default function SearchDashboard');
    process.exit(1);
}

const newTop = `'use client';

import { useState, useEffect, useCallback } from "react";
import { insforge } from "@/lib/insforge-client";
import { capture } from "@/lib/posthog";
import { getCurrencySymbol } from "@/lib/currency";
import JobSearchForm from "./JobSearchForm";
import JobCard from "./JobCard";
import type { Job } from "./JobCard";
import EmptyState from "@/app/components/EmptyState";

interface SearchDashboardProps {
  user: { email?: string; profile?: { name?: string } | null; id?: string } | null;
  initialSavedCount: number;
  initialStatusCounts: { saved: number; applied: number; interviewing: number };
  initialSavedIds: string[];
  initialProfileLocations?: string[];
}

interface SavedJobRow {
  id: string;
  job_data: Job;
  status: string;
}`;

const newLines = [
    newTop,
    ...lines.slice(exportIndex)
];

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Successfully repaired SearchDashboard.tsx');
