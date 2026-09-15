import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { productDetailQuery, type ProductSource, type Supplier } from "@/lib/queries";
import { computeEconomics, formatMoney } from "@/lib/economics";

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

const SCORE_CRITERIA = [
  "demand",
  "problem_severity",
  "visual_demonstration",
  "margin",
  "shipping",
  "competition",
  "differentiation",
  "content_potential",
  "upsell_potential",
  "private_label_potential",
  "return_risk",
  "regulatory_risk",
];

const CREATIVE_HYPOTHESES = [
  "Dog owners know this problem.",
  "Your dog isn't the problem. The fur is.",
  "Before you pay for another car detail...",
  "Watch what happens to this car seat.",
];

function landedCost(s: ProductSource): number | null {
  const parts = [s.product_cost, s.shipping_cost, s.fees];
  if (parts.some((p) => p === null)) return null;
  return parts.reduce<number>((a, p) => a + Number(p), 0);
}

function decision(args: {
  stage: string;
  sourcesWithCost: number;
  totalSources: number;
  economicsComplete: boolean;
}) {
  const reasons: string[] = [];
  if (args.sourcesWithCost === 0) {
    reasons.push(`No supplier has confirmed cost data (${args.totalSources} candidates registered).`);
  }
  if (!args.economicsComplete) {
    reasons.push("Unit economics cannot be computed — price and/or cost inputs are missing.");
  }
  if (reasons.length > 0) {
    return { verdict: "COMPLETE SOURCING DATA", reasons };
  }
  return {
    verdict: "CONTINUE TESTING",
    reasons: ["Economics are computable. No experiment data exists yet (Phase 4)."],
  };
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { t, locale } = useI18n();
  const { data, isLoading } = useQuery(productDetailQuery(slug));

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Product not found.</p>;

  const { product, sources, history } = data;
  const currency = product.currency ?? "USD";
  const econ = computeEconomics({
    suggested_price: product.suggested_price === null ? null : Number(product.suggested_price),
    product_cost: product.product_cost === null ? null : Number(product.product_cost),
    shipping_cost: product.shipping_cost === null ? null : Number(product.shipping_cost),
    fulfillment_cost: product.fulfillment_cost === null ? null : Number(product.fulfillment_cost),
    payment_fee_pct: product.payment_fee_pct === null ? null : Number(product.payment_fee_pct),
    platform_fee_pct: product.platform_fee_pct === null ? null : Number(product.platform_fee_pct),
    refund_allowance_pct:
      product.refund_allowance_pct === null ? null : Number(product.refund_allowance_pct),
    estimated_cac: product.estimated_cac === null ? null : Number(product.estimated_cac),
  });

  const sourcesWithCost = sources.filter((s) => landedCost(s) !== null);
  const best = sourcesWithCost
    .slice()
    .sort((a, b) => (landedCost(a) as number) - (landedCost(b) as number))[0];

  const d = decision({
    stage: product.stage,
    sourcesWithCost: sourcesWithCost.length,
    totalSources: sources.length,
    economicsComplete: econ.complete,
  });

  const breakdown = (product.score_breakdown ?? {}) as Record<string, number | undefined>;

  return (
    <div className="space-y-14">
      <PageHeader
        title={product.name}
        subtitle={product.concept ?? undefined}
        action={<Badge tone="accent">{product.stage.replace("_", " ")}</Badge>}
      />
      <div className="label-xs -mt-10">
        <Link to="/products" className="hover:text-foreground">
          ← {t("products.title")}
        </Link>
        {product.brands ? ` · ${product.brands.name}™` : ""}
      </div>

      <section className="space-y-4">
        <SectionTitle
          aside={
            product.score === null ? (
              <DataFlag kind="UNKNOWN" />
            ) : (
              <span className="numeral">{product.score}/100</span>
            )
          }
        >
          {t("product.score")}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {SCORE_CRITERIA.map((c) => (
            <div key={c} className="bg-card p-4">
              <div className="label-xs">{c.replace(/_/g, " ")}</div>
              <div className="numeral mt-1 text-sm">
                {breakdown[c] === undefined ? t("state.unknown") : breakdown[c]}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          The score is only calculated once every criterion has a recorded value. Nothing is
          estimated automatically.
        </p>
      </section>

      <section className="space-y-4">
        <SectionTitle aside={currency}>{t("product.economics")}</SectionTitle>
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
        <SectionTitle aside={`${sources.length} candidates`}>{t("product.sources")}</SectionTitle>
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
          Rankings appear only for suppliers with confirmed figures. No supplier is auto-selected
          without data.
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

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <SectionTitle aside={<DataFlag kind="UNKNOWN">HYPOTHESIS</DataFlag>}>
            {t("product.creative")}
          </SectionTitle>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CREATIVE_HYPOTHESES.map((h) => (
              <li key={h}>“{h}”</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Hypotheses only. No performance has been measured.
          </p>
        </div>
        <div className="space-y-4">
          <SectionTitle>{t("product.experiments")}</SectionTitle>
          <p className="text-sm text-muted-foreground">
            {t("state.noData")} — the Experiment Engine ships in Phase 4.
          </p>
          <SectionTitle>{t("product.landing")}</SectionTitle>
          <p className="text-sm text-muted-foreground">
            {t("state.noData")} — the landing builder ships in Phase 3.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>{t("product.history")}</SectionTitle>
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span>
                {h.from_stage ? `${h.from_stage.replace("_", " ")} → ` : ""}
                {h.to_stage.replace("_", " ")}
              </span>
              <span className="numeral text-xs text-muted-foreground">
                {new Date(h.created_at).toLocaleString(locale)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
