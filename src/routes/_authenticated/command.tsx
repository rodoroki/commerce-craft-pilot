import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { integrationsQuery, productsQuery, PRODUCT_STAGES } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/command")({
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

const BUSINESS = [
  "metric.revenue",
  "metric.orders",
  "metric.aov",
  "metric.cac",
  "metric.roas",
  "metric.contributionMargin",
  "metric.refundRate",
];

function CommandCenter() {
  const { t } = useI18n();
  const products = useQuery(productsQuery);
  const integrations = useQuery(integrationsQuery);

  const commerceConnected = (integrations.data ?? []).some(
    (i) => i.category === "COMMERCE" && i.status === "CONNECTED",
  );

  const counts = PRODUCT_STAGES.map((stage) => ({
    stage,
    count: (products.data ?? []).filter((p) => p.stage === stage).length,
  }));

  const attention = (products.data ?? []).filter((p) => p.score === null || p.stage === "SOURCING");

  return (
    <div className="space-y-14">
      <PageHeader title={t("command.title")} subtitle={t("phase.note")} />

      <section className="space-y-4">
        <SectionTitle aside={!commerceConnected ? <DataFlag kind="NOT_CONFIGURED" /> : undefined}>
          {t("command.business")}
        </SectionTitle>
        <p className="text-sm text-muted-foreground">{t("command.noBusinessData")}</p>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {BUSINESS.map((key) => (
            <div key={key} className="bg-card p-4">
              <div className="label-xs">{t(key)}</div>
              <div className="numeral mt-2 text-sm text-muted-foreground">{t("state.noData")}</div>
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
