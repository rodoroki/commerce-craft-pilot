import type { ExperimentMetric, Product } from "@/lib/queries";
import { computeEconomics } from "@/lib/economics";

export type Totals = {
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  pageViews: number | null;
  viewContent: number | null;
  addToCart: number | null;
  beginCheckout: number | null;
  purchases: number | null;
  revenue: number | null;
  refunds: number | null;
  days: number;
};

const sum = (rows: ExperimentMetric[], key: keyof ExperimentMetric): number | null => {
  const values = rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return values.reduce<number>((a, v) => a + Number(v), 0);
};

export function totals(rows: ExperimentMetric[]): Totals {
  return {
    impressions: sum(rows, "impressions"),
    clicks: sum(rows, "clicks"),
    spend: sum(rows, "spend"),
    pageViews: sum(rows, "page_views"),
    viewContent: sum(rows, "view_content"),
    addToCart: sum(rows, "add_to_cart"),
    beginCheckout: sum(rows, "begin_checkout"),
    purchases: sum(rows, "purchases"),
    revenue: sum(rows, "revenue"),
    refunds: sum(rows, "refunds"),
    days: rows.length,
  };
}

const ratio = (a: number | null, b: number | null): number | null =>
  a === null || b === null || b === 0 ? null : a / b;

export type Derived = {
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  atcRate: number | null;
  checkoutRate: number | null;
  conversionRate: number | null;
  cac: number | null;
  aov: number | null;
  roas: number | null;
  refundRate: number | null;
};

/** Every rate is null unless both inputs exist. Nothing is filled in by guesswork. */
export function derive(t: Totals): Derived {
  const ctr = ratio(t.clicks, t.impressions);
  return {
    ctr: ctr === null ? null : ctr * 100,
    cpc: ratio(t.spend, t.clicks),
    cpm: t.spend !== null && t.impressions ? (t.spend / t.impressions) * 1000 : null,
    atcRate: ratio(t.addToCart, t.pageViews) === null ? null : ratio(t.addToCart, t.pageViews)! * 100,
    checkoutRate:
      ratio(t.beginCheckout, t.addToCart) === null
        ? null
        : ratio(t.beginCheckout, t.addToCart)! * 100,
    conversionRate:
      ratio(t.purchases, t.pageViews) === null ? null : ratio(t.purchases, t.pageViews)! * 100,
    cac: ratio(t.spend, t.purchases),
    aov: ratio(t.revenue, t.purchases),
    roas: ratio(t.revenue, t.spend),
    refundRate: ratio(t.refunds, t.revenue) === null ? null : ratio(t.refunds, t.revenue)! * 100,
  };
}

export type Verdict =
  | "INSUFFICIENT_DATA"
  | "CONTINUE_TESTING"
  | "SCALE"
  | "REWORK_OFFER"
  | "CHANGE_CREATIVE"
  | "CHANGE_AUDIENCE"
  | "CHANGE_LANDING"
  | "CHANGE_SUPPLIER"
  | "VERIFY_DATA"
  | "WAIT_FOR_MORE_DATA"
  | "KILL";

export type Decision = { verdict: Verdict; reasons: string[]; indicators: string[] };

const MIN_PURCHASES = 10;
const MIN_PAGE_VIEWS = 500;

/**
 * Rule-based decision support. It refuses to decide on thin data and always
 * exposes the indicators behind the verdict.
 */
export function decide(args: {
  t: Totals;
  d: Derived;
  product: Pick<
    Product,
    | "suggested_price"
    | "product_cost"
    | "shipping_cost"
    | "fulfillment_cost"
    | "payment_fee_pct"
    | "platform_fee_pct"
    | "refund_allowance_pct"
    | "estimated_cac"
  > | null;
}): Decision {
  const { t, d } = args;
  const indicators: string[] = [];
  if (d.ctr !== null) indicators.push(`CTR ${d.ctr.toFixed(2)}%`);
  if (d.conversionRate !== null) indicators.push(`CVR ${d.conversionRate.toFixed(2)}%`);
  if (d.cac !== null) indicators.push(`CAC ${d.cac.toFixed(2)}`);
  if (d.roas !== null) indicators.push(`ROAS ${d.roas.toFixed(2)}`);
  if (d.atcRate !== null) indicators.push(`ATC ${d.atcRate.toFixed(2)}%`);

  if (
    (t.purchases ?? 0) < MIN_PURCHASES &&
    (t.pageViews ?? 0) < MIN_PAGE_VIEWS &&
    (t.spend ?? 0) === 0
  ) {
    return {
      verdict: "INSUFFICIENT_DATA",
      reasons: [
        `No measured volume yet. A verdict needs at least ${MIN_PURCHASES} purchases or ${MIN_PAGE_VIEWS} page views.`,
      ],
      indicators,
    };
  }

  if ((t.purchases ?? 0) < MIN_PURCHASES && (t.pageViews ?? 0) < MIN_PAGE_VIEWS) {
    return {
      verdict: "INSUFFICIENT_DATA",
      reasons: [
        `Recorded volume is below the decision threshold (${t.purchases ?? 0} purchases, ${t.pageViews ?? 0} page views).`,
      ],
      indicators,
    };
  }

  const econ = args.product
    ? computeEconomics({
        suggested_price: num(args.product.suggested_price),
        product_cost: num(args.product.product_cost),
        shipping_cost: num(args.product.shipping_cost),
        fulfillment_cost: num(args.product.fulfillment_cost),
        payment_fee_pct: num(args.product.payment_fee_pct),
        platform_fee_pct: num(args.product.platform_fee_pct),
        refund_allowance_pct: num(args.product.refund_allowance_pct),
        estimated_cac: d.cac,
      })
    : null;

  const contribution = econ?.contributionBefore ?? null;
  const reasons: string[] = [];

  if (contribution !== null && d.cac !== null) {
    const after = contribution - d.cac;
    reasons.push(
      `Contribution per order before advertising is ${contribution.toFixed(2)}; measured CAC is ${d.cac.toFixed(2)}, leaving ${after.toFixed(2)} after advertising.`,
    );
    if (after > 0 && (d.roas === null || d.roas >= 1.5)) {
      return { verdict: "SCALE", reasons, indicators };
    }
    if (after <= 0 && contribution > 0 && (d.ctr === null || d.ctr >= 1)) {
      reasons.push("Traffic converts but acquisition cost exceeds the margin.");
      return { verdict: "REWORK_OFFER", reasons, indicators };
    }
    if (after <= 0 && contribution <= 0) {
      reasons.push("The product cannot be profitable at the current landed cost.");
      return { verdict: "CHANGE_SUPPLIER", reasons, indicators };
    }
  } else {
    reasons.push("Unit economics are incomplete — profitability cannot be confirmed.");
  }

  if (d.ctr !== null && d.ctr < 1 && (t.impressions ?? 0) > 5000) {
    reasons.push("Click-through rate is below 1% over a meaningful impression volume.");
    return { verdict: "CHANGE_CREATIVE", reasons, indicators };
  }

  if (d.conversionRate !== null && d.conversionRate < 0.5 && (t.pageViews ?? 0) >= MIN_PAGE_VIEWS) {
    reasons.push("Traffic arrives but the page does not convert.");
    return { verdict: "REWORK_OFFER", reasons, indicators };
  }

  if (
    d.roas !== null &&
    d.roas < 0.6 &&
    (t.purchases ?? 0) >= MIN_PURCHASES &&
    contribution !== null &&
    contribution <= 0
  ) {
    reasons.push("Return on ad spend and margin are both negative.");
    return { verdict: "KILL", reasons, indicators };
  }

  reasons.push("Signals are mixed — keep testing before committing budget.");
  return { verdict: "CONTINUE_TESTING", reasons, indicators };
}

function num(v: number | string | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const fmtNum = (v: number | null, digits = 0) =>
  v === null ? null : v.toLocaleString("en-US", { maximumFractionDigits: digits });

export const fmtPct = (v: number | null) => (v === null ? null : `${v.toFixed(2)}%`);
