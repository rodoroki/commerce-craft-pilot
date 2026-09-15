import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, SectionTitle } from "@/components/ui/kit";
import { Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import { aiRunsQuery, productsQuery, type AiRun } from "@/lib/queries";
import { AI_TASKS, runAiTask } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({
    meta: [
      { title: "AI Layer — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Provider-agnostic AI assistance for products, suppliers, creatives and decisions.",
      },
      { property: "og:title", content: "AI Layer — Commerce Intelligence Engine" },
      { property: "og:description", content: "AI assistance, always labelled as AI generated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiPage,
});

const ERRORS: Record<string, string> = {
  AI_NOT_CONFIGURED: "The AI service is not configured yet, so no request was sent.",
  RATE_LIMITED: "Too many requests right now. Try again in a moment.",
  CREDITS_REQUIRED: "AI usage credits are required before this can run.",
};

function AiPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery(aiRunsQuery);
  const { data: products } = useQuery(productsQuery);
  const run = useServerFn(runAiTask);
  const [task, setTask] = useState<(typeof AI_TASKS)[number]>("PRODUCT_ANALYSIS");
  const [context, setContext] = useState("");
  const [productId, setProductId] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runs = (data ?? []) as AiRun[];

  const submit = async () => {
    if (!context.trim()) {
      toast.error("Describe what the AI should work on.");
      return;
    }
    setBusy(true);
    setOutput(null);
    try {
      const res = await run({ data: { task, context: context.trim(), productId: productId || undefined } });
      if (!res.ok) {
        toast.error(ERRORS[res.error] ?? "The AI request failed.");
        return;
      }
      setOutput(res.output);
      qc.invalidateQueries({ queryKey: ["ai_runs"] });
    } catch {
      toast.error("The AI request could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="AI Layer"
        subtitle="Assistance for analysis and copy. Every output is labelled AI GENERATED and logged."
      />

      <Card className="space-y-4 p-6">
        <Field label="Task">
          <Select value={task} onChange={(e) => setTask(e.target.value as typeof task)}>
            {AI_TASKS.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Context">
          <Textarea
            rows={6}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste the product, supplier or experiment facts the AI should reason about."
          />
        </Field>
        <Field label="Product context">
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">No linked product</option>
            {(products ?? []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </Select>
        </Field>
        <Button onClick={submit} disabled={busy}>
          {busy ? t("state.loading") : "Run"}
        </Button>
        {output ? (
          <div className="rounded-lg border border-border bg-muted/20 p-5">
            <DataFlag kind="AI_GENERATED" />
            <p className="mt-3 whitespace-pre-wrap text-sm">{output}</p>
          </div>
        ) : null}
      </Card>

      <section className="space-y-4">
        <SectionTitle aside={`${runs.length} logged run(s)`}>History</SectionTitle>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("state.noData")}</p>
        ) : (
          <div className="space-y-3">
            {runs.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="neutral">{r.task}</Badge>
                  <span className="label-xs">
                    {r.model} · {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                  {r.output}
                </p>
                <div className="mt-3">
                  <DataFlag kind="AI_GENERATED" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
