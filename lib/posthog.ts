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

/**
 * Capture a PostHog event.
 * @param event Name of the event.
 * @param props Optional properties to attach.
 */
export function capture(event: string, props?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  init();
  posthog.capture(event, props);
}

export default { capture };
