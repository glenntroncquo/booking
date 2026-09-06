/**
 * Embed contract for glenntroncquo/booking-widget.
 *
 * This public site does not call booking edge functions. Catalog, availability,
 * and appointment writes live in the widget on the folded v1 slugs
 * (`service-list`, `availability-list`, `appointment-create` — not `*-v2`,
 * not `treatment-list`). The host may read `public.location` via existing anon
 * RLS for SEO / 404. The iframe URL and postMessage types below are the only
 * widget coupling.
 */

export const DEFAULT_WIDGET_DOMAIN = "https://booking-widget-nine.vercel.app";

export const WIDGET_READY_EVENT = "salonify-widget-ready";
export const WIDGET_THEME_EVENT = "widget-theme";

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

/** Query params the widget reads. Location is forwarded as locationId and/or locationSlug; the widget resolves it. serviceIds / serviceVariantIds only — no treatmentId / priceOptionId aliases. */
export type WidgetEmbedParams = {
  companyId: string;
  locationId?: string;
  locationSlug?: string;
  staffIds?: string[];
  staffSlugs?: string[];
  serviceIds?: string[];
  serviceVariantIds?: string[];
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
