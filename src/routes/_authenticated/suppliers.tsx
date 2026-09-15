import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Card, DataFlag } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { suppliersQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Supplier registry: terms, delivery, packaging, reliability and scoring.",
      },
      { property: "og:title", content: "Supplier Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Supplier registry, terms and reliability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(suppliersQuery);

  return (
    <div>
      <PageHeader title={t("suppliers.title")} subtitle={t("suppliers.subtitle")} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-xl">{s.name}</div>
                  <div className="label-xs mt-1">
                    {s.source ?? "—"} · {s.country ?? t("state.unknown")}
                  </div>
                </div>
                <div className="numeral text-sm text-muted-foreground">
                  {s.supplier_score === null ? t("state.unknown") : `${s.supplier_score}/100`}
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {(
                  [
                    ["Warehouse", s.warehouse_location],
                    ["Shipping", s.shipping_method],
                    [
                      "Private label",
                      s.private_label === null ? null : s.private_label ? "Yes" : "No",
                    ],
                    ["Returns", s.returns_policy],
                  ] as [string, string | null][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="label-xs">{label}</dt>
                    <dd className="mt-1">{value ?? <DataFlag kind="UNKNOWN" />}</dd>
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
