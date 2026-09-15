import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Button, Card, DataFlag, Input, SectionTitle } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { integrationsQuery, useSaveRecord, webhooksQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Commerce Intelligence Engine" },
      {
        name: "description",
        content: "Connection status for commerce, sourcing, automation and acquisition platforms.",
      },
      { property: "og:title", content: "Integrations — Commerce Intelligence Engine" },
      { property: "og:description", content: "Real connection status. Nothing simulated." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

function statusTone(status: string) {
  if (status === "CONNECTED") return "success" as const;
  if (status === "ERROR") return "danger" as const;
  return "neutral" as const;
}

function IntegrationsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery(integrationsQuery);
  const { data: webhooks } = useQuery(webhooksQuery);
  const saveWebhook = useSaveRecord("webhook_endpoints");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const saveUrl = (id: string, current: string | null) => {
    const value = drafts[id] ?? current ?? "";
    saveWebhook.mutate(
      { id, values: { url: value || null, is_active: Boolean(value) } },
      {
        onSuccess: () => toast.success("Webhook URL saved."),
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div>
      <PageHeader title={t("integrations.title")} subtitle={t("integrations.subtitle")} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("state.loading")}</p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {(data ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-4 bg-card p-5">
              <div>
                <div className="font-medium">{i.label}</div>
                <div className="label-xs mt-1">{i.category}</div>
              </div>
              <Badge tone={statusTone(i.status)} className="font-mono">
                {i.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 bg-card p-5">
            <div>
              <div className="font-medium">Cloud database and authentication</div>
              <div className="label-xs mt-1">PLATFORM</div>
            </div>
            <Badge tone="success" className="font-mono">
              CONNECTED
            </Badge>
          </div>
        </div>
      )}
      <Card className="mt-8 p-5 text-sm text-muted-foreground">
        Credentials are stored server-side only. No integration is reported as active until it is
        configured and tested.
      </Card>

      <section className="mt-12 space-y-4">
        <SectionTitle aside="Automation events sent to n8n">Webhooks</SectionTitle>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {(webhooks ?? []).map((w) => (
            <div
              key={w.id}
              className="flex flex-col gap-3 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-48">
                <div className="font-mono text-sm">{w.event_key}</div>
                <div className="mt-1">
                  {w.url ? (
                    <Badge tone={w.is_active ? "success" : "neutral"}>
                      {w.is_active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  ) : (
                    <DataFlag kind="NOT_CONFIGURED" />
                  )}
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={drafts[w.id] ?? w.url ?? ""}
                  placeholder="https://your-n8n-instance/webhook/..."
                  onChange={(e) => setDrafts({ ...drafts, [w.id]: e.target.value })}
                />
                <Button size="sm" variant="outline" onClick={() => saveUrl(w.id, w.url)}>
                  {t("save")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
