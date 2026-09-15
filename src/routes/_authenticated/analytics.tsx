import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { allMetricsQuery, funnelEventsQuery, integrationsQuery } from "@/lib/queries";
import { derive, fmtNum, fmtPct, totals } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Funnel events, acquisition rates and margin metrics from recorded data only.",
      },
      { property: "og:title", content: "Analytics — Commerce Intelligence Engine" },
      { property: "og:description", content: "Funnel, acquisition and margin metrics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const FUNNEL_ORDER = [
  "PAGE_VIEW",
  "VIEW_CONTENT",
  "ADD_TO_CART",
  "BEGIN_CHECKOUT",
  "PURCHASE",
  "REFUND",
  "LEAD",
  "EMAIL_SIGNUP",
  "COUPON",
  "UPSELL",
];

function AnalyticsPage() {
  const { t } = useI18n();
  const { data: metrics } = useQuery(allMetricsQuery);
  const { data: events } = useQuery(funnelEventsQuery);
  const { data: integrations } = useQuery(integrationsQuery);

  const tot = totals(metrics ?? []);
  const der = derive(tot);

  const counts = FUNNEL_ORDER.map((type) => ({
    type,
    count: (events ?? []).filter((e) => e.event_type === type).length,
  }));
  const hasEvents = (events ?? []).length > 0;

  const utm = new Map<string, number>();
  for (const e of events ?? []) {
    const key = `${e.utm_source ?? "—"} / ${e.utm_medium ?? "—"} / ${e.utm_campaign ?? "—"}`;
    utm.set(key, (utm.get(key) ?? 0) + 1);
  }

  const adsConnected = (integrations ?? []).some(
    (i) => ["meta", "tiktok", "google_ads", "ga4"].includes(i.key) && i.status === "CONNECTED",
  );

  const cards: [string, string | null][] = [
    ["Revenue", fmtNum(tot.revenue, 2)],
    ["Orders", fmtNum(tot.purchases)],
    ["AOV", fmtNum(der.aov, 2)],
    ["CAC", fmtNum(der.cac, 2)],
    ["ROAS", fmtNum(der.roas, 2)],
    ["Refund rate", fmtPct(der.refundRate)],
    ["CTR", fmtPct(der.ctr)],
    ["CPC", fmtNum(der.cpc, 2)],
    ["CPM", fmtNum(der.cpm, 2)],
    ["ATC rate", fmtPct(der.atcRate)],
    ["Checkout rate", fmtPct(der.checkoutRate)],
    ["Conversion rate", fmtPct(der.conversionRate)],
  ];

  return (
    <div className="space-y-12">
      <PageHeader
        title="Analytics"
        subtitle="Aggregated from experiment records and tracked funnel events. Revenue is not profit."
      />

      {!adsConnected ? (
        <Card className="flex flex-wrap items-center gap-3 p-4 text-sm text-muted-foreground">
          <DataFlag kind="NOT_CONFIGURED" />
          Meta, TikTok, Google Ads and GA4 are not connected — ad figures come only from what you
          record manually.
        </Card>
      ) : null}

      <section className="space-y-4">
        <SectionTitle aside={`${(metrics ?? []).length} recorded day(s)`}>Performance</SectionTitle>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {cards.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <div className="label-xs">{label}</div>
              <div className="numeral mt-2 text-lg">{value ?? <DataFlag kind="NO_DATA" />}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle aside="Ingested through the tracking endpoint">Funnel events</SectionTitle>
        {!hasEvents ? (
          <Card className="p-5 text-sm text-muted-foreground">
            <DataFlag kind="NO_DATA" /> No funnel events received yet.
          </Card>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
            {counts.map((c) => (
              <div key={c.type} className="bg-card p-4">
                <div className="label-xs">{c.type.replace(/_/g, " ")}</div>
                <div className="numeral mt-2 text-lg">{c.count}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle>UTM breakdown</SectionTitle>
        {utm.size === 0 ? (
          <p className="text-sm text-muted-foreground">{t("state.noData")}</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {[...utm.entries()].map(([key, count]) => (
              <div key={key} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{key}</span>
                <Badge tone="neutral" className="numeral">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
