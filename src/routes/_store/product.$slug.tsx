import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { getStorefrontProduct } from "@/lib/storefront.functions";
import { KIT_COMPONENTS, STEPS, BENEFITS, FAQS, PENDING_LABEL, BRAND } from "@/lib/store-content";
import { useCart, formatMoney } from "@/lib/cart";
import { trackStoreEvent } from "@/lib/store-events";
import heroImage from "@/assets/store-hero.jpg";
import problemImage from "@/assets/store-problem.jpg";

export const Route = createFileRoute("/_store/product/$slug")({
  loader: async ({ params }) => {
    const product = await getStorefrontProduct({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — DOG CAR LIFE" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${BRAND.mark}`;
    const description =
      product.concept?.slice(0, 155) ??
      "A four-piece kit for getting dog hair out of your car after every ride.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <Section>
      <h1 className="display text-3xl">This page could not be loaded.</h1>
      <p className="mt-3 text-muted-foreground">
        Please try again in a moment, or{" "}
        <Link to="/" className="underline underline-offset-4">
          go back to the homepage
        </Link>
        .
      </p>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <h1 className="display text-3xl">We could not find that product.</h1>
      <p className="mt-3 text-muted-foreground">
        It may have been renamed.{" "}
        <Link to="/" className="underline underline-offset-4">
          See what we make
        </Link>
        .
      </p>
    </Section>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const available = product.price !== null;

  useEffect(() => {
    trackStoreEvent("PRODUCT_VIEW", { slug: product.slug });
  }, [product.slug]);

  const gallery = product.images.length > 0 ? product.images : [];

  return (
    <>
      <Section className="pb-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            {gallery.length > 0 ? (
              <div className="space-y-4">
                {gallery.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={product.name}
                    loading="lazy"
                    className="w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface">
                <div className="px-8 text-center">
                  <p className="label-xs">Product photography</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Photographs of the real kit are being produced. They will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>{BRAND.mark}</Eyebrow>
            <h1 className="display mt-3 text-4xl sm:text-5xl">{product.name}</h1>
            {product.concept ? (
              <p className="mt-4 text-muted-foreground">{product.concept}</p>
            ) : null}

            <div className="mt-8 border-t border-border pt-6">
              {available ? (
                <p className="numeral text-2xl">{formatMoney(product.price!, product.currency)}</p>
              ) : (
                <>
                  <p className="text-base font-medium">Price not published yet</p>
                  <PendingNote>
                    Pricing is being finalised. We publish a price only when it is real — never a
                    placeholder.
                  </PendingNote>
                </>
              )}

              <button
                type="button"
                disabled={!available}
                onClick={() => {
                  add({
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    currency: product.currency,
                  });
                  setAdded(true);
                }}
                className="mt-6 w-full rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {available ? "Add to bag" : "Not yet available"}
              </button>

              {added ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Added.{" "}
                  <Link to="/cart" className="underline underline-offset-4">
                    View your bag
                  </Link>
                </p>
              ) : null}

              {!available ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  The kit is in final sourcing. Ordering opens once pricing, shipping and returns are
                  confirmed.
                </p>
              ) : null}
            </div>

            <dl className="mt-8 divide-y divide-border border-t border-border text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">In the kit</dt>
                <dd className="text-right">4 pieces</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-right">{PENDING_LABEL}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Returns</dt>
                <dd className="text-right">{PENDING_LABEL}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Materials &amp; dimensions</dt>
                <dd className="text-right">{PENDING_LABEL}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Hair does not vacuum out.</h2>
            <p className="mt-4 text-muted-foreground">
              It works into the weave of the seat and stays. This kit is built to break it loose and
              take it with you, in the car, right after the ride.
            </p>
          </div>
          <img
            src={problemImage}
            alt="Dog hair caught in the fabric of a car seat"
            width={1408}
            height={1008}
            loading="lazy"
            className="w-full rounded-lg object-cover"
          />
        </div>
      </Section>

      <Section>
        <Eyebrow>What is in the box</Eyebrow>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {KIT_COMPONENTS.map((part) => (
            <div key={part.code} className="border-t border-border pt-4">
              <div className="numeral text-xs text-muted-foreground">{part.code}</div>
              <h3 className="mt-2 text-base font-medium">{part.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{part.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface">
          <div className="px-6 text-center">
            <p className="label-xs">Demonstration</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A video of the kit in a real car is being filmed and will be published here.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Eyebrow>How to use it</Eyebrow>
        <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.code} className="border-t border-border pt-4">
              <div className="numeral text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="label-xs mt-2">{step.code}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Eyebrow>Why owners want it</Eyebrow>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="border-t border-border pt-4">
              <dt className="text-base font-medium">{b.title}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{b.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Before you buy</Eyebrow>
            <h2 className="display mt-3 text-3xl">Questions</h2>
          </div>
          <dl className="divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="text-base font-medium">{faq.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <section className="relative">
        <img
          src={heroImage}
          alt="A dog riding in a clean car"
          width={1920}
          height={1200}
          loading="lazy"
          className="h-[320px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-foreground/40" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
          <div>
            <h2 className="display text-3xl text-background sm:text-4xl">{BRAND.tagline}</h2>
            <Link
              to="/how-it-works"
              className="mt-6 inline-block rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
