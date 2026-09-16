/**
 * Shared server-side plumbing for every connector:
 * observability, sanitization, idempotency helpers and rate-limit aware fetch.
 * Never logs or returns credentials.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { ApiState, AuthState, ConnectionState, ProviderId, WebhookState } from "./registry";

const SECRET_KEY = /(token|secret|password|authorization|api[_-]?key|credential|cookie)/i;

export const newCorrelationId = () => crypto.randomUUID();

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Redacts anything that looks like a credential, at any depth. */
export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 200).map((v) => sanitize(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** Turns any thrown value into a message that is safe to show an operator. */
export function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/[A-Za-z0-9_\-.]{24,}/g, "[REDACTED]").slice(0, 400);
}

export function classifyStatus(status: number): { errorType: string; message: string } | null {
  if (status < 400) return null;
  const map: Record<number, string> = {
    400: "Invalid request sent to the provider.",
    401: "Authorization is invalid or expired. Reconnect the account.",
    403: "The account does not have permission for this call. Check granted scopes.",
    404: "The requested resource does not exist on the provider.",
    409: "Conflict reported by the provider.",
    422: "The provider rejected the payload as unprocessable.",
    429: "Rate limit reached. The connector will back off and retry.",
  };
  return {
    errorType: `HTTP_${status}`,
    message: map[status] ?? (status >= 500 ? "The provider is failing right now." : "Request failed."),
  };
}

export async function logApiCall(entry: {
  provider: string;
  endpoint: string;
  method: string;
  statusCode?: number | null;
  latencyMs?: number | null;
  errorType?: string | null;
  correlationId?: string | null;
}) {
  await supabaseAdmin.from("integration_api_logs").insert({
    provider: entry.provider,
    endpoint: entry.endpoint,
    method: entry.method,
    status_code: entry.statusCode ?? null,
    latency_ms: entry.latencyMs ?? null,
    error_type: entry.errorType ?? null,
    correlation_id: entry.correlationId ?? null,
  });
}

export interface ConnectorFetchOptions extends RequestInit {
  provider: ProviderId;
  /** Retries only for 429 and 5xx. Default 2. */
  maxRetries?: number;
  timeoutMs?: number;
  correlationId?: string;
}

/** fetch with timeout, exponential backoff, retry-after support and API logging. */
export async function connectorFetch(url: string, options: ConnectorFetchOptions) {
  const { provider, maxRetries = 2, timeoutMs = 15000, correlationId, ...init } = options;
  const endpoint = new URL(url).pathname;
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      const latency = Date.now() - started;
      const classified = classifyStatus(res.status);
      await logApiCall({
        provider,
        endpoint,
        method: init.method ?? "GET",
        statusCode: res.status,
        latencyMs: latency,
        errorType: classified?.errorType ?? null,
        correlationId: correlationId ?? null,
      });

      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 10000)
          : Math.min(500 * 2 ** attempt, 8000);
        await new Promise((r) => setTimeout(r, waitMs));
        attempt += 1;
        continue;
      }
      return res;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      await logApiCall({
        provider,
        endpoint,
        method: init.method ?? "GET",
        statusCode: null,
        latencyMs: Date.now() - started,
        errorType: controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
        correlationId: correlationId ?? null,
      });
      if (attempt >= maxRetries) break;
      await new Promise((r) => setTimeout(r, Math.min(500 * 2 ** attempt, 8000)));
      attempt += 1;
    }
  }
  throw new Error(safeMessage(lastError ?? "Network error"));
}

export interface HealthResult {
  connection: ConnectionState;
  auth: AuthState;
  api: ApiState;
  webhooks?: WebhookState;
  accountId?: string | null;
  scopes?: string[] | null;
  /** Operator-facing reason. Never technical noise, never secrets. */
  reason?: string | null;
  nextAction?: string | null;
  ok: boolean;
}

export function missingSecrets(names: string[]): string[] {
  return names.filter((n) => !process.env[n]);
}

export function notConfigured(missing: string[]): HealthResult {
  return {
    connection: "NOT_CONFIGURED",
    auth: "UNKNOWN",
    api: "UNKNOWN",
    webhooks: "NOT_CONFIGURED",
    ok: false,
    reason: `Waiting for credentials: ${missing.join(", ")}.`,
    nextAction: "Add the missing credentials as backend secrets, then test the connection again.",
  };
}

/** Writes the verified health result back onto the integrations registry row. */
export async function persistHealth(provider: ProviderId, result: HealthResult) {
  const now = new Date().toISOString();
  await supabaseAdmin
    .from("integrations")
    .update({
      status: result.connection === "CONNECTED" ? "CONNECTED" : result.connection === "ERROR" ? "ERROR" : "NOT_CONFIGURED",
      connection_state: result.connection,
      auth_state: result.auth,
      api_state: result.api,
      ...(result.webhooks ? { webhook_state: result.webhooks } : {}),
      external_account_id: result.accountId ?? null,
      granted_scopes: result.scopes ?? null,
      last_checked_at: now,
      ...(result.ok ? { last_success_at: now, last_error: null, last_error_at: null } : {}),
      ...(result.ok ? {} : { last_error: result.reason ?? "Connection failed.", last_error_at: now }),
      details: result.nextAction ?? result.reason ?? null,
    })
    .eq("key", provider);
  return result;
}

export async function readSecretRow(provider: ProviderId) {
  const { data } = await supabaseAdmin
    .from("integration_secrets")
    .select("*")
    .eq("provider", provider)
    .maybeSingle();
  return data;
}

export async function writeSecretRow(
  provider: ProviderId,
  values: {
    access_token?: string | null;
    refresh_token?: string | null;
    token_type?: string | null;
    expires_at?: string | null;
    extra?: Record<string, unknown>;
  },
) {
  await supabaseAdmin
    .from("integration_secrets")
    .upsert(
      { provider, ...values, extra: JSON.parse(JSON.stringify(values.extra ?? {})) },
      { onConflict: "provider" },
    );
}

/** Constant-time comparison for signature validation. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function publicBaseUrl(requestUrl?: string): string | null {
  const configured = process.env["PUBLIC_BASE_URL"];
  if (configured) return configured.replace(/\/$/, "");
  if (requestUrl) {
    const u = new URL(requestUrl);
    return `${u.protocol}//${u.host}`;
  }
  return null;
}
