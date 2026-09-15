import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Field, Input } from "@/components/ui/kit";
import { Grid2, Modal, Textarea } from "@/components/ui/form";
import { useI18n } from "@/lib/i18n";
import { brandsQuery, slugify, useSaveRecord, type Brand } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/brands")({
  head: () => ({
    meta: [
      { title: "Brand Lab — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Multi-brand architecture: positioning, territory, audience, voice and market.",
      },
      { property: "og:title", content: "Brand Lab — Commerce Intelligence Engine" },
      { property: "og:description", content: "Positioning, territory, audience and voice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandsPage,
});

type FormState = {
  name: string;
  positioning: string;
  territory: string;
  audience: string;
  voice: string;
  market: string;
  country: string;
  currency: string;
  domain: string;
};

const empty: FormState = {
  name: "",
  positioning: "",
  territory: "",
  audience: "",
  voice: "",
  market: "United States",
  country: "US",
  currency: "USD",
  domain: "",
};

function BrandsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(brandsQuery);
  const save = useSaveRecord("brands");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({
      name: b.name,
      positioning: b.positioning ?? "",
      territory: b.territory ?? "",
      audience: b.audience ?? "",
      voice: b.voice ?? "",
      market: b.market ?? "",
      country: b.country ?? "",
      currency: b.currency ?? "USD",
      domain: b.domain ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("A brand name is required.");
      return;
    }
    const values: Record<string, unknown> = {
      name: form.name.trim(),
      positioning: form.positioning || null,
      territory: form.territory || null,
      audience: form.audience || null,
      voice: form.voice || null,
      market: form.market || null,
      country: form.country || null,
      currency: form.currency || null,
      domain: form.domain || null,
    };
    if (!editing) values["slug"] = slugify(form.name);
    save.mutate(
      editing ? { id: editing.id, values } : { values },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Brand saved.");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title={t("brands.title")}
        subtitle={t("brands.subtitle")}
        action={<Button onClick={openNew}>New brand</Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data ?? []).map((b) => (
            <Card key={b.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-2xl">{b.name}™</div>
                  <div className="label-xs mt-1">
                    {b.market ?? "—"} · {b.currency ?? "—"}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                  Edit
                </Button>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                {(
                  [
                    ["Positioning", b.positioning],
                    ["Territory", b.territory],
                    ["Audience", b.audience],
                    ["Voice", b.voice],
                    ["Domain", b.domain],
                  ] as [string, string | null][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="label-xs">{label}</dt>
                    <dd className="mt-0.5">
                      {value ? value : <DataFlag kind="NO_DATA" />}
                    </dd>
                  </div>
                ))}
              </dl>
              {b.is_active ? (
                <Badge tone="success" className="mt-5">
                  ACTIVE
                </Badge>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New brand"}
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
          <Field label="Domain">
            <Input
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </Field>
          <Field label="Market">
            <Input
              value={form.market}
              onChange={(e) => setForm({ ...form, market: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </Field>
        </Grid2>
        <Field label="Positioning">
          <Textarea
            value={form.positioning}
            onChange={(e) => setForm({ ...form, positioning: e.target.value })}
          />
        </Field>
        <Field label="Territory">
          <Input
            value={form.territory}
            onChange={(e) => setForm({ ...form, territory: e.target.value })}
          />
        </Field>
        <Field label="Audience">
          <Textarea
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          />
        </Field>
        <Field label="Voice">
          <Input value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })} />
        </Field>
      </Modal>
    </div>
  );
}
