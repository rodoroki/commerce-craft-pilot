import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  LANDING_BLOCK_TYPES,
  LANDING_STATUSES,
  brandsQuery,
  landingPagesQuery,
  productsQuery,
  slugify,
  useSaveRecord,
  type LandingPage,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/landing")({
  head: () => ({
    meta: [
      { title: "Landing Pages — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Conversion page blueprints assembled from reusable conversion blocks.",
      },
      { property: "og:title", content: "Landing Pages — Commerce Intelligence Engine" },
      { property: "og:description", content: "Reusable conversion blocks per offer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPagesPage,
});

type FormState = {
  title: string;
  brand_id: string;
  product_id: string;
  offer: string;
  status: string;
  notes: string;
  blocks: string[];
};

const empty: FormState = {
  title: "",
  brand_id: "",
  product_id: "",
  offer: "",
  status: "DRAFT",
  notes: "",
  blocks: ["HERO", "PROBLEM", "HOW_IT_WORKS", "PRODUCT", "SOCIAL_PROOF", "FAQ", "CTA"],
};

function LandingPagesPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(landingPagesQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: brands } = useQuery(brandsQuery);
  const save = useSaveRecord("landing_pages");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (l: LandingPage) => {
    setEditing(l);
    setForm({
      title: l.title,
      brand_id: l.brand_id ?? "",
      product_id: l.product_id ?? "",
      offer: l.offer ?? "",
      status: l.status,
      notes: l.notes ?? "",
      blocks: Array.isArray(l.blocks) ? (l.blocks as string[]) : [],
    });
    setOpen(true);
  };

  const toggleBlock = (b: string) =>
    setForm((f) => ({
      ...f,
      blocks: f.blocks.includes(b) ? f.blocks.filter((x) => x !== b) : [...f.blocks, b],
    }));

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("A page title is required.");
      return;
    }
    const values: Record<string, unknown> = {
      title: form.title.trim(),
      brand_id: form.brand_id || null,
      product_id: form.product_id || null,
      offer: form.offer || null,
      status: form.status,
      notes: form.notes || null,
      blocks: form.blocks,
    };
    if (!editing) values["slug"] = slugify(form.title);
    save.mutate(editing ? { id: editing.id, values } : { values }, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Landing page saved.");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div>
      <PageHeader
        title="Landing Pages"
        subtitle="Blueprints of conversion blocks linked to a brand, product, offer and experiment."
        action={<Button onClick={openNew}>New page</Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No landing pages yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data ?? []).map((l) => (
            <Card key={l.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-xl">{l.title}</div>
                  <div className="label-xs mt-1">
                    /{l.slug} · {l.products?.name ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={l.status === "LIVE" ? "success" : "neutral"}>{l.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => openEdit(l)}>
                    Edit
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm">
                {l.offer ? l.offer : <DataFlag kind="NO_DATA">NO OFFER DEFINED</DataFlag>}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(Array.isArray(l.blocks) ? (l.blocks as string[]) : []).map((b) => (
                  <Badge key={b} tone="neutral">
                    {b.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit landing page" : "New landing page"}
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
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {LANDING_STATUSES.map((s) => (
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
        </Grid2>
        <Field label="Offer">
          <Input value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} />
        </Field>
        <Field label="Blocks">
          <div className="flex flex-wrap gap-2">
            {LANDING_BLOCK_TYPES.map((b) => {
              const on = form.blocks.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBlock(b)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    on
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}
