// lib/supabase/browser.ts

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export type BrowserSupabaseClient = SupabaseClient<Database>;

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

export function createClient(): BrowserSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}