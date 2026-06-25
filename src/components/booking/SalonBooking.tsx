"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabase/config";

export interface SalonBookingProps {
  companyId: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  widgetDomain?: string;
  preselectedStaffIds?: string[];
}

const salonTheme = {
  primary: "#FF8FB2",
  primaryHover: "#FFBDD4",
  primaryLight: "#FFF0F7",
  secondary: "#FFBDD4",
  text: "#4A3F45",
  background: "white",
  buttonText: "white",
};

function buildWidgetUrl({
  widgetDomain,
  companyId,
  supabaseUrl,
  supabaseKey,
  preselectedStaffIds,
}: {
  widgetDomain: string;
  companyId: string;
  supabaseUrl: string;
  supabaseKey: string;
  preselectedStaffIds: string[];
}) {
  const params = new URLSearchParams();
  params.set("companyId", companyId);
  params.set("supabaseUrl", supabaseUrl);
  params.set("supabaseKey", supabaseKey);

  if (preselectedStaffIds.length > 0) {
    params.set("staffIds", preselectedStaffIds.join(","));
  }

  return `${widgetDomain.replace(/\/$/, "")}/widget?${params.toString()}`;
}

export function SalonBooking({
  companyId,
  supabaseUrl = SUPABASE_URL,
  supabaseKey = SUPABASE_ANON_KEY,
  widgetDomain = process.env.NEXT_PUBLIC_WIDGET_DOMAIN ||
    "https://booking-widget-nine.vercel.app",
  preselectedStaffIds = [],
}: SalonBookingProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);

  const widgetUrl = buildWidgetUrl({
    widgetDomain,
    companyId,
    supabaseUrl,
    supabaseKey,
    preselectedStaffIds: preselectedStaffIds.filter(Boolean),
  });

  const sendTheme = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "widget-theme", theme: salonTheme },
      "*",
    );
    iframeRef.current?.contentWindow?.postMessage(
      { type: "widget-request-height" },
      "*",
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "salonify-widget-ready") {
        sendTheme();
      }
      if (
        event.data?.type === "salonify-widget-height" &&
        typeof event.data.height === "number"
      ) {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendTheme]);

  if (!supabaseKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-900">
        Booking is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={widgetUrl}
      title="Book appointment"
      width="100%"
      height={iframeHeight}
      onLoad={() => setTimeout(sendTheme, 300)}
      style={{
        border: "none",
        borderRadius: "8px",
        minHeight: "600px",
        transition: "height 0.3s ease-in-out",
      }}
      allow="clipboard-read; clipboard-write"
    />
  );
}
