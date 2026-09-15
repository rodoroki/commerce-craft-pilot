import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input, SectionTitle } from "@/components/ui/kit";
import { Grid2, Modal, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  CREATIVE_CONCEPTS,
  CREATIVE_STATUSES,
  brandsQuery,
  creativesQuery,
  hooksQuery,
  productsQuery,
  useDeleteRecord,
  useSaveRecord,
  type Creative,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/creatives")({
  head: () => ({
    meta: [
      { title: "Creative Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Creative concepts, hooks, scripts and production status for paid testing.",
      },
      { property: "og:title", content: "Creative Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Concepts, hooks, scripts and production status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreativesPage,
});

type FormState = {
  code: string;
  brand_id: string;
  product_id: string;
  concept: string;
  hook: string;
  script: string;
  format: string;
  platform: string;
  audience: string;
  status: string;
  url: string;
  notes: string;
};

const empty: FormState = {
  code: "",
  brand_id: "",
  product_id: "",
  concept: "UGC",
  hook: "",
  script: "",
  format: "VERTICAL_VIDEO",
  platform: "META",
  audience: "",
  status: "IDEA",
  url: "",
  notes: "",
};

function CreativesPage() {
  const { t } = useI18n();
  const { data: creatives, isLoading } = useQuery(creativesQuery);
  const { data: hooks } = useQuery(hooksQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: brands } = useQuery(brandsQuery);
  const save = useSaveRecord("creatives");
  const saveHook = useSaveRecord("hooks");
  const removeHook = useDeleteRecord("hooks");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Creative | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [hookText, setHookText] = useState("");
  const [hookProduct, setHookProduct] = useState("");

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: Creative) => {
    setEditing(c);
    setForm({
      code: c.code ?? "",
      brand_id: c.brand_id ?? "",
      product_id: c.product_id ?? "",
      concept: c.concept ?? "UGC",
      hook: c.hook ?? "",
      script: c.script ?? "",
      format: c.format ?? "",
      platform: c.platform ?? "",
      audience: c.audience ?? "",
      status: c.status,
      url: c.url ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    const values: Record<string, unknown> = {
      code: form.code || null,
      brand_id: form.brand_id || null,
      product_id: form.product_id || null,
      concept: form.concept || null,
      hook: form.hook || null,
      script: form.script || null,
      format: form.format || null,
      platform: form.platform || null,
      audience: form.audience || null,
      status: form.status,
      url: form.url || null,
      notes: form.notes || null,
    };
    save.mutate(editing ? { id: editing.id, values } : { values }, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Creative saved.");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const addHook = () => {
    if (!hookText.trim()) return;
    saveHook.mutate(
      {
        values: {
          text: hookText.trim(),
          product_id: hookProduct || null,
          is_hypothesis: true,
        },
      },
      {
        onSuccess: () => {
          setHookText("");
          toast.success("Hook added as a hypothesis.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Creative Lab"
        subtitle="Concepts, hooks and scripts. Performance appears only when an experiment records it."
        action={<Button onClick={openNew}>New creative</Button>}
      />

      <section className="space-y-4">
        <SectionTitle aside={`${(creatives ?? []).length} registered`}>Creatives</SectionTitle>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
        ) : (creatives ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No creatives yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(creatives ?? []).map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="display text-lg">{c.code ?? c.concept ?? "Creative"}</div>
                    <div className="label-xs mt-1">
                      {c.products?.name ?? "—"} · {c.platform ?? "—"} · {c.format ?? "—"}
                    </div>
                  </div>
                  <Badge tone="accent">{c.status}</Badge>
                </div>
                <p className="mt-4 text-sm">{c.hook ?? <DataFlag kind="NO_DATA" />}</p>
                <div className="mt-4 flex items-center justify-between">
                  <DataFlag kind="NO_DATA">NO PERFORMANCE DATA</DataFlag>
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle aside="Hypotheses only — never proven winners">Hook library</SectionTitle>
        <Card className="space-y-4 p-5">
          <Grid2>
            <Field label="Hook">
              <Input
                value={hookText}
                onChange={(e) => setHookText(e.target.value)}
                placeholder="Your dog isn't the problem. The fur is."
              />
            </Field>
            <Field label="Product">
              <Select value={hookProduct} onChange={(e) => setHookProduct(e.target.value)}>
                <option value="">—</option>
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
          </Grid2>
          <Button size="sm" onClick={addHook} disabled={saveHook.isPending}>
            Add hook
          </Button>
        </Card>
        <div className="divide-y divide-border rounded-lg border border-border">
          {(hooks ?? []).length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No hooks recorded yet.</p>
          ) : (
            (hooks ?? []).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-sm">{h.text}</span>
                <div className="flex items-center gap-2">
                  {h.ai_generated ? <DataFlag kind="AI_GENERATED" /> : null}
                  <Badge tone="warning">HYPOTHESIS</Badge>
                  <Button size="sm" variant="ghost" onClick={() => removeHook.mutate(h.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit creative" : "New creative"}
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
          <Field label="Creative ID">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {CREATIVE_STATUSES.map((s) => (
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
          <Field label="Concept">
            <Select
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
            >
              {CREATIVE_CONCEPTS.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Format">
            <Input
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            />
          </Field>
          <Field label="Platform">
            <Input
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            />
          </Field>
          <Field label="Audience">
            <Input
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />
          </Field>
        </Grid2>
        <Field label="Hook">
          <Input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} />
        </Field>
        <Field label="Script">
          <Textarea
            value={form.script}
            onChange={(e) => setForm({ ...form, script: e.target.value })}
          />
        </Field>
        <Field label="Asset URL">
          <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </Field>
      </Modal>
    </div>
  );
}
