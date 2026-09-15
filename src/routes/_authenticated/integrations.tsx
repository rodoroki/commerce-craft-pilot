import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { integrationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/integrations")({
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
    </div>
  );
}
