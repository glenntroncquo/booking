"use client";

import { useMemo } from "react";
import { SalonBooking } from "./SalonBooking";
import { defaultTheme, type SalonTheme } from "./types/types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type BookingShellProps = {
  companyId: string;
  theme?: Partial<SalonTheme>;
  shouldShowStaff?: boolean;
  embed?: boolean;
};

export function BookingShell({
  companyId,
  theme,
  shouldShowStaff = true,
  embed = false,
}: BookingShellProps) {
  const mergedTheme = useMemo(
    () => ({ ...defaultTheme, ...theme }),
    [theme],
  );

  if (!SUPABASE_ANON_KEY) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-900">
        Booking is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </div>
    );
  }

  return (
    <div className={embed ? "widget-container" : "widget-container flex justify-center"}>
      <SalonBooking
        companyId={companyId}
        supabaseConfig={{ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY }}
        theme={mergedTheme}
        shouldShowStaff={shouldShowStaff}
      />
    </div>
  );
}
