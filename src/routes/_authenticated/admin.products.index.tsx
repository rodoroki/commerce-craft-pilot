import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import {
  brandsQuery,
  PRODUCT_STAGES,
  productsQuery,
  slugify,
  useSaveRecord,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/products/")({
  head: () => ({
    meta: [
      { title: "Product Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content:
          "Product opportunities, lifecycle stages, scoring and sourcing status in one place.",
      },
      { property: "og:title", content: "Product Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Lifecycle, scoring and sourcing status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(productsQuery);
  const { data: brands } = useQuery(brandsQuery);
  const save = useSaveRecord("products");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    internal_name: "",
    brand_id: "",
    category: "",
    subcategory: "",
    concept: "",
    stage: "IDEA",
    market: "United States",
    country: "US",
    currency: "USD",
  });

  const create = () => {
    if (!form.name.trim()) {
      toast.error("A product name is required.");
      return;
    }
    save.mutate(
      {
        values: {
          name: form.name.trim(),
          slug: slugify(form.name),
          internal_name: form.internal_name || null,
          brand_id: form.brand_id || null,
          category: form.category || null,
          subcategory: form.subcategory || null,
          concept: form.concept || null,
          stage: form.stage,
          market: form.market || null,
          country: form.country || null,
          currency: form.currency || "USD",
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ ...form, name: "", internal_name: "", concept: "" });
          toast.success("Product created.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        action={<Button onClick={() => setOpen(true)}>{t("products.new")}</Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("products.empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((p) => (
            <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }}>
              <Card className="h-full p-5 transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="display text-xl">{p.name}</div>
                    <div className="label-xs mt-1">
                      {p.brands?.name ?? "—"} · {p.category ?? "—"}
                    </div>
                  </div>
                  <Badge tone="accent">{p.stage.replace(/_/g, " ")}</Badge>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="label-xs">{t("product.score")}</span>
                  {p.score === null ? (
                    <DataFlag kind="UNKNOWN" />
                  ) : (
                    <span className="numeral">{p.score}/100</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("products.new")}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={create} disabled={save.isPending}>
              {t("save")}
            </Button>
          </>
        }
      >
        <Grid2>
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Internal name">
            <Input
              value={form.internal_name}
              onChange={(e) => setForm({ ...form, internal_name: e.target.value })}
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
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {PRODUCT_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Subcategory">
            <Input
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            />
          </Field>
          <Field label="Market">
            <Input
              value={form.market}
              onChange={(e) => setForm({ ...form, market: e.target.value })}
            />
          </Field>
          <Field label="Currency">
            <Input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </Field>
        </Grid2>
        <Field label="Concept">
          <Textarea
            value={form.concept}
            onChange={(e) => setForm({ ...form, concept: e.target.value })}
          />
        </Field>
      </Modal>
    </div>
  );
}
