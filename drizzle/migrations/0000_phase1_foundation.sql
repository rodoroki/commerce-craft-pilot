-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','operator','viewer');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ENUMS
CREATE TYPE public.product_stage AS ENUM ('IDEA','SOURCING','SAMPLE','CREATIVE_TEST','LANDING_TEST','PAID_TEST','VALIDATED','SCALE','KILLED');
CREATE TYPE public.integration_status AS ENUM ('CONNECTED','NOT_CONFIGURED','ERROR');

-- BRANDS
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  positioning text,
  territory text,
  audience text,
  voice text,
  market text,
  country text,
  language text,
  currency text,
  domain text,
  logo_url text,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  typography jsonb NOT NULL DEFAULT '{}'::jsonb,
  social jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands authenticated all" ON public.brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER brands_touch BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  marketplace text,
  source text,
  contact text,
  url text,
  warehouse_location text,
  shipping_method text,
  delivery_estimate_days_min int,
  delivery_estimate_days_max int,
  tracking_available boolean,
  returns_policy text,
  packaging text,
  private_label boolean,
  customization boolean,
  response_time_hours int,
  reliability_notes text,
  supplier_score int CHECK (supplier_score BETWEEN 0 AND 100),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers authenticated all" ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER suppliers_touch BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  internal_name text,
  slug text NOT NULL UNIQUE,
  concept text,
  category text,
  subcategory text,
  market text,
  country text,
  currency text NOT NULL DEFAULT 'USD',
  stage public.product_stage NOT NULL DEFAULT 'IDEA',
  suggested_price numeric(12,2),
  product_cost numeric(12,2),
  shipping_cost numeric(12,2),
  fulfillment_cost numeric(12,2),
  payment_fee_pct numeric(6,3),
  platform_fee_pct numeric(6,3),
  refund_allowance_pct numeric(6,3),
  estimated_cac numeric(12,2),
  score int CHECK (score BETWEEN 0 AND 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products authenticated all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRODUCT SOURCES (Source War candidates)
CREATE TABLE public.product_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_sku text,
  supplier_url text,
  product_cost numeric(12,2),
  shipping_cost numeric(12,2),
  fees numeric(12,2),
  moq int,
  stock int,
  stock_location text,
  delivery_estimate_days_min int,
  delivery_estimate_days_max int,
  shipping_method text,
  tracking_available boolean,
  returns_policy text,
  private_label boolean,
  custom_packaging boolean,
  data_confirmed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, supplier_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sources TO authenticated;
GRANT ALL ON public.product_sources TO service_role;
ALTER TABLE public.product_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_sources authenticated all" ON public.product_sources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER product_sources_touch BEFORE UPDATE ON public.product_sources FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- STAGE HISTORY
CREATE TABLE public.product_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  from_stage public.product_stage,
  to_stage public.product_stage NOT NULL,
  reason text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.product_stage_history TO authenticated;
GRANT ALL ON public.product_stage_history TO service_role;
ALTER TABLE public.product_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage history read" ON public.product_stage_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "stage history insert" ON public.product_stage_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_product_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.product_stage_history (product_id, from_stage, to_stage, changed_by)
    VALUES (NEW.id, NULL, NEW.stage, auth.uid());
  ELSIF NEW.stage IS DISTINCT FROM OLD.stage THEN
    INSERT INTO public.product_stage_history (product_id, from_stage, to_stage, changed_by)
    VALUES (NEW.id, OLD.stage, NEW.stage, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER products_stage_log AFTER INSERT OR UPDATE OF stage ON public.products
FOR EACH ROW EXECUTE FUNCTION public.log_product_stage_change();

-- INTEGRATIONS
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL,
  status public.integration_status NOT NULL DEFAULT 'NOT_CONFIGURED',
  last_checked_at timestamptz,
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations authenticated all" ON public.integrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER integrations_touch BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED: real/conceptual records only, no fake metrics
INSERT INTO public.brands (name, slug, positioning, territory, audience, market, country, language, currency)
VALUES (
  'DOG CAR LIFE',
  'dog-car-life',
  'Dog owners who want to travel and live with their dogs without turning their car into a mess.',
  'DOG + CAR + FREEDOM + CLEANLINESS',
  'US dog owners who drive with their dogs',
  'United States', 'US', 'en-US', 'USD'
);

INSERT INTO public.products (brand_id, name, internal_name, slug, concept, category, subcategory, market, country, currency, stage)
SELECT b.id, 'FUR RESCUE KIT', 'FRK-01', 'fur-rescue-kit',
  'A compact system for removing dog hair from cars, carpets, upholstery and other surfaces. Components: 01 Scraper, 02 Detail Brush, 03 Collector/Roller, 04 Carry Pouch.',
  'Pet', 'Car cleaning', 'United States', 'US', 'USD', 'SOURCING'
FROM public.brands b WHERE b.slug = 'dog-car-life';

INSERT INTO public.suppliers (name, country, marketplace, source) VALUES
  ('NocNoc EUA', 'US', 'NocNoc', 'MARKETPLACE'),
  ('CJ Dropshipping', 'CN', 'CJ', 'DROPSHIPPING'),
  ('Direct Supplier', NULL, NULL, 'DIRECT'),
  ('3PL Partner', NULL, NULL, '3PL');

INSERT INTO public.product_sources (product_id, supplier_id)
SELECT p.id, s.id FROM public.products p CROSS JOIN public.suppliers s WHERE p.slug = 'fur-rescue-kit';

INSERT INTO public.integrations (key, label, category) VALUES
  ('nuvemshop','Nuvemshop','COMMERCE'),
  ('dropi','Dropi','SOURCING'),
  ('nocnoc','NocNoc','SOURCING'),
  ('n8n','n8n','AUTOMATION'),
  ('meta','Meta Ads','ACQUISITION'),
  ('tiktok','TikTok Ads','ACQUISITION'),
  ('google_ads','Google Ads','ACQUISITION'),
  ('ga4','Google Analytics 4','ANALYTICS');