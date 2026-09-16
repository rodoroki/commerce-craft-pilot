/**
 * Integration registry — client-safe metadata only.
 * No secrets, no tokens. Secret *names* are listed so the admin UI can tell the
 * operator exactly what is still missing, never their values.
 */

export type ProviderId = "nuvemshop" | "meta" | "tiktok" | "google_ads" | "dropi";

export type ConnectionState =
  | "NOT_CONFIGURED"
  | "CONFIGURED"
  | "AUTHORIZING"
  | "CONNECTED"
  | "DEGRADED"
  | "ERROR"
  | "DISCONNECTED"
  | "REVOKED";

export type AuthState = "VALID" | "INVALID" | "EXPIRED" | "UNKNOWN";
export type ApiState = "HEALTHY" | "ERROR" | "UNKNOWN";
export type WebhookState = "ACTIVE" | "PARTIAL" | "NOT_CONFIGURED" | "ERROR";

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  category: "COMMERCE" | "SOURCING" | "ACQUISITION";
  authType: "OAUTH2" | "TOKEN" | "API_KEY";
  /** Environment variable names required before anything can be attempted. */
  requiredSecrets: string[];
  /** Optional environment variables that unlock extra capabilities. */
  optionalSecrets: string[];
  scopes: string[];
  webhookTopics: string[];
  supportsOAuth: boolean;
  supportsWebhooks: boolean;
  note: string;
}

/** Nuvemshop topics we actually need — nothing is subscribed "just in case". */
export const NUVEMSHOP_TOPICS = [
  "product/created",
  "product/updated",
  "product/deleted",
  "order/created",
  "order/updated",
  "order/paid",
  "order/packed",
  "order/fulfilled",
  "order/cancelled",
  "customer/created",
  "customer/updated",
  "customer/deleted",
  "fulfillment/updated",
  "app/uninstalled",
  "app/suspended",
  "app/resumed",
  "store/redact",
  "customers/redact",
  "customers/data_request",
];

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "nuvemshop",
    label: "Nuvemshop",
    category: "COMMERCE",
    authType: "OAUTH2",
    requiredSecrets: ["NUVEMSHOP_CLIENT_ID", "NUVEMSHOP_CLIENT_SECRET", "NUVEMSHOP_APP_ID"],
    optionalSecrets: ["NUVEMSHOP_REDIRECT_URI", "PUBLIC_BASE_URL"],
    scopes: ["read_products", "read_orders", "read_customers", "read_content", "read_shipping"],
    webhookTopics: NUVEMSHOP_TOPICS,
    supportsOAuth: true,
    supportsWebhooks: true,
    note: "Source of truth for products, orders, customers and fulfillment. Read-only scopes only.",
  },
  {
    id: "meta",
    label: "Meta Ads",
    category: "ACQUISITION",
    authType: "OAUTH2",
    requiredSecrets: ["META_APP_ID", "META_APP_SECRET", "META_ACCESS_TOKEN"],
    optionalSecrets: ["META_AD_ACCOUNT_ID", "META_DATASET_ID"],
    scopes: ["ads_read", "business_management"],
    webhookTopics: [],
    supportsOAuth: true,
    supportsWebhooks: false,
    note: "Marketing API for campaign, ad set, ad and metric reads. Conversions API is prepared, not enabled.",
  },
  {
    id: "tiktok",
    label: "TikTok Ads",
    category: "ACQUISITION",
    authType: "TOKEN",
    requiredSecrets: ["TIKTOK_APP_ID", "TIKTOK_APP_SECRET", "TIKTOK_ACCESS_TOKEN"],
    optionalSecrets: ["TIKTOK_ADVERTISER_ID"],
    scopes: ["Ads Management (read)", "Reporting"],
    webhookTopics: [],
    supportsOAuth: true,
    supportsWebhooks: false,
    note: "TikTok Marketing API v1.3. Its auth flow and endpoints differ from Meta and are implemented separately.",
  },
  {
    id: "google_ads",
    label: "Google Ads",
    category: "ACQUISITION",
    authType: "OAUTH2",
    requiredSecrets: [
      "GOOGLE_ADS_CLIENT_ID",
      "GOOGLE_ADS_CLIENT_SECRET",
      "GOOGLE_ADS_DEVELOPER_TOKEN",
      "GOOGLE_ADS_REFRESH_TOKEN",
    ],
    optionalSecrets: ["GOOGLE_ADS_CUSTOMER_ID", "GOOGLE_ADS_LOGIN_CUSTOMER_ID"],
    scopes: ["https://www.googleapis.com/auth/adwords"],
    webhookTopics: [],
    supportsOAuth: true,
    supportsWebhooks: false,
    note: "Requires an approved developer token. OAuth alone does not make it connected.",
  },
  {
    id: "dropi",
    label: "Dropi",
    category: "SOURCING",
    authType: "API_KEY",
    requiredSecrets: ["DROPI_API_BASE_URL", "DROPI_API_KEY"],
    optionalSecrets: ["DROPI_ACCOUNT_ID"],
    scopes: [],
    webhookTopics: [],
    supportsOAuth: false,
    supportsWebhooks: false,
    note: "Dropi publishes no open API reference. The connector stays inert until the account's real base URL and key are provided and verified.",
  },
];

export const providerById = (id: string): ProviderDefinition | undefined =>
  PROVIDERS.find((p) => p.id === id);

export const webhookPath = (provider: ProviderId) => `/api/public/webhooks/${provider}`;
export const oauthCallbackPath = (provider: ProviderId) => `/api/public/oauth/${provider}`;
