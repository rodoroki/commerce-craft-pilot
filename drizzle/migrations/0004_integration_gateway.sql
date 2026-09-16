ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS connection_state text NOT NULL DEFAULT 'NOT_CONFIGURED',
  ADD COLUMN IF NOT EXISTS auth_state text NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN IF NOT EXISTS api_state text NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN IF NOT EXISTS webhook_state text NOT NULL DEFAULT 'NOT_CONFIGURED',
  ADD COLUMN IF NOT EXISTS external_account_id text,
  ADD COLUMN IF NOT EXISTS granted_scopes text[],
  ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_success_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS last_error_at timestamptz;

ALTER TABLE public.integrations
  ADD CONSTRAINT integrations_connection_state_check CHECK (connection_state IN
    ('NOT_CONFIGURED','CONFIGURED','AUTHORIZING','CONNECTED','DEGRADED','ERROR','DISCONNECTED','REVOKED')),
  ADD CONSTRAINT integrations_auth_state_check CHECK (auth_state IN ('VALID','INVALID','EXPIRED','UNKNOWN')),
  ADD CONSTRAINT integrations_api_state_check CHECK (api_state IN ('HEALTHY','ERROR','UNKNOWN')),
  ADD CONSTRAINT integrations_webhook_state_check CHECK (webhook_state IN ('ACTIVE','PARTIAL','NOT_CONFIGURED','ERROR'));

CREATE TABLE IF NOT EXISTS public.integration_secrets (
  provider text PRIMARY KEY,
  access_token text,
  refresh_token text,
  token_type text,
  expires_at timestamptz,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.integration_secrets TO service_role;
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER integration_secrets_touch BEFORE UPDATE ON public.integration_secrets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.integration_oauth_states (
  state text PRIMARY KEY,
  provider text NOT NULL,
  redirect_uri text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.integration_oauth_states TO service_role;
ALTER TABLE public.integration_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  topic text NOT NULL,
  endpoint_path text NOT NULL,
  external_id text,
  status text NOT NULL DEFAULT 'NOT_CONFIGURED'
    CHECK (status IN ('NOT_CONFIGURED','PENDING','ACTIVE','ERROR','DISABLED')),
  last_received_at timestamptz,
  last_processed_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, topic)
);
GRANT SELECT ON public.webhook_subscriptions TO authenticated;
GRANT ALL ON public.webhook_subscriptions TO service_role;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read webhook subscriptions" ON public.webhook_subscriptions
  FOR SELECT TO authenticated USING (true);
CREATE TRIGGER webhook_subscriptions_touch BEFORE UPDATE ON public.webhook_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  raw_topic text,
  event_type text NOT NULL,
  external_id text,
  account_id text,
  idempotency_key text NOT NULL UNIQUE,
  payload_hash text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature_valid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED','PROCESSED','DUPLICATE','FAILED','IGNORED')),
  error text,
  correlation_id text,
  retry_count integer NOT NULL DEFAULT 0,
  occurred_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT SELECT ON public.integration_events TO authenticated;
GRANT ALL ON public.integration_events TO service_role;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read integration events" ON public.integration_events
  FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS integration_events_provider_idx
  ON public.integration_events (provider, received_at DESC);

CREATE TABLE IF NOT EXISTS public.integration_api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  latency_ms integer,
  error_type text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_api_logs TO authenticated;
GRANT ALL ON public.integration_api_logs TO service_role;
ALTER TABLE public.integration_api_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read integration api logs" ON public.integration_api_logs
  FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS integration_api_logs_provider_idx
  ON public.integration_api_logs (provider, created_at DESC);