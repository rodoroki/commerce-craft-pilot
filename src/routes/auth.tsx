import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button, Card, Field, Input } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Commerce Intelligence Engine" },
      {
        name: "description",
        content:
          "Private access to the Commerce Intelligence Engine: product validation, sourcing and experiment control.",
      },
      { property: "og:title", content: "Sign in — Commerce Intelligence Engine" },
      {
        property: "og:description",
        content: "Private access to the Commerce Intelligence Engine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/" });
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm the account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="display text-3xl leading-tight">Commerce Intelligence Engine</div>
          <p className="mt-3 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label={t("auth.email")}>
              <Input
                type="email"
                value={email}
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t("auth.password")}>
              <Input
                type="password"
                value={password}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signup" ? t("auth.signup") : t("auth.signin")}
            </Button>
          </form>
          <Button variant="outline" className="mt-3 w-full" onClick={google}>
            {t("auth.google")}
          </Button>
          <button
            type="button"
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? t("auth.toggleToSignin") : t("auth.toggleToSignup")}
          </button>
        </Card>
      </div>
    </div>
  );
}
