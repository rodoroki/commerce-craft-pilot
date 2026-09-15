import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import {
  allMetricsQuery,
  experimentsQuery,
  integrationsQuery,
  productsQuery,
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
        <SectionTitle>{t("command.attention")}</SectionTitle>
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
      </section>
    </div>
  );
}
