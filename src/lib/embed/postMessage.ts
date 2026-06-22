"use client";

import type { SalonTheme } from "@/components/booking/types/types";

export type BookingEventType = "started" | "completed" | "error";

export function postWidgetReady() {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(
    { type: "salonify-widget-ready", source: "salonify-booking" },
    "*",
  );
}

export function postWidgetHeight(height: number) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage({ type: "salonify-widget-height", height }, "*");
}

export function postBookingEvent(
  event: BookingEventType,
  data?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(
    { type: "salonify-booking-event", event, data },
    "*",
  );
}

export function parseThemeMessage(data: unknown): Partial<SalonTheme> | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "widget-theme" &&
    "theme" in data &&
    typeof data.theme === "object" &&
    data.theme !== null
  ) {
    return data.theme as Partial<SalonTheme>;
  }
  return null;
}

export function isHeightRequest(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "widget-request-height"
  );
}
