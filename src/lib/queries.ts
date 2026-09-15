import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Brand = Tables<"brands">;
export type Product = Tables<"products">;
export type Supplier = Tables<"suppliers">;
export type ProductSource = Tables<"product_sources">;
export type StageHistory = Tables<"product_stage_history">;
export type Integration = Tables<"integrations">;
export type Creative = Tables<"creatives">;
export type Hook = Tables<"hooks">;
export type LandingPage = Tables<"landing_pages">;
export type Experiment = Tables<"experiments">;
export type ExperimentMetric = Tables<"experiment_metrics">;
export type FunnelEvent = Tables<"funnel_events">;
export type KnowledgeEntry = Tables<"knowledge_entries">;
export type AiRun = Tables<"ai_runs">;
export type WebhookEndpoint = Tables<"webhook_endpoints">;

export const PRODUCT_STAGES = [
  "IDEA",
  "SOURCING",
  "SAMPLE",
  "CREATIVE_TEST",
  "LANDING_TEST",
  "PAID_TEST",
  "VALIDATED",
  "SCALE",
  "KILLED",
] as const;
export type ProductStage = (typeof PRODUCT_STAGES)[number];

export const SCORE_CRITERIA = [
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
] as const;

export const CREATIVE_CONCEPTS = [
  "UGC",
  "DEMO",
  "BEFORE_AFTER",
  "PROBLEM_SOLUTION",
  "HUMOR",
  "LIFESTYLE",
  "ASMR",
  "TESTIMONIAL",
  "COMPARISON",
  "FOUNDER",
  "EDUCATIONAL",
] as const;

export const CREATIVE_STATUSES = [
  "IDEA",
  "SCRIPTED",
  "PRODUCTION",
  "LIVE",
  "PAUSED",
  "ARCHIVED",
] as const;

export const EXPERIMENT_STATUSES = ["DRAFT", "RUNNING", "PAUSED", "COMPLETED"] as const;
export const LANDING_STATUSES = ["DRAFT", "LIVE", "ARCHIVED"] as const;
export const KNOWLEDGE_STATUSES = [
  "HYPOTHESIS",
  "SUPPORTED",
  "CONSOLIDATED",
  "REJECTED",
] as const;

export const LANDING_BLOCK_TYPES = [
  "HERO",
  "PROBLEM",
  "BEFORE_AFTER",
  "HOW_IT_WORKS",
  "PRODUCT",
  "BENEFITS",
  "DEMONSTRATION",
  "SOCIAL_PROOF",
  "FAQ",
  "GUARANTEE",
  "SHIPPING",
  "CTA",
  "UPSELL",
  "CROSS_SELL",
] as const;
export type LandingBlockType = (typeof LANDING_BLOCK_TYPES)[number];
export type LandingBlock = { type: LandingBlockType; headline?: string; body?: string };

const unwrap = <T>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

export const brandsQuery = queryOptions({
  queryKey: ["brands"],
  queryFn: async () => unwrap(await supabase.from("brands").select("*").order("name")),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("products")
        .select("*, brands(name, slug)")
        .order("created_at", { ascending: false }),
    ) as (Product & { brands: { name: string; slug: string } | null })[],
});

export const suppliersQuery = queryOptions({
  queryKey: ["suppliers"],
  queryFn: async () => unwrap(await supabase.from("suppliers").select("*").order("name")),
});

export const integrationsQuery = queryOptions({
  queryKey: ["integrations"],
  queryFn: async () => unwrap(await supabase.from("integrations").select("*").order("category")),
});

export const webhooksQuery = queryOptions({
  queryKey: ["webhooks"],
  queryFn: async () =>
    unwrap(await supabase.from("webhook_endpoints").select("*").order("event_key")),
});

export const creativesQuery = queryOptions({
  queryKey: ["creatives"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("creatives")
        .select("*, products(name, slug), brands(name)")
        .order("created_at", { ascending: false }),
    ) as (Creative & {
      products: { name: string; slug: string } | null;
      brands: { name: string } | null;
    })[],
});

export const hooksQuery = queryOptions({
  queryKey: ["hooks"],
  queryFn: async () =>
    unwrap(await supabase.from("hooks").select("*").order("created_at", { ascending: false })),
});

export const landingPagesQuery = queryOptions({
  queryKey: ["landing_pages"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("landing_pages")
        .select("*, products(name), brands(name)")
        .order("created_at", { ascending: false }),
    ) as (LandingPage & {
      products: { name: string } | null;
      brands: { name: string } | null;
    })[],
});

export const experimentsQuery = queryOptions({
  queryKey: ["experiments"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("experiments")
        .select("*, products(name, slug), brands(name)")
        .order("created_at", { ascending: false }),
    ) as (Experiment & {
      products: { name: string; slug: string } | null;
      brands: { name: string } | null;
    })[],
});

export const experimentDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["experiment", id],
    queryFn: async () => {
      const experiment = unwrap(
        await supabase
          .from("experiments")
          .select("*, products(*), brands(name), creatives(code, concept, hook), landing_pages(title, slug)")
          .eq("id", id)
          .maybeSingle(),
      ) as
        | (Experiment & {
            products: Product | null;
            brands: { name: string } | null;
            creatives: { code: string | null; concept: string | null; hook: string | null } | null;
            landing_pages: { title: string; slug: string } | null;
          })
        | null;
      if (!experiment) return null;
      const metrics = unwrap(
        await supabase
          .from("experiment_metrics")
          .select("*")
          .eq("experiment_id", id)
          .order("metric_date", { ascending: true }),
      ) as ExperimentMetric[];
      return { experiment, metrics };
    },
  });

export const allMetricsQuery = queryOptions({
  queryKey: ["experiment_metrics"],
  queryFn: async () =>
    unwrap(
      await supabase.from("experiment_metrics").select("*").order("metric_date"),
    ) as ExperimentMetric[],
});

export const funnelEventsQuery = queryOptions({
  queryKey: ["funnel_events"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("funnel_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(500),
    ) as FunnelEvent[],
});

export const knowledgeQuery = queryOptions({
  queryKey: ["knowledge"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("knowledge_entries")
        .select("*")
        .order("created_at", { ascending: false }),
    ),
});

export const aiRunsQuery = queryOptions({
  queryKey: ["ai_runs"],
  queryFn: async () =>
    unwrap(
      await supabase.from("ai_runs").select("*").order("created_at", { ascending: false }).limit(50),
    ),
});

export const productDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const product = unwrap(
        await supabase.from("products").select("*, brands(*)").eq("slug", slug).maybeSingle(),
      ) as (Product & { brands: Brand | null }) | null;
      if (!product) return null;
      const sources = unwrap(
        await supabase
          .from("product_sources")
          .select("*, suppliers(*)")
          .eq("product_id", product.id),
      ) as (ProductSource & { suppliers: Supplier | null })[];
      const history = unwrap(
        await supabase
          .from("product_stage_history")
          .select("*")
          .eq("product_id", product.id)
          .order("created_at", { ascending: false }),
      ) as StageHistory[];
      const creatives = unwrap(
        await supabase.from("creatives").select("*").eq("product_id", product.id),
      ) as Creative[];
      const hooks = unwrap(
        await supabase.from("hooks").select("*").eq("product_id", product.id),
      ) as Hook[];
      const landings = unwrap(
        await supabase.from("landing_pages").select("*").eq("product_id", product.id),
      ) as LandingPage[];
      const experiments = unwrap(
        await supabase.from("experiments").select("*").eq("product_id", product.id),
      ) as Experiment[];
      return { product, sources, history, creatives, hooks, landings, experiments };
    },
  });

type TableName =
  | "brands"
  | "products"
  | "suppliers"
  | "product_sources"
  | "creatives"
  | "hooks"
  | "landing_pages"
  | "experiments"
  | "experiment_metrics"
  | "knowledge_entries"
  | "webhook_endpoints"
  | "integrations";

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as unknown as {
  from: (t: string) => any;
};

/** Generic insert/update helper. Invalidates every query so derived views stay honest. */
export function useSaveRecord(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (id) {
        const { error } = await db.from(table).update(values).eq("id", id);
        if (error) throw new Error(error.message);
        return id;
      }
      const { data, error } = await db.from(table).insert(values).select("id").single();
      if (error) throw new Error(error.message);
      return data.id as string;
    },

    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteRecord(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
