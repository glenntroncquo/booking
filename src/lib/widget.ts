/**
 * Embed contract for glenntroncquo/booking-widget.
 *
 * This public site does not call booking edge functions. Catalog, availability,
 * and appointment writes live in the widget on the folded v1 slugs
 * (`service-list`, `availability-list`, `appointment-create` — not `*-v2`,
 * not `treatment-list`). The host may read `public.location` via existing anon
 * RLS for SEO / 404. The iframe URL and postMessage types below are the only
 * widget coupling.
 *
 * Deposit Checkout (Phase 3): the widget calls `appointment-create`. When the
 * response includes `checkout_url`, it postMessages `salonify-checkout` (or
 * `salonify-booking-event` / `checkout`) so this host can redirect the **top**
 * window to Stripe Checkout. Success/cancel return to this origin with
 * `?deposit=success|cancel`. The host injects `successUrl`/`cancelUrl` and
 * snake_case `success_url`/`cancel_url` on the iframe query and `widget-config`
 * so the widget can send them on create. The host never invokes `appointment-create`.
 */

export const DEFAULT_WIDGET_DOMAIN = "https://booking-widget-nine.vercel.app";

export const WIDGET_READY_EVENT = "salonify-widget-ready";
export const WIDGET_THEME_EVENT = "widget-theme";
export const WIDGET_CONFIG_EVENT = "widget-config";
export const WIDGET_CHECKOUT_EVENT = "salonify-checkout";
export const WIDGET_BOOKING_EVENT = "salonify-booking-event";

export type WidgetTheme = {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  text: string;
  background: string;
  buttonText: string;
};

export const DEFAULT_WIDGET_THEME: WidgetTheme = {
  primary: "#FF8FB2",
  primaryHover: "#FFBDD4",
  primaryLight: "#FFF0F7",
  secondary: "#FFBDD4",
  text: "#4A3F45",
  background: "white",
  buttonText: "white",
};

export type WidgetReadyMessage = {
  type: typeof WIDGET_READY_EVENT;
  source?: string;
};

export type WidgetThemeMessage = {
  type: typeof WIDGET_THEME_EVENT;
  theme: WidgetTheme;
};

export type WidgetConfigMessage = {
  type: typeof WIDGET_CONFIG_EVENT;
  config: {
    successUrl?: string;
    cancelUrl?: string;
    success_url?: string;
    cancel_url?: string;
    depositAmount?: number;
    depositEnabled?: boolean;
  };
};

export type WidgetCheckoutMessage = {
  type: typeof WIDGET_CHECKOUT_EVENT;
  checkout_url: string;
};

/** Query params the widget reads. Location is forwarded as locationId and/or locationSlug; the widget resolves it. serviceIds / serviceVariantIds only — no treatmentId / priceOptionId aliases. Deposit return URLs are host booking paths (`?deposit=success|cancel`). */
export type WidgetEmbedParams = {
  companyId: string;
  locationId?: string;
  locationSlug?: string;
  staffIds?: string[];
  staffSlugs?: string[];
  serviceIds?: string[];
  serviceVariantIds?: string[];
  /** Always set — deposit create requires them; no-deposit create ignores them. */
  successUrl: string;
  cancelUrl: string;
  depositAmount?: number;
  depositEnabled?: boolean;
};

export function getWidgetDomain(): string {
  return (
    process.env.NEXT_PUBLIC_WIDGET_DOMAIN?.replace(/\/$/, "") ||
    DEFAULT_WIDGET_DOMAIN
  );
}

function setListParam(
  params: URLSearchParams,
  key: string,
  values: string[] | undefined,
) {
  const list = (values ?? []).map((value) => value.trim()).filter(Boolean);
  if (list.length > 0) {
    params.set(key, list.join(","));
  }
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  const trimmed = value?.trim();
  if (trimmed) {
    params.set(key, trimmed);
  }
}

export function buildWidgetUrl(
  widgetDomain: string,
  {
    companyId,
    locationId,
    locationSlug,
    staffIds,
    staffSlugs,
    serviceIds,
    serviceVariantIds,
    successUrl,
    cancelUrl,
    depositAmount,
    depositEnabled,
  }: WidgetEmbedParams,
): string {
  const params = new URLSearchParams();
  params.set("companyId", companyId);
  setParam(params, "locationId", locationId);
  setParam(params, "locationSlug", locationSlug);
  setListParam(params, "staffIds", staffIds);
  setListParam(params, "staffSlugs", staffSlugs);
  setListParam(params, "serviceIds", serviceIds);
  setListParam(params, "serviceVariantIds", serviceVariantIds);
  setParam(params, "successUrl", successUrl);
  setParam(params, "cancelUrl", cancelUrl);
  // Architect / BE: appointment-create reads snake_case. Widget accepts both.
  setParam(params, "success_url", successUrl);
  setParam(params, "cancel_url", cancelUrl);
  if (depositEnabled) {
    params.set("depositEnabled", "true");
  }
  if (depositAmount != null && Number.isFinite(depositAmount) && depositAmount > 0) {
    params.set("depositAmount", String(depositAmount));
  }
  return `${widgetDomain.replace(/\/$/, "")}/widget?${params.toString()}`;
}

export function isWidgetReadyMessage(
  data: unknown,
): data is WidgetReadyMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as WidgetReadyMessage).type === WIDGET_READY_EVENT
  );
}
