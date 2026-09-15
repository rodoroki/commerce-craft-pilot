import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  concept: string | null;
  category: string | null;
  currency: string;
  price: number | null;
  images: string[];
  brand: {
    name: string;
    positioning: string | null;
    audience: string | null;
    market: string | null;
  } | null;
};

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const PRODUCT_COLUMNS =
  "id, name, slug, concept, category, currency, suggested_price, images, brands ( name, positioning, audience, market )";

function toImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

type Row = {
  id: string;
  name: string;
  slug: string;
  concept: string | null;
  category: string | null;
  currency: string;
  suggested_price: number | string | null;
  images: unknown;
  brands: {
    name: string;
    positioning: string | null;
    audience: string | null;
    market: string | null;
  } | null;
};

function shape(row: Row): StorefrontProduct {
  const price =
    row.suggested_price === null || row.suggested_price === undefined
      ? null
      : Number(row.suggested_price);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    concept: row.concept,
    category: row.category,
    currency: row.currency || "USD",
    price: price !== null && Number.isFinite(price) && price > 0 ? price : null,
    images: toImages(row.images),
    brand: row.brands,
  };
}

/** Public, read-only product read for the storefront. Never exposes internal columns. */
export const getStorefrontProduct = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<StorefrontProduct | null> => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error || !row) return null;
    return shape(row as unknown as Row);
  });

export const listStorefrontProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<StorefrontProduct[]> => {
    const { data, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as unknown as Row[]).map(shape);
  },
);
