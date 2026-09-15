-- Enums
CREATE TYPE public.experiment_status AS ENUM ('DRAFT','RUNNING','PAUSED','COMPLETED');
CREATE TYPE public.creative_status AS ENUM ('IDEA','SCRIPTED','PRODUCTION','LIVE','PAUSED','ARCHIVED');
CREATE TYPE public.landing_status AS ENUM ('DRAFT','LIVE','ARCHIVED');
CREATE TYPE public.funnel_event_type AS ENUM ('PAGE_VIEW','VIEW_CONTENT','ADD_TO_CART','BEGIN_CHECKOUT','PURCHASE','REFUND','LEAD','EMAIL_SIGNUP','COUPON','UPSELL');
CREATE TYPE public.knowledge_status AS ENUM ('HYPOTHESIS','SUPPORTED','CONSOLIDATED','REJECTED');

-- Hooks (hypotheses library)
CREATE TABLE public.hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  text text NOT NULL,
  angle text,
  is_hypothesis boolean NOT NULL DEFAULT true,
  ai_generated boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hooks TO authenticated;
GRANT ALL ON public.hooks TO service_role;
ALTER TABLE public.hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all hooks" ON public.hooks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_hooks BEFORE UPDATE ON public.hooks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Creatives
CREATE TABLE public.creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  concept text,
  hook text,
  script text,
  format text,
  platform text,
  audience text,
  status public.creative_status NOT NULL DEFAULT 'IDEA',
  url text,
  thumbnail_url text,
  video_url text,
  ai_generated boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creatives TO authenticated;
GRANT ALL ON public.creatives TO service_role;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all creatives" ON public.creatives FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_creatives BEFORE UPDATE ON public.creatives FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Landing pages
CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  offer text,
  status public.landing_status NOT NULL DEFAULT 'DRAFT',
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_pages TO authenticated;
GRANT SELECT ON public.landing_pages TO anon;
GRANT ALL ON public.landing_pages TO service_role;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all landing" ON public.landing_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public read live landing" ON public.landing_pages FOR SELECT TO anon USING (status = 'LIVE');
CREATE TRIGGER touch_landing BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Experiments
CREATE TABLE public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  creative_id uuid REFERENCES public.creatives(id) ON DELETE SET NULL,
  landing_page_id uuid REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  hypothesis text,
  audience text,
  offer text,
  traffic_source text,
  budget numeric(12,2),
  start_date date,
  end_date date,
  status public.experiment_status NOT NULL DEFAULT 'DRAFT',
  result text,
  decision text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiments TO authenticated;
GRANT ALL ON public.experiments TO service_role;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all experiments" ON public.experiments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_experiments BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Experiment metrics (manually recorded or imported; never simulated)
CREATE TABLE public.experiment_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  source text,
  impressions integer,
  clicks integer,
  spend numeric(12,2),
  page_views integer,
  view_content integer,
  add_to_cart integer,
  begin_checkout integer,
  purchases integer,
  revenue numeric(12,2),
  refunds numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experiment_id, metric_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiment_metrics TO authenticated;
GRANT ALL ON public.experiment_metrics TO service_role;
ALTER TABLE public.experiment_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all metrics" ON public.experiment_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Funnel events (from the tracking endpoint / automations)
CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type public.funnel_event_type NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  landing_page_id uuid REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE SET NULL,
  value numeric(12,2),
  currency text DEFAULT 'USD',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  external_id text,
  payload jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX funnel_events_occurred_idx ON public.funnel_events (occurred_at DESC);
GRANT SELECT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read events" ON public.funnel_events FOR SELECT TO authenticated USING (true);

-- Knowledge base
CREATE TABLE public.knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  insight text NOT NULL,
  evidence text,
  observations_count integer NOT NULL DEFAULT 1,
  status public.knowledge_status NOT NULL DEFAULT 'HYPOTHESIS',
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entries TO authenticated;
GRANT ALL ON public.knowledge_entries TO service_role;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all knowledge" ON public.knowledge_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_knowledge BEFORE UPDATE ON public.knowledge_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AI runs (provider-agnostic log)
CREATE TABLE public.ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text NOT NULL,
  task text NOT NULL,
  prompt text,
  input jsonb,
  output text,
  confidence text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_runs TO authenticated;
GRANT ALL ON public.ai_runs TO service_role;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read ai" ON public.ai_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert ai" ON public.ai_runs FOR INSERT TO authenticated WITH CHECK (true);

-- Webhook endpoints (n8n and automation targets)
CREATE TABLE public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  url text,
  is_active boolean NOT NULL DEFAULT false,
  last_delivery_at timestamptz,
  last_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all webhooks" ON public.webhook_endpoints FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_webhooks BEFORE UPDATE ON public.webhook_endpoints FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.webhook_endpoints (event_key) VALUES
  ('ORDER_CREATED'),('ORDER_PAID'),('ORDER_FULFILLED'),('ORDER_SHIPPED'),('ORDER_DELIVERED'),
  ('ORDER_CANCELLED'),('ORDER_REFUNDED'),('PRODUCT_CREATED'),('PRODUCT_UPDATED'),('STOCK_UPDATED'),
  ('PURCHASE'),('LEAD'),('EMAIL_SIGNUP');
