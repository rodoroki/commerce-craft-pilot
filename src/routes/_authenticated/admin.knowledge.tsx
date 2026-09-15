import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, NumberInput, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  KNOWLEDGE_STATUSES,
  brandsQuery,
  knowledgeQuery,
  productsQuery,
  useSaveRecord,
  type KnowledgeEntry,
} from "@/lib/queries";
import { learningStatus } from "@/lib/intelligence";

export const Route = createFileRoute("/_authenticated/admin/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Learnings promoted to rules only when enough observations support them.",
      },
      { property: "og:title", content: "Knowledge Base — Commerce Intelligence Engine" },
      { property: "og:description", content: "Evidence-backed learnings, never single anecdotes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgePage,
});

const MIN_OBSERVATIONS = 3;

const empty = {
  title: "",
  category: "",
  insight: "",
  evidence: "",
  observation: "",
  signal: "",
  test_result: "",
  next_action: "",
  observations_count: null as number | null,
  status: "HYPOTHESIS",
  brand_id: "",
  product_id: "",
};

function KnowledgePage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(knowledgeQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: brands } = useQuery(brandsQuery);
  const save = useSaveRecord("knowledge_entries");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const entries = (data ?? []) as KnowledgeEntry[];

  const submit = () => {
    if (!form.title.trim() || !form.insight.trim()) {
      toast.error("A title and an insight are required.");
      return;
    }
    const observations = form.observations_count;
    const status = learningStatus(form.status, observations ?? 0);
    if (status !== form.status) {
      toast.message(
        `Kept as a hypothesis: consolidating a rule needs at least ${MIN_OBSERVATIONS} observations.`,
      );
    }
    save.mutate(
      {
        values: {
          title: form.title.trim(),
          category: form.category || null,
          insight: form.insight.trim(),
          evidence: form.evidence || null,
          observation: form.observation || null,
          signal: form.signal || null,
          test_result: form.test_result || null,
          next_action: form.next_action || null,
          confidence: status === "CONSOLIDATED" ? "HIGH" : status === "SUPPORTED" ? "MEDIUM" : "LOW",
          observations_count: observations,
          status,
          brand_id: form.brand_id || null,
          product_id: form.product_id || null,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm(empty);
          toast.success("Learning recorded.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        subtitle={`A single observation never becomes a rule. Consolidation requires at least ${MIN_OBSERVATIONS} observations.`}
        action={<Button onClick={() => setOpen(true)}>New learning</Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing learned yet — run experiments first.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((k) => (
            <Card key={k.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-lg">{k.title}</div>
                  <div className="label-xs mt-1">{k.category ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {k.ai_generated ? <DataFlag kind="AI_GENERATED" /> : null}
                  <Badge tone={k.status === "CONSOLIDATED" ? "success" : "warning"}>
                    {k.status}
                  </Badge>
                </div>
              </div>
              <p className="mt-4 text-sm">{k.insight}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[["Observation", k.observation], ["Signal", k.signal], ["Test result", k.test_result], ["Next action", k.next_action]].map(([label, value]) => <div key={label}><div className="label-xs">{label}</div><p className="mt-1 text-sm text-muted-foreground">{value ?? "—"}</p></div>)}
              </div>
              <div className="mt-4 text-sm">
                <div className="label-xs">Evidence</div>
                <div className="mt-1">
                  {k.evidence ? k.evidence : <DataFlag kind="NO_DATA" />}
                </div>
              </div>
              <div className="label-xs mt-4">
                {k.observations_count ?? 0} observation(s)
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New learning"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {KNOWLEDGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Observations">
            <NumberInput
              value={form.observations_count}
              onValue={(v) => setForm({ ...form, observations_count: v })}
            />
          </Field>
          <Field label="Brand">
            <Select
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
            >
              <option value="">—</option>
              {(brands ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product">
            <Select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            >
              <option value="">—</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </Grid2>
        <Field label="Insight">
          <Textarea
            value={form.insight}
            onChange={(e) => setForm({ ...form, insight: e.target.value })}
          />
        </Field>
        <Grid2>
          <Field label="Observation"><Textarea value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} /></Field>
          <Field label="Signal"><Textarea value={form.signal} onChange={(e) => setForm({ ...form, signal: e.target.value })} /></Field>
          <Field label="Test result"><Textarea value={form.test_result} onChange={(e) => setForm({ ...form, test_result: e.target.value })} /></Field>
          <Field label="Next action"><Textarea value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} /></Field>
        </Grid2>
        <Field label="Evidence">
          <Textarea
            value={form.evidence}
            onChange={(e) => setForm({ ...form, evidence: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}
