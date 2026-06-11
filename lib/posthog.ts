import posthog from 'posthog-js';

let initialized = false;

/**
 * Initialise PostHog client (client‑side only).
 * Called lazily by `capture` so the SDK loads only when needed.
 */
function init() {
  if (typeof window === 'undefined' || initialized) return;
  // TODO: replace with your actual PostHog project API key.
  posthog.init('phc_qMtE7ZhFsJwyvNR2XWJLm3r4UzYENRzLXzSkcmJdesP8', {
    api_host: 'https://app.posthog.com',
    // Optional: enable autocapture, session recording, etc.
    // autocapture: true,
  });
  initialized = true;
}

type TrackingEvents = {
  job_saved: { job_id: string; title: string; company?: string };
  job_saved_auto: { job_id: string; title: string };
  job_unsaved: { job_id: string; title: string };
  company_researched: { user_id?: string; job_id: string; company: string };
  page_view: { url?: string; path?: string } | undefined;
  login_success: { method?: string; user_id?: string } | undefined;
  sign_out: { method?: string } | undefined;
  job_search: { query?: string; location?: string; type?: string; experience?: string } | undefined;
  profile_updated: { sections?: string[] } | undefined;
  resume_uploaded: { file_name?: string; size?: number } | undefined;
  resume_removed: Record<string, any> | undefined;
};

/**
 * Capture a PostHog event.
 * @param event Name of the event.
 * @param props Optional properties to attach.
 */
export function capture<K extends keyof TrackingEvents>(event: K, props?: TrackingEvents[K]) {
  if (typeof window === 'undefined') return;
  init();
  posthog.capture(event, props);
}

export default { capture };
