import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, ConfidenceBadge, DataFlag, Field, Input, ProvenanceLine, SectionTitle } from "@/components/ui/kit";
import { Grid2, Modal, NumberInput, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  PRODUCT_STAGES,
  SCORE_CRITERIA,
  productDetailQuery,
  suppliersQuery,
  useSaveRecord,
  type ProductSource,
  type Supplier,
} from "@/lib/queries";
import { computeEconomics, formatMoney } from "@/lib/economics";
import { compareSources, interpretOpportunity, nextBestAction } from "@/lib/intelligence";

export const Route = createFileRoute("/_authenticated/products/$slug")({
  head: () => ({
    meta: [
      { title: "Product detail — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Score, unit economics, supplier comparison, stage history and decision support.",
      },
      { property: "og:title", content: "Product detail — Commerce Intelligence Engine" },
      { property: "og:description", content: "Score, economics, sourcing and decision support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <p className="text-sm text-muted-foreground">This product failed to load.</p>,
  notFoundComponent: () => <p className="text-sm text-muted-foreground">Product not found.</p>,
  component: ProductDetail,
});

const num = (v: number | string | null) => (v === null ? null : Number(v));

function landedCost(s: ProductSource): number | null {
  const parts = [s.product_cost, s.shipping_cost, s.fees];
  if (parts.some((p) => p === null)) return null;
  return parts.reduce<number>((a, p) => a + Number(p), 0);
}

function decision(args: {
  sourcesWithCost: number;
  totalSources: number;
  economicsComplete: boolean;
  contributionBefore: number | null;
}) {
  const reasons: string[] = [];
  if (args.sourcesWithCost === 0) {
    reasons.push(`No supplier has confirmed cost data (${args.totalSources} candidates registered).`);
  }
  if (!args.economicsComplete) {
    reasons.push("Unit economics cannot be computed — price and/or cost inputs are missing.");
  }
  if (reasons.length > 0) return { verdict: "COMPLETE SOURCING DATA", reasons };
  if (args.contributionBefore !== null && args.contributionBefore <= 0) {
    return {
      verdict: "CHANGE SUPPLIER",
      reasons: ["Contribution before advertising is zero or negative at the current landed cost."],
    };
  }
  return {
    verdict: "CONTINUE TESTING",
    reasons: ["Economics are computable. Run an experiment to produce measured results."],
  };
}

const emptySource = {
  supplier_id: "",
  supplier_sku: "",
  supplier_url: "",
  product_cost: null as number | null,
  shipping_cost: null as number | null,
  fees: null as number | null,
  moq: null as number | null,
  stock: null as number | null,
  stock_location: "",
  delivery_estimate_days_min: null as number | null,
  delivery_estimate_days_max: null as number | null,
  data_confirmed: "no",
  notes: "",
};

function ProductDetail() {
  const { slug } = Route.useParams();
  const { t, locale } = useI18n();
  const { data, isLoading } = useQuery(productDetailQuery(slug));
  const { data: suppliers } = useQuery(suppliersQuery);
  const saveProduct = useSaveRecord("products");
  const saveSource = useSaveRecord("product_sources");
  const saveEvidence = useSaveRecord("evidence_items");

  const [econOpen, setEconOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [econForm, setEconForm] = useState<Record<string, number | null>>({});
  const [scoreForm, setScoreForm] = useState<Record<string, number | null>>({});
  const [sourceForm, setSourceForm] = useState(emptySource);
  const [evidenceForm, setEvidenceForm] = useState({ claim: "", source: "", source_url: "", status: "UNKNOWN" });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Product not found.</p>;

  const { product, sources, history, creatives, hooks, landings, experiments, evidence } = data;
  const currency = product.currency ?? "USD";
  const econ = computeEconomics({
    suggested_price: num(product.suggested_price),
    product_cost: num(product.product_cost),
    shipping_cost: num(product.shipping_cost),
    fulfillment_cost: num(product.fulfillment_cost),
    payment_fee_pct: num(product.payment_fee_pct),
    platform_fee_pct: num(product.platform_fee_pct),
    refund_allowance_pct: num(product.refund_allowance_pct),
    estimated_cac: num(product.estimated_cac),
  });

  const sourcesWithCost = sources.filter((s) => landedCost(s) !== null);
  const best = sourcesWithCost
    .slice()
    .sort((a, b) => (landedCost(a) as number) - (landedCost(b) as number))[0];

  const d = decision({
    sourcesWithCost: sourcesWithCost.length,
    totalSources: sources.length,
    economicsComplete: econ.complete,
    contributionBefore: econ.contributionBefore,
  });
  const opportunity = interpretOpportunity(product, sources, econ);
  const action = nextBestAction({ opportunity, economics: econ, sources, experiments });
  const sourceWar = compareSources(sources);

  const breakdown = (product.score_breakdown ?? {}) as Record<string, number | undefined>;

  const openEcon = () => {
    setEconForm({
      suggested_price: num(product.suggested_price),
      product_cost: num(product.product_cost),
      shipping_cost: num(product.shipping_cost),
      fulfillment_cost: num(product.fulfillment_cost),
      payment_fee_pct: num(product.payment_fee_pct),
      platform_fee_pct: num(product.platform_fee_pct),
      refund_allowance_pct: num(product.refund_allowance_pct),
      estimated_cac: num(product.estimated_cac),
    });
    setEconOpen(true);
  };

  const openScore = () => {
    const initial: Record<string, number | null> = {};
    for (const c of SCORE_CRITERIA) initial[c] = breakdown[c] ?? null;
    setScoreForm(initial);
    setScoreOpen(true);
  };

  const submitEcon = () =>
    saveProduct.mutate(
      { id: product.id, values: econForm },
      {
        onSuccess: () => {
          setEconOpen(false);
          toast.success("Economics updated.");
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const submitScore = () => {
    const values = Object.fromEntries(
      Object.entries(scoreForm).filter(([, v]) => v !== null),
    ) as Record<string, number>;
    const complete = SCORE_CRITERIA.every((c) => values[c] !== undefined);
    const total = complete
      ? Math.round(
          (SCORE_CRITERIA.reduce((a, c) => a + (values[c] ?? 0), 0) / (SCORE_CRITERIA.length * 10)) *
            100,
        )
      : null;
    saveProduct.mutate(
      { id: product.id, values: { score_breakdown: values, score: total } },
      {
        onSuccess: () => {
          setScoreOpen(false);
          toast.success(
            complete ? "Score recalculated." : "Criteria saved. The total needs all 12 values.",
          );
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const submitSource = () => {
    if (!sourceForm.supplier_id) {
      toast.error("Pick a supplier.");
      return;
    }
    saveSource.mutate(
      {
        values: {
          product_id: product.id,
          supplier_id: sourceForm.supplier_id,
          supplier_sku: sourceForm.supplier_sku || null,
          supplier_url: sourceForm.supplier_url || null,
          product_cost: sourceForm.product_cost,
          shipping_cost: sourceForm.shipping_cost,
          fees: sourceForm.fees,
          moq: sourceForm.moq,
          stock: sourceForm.stock,
          stock_location: sourceForm.stock_location || null,
          delivery_estimate_days_min: sourceForm.delivery_estimate_days_min,
          delivery_estimate_days_max: sourceForm.delivery_estimate_days_max,
          data_confirmed: sourceForm.data_confirmed === "yes",
          notes: sourceForm.notes || null,
        },
      },
      {
        onSuccess: () => {
          setSourceOpen(false);
          setSourceForm(emptySource);
          toast.success("Source saved.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const changeStage = (stage: string) =>
    saveProduct.mutate(
      { id: product.id, values: { stage } },
      {
        onSuccess: () => toast.success("Stage updated and logged."),
        onError: (e) => toast.error(e.message),
      },
    );

  const submitEvidence = () => {
    if (!evidenceForm.claim.trim() || !evidenceForm.source.trim()) {
      toast.error("A claim and source are required.");
      return;
    }
    saveEvidence.mutate({ values: {
      product_id: product.id,
      claim: evidenceForm.claim.trim(),
      source: evidenceForm.source.trim(),
      source_url: evidenceForm.source_url || null,
      status: evidenceForm.status,
      observed_at: new Date().toISOString(),
    } }, {
      onSuccess: () => {
        setEvidenceOpen(false);
        setEvidenceForm({ claim: "", source: "", source_url: "", status: "UNKNOWN" });
        toast.success("Evidence recorded.");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-14">
      <PageHeader
        title={product.name}
        subtitle={product.concept ?? undefined}
        action={
          <Select value={product.stage} onChange={(e) => changeStage(e.target.value)}>
            {PRODUCT_STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        }
      />
      <div className="label-xs -mt-10">
        <Link to="/products" className="hover:text-foreground">
          ← {t("products.title")}
        </Link>
        {product.brands ? ` · ${product.brands.name}™` : ""}
      </div>

      <section className="space-y-4">
        <SectionTitle aside={<div className="flex items-center gap-2"><ConfidenceBadge level={opportunity.confidence} /><Button size="sm" variant="outline" onClick={() => setEvidenceOpen(true)}>Add evidence</Button></div>}>
          {t("intelligence.opportunity")}
        </SectionTitle>
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={opportunity.status === "PROMISING" ? "success" : "accent"}>{opportunity.status.replace(/_/g, " ")}</Badge>
              {opportunity.score === null ? <DataFlag kind="UNKNOWN">SCORE UNKNOWN</DataFlag> : <span className="numeral text-sm">{opportunity.score}/100</span>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{opportunity.summary}</p>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-3">
            {([
              [t("intelligence.why"), opportunity.why],
              [t("intelligence.risks"), opportunity.risks],
              [t("intelligence.unknowns"), opportunity.unknowns],
            ] as const).map(([label, items]) => (
              <div key={label} className="bg-card p-5">
                <div className="label-xs">{label}</div>
                {items.length === 0 ? <div className="mt-3"><DataFlag kind="NO_DATA" /></div> : (
                  <ul className="mt-3 space-y-4 text-sm">
                    {items.map((item) => <li key={`${item.claim}-${item.source}`}>{item.claim}<ProvenanceLine source={item.source} timestamp={item.timestamp} status={item.status} /></li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-5">
            <div className="label-xs">{t("intelligence.evidence")} · {evidence.length} recorded</div>
            {evidence.length === 0 ? <div className="mt-3"><DataFlag kind="NO_DATA">NO RECORDED EVIDENCE</DataFlag></div> : (
              <div className="mt-3 space-y-3">{evidence.slice(0, 5).map((item) => <div key={item.id} className="text-sm">{item.claim}<ProvenanceLine source={item.source} timestamp={item.observed_at ?? item.created_at} status={item.status} /></div>)}</div>
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("intelligence.nextAction")}</SectionTitle>
        <Card className="p-5">
          <div className="display text-2xl">{action.action}</div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[["Why", action.why], ["Evidence", action.evidence], ["Unknown", action.unknown], ["Risk", action.risk], ["Expected outcome", action.expectedOutcome]].map(([label, value]) => <div key={label}><div className="label-xs">{label}</div><p className="mt-2 text-sm text-muted-foreground">{value}</p></div>)}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle
          aside={
            <div className="flex items-center gap-3">
              {product.score === null ? (
                <DataFlag kind="UNKNOWN" />
              ) : (
                <span className="numeral">{product.score}/100</span>
              )}
              <Button size="sm" variant="outline" onClick={openScore}>
                Edit
              </Button>
            </div>
          }
        >
          {t("product.score")}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {SCORE_CRITERIA.map((c) => (
            <div key={c} className="bg-card p-4">
              <div className="label-xs">{c.replace(/_/g, " ")}</div>
              <div className="numeral mt-1 text-sm">
                {breakdown[c] === undefined ? t("state.unknown") : `${breakdown[c]}/10`}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          The total score is only calculated once all 12 criteria have a recorded value. Nothing is
          estimated automatically.
        </p>
      </section>

      <section className="space-y-4">
        <SectionTitle
          aside={
            <div className="flex items-center gap-3">
              <span className="label-xs">{currency}</span>
              <Button size="sm" variant="outline" onClick={openEcon}>
                Edit
              </Button>
            </div>
          }
        >
          {t("product.economics")}
        </SectionTitle>
        <Card className="divide-y divide-border">
          {econ.lines.map((line) => (
            <div key={line.key} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>{t(line.key)}</span>
              <span className="numeral">
                {line.unknown ? (
                  <DataFlag kind="UNKNOWN" />
                ) : (
                  formatMoney(line.value, currency, locale)
                )}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-surface px-5 py-3 text-sm font-medium">
            <span>{t("econ.contributionBefore")}</span>
            <span className="numeral">
              {econ.contributionBefore === null ? (
                <DataFlag kind="UNKNOWN" />
              ) : (
                formatMoney(econ.contributionBefore, currency, locale)
              )}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <span>{t("econ.cac")}</span>
            <span className="numeral">
              {product.estimated_cac === null ? (
                <DataFlag kind="UNKNOWN" />
              ) : (
                formatMoney(Number(product.estimated_cac), currency, locale)
              )}
            </span>
          </div>
          <div className="flex items-center justify-between bg-surface px-5 py-3 text-sm font-medium">
            <span>{t("econ.contributionAfter")}</span>
            <span className="numeral">
              {econ.contributionAfter === null ? (
                <DataFlag kind="UNKNOWN" />
              ) : (
                formatMoney(econ.contributionAfter, currency, locale)
              )}
            </span>
          </div>
        </Card>
        {!econ.complete ? (
          <p className="text-xs text-muted-foreground">{t("econ.incomplete")}</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <SectionTitle
          aside={
            <div className="flex items-center gap-3">
              <span className="label-xs">{sources.length} candidates</span>
              <Button size="sm" variant="outline" onClick={() => setSourceOpen(true)}>
                Add source
              </Button>
            </div>
          }
        >
          {t("product.sources")}
        </SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface">
              <tr className="label-xs text-left">
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Shipping</th>
                <th className="px-4 py-3 font-medium">Landed</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium">MOQ</th>
                <th className="px-4 py-3 font-medium">Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {sources.map((s) => {
                const supplier = s.suppliers as Supplier | null;
                const landed = landedCost(s);
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      {supplier?.name ?? "—"}
                      {best && best.id === s.id ? (
                        <Badge tone="success" className="ml-2">
                          BEST COST
                        </Badge>
                      ) : null}
                    </td>
                    <td className="numeral px-4 py-3">
                      {s.product_cost === null
                        ? t("state.unknown")
                        : formatMoney(Number(s.product_cost), currency, locale)}
                    </td>
                    <td className="numeral px-4 py-3">
                      {s.shipping_cost === null
                        ? t("state.unknown")
                        : formatMoney(Number(s.shipping_cost), currency, locale)}
                    </td>
                    <td className="numeral px-4 py-3">
                      {landed === null ? t("state.unknown") : formatMoney(landed, currency, locale)}
                    </td>
                    <td className="numeral px-4 py-3">
                      {s.delivery_estimate_days_min === null
                        ? t("state.unknown")
                        : `${s.delivery_estimate_days_min}–${s.delivery_estimate_days_max ?? "?"}d`}
                    </td>
                    <td className="numeral px-4 py-3">{s.moq ?? t("state.unknown")}</td>
                    <td className="px-4 py-3">{s.data_confirmed ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          {sourceWar.rationale} Rankings only use comparable recorded figures.
        </p>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("product.decision")}</SectionTitle>
        <Card className="p-5">
          <div className="display text-2xl">{d.verdict}</div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {d.reasons.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle aside={<DataFlag kind="NO_DATA">NO PERFORMANCE</DataFlag>}>
            {t("product.creative")}
          </SectionTitle>
          {creatives.length === 0 && hooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No creatives or hooks recorded for this product yet.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {creatives.map((c) => (
                <li key={c.id}>
                  {c.code ?? c.concept} — {c.hook ?? "no hook"}
                </li>
              ))}
              {hooks.map((h) => (
                <li key={h.id}>“{h.text}”</li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <SectionTitle>{t("product.landing")}</SectionTitle>
          {landings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("state.noData")}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {landings.map((l) => (
                <li key={l.id}>
                  {l.title} · {l.status}
                </li>
              ))}
            </ul>
          )}
          <SectionTitle>{t("product.experiments")}</SectionTitle>
          {experiments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("state.noData")}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {experiments.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/experiments/$id"
                    params={{ id: e.id }}
                    className="hover:text-foreground"
                  >
                    {e.code ?? "Experiment"} · {e.status}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("product.history")}</SectionTitle>
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span>
                {h.from_stage ? `${h.from_stage.replace(/_/g, " ")} → ` : ""}
                {h.to_stage.replace(/_/g, " ")}
              </span>
              <span className="numeral text-xs text-muted-foreground">
                {new Date(h.created_at).toLocaleString(locale)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        title="Record evidence"
        footer={<><Button variant="outline" onClick={() => setEvidenceOpen(false)}>{t("cancel")}</Button><Button onClick={submitEvidence} disabled={saveEvidence.isPending}>{t("save")}</Button></>}
      >
        <Field label="Claim"><Textarea value={evidenceForm.claim} onChange={(e) => setEvidenceForm({ ...evidenceForm, claim: e.target.value })} /></Field>
        <Grid2>
          <Field label="Source"><Input value={evidenceForm.source} onChange={(e) => setEvidenceForm({ ...evidenceForm, source: e.target.value })} placeholder="Supplier quote, test, document…" /></Field>
          <Field label="Source URL"><Input value={evidenceForm.source_url} onChange={(e) => setEvidenceForm({ ...evidenceForm, source_url: e.target.value })} /></Field>
          <Field label="Status"><Select value={evidenceForm.status} onChange={(e) => setEvidenceForm({ ...evidenceForm, status: e.target.value })}>{["VERIFIED", "OBSERVED", "DECLARED_BY_SUPPLIER", "HYPOTHESIS", "ESTIMATE", "AI_GENERATED", "UNKNOWN", "INSUFFICIENT_DATA"].map((status) => <option key={status} value={status}>{status.replace(/_/g, " ")}</option>)}</Select></Field>
        </Grid2>
      </Modal>

      <Modal
        open={econOpen}
        onClose={() => setEconOpen(false)}
        title="Unit economics"
        footer={
          <>
            <Button variant="outline" onClick={() => setEconOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submitEcon} disabled={saveProduct.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          {(
            [
              ["suggested_price", "Selling price"],
              ["product_cost", "Product cost"],
              ["shipping_cost", "Shipping"],
              ["fulfillment_cost", "Fulfillment"],
              ["payment_fee_pct", "Payment fees (%)"],
              ["platform_fee_pct", "Platform fees (%)"],
              ["refund_allowance_pct", "Refund allowance (%)"],
              ["estimated_cac", "Estimated CAC"],
            ] as [string, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <NumberInput
                value={econForm[key] ?? null}
                step={0.01}
                onValue={(v) => setEconForm({ ...econForm, [key]: v })}
              />
            </Field>
          ))}
        </Grid2>
        <p className="text-xs text-muted-foreground">
          Leave a field empty when you do not have the real figure — it stays UNKNOWN instead of
          being guessed.
        </p>
      </Modal>

      <Modal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        title="Score criteria (0–10 each)"
        footer={
          <>
            <Button variant="outline" onClick={() => setScoreOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submitScore} disabled={saveProduct.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          {SCORE_CRITERIA.map((c) => (
            <Field key={c} label={c.replace(/_/g, " ")}>
              <NumberInput
                value={scoreForm[c] ?? null}
                min={0}
                max={10}
                onValue={(v) => setScoreForm({ ...scoreForm, [c]: v })}
              />
            </Field>
          ))}
        </Grid2>
      </Modal>

      <Modal
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        title="Add supplier source"
        footer={
          <>
            <Button variant="outline" onClick={() => setSourceOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submitSource} disabled={saveSource.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          <Field label="Supplier">
            <Select
              value={sourceForm.supplier_id}
              onChange={(e) => setSourceForm({ ...sourceForm, supplier_id: e.target.value })}
            >
              <option value="">—</option>
              {(suppliers ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Supplier SKU">
            <Input
              value={sourceForm.supplier_sku}
              onChange={(e) => setSourceForm({ ...sourceForm, supplier_sku: e.target.value })}
            />
          </Field>
          <Field label="Supplier URL">
            <Input
              value={sourceForm.supplier_url}
              onChange={(e) => setSourceForm({ ...sourceForm, supplier_url: e.target.value })}
            />
          </Field>
          <Field label="Data confirmed">
            <Select
              value={sourceForm.data_confirmed}
              onChange={(e) => setSourceForm({ ...sourceForm, data_confirmed: e.target.value })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
          <Field label="Product cost">
            <NumberInput
              value={sourceForm.product_cost}
              step={0.01}
              onValue={(v) => setSourceForm({ ...sourceForm, product_cost: v })}
            />
          </Field>
          <Field label="Shipping cost">
            <NumberInput
              value={sourceForm.shipping_cost}
              step={0.01}
              onValue={(v) => setSourceForm({ ...sourceForm, shipping_cost: v })}
            />
          </Field>
          <Field label="Fees">
            <NumberInput
              value={sourceForm.fees}
              step={0.01}
              onValue={(v) => setSourceForm({ ...sourceForm, fees: v })}
            />
          </Field>
          <Field label="MOQ">
            <NumberInput
              value={sourceForm.moq}
              onValue={(v) => setSourceForm({ ...sourceForm, moq: v })}
            />
          </Field>
          <Field label="Stock">
            <NumberInput
              value={sourceForm.stock}
              onValue={(v) => setSourceForm({ ...sourceForm, stock: v })}
            />
          </Field>
          <Field label="Stock location">
            <Input
              value={sourceForm.stock_location}
              onChange={(e) => setSourceForm({ ...sourceForm, stock_location: e.target.value })}
            />
          </Field>
          <Field label="Delivery days (min)">
            <NumberInput
              value={sourceForm.delivery_estimate_days_min}
              onValue={(v) => setSourceForm({ ...sourceForm, delivery_estimate_days_min: v })}
            />
          </Field>
          <Field label="Delivery days (max)">
            <NumberInput
              value={sourceForm.delivery_estimate_days_max}
              onValue={(v) => setSourceForm({ ...sourceForm, delivery_estimate_days_max: v })}
            />
          </Field>
        </Grid2>
        <Field label="Notes">
          <Textarea
            value={sourceForm.notes}
            onChange={(e) => setSourceForm({ ...sourceForm, notes: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}
