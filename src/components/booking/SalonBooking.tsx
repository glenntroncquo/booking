"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SalonBookingProps {
  companyId: string;
  widgetDomain?: string;
  preselectedStaffIds?: string[];
  preselectedStaffSlugs?: string[];
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
  preselectedStaffIds,
  preselectedStaffSlugs,
}: {
  widgetDomain: string;
  companyId: string;
  preselectedStaffIds: string[];
  preselectedStaffSlugs: string[];
}) {
  const params = new URLSearchParams();
  params.set("companyId", companyId);

  if (preselectedStaffIds.length > 0) {
    params.set("staffIds", preselectedStaffIds.join(","));
  }

  if (preselectedStaffSlugs.length > 0) {
    params.set("staffSlugs", preselectedStaffSlugs.join(","));
  }

  return `${widgetDomain.replace(/\/$/, "")}/widget?${params.toString()}`;
}

export function SalonBooking({
  companyId,
  widgetDomain = process.env.NEXT_PUBLIC_WIDGET_DOMAIN ||
    "https://booking-widget-nine.vercel.app",
  preselectedStaffIds = [],
  preselectedStaffSlugs = [],
}: SalonBookingProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(600);

  const widgetUrl = buildWidgetUrl({
    widgetDomain,
    companyId,
    preselectedStaffIds: preselectedStaffIds.filter(Boolean),
    preselectedStaffSlugs: preselectedStaffSlugs.filter(Boolean),
  });

  const widgetOrigin = useMemo(() => {
    try {
      return new URL(widgetUrl).origin;
    } catch {
      return null;
    }
  }, [widgetUrl]);

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
      // Only trust messages from the widget origin.
      if (widgetOrigin && event.origin !== widgetOrigin) return;

      if (event.data?.type === "salonify-widget-ready") {
        sendTheme();
      }

      // The widget reports its content height so the iframe can grow to fit
      // and the PAGE (not the iframe) scrolls when the form is tall.
      const isResize =
        event.data?.type === "salonify-widget-resize" ||
        event.data?.type === "salonify-widget-height";

      if (isResize && typeof event.data.height === "number") {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendTheme, widgetOrigin]);

  return (
    <iframe
      ref={iframeRef}
      id="salonify-widget"
      src={widgetUrl}
      title="Book appointment"
      width="100%"
      height={iframeHeight}
      scrolling="no"
      onLoad={() => setTimeout(sendTheme, 300)}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "480px",
        border: 0,
        height: `${iframeHeight}px`,
        transition: "height 0.3s ease-in-out",
      }}
      allow="clipboard-read; clipboard-write"
    />
  );
}
