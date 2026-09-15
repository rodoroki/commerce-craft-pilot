import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const EVENT_TYPES = [
  "PAGE_VIEW",
  "VIEW_CONTENT",
  "ADD_TO_CART",
  "BEGIN_CHECKOUT",
  "PURCHASE",
  "REFUND",
  "LEAD",
  "EMAIL_SIGNUP",
  "COUPON",
  "UPSELL",
] as const;

const schema = z.object({
  event_type: z.enum(EVENT_TYPES),
  brand_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  landing_page_id: z.string().uuid().optional(),
  experiment_id: z.string().uuid().optional(),
  value: z.number().optional(),
  currency: z.string().max(8).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  external_id: z.string().max(200).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-tracking-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Funnel ingestion endpoint for storefront / n8n automations.
 * Requires TRACKING_SECRET; without it the endpoint stays closed rather than
 * accepting unverified traffic.
 */
export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const secret = process.env["TRACKING_SECRET"];
        if (!secret) {
          return Response.json(
            { error: "NOT_CONFIGURED" },
            { status: 503, headers: cors },
          );
        }
        if (request.headers.get("x-tracking-secret") !== secret) {
          return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers: cors });
        }

        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "INVALID_PAYLOAD" }, { status: 400, headers: cors });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("funnel_events")
          .insert(JSON.parse(JSON.stringify(parsed.data)));

        if (error) {
          return Response.json({ error: "WRITE_FAILED" }, { status: 500, headers: cors });
        }
        return Response.json({ ok: true }, { headers: cors });
      },
    },
  },
});
