// lib/supabase/server.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export type ServerSupabaseClient = SupabaseClient<Database>;

function getPublicSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

export async function createClient(): Promise<ServerSupabaseClient> {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value,
            ...options
          });
        } catch {
          /*
           * Server Components cannot set cookies.
           * Middleware or Server Actions will refresh auth cookies when needed.
           */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0
          });
        } catch {
          /*
           * Server Components cannot remove cookies.
           * Middleware or Server Actions will refresh auth cookies when needed.
           */
        }
      }
    }
  });
}