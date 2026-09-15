import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Brand = Tables<"brands">;
export type Product = Tables<"products">;
export type Supplier = Tables<"suppliers">;
export type ProductSource = Tables<"product_sources">;
export type StageHistory = Tables<"product_stage_history">;
export type Integration = Tables<"integrations">;

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
      return { product, sources, history };
    },
  });
