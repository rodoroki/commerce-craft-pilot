import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { brandsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/brands")({
  head: () => ({
    meta: [
      { title: "Brand Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Multi-brand architecture: positioning, market, language and currency per brand.",
      },
      { property: "og:title", content: "Brand Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Multi-brand architecture and positioning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(brandsQuery);

  return (
    <div>
      <PageHeader title={t("brands.title")} subtitle={t("brands.subtitle")} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((b) => (
            <Card key={b.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="display text-2xl">{b.name}™</h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    {b.positioning ?? t("state.unknown")}
                  </p>
                </div>
                <Badge tone={b.is_active ? "success" : "neutral"}>
                  {b.is_active ? "ACTIVE" : "DRAFT"}
                </Badge>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {(
                  [
                    ["Territory", b.territory],
                    ["Market", b.market],
                    ["Language", b.language],
                    ["Currency", b.currency],
                    ["Domain", b.domain],
                    ["Audience", b.audience],
                    ["Voice", b.voice],
                    ["Logo", b.logo_url],
                  ] as [string, string | null][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="label-xs">{label}</dt>
                    <dd className="mt-1 text-sm">{value ?? <DataFlag kind="UNKNOWN" />}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
