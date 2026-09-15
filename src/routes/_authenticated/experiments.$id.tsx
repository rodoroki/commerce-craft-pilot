import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input, SectionTitle } from "@/components/ui/kit";
import { Grid2, Modal, NumberInput, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import { EXPERIMENT_STATUSES, experimentDetailQuery, useSaveRecord } from "@/lib/queries";
import { decide, derive, fmtNum, fmtPct, totals } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/experiments/$id")({
  head: () => ({
    meta: [
      { title: "Experiment detail — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Daily metrics, derived rates and rule-based decision support for one test.",
      },
      { property: "og:title", content: "Experiment detail — Commerce Intelligence Engine" },
      { property: "og:description", content: "Daily metrics, rates and decision support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExperimentDetail,
});

const emptyRow = {
  metric_date: new Date().toISOString().slice(0, 10),
  source: "",
  impressions: null as number | null,
  clicks: null as number | null,
  spend: null as number | null,
  page_views: null as number | null,
  view_content: null as number | null,
  add_to_cart: null as number | null,
  begin_checkout: null as number | null,
  purchases: null as number | null,
  revenue: null as number | null,
  refunds: null as number | null,
};

function ExperimentDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { data, isLoading } = useQuery(experimentDetailQuery(id));
  const saveMetric = useSaveRecord("experiment_metrics");
  const saveExperiment = useSaveRecord("experiments");
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState(emptyRow);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Experiment not found.</p>;

  const { experiment, metrics } = data;
  const tot = totals(metrics);
  const der = derive(tot);
  const decision = decide({ t: tot, d: der, product: experiment.products });

  const addRow = () => {
    saveMetric.mutate(
      { values: { ...row, experiment_id: id, source: row.source || null } },
      {
        onSuccess: () => {
          setOpen(false);
          setRow(emptyRow);
          toast.success("Metrics recorded.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const setStatus = (status: string) =>
    saveExperiment.mutate({ id, values: { status } }, { onError: (e) => toast.error(e.message) });

  const metricCards: [string, string | null][] = [
    ["Impressions", fmtNum(tot.impressions)],
    ["Clicks", fmtNum(tot.clicks)],
    ["Spend", fmtNum(tot.spend, 2)],
    ["Page views", fmtNum(tot.pageViews)],
    ["Add to cart", fmtNum(tot.addToCart)],
    ["Purchases", fmtNum(tot.purchases)],
    ["Revenue", fmtNum(tot.revenue, 2)],
    ["Refunds", fmtNum(tot.refunds, 2)],
    ["CTR", fmtPct(der.ctr)],
    ["CPC", fmtNum(der.cpc, 2)],
    ["CPM", fmtNum(der.cpm, 2)],
    ["ATC rate", fmtPct(der.atcRate)],
    ["Checkout rate", fmtPct(der.checkoutRate)],
    ["Conversion rate", fmtPct(der.conversionRate)],
    ["CAC", fmtNum(der.cac, 2)],
    ["AOV", fmtNum(der.aov, 2)],
    ["ROAS", fmtNum(der.roas, 2)],
    ["Refund rate", fmtPct(der.refundRate)],
  ];

  return (
    <div className="space-y-12">
      <PageHeader
        title={experiment.code ?? "Experiment"}
        subtitle={experiment.hypothesis ?? ""}
        action={
          <div className="flex items-center gap-2">
            <Select value={experiment.status} onChange={(e) => setStatus(e.target.value)}>
              {EXPERIMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button onClick={() => setOpen(true)}>Record metrics</Button>
          </div>
        }
      />

      <section className="space-y-4">
        <SectionTitle aside="Revenue is not profit">Measured performance</SectionTitle>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {metricCards.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <div className="label-xs">{label}</div>
              <div className="numeral mt-2 text-lg">
                {value ?? <DataFlag kind="NO_DATA" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle aside={`${metrics.length} recorded day(s)`}>Decision</SectionTitle>
        <Card className="p-6">
          <Badge tone={decision.verdict === "SCALE" ? "success" : "accent"}>
            {decision.verdict.replace(/_/g, " ")}
          </Badge>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {decision.reasons.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
          {decision.indicators.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {decision.indicators.map((i) => (
                <Badge key={i} tone="neutral">
                  {i}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                saveExperiment.mutate(
                  { id, values: { decision: decision.verdict } },
                  { onSuccess: () => toast.success("Decision saved to the experiment.") },
                )
              }
            >
              Save this decision
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Daily records</SectionTitle>
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No metrics recorded. Nothing is estimated on your behalf.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="label-xs border-b border-border text-left">
                  {["Date", "Source", "Impr.", "Clicks", "Spend", "Views", "ATC", "Purch.", "Revenue"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 font-normal">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">{m.metric_date}</td>
                    <td className="px-4 py-3">{m.source ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.impressions ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.clicks ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.spend ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.page_views ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.add_to_cart ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.purchases ?? "—"}</td>
                    <td className="numeral px-4 py-3">{m.revenue ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link to="/experiments" className="text-sm text-muted-foreground hover:text-foreground">
        ← All experiments
      </Link>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record daily metrics"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={addRow} disabled={saveMetric.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          <Field label="Date">
            <Input
              type="date"
              value={row.metric_date}
              onChange={(e) => setRow({ ...row, metric_date: e.target.value })}
            />
          </Field>
          <Field label="Source">
            <Input value={row.source} onChange={(e) => setRow({ ...row, source: e.target.value })} />
          </Field>
          <Field label="Impressions">
            <NumberInput value={row.impressions} onValue={(v) => setRow({ ...row, impressions: v })} />
          </Field>
          <Field label="Clicks">
            <NumberInput value={row.clicks} onValue={(v) => setRow({ ...row, clicks: v })} />
          </Field>
          <Field label="Spend">
            <NumberInput value={row.spend} onValue={(v) => setRow({ ...row, spend: v })} step={0.01} />
          </Field>
          <Field label="Page views">
            <NumberInput value={row.page_views} onValue={(v) => setRow({ ...row, page_views: v })} />
          </Field>
          <Field label="View content">
            <NumberInput
              value={row.view_content}
              onValue={(v) => setRow({ ...row, view_content: v })}
            />
          </Field>
          <Field label="Add to cart">
            <NumberInput value={row.add_to_cart} onValue={(v) => setRow({ ...row, add_to_cart: v })} />
          </Field>
          <Field label="Begin checkout">
            <NumberInput
              value={row.begin_checkout}
              onValue={(v) => setRow({ ...row, begin_checkout: v })}
            />
          </Field>
          <Field label="Purchases">
            <NumberInput value={row.purchases} onValue={(v) => setRow({ ...row, purchases: v })} />
          </Field>
          <Field label="Revenue">
            <NumberInput
              value={row.revenue}
              onValue={(v) => setRow({ ...row, revenue: v })}
              step={0.01}
            />
          </Field>
          <Field label="Refunds">
            <NumberInput
              value={row.refunds}
              onValue={(v) => setRow({ ...row, refunds: v })}
              step={0.01}
            />
          </Field>
        </Grid2>
        <Textarea className="hidden" readOnly value="" />
      </Modal>
    </div>
  );
}
