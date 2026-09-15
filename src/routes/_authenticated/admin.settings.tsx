import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Card, Field } from "@/components/ui/kit";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Commerce Intelligence Engine" },
      { name: "description", content: "Language, display currency and workspace preferences." },
      { property: "og:title", content: "Settings — Commerce Intelligence Engine" },
      { property: "og:description", content: "Language and workspace preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("phase.note")} />
      <Card className="max-w-md space-y-6 p-6">
        <Field label={t("settings.language")}>
          <select
            className={selectClass}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            <option value="en-US">English (US)</option>
            <option value="pt-BR">Português (BR)</option>
          </select>
        </Field>
        <Field label={t("settings.currency")}>
          <select className={selectClass} defaultValue="USD" disabled>
            <option value="USD">USD</option>
          </select>
        </Field>
        <p className="text-xs text-muted-foreground">
          BRL and EUR require a real exchange-rate source. No fictional conversion is applied.
        </p>
      </Card>
    </div>
  );
}
