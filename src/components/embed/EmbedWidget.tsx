"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookingShell } from "@/components/booking/BookingShell";
import { defaultTheme, type SalonTheme } from "@/components/booking/types/types";
import { isValidCompanyId } from "@/lib/constants";
import {
  isHeightRequest,
  parseThemeMessage,
  postWidgetHeight,
  postWidgetReady,
} from "@/lib/embed/postMessage";

type EmbedWidgetProps = {
  companyId: string;
  showStaff?: boolean;
};

export function EmbedWidget({ companyId, showStaff = true }: EmbedWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Partial<SalonTheme>>(defaultTheme);

  const reportHeight = useCallback(() => {
    const height = containerRef.current?.scrollHeight ?? document.body.scrollHeight;
    postWidgetHeight(height);
  }, []);

  useEffect(() => {
    postWidgetReady();
    reportHeight();

    const observer = new ResizeObserver(() => reportHeight());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const onMessage = (event: MessageEvent) => {
      const nextTheme = parseThemeMessage(event.data);
      if (nextTheme) {
        setTheme((current) => ({ ...defaultTheme, ...current, ...nextTheme }));
        requestAnimationFrame(reportHeight);
      }
      if (isHeightRequest(event.data)) {
        reportHeight();
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      observer.disconnect();
      window.removeEventListener("message", onMessage);
    };
  }, [reportHeight]);

  if (!isValidCompanyId(companyId)) {
    return (
      <div className="p-6 text-center text-sm text-red-700">
        Invalid company ID.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <BookingShell
        companyId={companyId}
        theme={theme}
        shouldShowStaff={showStaff}
        embed
      />
    </div>
  );
}
