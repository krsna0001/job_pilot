'use client';

import { useEffect } from "react";
import { capture } from "@/lib/posthog";

export default function PosthogPageView() {
  useEffect(() => {
    capture("page_view", { path: window.location.pathname });
  }, []);

  return null;
}
