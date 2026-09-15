CREATE TYPE public.evidence_status AS ENUM ('VERIFIED','OBSERVED','DECLARED_BY_SUPPLIER','HYPOTHESIS','ESTIMATE','AI_GENERATED','UNKNOWN','INSUFFICIENT_DATA');
CREATE TYPE public.confidence_level AS ENUM ('VERIFIED','HIGH','MEDIUM','LOW','UNVERIFIED');
CREATE TYPE public.intelligence_decision AS ENUM ('CONTINUE_TESTING','SCALE','REWORK_OFFER','CHANGE_CREATIVE','CHANGE_AUDIENCE','CHANGE_LANDING','CHANGE_SUPPLIER','VERIFY_DATA','WAIT_FOR_MORE_DATA','KILL');

CREATE TABLE public.evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE,
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE,
  knowledge_entry_id uuid REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  claim text NOT NULL,
  source text NOT NULL,
  source_url text,
  status public.evidence_status NOT NULL DEFAULT 'UNKNOWN',
  observed_at timestamptz,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (product_id IS NOT NULL OR supplier_id IS NOT NULL OR experiment_id IS NOT NULL OR knowledge_entry_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_items TO authenticated;
GRANT ALL ON public.evidence_items TO service_role;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all evidence" ON public.evidence_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX evidence_product_idx ON public.evidence_items (product_id, created_at DESC);
CREATE INDEX evidence_experiment_idx ON public.evidence_items (experiment_id, created_at DESC);
CREATE INDEX evidence_knowledge_idx ON public.evidence_items (knowledge_entry_id, created_at DESC);

CREATE TABLE public.intelligence_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE SET NULL,
  decision public.intelligence_decision NOT NULL,
  why text[] NOT NULL DEFAULT '{}',
  evidence_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  unknowns text[] NOT NULL DEFAULT '{}',
  risk text,
  next_action text NOT NULL,
  confidence public.confidence_level NOT NULL DEFAULT 'UNVERIFIED',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (product_id IS NOT NULL OR experiment_id IS NOT NULL)
);
GRANT SELECT, INSERT ON public.intelligence_decisions TO authenticated;
GRANT ALL ON public.intelligence_decisions TO service_role;
ALTER TABLE public.intelligence_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read decisions" ON public.intelligence_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert decisions" ON public.intelligence_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX decisions_product_idx ON public.intelligence_decisions (product_id, created_at DESC);
CREATE INDEX decisions_experiment_idx ON public.intelligence_decisions (experiment_id, created_at DESC);

CREATE TABLE public.knowledge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  from_status public.knowledge_status,
  to_status public.knowledge_status NOT NULL,
  observations_count integer NOT NULL DEFAULT 0,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.knowledge_history TO authenticated;
GRANT ALL ON public.knowledge_history TO service_role;
ALTER TABLE public.knowledge_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read knowledge history" ON public.knowledge_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert knowledge history" ON public.knowledge_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX knowledge_history_entry_idx ON public.knowledge_history (knowledge_entry_id, created_at DESC);

ALTER TABLE public.knowledge_entries ADD COLUMN observation text;
ALTER TABLE public.knowledge_entries ADD COLUMN signal text;
ALTER TABLE public.knowledge_entries ADD COLUMN test_result text;
ALTER TABLE public.knowledge_entries ADD COLUMN next_action text;
ALTER TABLE public.knowledge_entries ADD COLUMN confidence public.confidence_level NOT NULL DEFAULT 'UNVERIFIED';

CREATE OR REPLACE FUNCTION public.log_knowledge_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.knowledge_history (knowledge_entry_id, from_status, to_status, observations_count, changed_by)
    VALUES (NEW.id, NULL, NEW.status, NEW.observations_count, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status OR NEW.observations_count IS DISTINCT FROM OLD.observations_count THEN
    INSERT INTO public.knowledge_history (knowledge_entry_id, from_status, to_status, observations_count, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.observations_count, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER knowledge_status_log AFTER INSERT OR UPDATE OF status, observations_count ON public.knowledge_entries FOR EACH ROW EXECUTE FUNCTION public.log_knowledge_status_change();