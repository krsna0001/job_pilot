import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { refreshAuth } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const { response } = await refreshAuth({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: {
      get: (name) => cookieStore.get(name)?.value ?? null,
    },
    request,
  });
  return response;
}
