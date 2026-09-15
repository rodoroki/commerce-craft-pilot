export type EconomicsInput = {
  suggested_price: number | null;
  product_cost: number | null;
  shipping_cost: number | null;
  fulfillment_cost: number | null;
  payment_fee_pct: number | null;
  platform_fee_pct: number | null;
  refund_allowance_pct: number | null;
  estimated_cac: number | null;
};

export type EconomicsLine = {
  key: string;
  value: number | null;
  /** true when the value cannot be computed because an input is missing */
  unknown: boolean;
};

export type EconomicsResult = {
  lines: EconomicsLine[];
  contributionBefore: number | null;
  contributionAfter: number | null;
  contributionMarginPct: number | null;
  complete: boolean;
};

const num = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Pure unit-economics calculation. Any missing input keeps the result UNKNOWN —
 * we never substitute an invented number.
 */
export function computeEconomics(input: EconomicsInput): EconomicsResult {
  const price = num(input.suggested_price);
  const cost = num(input.product_cost);
  const shipping = num(input.shipping_cost);
  const fulfillment = num(input.fulfillment_cost);
  const paymentPct = num(input.payment_fee_pct);
  const platformPct = num(input.platform_fee_pct);
  const refundPct = num(input.refund_allowance_pct);
  const cac = num(input.estimated_cac);

  const pct = (p: number | null) => (price === null || p === null ? null : (price * p) / 100);

  const paymentFees = pct(paymentPct);
  const platformFees = pct(platformPct);
  const refundAllowance = pct(refundPct);

  const deductions = [cost, shipping, fulfillment, paymentFees, platformFees, refundAllowance];
  const complete = price !== null && deductions.every((d) => d !== null);

  const contributionBefore = complete
    ? (price ?? 0) - deductions.reduce<number>((acc, d) => acc + (d as number), 0)
    : null;
  const contributionAfter =
    contributionBefore !== null && cac !== null ? contributionBefore - cac : null;
  const contributionMarginPct =
    contributionBefore !== null && price ? (contributionBefore / price) * 100 : null;

  const line = (key: string, value: number | null): EconomicsLine => ({
    key,
    value,
    unknown: value === null,
  });

  return {
    lines: [
      line("econ.sellingPrice", price),
      line("econ.productCost", cost),
      line("econ.shipping", shipping),
      line("econ.fulfillment", fulfillment),
      line("econ.paymentFees", paymentFees),
      line("econ.platformFees", platformFees),
      line("econ.refundAllowance", refundAllowance),
    ],
    contributionBefore,
    contributionAfter,
    contributionMarginPct,
    complete,
  };
}

export function formatMoney(value: number | null, currency = "USD", locale = "en-US") {
  if (value === null) return null;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}
