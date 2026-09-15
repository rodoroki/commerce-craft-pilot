import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { useCart, formatMoney } from "@/lib/cart";
import { trackStoreEvent } from "@/lib/store-events";

const TITLE = "Your bag — DOG CAR LIFE";
const DESCRIPTION = "Review the items in your bag before checkout.";

export const Route = createFileRoute("/_store/cart")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, ready, subtotal, setQuantity, remove } = useCart();

  return (
    <Section>
      <Eyebrow>Your bag</Eyebrow>
      <h1 className="display mt-3 text-4xl sm:text-5xl">Bag</h1>

      {!ready ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading your bag…</p>
      ) : lines.length === 0 ? (
        <div className="mt-8">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/product/$slug"
            params={{ slug: "fur-rescue-kit" }}
            className="mt-6 inline-block rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            See the Fur Rescue Kit
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={line.slug} className="flex flex-wrap items-center gap-4 py-5">
                <div className="min-w-[180px] flex-1">
                  <p className="text-base font-medium">{line.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {line.price === null ? "Price not published yet" : formatMoney(line.price, line.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${line.name}`}
                    className="size-9 rounded-md border border-border hover:bg-surface"
                    onClick={() => setQuantity(line.slug, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="numeral w-8 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${line.name}`}
                    className="size-9 rounded-md border border-border hover:bg-surface"
                    onClick={() => setQuantity(line.slug, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  onClick={() => remove(line.slug)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-lg border border-border p-6">
            <h2 className="label-xs">Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="numeral">
                {subtotal === null ? "—" : formatMoney(subtotal, lines[0]?.currency ?? "USD")}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shipping and taxes are calculated at checkout.
            </p>

            <button
              type="button"
              disabled
              onClick={() => trackStoreEvent("BEGIN_CHECKOUT")}
              className="mt-6 w-full rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to checkout
            </button>
            <PendingNote>
              Checkout opens once pricing, shipping and returns are confirmed. Your bag is saved on
              this device in the meantime.
            </PendingNote>
          </aside>
        </div>
      )}
    </Section>
  );
}
