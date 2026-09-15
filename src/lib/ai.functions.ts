import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const AI_TASKS = [
  "PRODUCT_ANALYSIS",
  "SUPPLIER_COMPARISON",
  "CREATIVE_HOOKS",
  "LANDING_COPY",
  "EXPERIMENT_ANALYSIS",
  "DECISION_SUPPORT",
] as const;

const TASK_PROMPTS: Record<string, string> = {
  PRODUCT_ANALYSIS:
    "You analyse a physical product opportunity for a direct-to-consumer brand. Be blunt about risk. Never invent market numbers; if data is missing, say what is missing.",
  SUPPLIER_COMPARISON:
    "You compare supplier options for a product. Never pick a winner when cost, delivery or MOQ data is missing; state exactly which figures are required.",
  CREATIVE_HOOKS:
    "You write short ad hooks. Return them as hypotheses only, never as proven winners. Maximum 12 words each.",
  LANDING_COPY:
    "You write conversion-focused landing page copy in clear, concrete English. No hype, no invented testimonials, no invented statistics.",
  EXPERIMENT_ANALYSIS:
    "You analyse advertising experiment results. If the sample is too small for a conclusion, say so first.",
  DECISION_SUPPORT:
    "You support a scale/rework/kill decision. Always separate what the data shows from what is assumed.",
};

const inputSchema = z.object({
  task: z.enum(AI_TASKS),
  context: z.string().min(1).max(8000),
});

/**
 * Provider-agnostic AI call. Output is always labelled AI GENERATED in the UI
 * and logged to ai_runs with provider, model, prompt and task.
 */
export const runAiTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "AI_NOT_CONFIGURED" };
    }
    const provider = "lovable-ai-gateway";
    const model = "google/gemini-3-flash-preview";
    const system = TASK_PROMPTS[data.task] ?? "";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.context },
        ],
      }),
    });

    if (res.status === 429) return { ok: false as const, error: "RATE_LIMITED" };
    if (res.status === 402) return { ok: false as const, error: "CREDITS_REQUIRED" };
    if (!res.ok) return { ok: false as const, error: `AI_ERROR_${res.status}` };

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const output = json.choices?.[0]?.message?.content ?? "";

    await context.supabase.from("ai_runs").insert({
      provider,
      model,
      task: data.task,
      prompt: system,
      input: { context: data.context },
      output,
      confidence: "UNVERIFIED",
      created_by: context.userId,
    });

    return { ok: true as const, output, provider, model };
  });
