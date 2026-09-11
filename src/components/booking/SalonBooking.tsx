"use client";

import { useCallback, useEffect, useRef } from "react";
import { checkoutUrlFromWidgetMessage } from "@/lib/deposit";
import {
  DEFAULT_WIDGET_THEME,
  WIDGET_CONFIG_EVENT,
  WIDGET_THEME_EVENT,
  buildWidgetUrl,
  getWidgetDomain,
  isWidgetReadyMessage,
  type WidgetConfigMessage,
} from "@/lib/widget";

export interface SalonBookingProps {
  companyId: string;
  widgetDomain?: string;
  preselectedLocationId?: string;
  preselectedLocationSlug?: string;
  preselectedStaffIds?: string[];
  preselectedStaffSlugs?: string[];
  preselectedServiceIds?: string[];
  preselectedServiceVariantIds?: string[];
  successUrl?: string;
  cancelUrl?: string;
  depositEnabled?: boolean;
  depositAmount?: number;
}

export function SalonBooking({
  companyId,
  widgetDomain = getWidgetDomain(),
  preselectedLocationId,
  preselectedLocationSlug,
  preselectedStaffIds = [],
  preselectedStaffSlugs = [],
  preselectedServiceIds = [],
  preselectedServiceVariantIds = [],
  successUrl,
  cancelUrl,
  depositEnabled,
  depositAmount,
}: SalonBookingProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const widgetUrl = buildWidgetUrl(widgetDomain, {
    companyId,
    locationId: preselectedLocationId,
    locationSlug: preselectedLocationSlug,
    staffIds: preselectedStaffIds,
    staffSlugs: preselectedStaffSlugs,
    serviceIds: preselectedServiceIds,
    serviceVariantIds: preselectedServiceVariantIds,
    successUrl,
    cancelUrl,
    depositEnabled,
    depositAmount,
  });

  const sendHostConfig = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;

    frame.postMessage(
      { type: WIDGET_THEME_EVENT, theme: DEFAULT_WIDGET_THEME },
      "*",
    );

    const config: WidgetConfigMessage["config"] = {};
    if (successUrl) {
      config.successUrl = successUrl;
      config.success_url = successUrl;
    }
    if (cancelUrl) {
      config.cancelUrl = cancelUrl;
      config.cancel_url = cancelUrl;
    }
    if (depositEnabled) config.depositEnabled = true;
    if (depositAmount != null && depositAmount > 0) {
      config.depositAmount = depositAmount;
    }
    if (Object.keys(config).length > 0) {
      frame.postMessage({ type: WIDGET_CONFIG_EVENT, config }, "*");
    }
  }, [successUrl, cancelUrl, depositEnabled, depositAmount]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (isWidgetReadyMessage(event.data)) {
        sendHostConfig();
        return;
      }

      const checkoutUrl = checkoutUrlFromWidgetMessage(event.data);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendHostConfig]);

  return (
    <iframe
      ref={iframeRef}
      id="salonify-widget"
      src={widgetUrl}
      title="Book appointment"
      onLoad={() => setTimeout(sendHostConfig, 300)}
      allow="clipboard-read; clipboard-write; payment"
    />
  );
}
