import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/products/")({
  head: () => ({
    meta: [
      { title: "Product Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Product opportunities, lifecycle stages, scoring and sourcing candidates.",
      },
      { property: "og:title", content: "Product Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Product opportunities, lifecycle and scoring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(productsQuery);

  return (
    <div>
      <PageHeader title={t("products.title")} subtitle={t("products.subtitle")} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">{t("products.empty")}</p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {data!.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="block bg-card transition-colors hover:bg-surface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <div className="display text-xl">{p.name}</div>
                  <div className="label-xs mt-1">
                    {p.brands?.name ?? "—"} · {p.market ?? t("state.unknown")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="numeral text-sm text-muted-foreground">
                    {p.score === null ? t("state.unknown") : `${p.score}/100`}
                  </span>
                  <Badge tone="accent">{p.stage.replace("_", " ")}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Card className="mt-8 p-5 text-sm text-muted-foreground">{t("phase.note")}</Card>
    </div>
  );
}
