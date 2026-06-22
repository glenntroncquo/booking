"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

const globalForSupabase = globalThis as typeof globalThis & {
  salonifyBookingSupabase?: SupabaseClient;
};

export function getBrowserSupabaseClient(): SupabaseClient {
  if (!globalForSupabase.salonifyBookingSupabase) {
    globalForSupabase.salonifyBookingSupabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    );
  }
  return globalForSupabase.salonifyBookingSupabase;
}
