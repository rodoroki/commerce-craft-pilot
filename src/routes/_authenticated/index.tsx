import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import {
  allMetricsQuery,
  decisionsQuery,
  experimentsQuery,
  integrationsQuery,
  knowledgeQuery,
  productsQuery,
  stageHistoryQuery,
  suppliersQuery,
  PRODUCT_STAGES,
} from "@/lib/queries";
import { derive, fmtNum, fmtPct, totals } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Command Center — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Operation state at a glance: business metrics, product pipeline and decisions.",
      },
      { property: "og:title", content: "Command Center — Commerce Intelligence Engine" },
      { property: "og:description", content: "Operation state at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const { t } = useI18n();
  const products = useQuery(productsQuery);
  const integrations = useQuery(integrationsQuery);
  const metrics = useQuery(allMetricsQuery);
  const experiments = useQuery(experimentsQuery);
  const suppliers = useQuery(suppliersQuery);
  const knowledge = useQuery(knowledgeQuery);
  const decisions = useQuery(decisionsQuery);
  const stageHistory = useQuery(stageHistoryQuery);

  const commerceConnected = (integrations.data ?? []).some(
    (i) => i.category === "COMMERCE" && i.status === "CONNECTED",
  );

  const tot = totals(metrics.data ?? []);
  const der = derive(tot);

  const business: [string, string | null][] = [
    [t("metric.revenue"), fmtNum(tot.revenue, 2)],
    [t("metric.orders"), fmtNum(tot.purchases)],
    [t("metric.aov"), fmtNum(der.aov, 2)],
    [t("metric.cac"), fmtNum(der.cac, 2)],
    [t("metric.roas"), fmtNum(der.roas, 2)],
    [t("metric.contributionMargin"), null],
    [t("metric.refundRate"), fmtPct(der.refundRate)],
  ];

  const counts = PRODUCT_STAGES.map((stage) => ({
    stage,
    count: (products.data ?? []).filter((p) => p.stage === stage).length,
  }));

  const attention = (products.data ?? []).filter((p) => p.score === null || p.stage === "SOURCING");
  const thinExperiments = (experiments.data ?? []).filter(
    (e) => e.status === "RUNNING" && !e.decision,
  );
  const unratedSuppliers = (suppliers.data ?? []).filter((s) => s.supplier_score === null);
  const totalBudget = (experiments.data ?? []).reduce((sum, experiment) => sum + Number(experiment.budget ?? 0), 0);
  const totalSpend = tot.spend ?? 0;
  const blockers = attention.length + unratedSuppliers.length;
  const latestChanges = (stageHistory.data ?? []).slice(0, 5);
  const latestLearning = (knowledge.data ?? [])[0];
  const latestDecision = (decisions.data ?? [])[0];
  const topAction = attention[0]
    ? `Complete evidence and sourcing for ${attention[0].name}.`
    : thinExperiments[0]
      ? `Collect enough data to decide ${thinExperiments[0].code ?? "the active experiment"}.`
      : "No urgent action is currently indicated.";

  return (
    <div className="space-y-14">
      <PageHeader title={t("command.title")} subtitle={t("phase.note")} />

      <section className="space-y-4">
        <SectionTitle aside={!commerceConnected ? <DataFlag kind="NOT_CONFIGURED" /> : undefined}>
          {t("command.business")}
        </SectionTitle>
        {!commerceConnected ? (
          <p className="text-sm text-muted-foreground">{t("command.noBusinessData")}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {business.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <div className="label-xs">{label}</div>
              <div className="numeral mt-2 text-sm">
                {value ?? <span className="text-muted-foreground">{t("state.noData")}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("command.pipeline")}</SectionTitle>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5 lg:grid-cols-9">
          {counts.map(({ stage, count }) => (
            <div key={stage} className="bg-card p-4">
              <div className="numeral display text-3xl">{count}</div>
              <div className="label-xs mt-1 leading-tight">{stage.replace("_", " ")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("intelligence.nextAction")}</SectionTitle>
        <Card className="p-6">
          <div className="display text-2xl">{topAction}</div>
          <p className="mt-2 text-sm text-muted-foreground">Selected from unresolved product evidence, supplier confidence, and experiment thresholds.</p>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("command.attention")} · {t("intelligence.blocking")}</SectionTitle>
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("command.attentionEmpty")}</p>
        ) : (
          <div className="space-y-2">
            {attention.map((p) => (
              <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="block">
                <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.score === null
                        ? "Product score not calculated — inputs missing."
                        : "Sourcing in progress — supplier data incomplete."}
                    </div>
                  </div>
                  <Badge tone="accent">{p.stage.replace("_", " ")}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/experiments" className="block">
            <Card className="p-4 transition-colors hover:bg-surface">
              <div className="label-xs">Experiments without a decision</div>
              <div className="numeral mt-2 text-2xl">{thinExperiments.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Running tests still below the data threshold for a verdict.
              </p>
            </Card>
          </Link>
          <Link to="/suppliers" className="block">
            <Card className="p-4 transition-colors hover:bg-surface">
              <div className="label-xs">Suppliers without a reliability score</div>
              <div className="numeral mt-2 text-2xl">{unratedSuppliers.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Sourcing decisions stay blocked until these are rated.
              </p>
            </Card>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle>{t("intelligence.capital")}</SectionTitle>
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-5">
              <div><div className="label-xs">Planned</div><div className="numeral mt-2 text-xl">{totalBudget > 0 ? fmtNum(totalBudget, 2) : <DataFlag kind="NO_DATA" />}</div></div>
              <div><div className="label-xs">Spent</div><div className="numeral mt-2 text-xl">{totalSpend > 0 ? fmtNum(totalSpend, 2) : <DataFlag kind="NO_DATA" />}</div></div>
              <div><div className="label-xs">Blocked areas</div><div className="numeral mt-2 text-xl">{blockers}</div></div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Capital exposure uses recorded experiment budgets and spend only. Revenue is not profit.</p>
          </Card>
        </div>
        <div className="space-y-4">
          <SectionTitle>{t("intelligence.changed")}</SectionTitle>
          <Card className="divide-y divide-border">
            {latestChanges.length === 0 ? <div className="p-5"><DataFlag kind="NO_DATA" /></div> : latestChanges.map((change) => <div key={change.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm"><span>{change.from_stage ? `${change.from_stage} → ` : ""}{change.to_stage}</span><span className="text-xs text-muted-foreground">{new Date(change.created_at).toLocaleDateString()}</span></div>)}
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle>{t("intelligence.learning")}</SectionTitle>
          <Card className="p-5">
            {latestLearning ? <><div className="flex items-center gap-2"><Badge tone={latestLearning.status === "CONSOLIDATED" ? "success" : "warning"}>{latestLearning.status}</Badge><span className="label-xs">{latestLearning.observations_count} observations</span></div><p className="mt-3 text-sm">{latestLearning.insight}</p></> : <DataFlag kind="NO_DATA" />}
          </Card>
        </div>
        <div className="space-y-4">
          <SectionTitle>{t("intelligence.decision")}</SectionTitle>
          <Card className="p-5">
            {latestDecision ? <><Badge tone={latestDecision.decision === "SCALE" ? "success" : "accent"}>{latestDecision.decision.replace(/_/g, " ")}</Badge><p className="mt-3 text-sm text-muted-foreground">{latestDecision.next_action}</p></> : <><DataFlag kind="NO_DATA" /><p className="mt-3 text-sm text-muted-foreground">No formal evidence-backed decision has been saved.</p></>}
          </Card>
        </div>
      </section>
    </div>
  );
}
