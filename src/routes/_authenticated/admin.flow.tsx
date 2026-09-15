import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card, DataFlag, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import {
  allMetricsQuery,
  brandsQuery,
  creativesQuery,
  experimentsQuery,
  funnelEventsQuery,
  integrationsQuery,
  knowledgeQuery,
  landingPagesQuery,
  productsQuery,
  suppliersQuery,
} from "@/lib/queries";
import { totals } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/admin/flow")({
  head: () => ({
    meta: [
      { title: "Operating Flow — Commerce Intelligence Engine" },
      {
        name: "description",
        content:
          "The full validation loop: discovery, sourcing, evaluation, brand, offer, creative, distribution, data, learning and decision.",
      },
      { property: "og:title", content: "Operating Flow — Commerce Intelligence Engine" },
      {
        property: "og:description",
        content: "The full validation loop from discovery to global scale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlowMap,
});

type NodeState = { value: string; tone: "neutral" | "accent" | "success"; flag?: "NO_DATA" | "NOT_CONFIGURED" };

function Node({
  title,
  note,
  state,
  to,
}: {
  title: string;
  note: string;
  state: NodeState;
  to?: string;
}) {
  const body = (
    <Card className="h-full p-4 transition-colors hover:bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="label-xs">{title}</div>
        {state.flag ? <DataFlag kind={state.flag} /> : <Badge tone={state.tone}>{state.value}</Badge>}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </Card>
  );
  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

function Rail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <SectionTitle>{label}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function FlowMap() {
  const { t } = useI18n();
  const products = useQuery(productsQuery);
  const brands = useQuery(brandsQuery);
  const suppliers = useQuery(suppliersQuery);
  const creatives = useQuery(creativesQuery);
  const landings = useQuery(landingPagesQuery);
  const experiments = useQuery(experimentsQuery);
  const metrics = useQuery(allMetricsQuery);
  const events = useQuery(funnelEventsQuery);
  const knowledge = useQuery(knowledgeQuery);
  const integrations = useQuery(integrationsQuery);

  const ints = integrations.data ?? [];
  const connected = (key: string) => ints.some((i) => i.key === key && i.status === "CONNECTED");
  const anyAdsConnected = ["meta", "tiktok", "google_ads"].some(connected);

  const count = (n: number): NodeState =>
    n > 0 ? { value: String(n), tone: "accent" } : { value: "", tone: "neutral", flag: "NO_DATA" };

  const configured = (ok: boolean): NodeState =>
    ok
      ? { value: "CONNECTED", tone: "success" }
      : { value: "", tone: "neutral", flag: "NOT_CONFIGURED" };

  const prods = products.data ?? [];
  const tot = totals(metrics.data ?? []);
  const scaled = prods.filter((p) => p.stage === "SCALE").length;
  const killed = prods.filter((p) => p.stage === "KILLED").length;
  const validated = prods.filter((p) => p.stage === "VALIDATED").length;
  const sourcedProducts = prods.filter((p) => p.product_cost !== null).length;
  const evaluated = prods.filter((p) => p.score !== null).length;

  return (
    <div className="space-y-12">
      <PageHeader title={t("flow.title")} subtitle={t("flow.subtitle")} />

      <Rail label={t("flow.discovery")}>
        <Node
          title="Market signals"
          note="Marketplace and demand signals. Requires a connected data source — nothing is assumed."
          state={configured(connected("nocnoc"))}
        />
        <Node
          title="Product signals"
          note="Product ideas registered in the Product Lab."
          state={count(prods.length)}
          to="/admin/products"
        />
        <Node
          title="Opportunity AI"
          note="AI reading of signals. Every output is labelled AI GENERATED and never counted as evidence."
          state={configured(false)}
          to="/ai"
        />
      </Rail>

      <Rail label={t("flow.sourceEvaluate")}>
        <Node
          title="Source"
          note="Supplier candidates per product, compared on landed cost, delivery and branding."
          state={count(suppliers.data?.length ?? 0)}
          to="/admin/suppliers"
        />
        <Node
          title="Landed cost"
          note="Products with a confirmed cost base. Without it no margin or ranking is shown."
          state={count(sourcedProducts)}
          to="/admin/products"
        />
        <Node
          title="Evaluate"
          note="Products scored on the 12 criteria."
          state={count(evaluated)}
          to="/admin/products"
        />
      </Rail>

      <Rail label={t("flow.buildOffer")}>
        <Node title="Brand" note="Brand positioning, territory, voice and audience." state={count(brands.data?.length ?? 0)} to="/brands" />
        <Node title="Offer & landing" note="Landing pages assembled from conversion blocks." state={count(landings.data?.length ?? 0)} to="/landing" />
        <Node title="Creative" note="Concepts, hooks and scripts. Performance only appears with real data." state={count(creatives.data?.length ?? 0)} to="/creatives" />
      </Rail>

      <Rail label={t("flow.distribution")}>
        <Node title="Meta" note="Acquisition channel. Read-only intelligence layer, never an ad platform." state={configured(connected("meta"))} to="/integrations" />
        <Node title="TikTok" note="Acquisition channel." state={configured(connected("tiktok"))} to="/integrations" />
        <Node title="Google" note="Acquisition channel." state={configured(connected("google_ads"))} to="/integrations" />
        <Node title="Store" note="Nuvemshop owns checkout, orders and stock. We only read." state={configured(connected("nuvemshop"))} to="/integrations" />
        <Node title="Fulfilment" note="Dropi handles sourcing and fulfilment automation." state={configured(connected("dropi"))} to="/integrations" />
        <Node title="Automation" note="n8n webhooks for order, product and funnel events." state={configured(connected("n8n"))} to="/integrations" />
      </Rail>

      <Rail label={t("flow.measure")}>
        <Node
          title="Traffic & conversion"
          note="Funnel events received from the tracking endpoint."
          state={count(events.data?.length ?? 0)}
          to="/analytics"
        />
        <Node
          title="Data"
          note={
            anyAdsConnected
              ? "Daily campaign and store figures."
              : "No acquisition source connected — figures come only from manual entries."
          }
          state={count(tot.purchases ?? 0)}
          to="/analytics"
        />
        <Node title="Experiments" note="Hypothesis, budget, results and a recorded decision." state={count(experiments.data?.length ?? 0)} to="/admin/experiments" />
      </Rail>

      <Rail label={t("flow.learnDecide")}>
        <Node title="Learning AI" note="Consolidates a lesson only with enough repeated observations." state={count(knowledge.data?.length ?? 0)} to="/knowledge" />
        <Node title="Decision AI" note="Recommends continue, scale, rework, change or kill — always with the reasons behind it." state={count(experiments.data?.filter((e) => e.decision).length ?? 0)} to="/admin/experiments" />
        <Node title="Kill" note="Products retired after a decision." state={count(killed)} to="/admin/products" />
        <Node title="Validated" note="Products with proven demand and economics." state={count(validated)} to="/admin/products" />
        <Node title="Scale" note="Products in active scaling." state={count(scaled)} to="/admin/products" />
        <Node title="Private label · 3PL · Global" note="Prepared next stage. Opens once a product is scaling with confirmed economics." state={configured(false)} />
      </Rail>
    </div>
  );
}
