import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/kit";

const NAV = [
  { to: "/admin", key: "nav.command" },
  { to: "/admin/flow", key: "nav.flow" },
  { to: "/admin/products", key: "nav.products" },
  { to: "/admin/brands", key: "nav.brands" },
  { to: "/admin/suppliers", key: "nav.suppliers" },
  { to: "/admin/creatives", key: "nav.creatives" },
  { to: "/admin/landing", key: "nav.landing" },
  { to: "/admin/experiments", key: "nav.experiments" },
  { to: "/admin/analytics", key: "nav.analytics" },
  { to: "/admin/knowledge", key: "nav.knowledge" },
  { to: "/admin/ai", key: "nav.ai" },
  { to: "/admin/integrations", key: "nav.integrations" },
  { to: "/admin/settings", key: "nav.settings" },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("cie.theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("cie.theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[232px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-border bg-surface px-5 py-6 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/admin" className="block" onClick={() => setOpen(false)}>
          <div className="display text-lg leading-none">Commerce</div>
          <div className="display text-lg leading-none">Intelligence</div>
          <div className="label-xs mt-2">Engine</div>
        </Link>

        <nav className="mt-10 flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/admin" }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              activeProps={{ className: "bg-background text-foreground font-medium" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border pt-4">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {t("settings.theme")}
          </button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            {t("nav.signout")}
          </Button>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 border-b border-border px-5 py-3 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <span className="display text-base">Commerce Intelligence Engine</span>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 lg:py-16">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
