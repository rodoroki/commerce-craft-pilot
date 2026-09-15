import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, NumberInput, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  EXPERIMENT_STATUSES,
  brandsQuery,
  creativesQuery,
  experimentsQuery,
  landingPagesQuery,
  productsQuery,
  useSaveRecord,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/experiments/")({
  head: () => ({
    meta: [
      { title: "Experiment Engine — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Hypotheses, budgets and measured results for every product test.",
      },
      { property: "og:title", content: "Experiment Engine — Commerce Intelligence Engine" },
      { property: "og:description", content: "Hypotheses, budgets and measured results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExperimentsPage,
});

const empty = {
  code: "",
  brand_id: "",
  product_id: "",
  creative_id: "",
  landing_page_id: "",
  hypothesis: "",
  audience: "",
  offer: "",
  traffic_source: "",
  budget: null as number | null,
  start_date: "",
  end_date: "",
  status: "DRAFT",
};

function ExperimentsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(experimentsQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: brands } = useQuery(brandsQuery);
  const { data: creatives } = useQuery(creativesQuery);
  const { data: landings } = useQuery(landingPagesQuery);
  const save = useSaveRecord("experiments");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const submit = () => {
    if (!form.hypothesis.trim()) {
      toast.error("An experiment needs a hypothesis.");
      return;
    }
    save.mutate(
      {
        values: {
          code: form.code || null,
          brand_id: form.brand_id || null,
          product_id: form.product_id || null,
          creative_id: form.creative_id || null,
          landing_page_id: form.landing_page_id || null,
          hypothesis: form.hypothesis.trim(),
          audience: form.audience || null,
          offer: form.offer || null,
          traffic_source: form.traffic_source || null,
          budget: form.budget,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: form.status,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm(empty);
          toast.success("Experiment created.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Experiment Engine"
        subtitle="Every test carries a hypothesis, a budget and a decision — results come only from recorded data."
        action={<Button onClick={() => setOpen(true)}>New experiment</Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No experiments yet.</p>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((e) => (
            <Link key={e.id} to="/admin/experiments/$id" params={{ id: e.id }}>
              <Card className="p-5 transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="display text-lg">{e.code ?? "Experiment"}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.hypothesis}</p>
                    <div className="label-xs mt-2">
                      {e.products?.name ?? "—"} · {e.traffic_source ?? "—"}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge tone={e.status === "RUNNING" ? "success" : "neutral"}>{e.status}</Badge>
                    {e.decision ? (
                      <Badge tone="accent">{e.decision}</Badge>
                    ) : (
                      <DataFlag kind="NO_DATA">NO DECISION</DataFlag>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New experiment"
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
          <Field label="Experiment ID">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {EXPERIMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
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
          <Field label="Creative">
            <Select
              value={form.creative_id}
              onChange={(e) => setForm({ ...form, creative_id: e.target.value })}
            >
              <option value="">—</option>
              {(creatives ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ?? c.concept ?? c.id.slice(0, 8)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Landing page">
            <Select
              value={form.landing_page_id}
              onChange={(e) => setForm({ ...form, landing_page_id: e.target.value })}
            >
              <option value="">—</option>
              {(landings ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Traffic source">
            <Input
              value={form.traffic_source}
              onChange={(e) => setForm({ ...form, traffic_source: e.target.value })}
            />
          </Field>
          <Field label="Budget">
            <NumberInput value={form.budget} onValue={(v) => setForm({ ...form, budget: v })} />
          </Field>
          <Field label="Start date">
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </Field>
        </Grid2>
        <Field label="Hypothesis">
          <Textarea
            value={form.hypothesis}
            onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
          />
        </Field>
        <Field label="Audience">
          <Input
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          />
        </Field>
        <Field label="Offer">
          <Input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} />
        </Field>
      </Modal>
    </div>
  );
}
