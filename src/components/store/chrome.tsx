import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/store-content";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/product/$slug", params: { slug: "fur-rescue-kit" }, label: "Shop" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
] as const;

function BagCount() {
  const { count, ready } = useCart();
  if (!ready || count === 0) return null;
  return (
    <span className="numeral ml-1 text-xs text-muted-foreground">({count})</span>
  );
}

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        solid ? "border-border bg-background/95 backdrop-blur" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="display text-base tracking-tight sm:text-lg" onClick={() => setOpen(false)}>
          {BRAND.mark}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("params" in link ? { params: link.params } : {})}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface"
            aria-label="Open bag"
          >
            Bag
            <BagCount />
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-foreground hover:bg-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden" aria-label="Mobile">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              {...("params" in link ? { params: link.params } : {})}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-base text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <div className="display text-lg">{BRAND.mark}</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{BRAND.purpose}</p>
        </div>
        <div>
          <h2 className="label-xs">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/product/$slug" params={{ slug: "fur-rescue-kit" }} className="text-muted-foreground hover:text-foreground">
                Fur Rescue Kit
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="label-xs">Help</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/policies" className="text-muted-foreground hover:text-foreground">
                Shipping &amp; returns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="label-xs">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/policies" className="text-muted-foreground hover:text-foreground">
                Privacy &amp; terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-muted-foreground sm:px-8">
          {BRAND.mark} — {BRAND.market}. Prices in USD.
        </div>
      </div>
    </footer>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}

export function Section({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24", className)} {...rest}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="label-xs">{children}</p>;
}

export function PendingNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-block size-1.5 rounded-full bg-muted-foreground/60" aria-hidden />
      {children}
    </p>
  );
}
