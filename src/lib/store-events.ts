/**
 * Storefront event layer.
 *
 * Events are collected in a single place so a real destination (the
 * Commerce Intelligence Engine tracking endpoint, GA4, Meta, TikTok) can be
 * connected later without touching page code. Until a destination is
 * configured this records nothing anywhere — no tracking is simulated.
 */

export type StoreEventName =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "VIDEO_PLAY"
  | "SCROLL_DEPTH"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "BEGIN_CHECKOUT"
  | "PURCHASE"
  | "UPSELL_CLICK"
  | "FAQ_OPEN"
  | "CTA_CLICK";

export type StoreEvent = {
  name: StoreEventName;
  payload?: Record<string, string | number | null | undefined>;
  occurredAt: string;
};

export type StoreEventSink = (event: StoreEvent) => void;

/** No destination is configured yet. */
let sink: StoreEventSink | null = null;

export function setStoreEventSink(next: StoreEventSink | null) {
  sink = next;
}

export function trackStoreEvent(
  name: StoreEventName,
  payload?: StoreEvent["payload"],
) {
  if (typeof window === "undefined") return;
  if (!sink) return;
  sink({ name, payload: payload ?? {}, occurredAt: new Date().toISOString() });
}

/** Attribution captured from the URL so a session can later be tied to a campaign. */
export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}
