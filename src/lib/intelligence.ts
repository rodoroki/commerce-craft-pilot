import type { Product, ProductSource, Supplier, Experiment, ExperimentMetric } from "@/lib/queries";
import type { EconomicsResult } from "@/lib/economics";
import { derive, totals, type Verdict } from "@/lib/analytics";

export type ConfidenceLevel = "VERIFIED" | "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
export type EvidenceStatus =
  | "VERIFIED"
  | "OBSERVED"
  | "DECLARED_BY_SUPPLIER"
  | "HYPOTHESIS"
  | "ESTIMATE"
  | "AI_GENERATED"
  | "UNKNOWN"
  | "INSUFFICIENT_DATA";

export type Evidence = {
  claim: string;
  source: string;
  timestamp: string | null;
  status: EvidenceStatus;
  confidence: ConfidenceLevel;
};

export function confidenceFromStatus(status: EvidenceStatus, sampleSize?: number): ConfidenceLevel {
  if (status === "VERIFIED") return "VERIFIED";
  if (status === "OBSERVED") return (sampleSize ?? 0) >= 10 ? "HIGH" : "LOW";
  if (status === "DECLARED_BY_SUPPLIER") return "MEDIUM";
  if (status === "ESTIMATE" || status === "HYPOTHESIS") return "LOW";
  return "UNVERIFIED";
}

const POSITIVE: Record<string, string> = {
  demand: "Strong recorded demand score",
  problem_severity: "Severe customer problem",
  visual_demonstration: "Strong visual demonstration",
  margin: "Attractive margin potential",
  shipping: "Favorable shipping profile",
  competition: "Favorable competitive position",
  differentiation: "Clear differentiation",
  content_potential: "Strong content potential",
  upsell_potential: "Strong upsell potential",
  private_label_potential: "Private-label potential",
  return_risk: "Low return-risk score",
  regulatory_risk: "Low regulatory-risk score",
};

export type Opportunity = {
  score: number | null;
  status: "PROMISING" | "MIXED" | "WEAK" | "NOT_ENOUGH_DATA";
  summary: string;
  why: Evidence[];
  risks: Evidence[];
  unknowns: Evidence[];
  confidence: ConfidenceLevel;
};

export function interpretOpportunity(
  product: Product,
  sources: ProductSource[],
  economics: EconomicsResult,
): Opportunity {
  const breakdown = (product.score_breakdown ?? {}) as Record<string, number | undefined>;
  const why = Object.entries(breakdown)
    .filter(([, value]) => value !== undefined && value >= 8)
    .map(([key]) => ({
      claim: POSITIVE[key] ?? key.replace(/_/g, " "),
      source: `Product score · ${key.replace(/_/g, " ")}`,
      timestamp: product.updated_at,
      status: "ESTIMATE" as const,
      confidence: "LOW" as const,
    }));
  const confirmed = sources.filter((source) => source.data_confirmed);
  const risks: Evidence[] = [];
  if (confirmed.length === 0) {
    risks.push({
      claim: "No supplier data has been verified",
      source: "Supplier candidates",
      timestamp: null,
      status: "UNVERIFIED",
      confidence: "UNVERIFIED",
    });
  }
  if (!economics.complete) {
    risks.push({
      claim: "Profitability cannot be confirmed",
      source: "Unit economics",
      timestamp: product.updated_at,
      status: "INSUFFICIENT_DATA",
      confidence: "UNVERIFIED",
    });
  }
  for (const [key, label] of [["return_risk", "Return risk is elevated"], ["regulatory_risk", "Regulatory risk is elevated"]] as const) {
    if (breakdown[key] !== undefined && breakdown[key] <= 3) {
      risks.push({ claim: label, source: `Product score · ${key.replace(/_/g, " ")}`, timestamp: product.updated_at, status: "ESTIMATE", confidence: "LOW" });
    }
  }
  const unknownChecks: Array<[string, boolean]> = [
    ["Actual landed cost", confirmed.every((s) => s.product_cost === null || s.shipping_cost === null || s.fees === null)],
    ["US delivery time", confirmed.every((s) => s.delivery_estimate_days_max === null)],
    ["Return conditions", confirmed.every((s) => s.returns_policy === null)],
    ["Private-label availability", confirmed.every((s) => s.private_label === null)],
  ];
  const unknowns = unknownChecks.filter(([, missing]) => missing).map(([claim]) => ({
    claim,
    source: "Supplier candidates",
    timestamp: null,
    status: "UNKNOWN" as const,
    confidence: "UNVERIFIED" as const,
  }));
  const status = product.score === null
    ? "NOT_ENOUGH_DATA"
    : product.score >= 70 && economics.complete && confirmed.length > 0
      ? "PROMISING"
      : product.score < 40 ? "WEAK" : "MIXED";
  const confidence: ConfidenceLevel = confirmed.length > 0 && unknowns.length === 0
    ? "HIGH"
    : why.length > 0 || confirmed.length > 0 ? "MEDIUM" : "UNVERIFIED";
  return {
    score: product.score,
    status,
    summary: `${why.length} supporting signal(s), ${risks.length} risk(s), ${unknowns.length} unknown(s).`,
    why,
    risks,
    unknowns,
    confidence,
  };
}

export type NextBestAction = {
  action: string;
  why: string;
  evidence: string;
  unknown: string;
  risk: string;
  expectedOutcome: string;
};

export function nextBestAction(args: {
  opportunity: Opportunity;
  economics: EconomicsResult;
  sources: ProductSource[];
  experiments: Experiment[];
}): NextBestAction {
  if (!args.sources.some((source) => source.data_confirmed)) {
    return {
      action: "Verify supplier data before spending on creative testing.",
      why: "Supply viability is the largest unresolved operational risk.",
      evidence: `${args.sources.length} supplier candidate(s), none verified.`,
      unknown: args.opportunity.unknowns.map((item) => item.claim).join(", ") || "Supplier terms",
      risk: "Testing before supply validation could waste capital.",
      expectedOutcome: "Increase confidence in landed cost and fulfillment viability.",
    };
  }
  if (!args.economics.complete) {
    return {
      action: "Complete unit-economics inputs before testing.",
      why: "Contribution cannot be calculated from the recorded inputs.",
      evidence: "At least one supplier candidate is verified.",
      unknown: "Complete selling price and cost inputs.",
      risk: "A test could acquire demand for an unprofitable offer.",
      expectedOutcome: "Establish the maximum viable acquisition cost.",
    };
  }
  if (args.experiments.length === 0) {
    return {
      action: "Create a controlled creative and landing test.",
      why: "Supply and economics are ready for measured demand validation.",
      evidence: "Verified source and computable economics.",
      unknown: "Real conversion and acquisition performance.",
      risk: "Keep the initial budget bounded until conversion is observed.",
      expectedOutcome: "Produce the first measured demand signal.",
    };
  }
  return {
    action: "Continue the current validation cycle.",
    why: "An experiment exists and should produce enough evidence for a decision.",
    evidence: `${args.experiments.length} experiment(s) recorded.`,
    unknown: "Whether observed performance clears the decision threshold.",
    risk: "Stopping early may turn a thin sample into a false conclusion.",
    expectedOutcome: "Reach a defensible continue, rework, scale, or kill decision.",
  };
}

export type SourceWarResult = {
  winnerId: string | null;
  cheapestId: string | null;
  rationale: string;
  missing: string[];
};

export function compareSources(sources: Array<ProductSource & { suppliers: Supplier | null }>): SourceWarResult {
  const required: Array<keyof ProductSource> = ["product_cost", "shipping_cost", "delivery_estimate_days_max", "moq"];
  const missing = [...new Set(sources.flatMap((source) => required.filter((key) => source[key] === null)))].map(String);
  const cost = (source: ProductSource) => Number(source.product_cost) + Number(source.shipping_cost) + Number(source.fees ?? 0);
  const complete = sources.filter((source) => required.every((key) => source[key] !== null));
  const cheapest = complete.slice().sort((a, b) => cost(a) - cost(b))[0];
  if (sources.length < 2 || missing.length > 0) {
    return { winnerId: null, cheapestId: cheapest?.id ?? null, missing, rationale: `No best source: comparable data is missing${missing.length ? ` (${missing.join(", ").replace(/_/g, " ")})` : ""}.` };
  }
  const dominant = complete.find((candidate) => complete.every((other) => candidate.id === other.id || (
    cost(candidate) <= cost(other) &&
    Number(candidate.delivery_estimate_days_max) <= Number(other.delivery_estimate_days_max) &&
    Number(candidate.moq) <= Number(other.moq)
  )));
  if (!dominant) return { winnerId: null, cheapestId: cheapest?.id ?? null, missing: [], rationale: "The cheapest source is not the lowest-risk source. No candidate dominates cost, delivery, and MOQ." };
  const hasOperationalTradeoff = complete.some((other) => other.id !== dominant.id && (
    (other.tracking_available === true && dominant.tracking_available !== true) ||
    (other.private_label === true && dominant.private_label !== true) ||
    (other.custom_packaging === true && dominant.custom_packaging !== true)
  ));
  return hasOperationalTradeoff
    ? { winnerId: null, cheapestId: cheapest?.id ?? null, missing: [], rationale: "A cheaper candidate has higher operational risk. Choose based on the current test priority." }
    : { winnerId: dominant.id, cheapestId: cheapest?.id ?? null, missing: [], rationale: `${dominant.suppliers?.name ?? "This source"} dominates the comparable cost, delivery, and MOQ criteria.` };
}

export type FormalDecision = {
  decision: Verdict | "VERIFY_DATA" | "WAIT_FOR_MORE_DATA";
  why: string[];
  evidence: string[];
  unknowns: string[];
  risk: string;
  nextAction: string;
  confidence: ConfidenceLevel;
};

export function formalDecision(verdict: Verdict, reasons: string[], metrics: ExperimentMetric[], economicsComplete: boolean): FormalDecision {
  const t = totals(metrics);
  const d = derive(t);
  const unknowns = [d.ctr === null ? "CTR" : null, d.conversionRate === null ? "conversion rate" : null, d.cac === null ? "CAC" : null, !economicsComplete ? "unit economics" : null].filter((value): value is string => value !== null);
  const decision = !economicsComplete ? "VERIFY_DATA" : verdict === "INSUFFICIENT_DATA" ? "WAIT_FOR_MORE_DATA" : verdict;
  const actions: Record<FormalDecision["decision"], string> = {
    CONTINUE_TESTING: "Continue the bounded test and monitor the weakest funnel signal.", SCALE: "Increase spend gradually while monitoring contribution after advertising.", REWORK_OFFER: "Revise price, bundle, or offer before the next test.", CHANGE_CREATIVE: "Test a new creative hypothesis against the same offer.", CHANGE_SUPPLIER: "Verify a lower-risk source with viable landed cost.", KILL: "Stop allocating test capital and preserve the learning.", INSUFFICIENT_DATA: "Wait for more measured data.", VERIFY_DATA: "Complete and verify the missing inputs.", WAIT_FOR_MORE_DATA: "Continue measuring until the decision threshold is reached.",
  };
  return {
    decision,
    why: reasons,
    evidence: [`${t.days} measured day(s)`, `${t.pageViews ?? 0} page views`, `${t.purchases ?? 0} purchases`, `${t.spend ?? 0} recorded spend`],
    unknowns,
    risk: decision === "SCALE" ? "Scaling too quickly can invalidate current acquisition economics." : "Acting on thin or incomplete evidence can waste capital.",
    nextAction: actions[decision],
    confidence: confidenceFromStatus(t.days > 0 ? "OBSERVED" : "INSUFFICIENT_DATA", t.purchases ?? 0),
  };
}

export function learningStatus(current: string, observations: number): "HYPOTHESIS" | "SUPPORTED" | "CONSOLIDATED" | "REJECTED" {
  if (current === "REJECTED") return "REJECTED";
  if (observations >= 8) return "CONSOLIDATED";
  if (observations >= 3) return "SUPPORTED";
  return "HYPOTHESIS";
}
