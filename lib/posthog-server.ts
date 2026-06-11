import { PostHog } from 'posthog-node';

// Use the same Project API Key as the client
const POSTHOG_PROJECT_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_qMtE7ZhFsJwyvNR2XWJLm3r4UzYENRzLXzSkcmJdesP8';

// A Personal API Key is required to use the HogQL query API
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || '';

export const posthogServer = new PostHog(POSTHOG_PROJECT_API_KEY, {
  host: 'https://app.posthog.com',
  personalApiKey: POSTHOG_PERSONAL_API_KEY,
});

import { unstable_cache } from 'next/cache';

export async function runHogQLQuery(query: string) {
  const fetchQuery = async () => {
    const url = `https://app.posthog.com/api/projects/@current/query/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    });

    if (!response.ok) {
      console.error('PostHog query failed:', await response.text());
      return { results: [] };
    }

    return response.json();
  };

  // Cache the query based on the query string for 5 minutes
  return unstable_cache(fetchQuery, ['posthog-hogql', query], { revalidate: 300 })();
}

