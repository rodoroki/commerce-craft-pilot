-- Narrow, column-limited public read access for the buyer-facing storefront.
-- Internal intelligence columns (costs, score, fees, notes) are NOT granted.

GRANT SELECT (id, brand_id, name, slug, concept, category, subcategory, market, country, currency, suggested_price, stage, images, updated_at)
  ON public.products TO anon;

GRANT SELECT (id, name, slug, positioning, territory, audience, voice, market, country, language, currency, domain, logo_url, colors, typography, social, is_active)
  ON public.brands TO anon;

CREATE POLICY "Storefront can read products"
  ON public.products FOR SELECT TO anon USING (true);

CREATE POLICY "Storefront can read active brands"
  ON public.brands FOR SELECT TO anon USING (is_active);
