import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, NumberInput, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import { suppliersQuery, useSaveRecord, type Supplier } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Supplier registry: terms, delivery, packaging, reliability and scoring.",
      },
      { property: "og:title", content: "Supplier Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Supplier registry, terms and reliability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuppliersPage,
});

type FormState = {
  name: string;
  country: string;
  marketplace: string;
  source: string;
  url: string;
  warehouse_location: string;
  shipping_method: string;
  delivery_estimate_days_min: number | null;
  delivery_estimate_days_max: number | null;
  returns_policy: string;
  packaging: string;
  private_label: string;
  customization: string;
  response_time_hours: number | null;
  supplier_score: number | null;
  notes: string;
};

const empty: FormState = {
  name: "",
  country: "",
  marketplace: "",
  source: "",
  url: "",
  warehouse_location: "",
  shipping_method: "",
  delivery_estimate_days_min: null,
  delivery_estimate_days_max: null,
  returns_policy: "",
  packaging: "",
  private_label: "",
  customization: "",
  response_time_hours: null,
  supplier_score: null,
  notes: "",
};

const boolOrNull = (v: string) => (v === "" ? null : v === "yes");

function SuppliersPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(suppliersQuery);
  const save = useSaveRecord("suppliers");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      country: s.country ?? "",
      marketplace: s.marketplace ?? "",
      source: s.source ?? "",
      url: s.url ?? "",
      warehouse_location: s.warehouse_location ?? "",
      shipping_method: s.shipping_method ?? "",
      delivery_estimate_days_min: s.delivery_estimate_days_min,
      delivery_estimate_days_max: s.delivery_estimate_days_max,
      returns_policy: s.returns_policy ?? "",
      packaging: s.packaging ?? "",
      private_label: s.private_label === null ? "" : s.private_label ? "yes" : "no",
      customization: s.customization === null ? "" : s.customization ? "yes" : "no",
      response_time_hours: s.response_time_hours,
      supplier_score: s.supplier_score,
      notes: s.notes ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("A supplier name is required.");
      return;
    }
    const values: Record<string, unknown> = {
      name: form.name.trim(),
      country: form.country || null,
      marketplace: form.marketplace || null,
      source: form.source || null,
      url: form.url || null,
      warehouse_location: form.warehouse_location || null,
      shipping_method: form.shipping_method || null,
      delivery_estimate_days_min: form.delivery_estimate_days_min,
      delivery_estimate_days_max: form.delivery_estimate_days_max,
      returns_policy: form.returns_policy || null,
      packaging: form.packaging || null,
      private_label: boolOrNull(form.private_label),
      customization: boolOrNull(form.customization),
      response_time_hours: form.response_time_hours,
      supplier_score: form.supplier_score,
      notes: form.notes || null,
    };
    save.mutate(editing ? { id: editing.id, values } : { values }, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Supplier saved.");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const scored = (data ?? []).filter((s) => s.supplier_score !== null);
  const bestScore = scored.slice().sort((a, b) => (b.supplier_score ?? 0) - (a.supplier_score ?? 0))[0];
  const fastest = (data ?? [])
    .filter((s) => s.delivery_estimate_days_max !== null)
    .sort((a, b) => (a.delivery_estimate_days_max ?? 0) - (b.delivery_estimate_days_max ?? 0))[0];
  const branding = (data ?? []).find((s) => s.private_label === true);

  return (
    <div className="space-y-10">
      <PageHeader
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        action={<Button onClick={openNew}>New supplier</Button>}
      />

      <Card className="grid gap-px overflow-hidden bg-border sm:grid-cols-3">
        {(
          [
            ["BEST OVERALL", bestScore?.name, "Highest recorded reliability score"],
            ["BEST DELIVERY", fastest?.name, "Shortest recorded delivery estimate"],
            ["BEST BRANDING", branding?.name, "Confirmed private label capability"],
          ] as [string, string | undefined, string][]
        ).map(([label, value, help]) => (
          <div key={label} className="bg-card p-5">
            <div className="label-xs">{label}</div>
            <div className="mt-2 text-sm">
              {value ?? <DataFlag kind="NO_DATA">INSUFFICIENT DATA</DataFlag>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{help}</p>
          </div>
        ))}
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-xl">{s.name}</div>
                  <div className="label-xs mt-1">
                    {s.source ?? "—"} · {s.country ?? t("state.unknown")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.supplier_score === null ? (
                    <DataFlag kind="UNKNOWN" />
                  ) : (
                    <Badge tone="neutral" className="numeral">
                      {s.supplier_score}/100
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {(
                  [
                    ["Warehouse", s.warehouse_location],
                    ["Shipping", s.shipping_method],
                    [
                      "Delivery (days)",
                      s.delivery_estimate_days_min !== null && s.delivery_estimate_days_max !== null
                        ? `${s.delivery_estimate_days_min}–${s.delivery_estimate_days_max}`
                        : null,
                    ],
                    [
                      "Private label",
                      s.private_label === null ? null : s.private_label ? "Yes" : "No",
                    ],
                  ] as [string, string | null][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="label-xs">{label}</dt>
                    <dd className="mt-0.5">{value ? value : <DataFlag kind="UNKNOWN" />}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New supplier"}
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
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Field>
          <Field label="Marketplace">
            <Input
              value={form.marketplace}
              onChange={(e) => setForm({ ...form, marketplace: e.target.value })}
            />
          </Field>
          <Field label="Source type">
            <Input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </Field>
          <Field label="URL">
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Field>
          <Field label="Warehouse location">
            <Input
              value={form.warehouse_location}
              onChange={(e) => setForm({ ...form, warehouse_location: e.target.value })}
            />
          </Field>
          <Field label="Shipping method">
            <Input
              value={form.shipping_method}
              onChange={(e) => setForm({ ...form, shipping_method: e.target.value })}
            />
          </Field>
          <Field label="Packaging">
            <Input
              value={form.packaging}
              onChange={(e) => setForm({ ...form, packaging: e.target.value })}
            />
          </Field>
          <Field label="Delivery days (min)">
            <NumberInput
              value={form.delivery_estimate_days_min}
              onValue={(v) => setForm({ ...form, delivery_estimate_days_min: v })}
            />
          </Field>
          <Field label="Delivery days (max)">
            <NumberInput
              value={form.delivery_estimate_days_max}
              onValue={(v) => setForm({ ...form, delivery_estimate_days_max: v })}
            />
          </Field>
          <Field label="Private label">
            <Select
              value={form.private_label}
              onChange={(e) => setForm({ ...form, private_label: e.target.value })}
            >
              <option value="">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>
          <Field label="Response time (hours)">
            <NumberInput
              value={form.response_time_hours}
              onValue={(v) => setForm({ ...form, response_time_hours: v })}
            />
          </Field>
          <Field label="Reliability score (0–100)">
            <NumberInput
              value={form.supplier_score}
              onValue={(v) => setForm({ ...form, supplier_score: v })}
              min={0}
              max={100}
            />
          </Field>
          <Field label="Returns policy">
            <Input
              value={form.returns_policy}
              onChange={(e) => setForm({ ...form, returns_policy: e.target.value })}
            />
          </Field>
        </Grid2>
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
