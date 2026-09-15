import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { BRAND, KIT_COMPONENTS, STEPS, BENEFITS, FAQS } from "@/lib/store-content";
import { trackStoreEvent } from "@/lib/store-events";
import heroImage from "@/assets/store-hero.jpg";
import problemImage from "@/assets/store-problem.jpg";
import lifestyleImage from "@/assets/store-lifestyle.jpg";

const TITLE = "DOG CAR LIFE — Gear for people who drive with their dogs";
const DESCRIPTION =
  "The Fur Rescue Kit: a four-piece system for getting dog hair out of your car seats, mats and upholstery after every ride.";

export const Route = createFileRoute("/_store/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useEffect(() => {
    trackStoreEvent("PAGE_VIEW", { page: "home" });
  }, []);

  return (
    <>
      <section className="relative">
        <img
          src={heroImage}
          alt="A dog sitting calmly on the clean back seat of a car at sunset"
          width={1920}
          height={1200}
          className="h-[68vh] min-h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/35" aria-hidden />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-20">
            <p className="label-xs text-background/80">{BRAND.mark}</p>
            <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.05] text-background sm:text-6xl">
              Take the dog. Keep the car.
            </h1>
            <p className="mt-4 max-w-md text-base text-background/90">
              The Fur Rescue Kit — four pieces that get dog hair out of your seats and mats in
              minutes, then live in the car for the next ride.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/product/$slug"
                params={{ slug: "fur-rescue-kit" }}
                onClick={() => trackStoreEvent("CTA_CLICK", { location: "hero" })}
                className="rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                See the kit
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-md border border-background/60 px-6 py-3 text-sm text-background transition-colors hover:bg-background/10"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img
            src={problemImage}
            alt="Dog hair woven into a grey fabric car seat and floor mat"
            width={1408}
            height={1008}
            loading="lazy"
            className="w-full rounded-lg object-cover"
          />
          <div>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Hair does not vacuum out.</h2>
            <p className="mt-4 text-muted-foreground">
              It twists into the weave of the seat and stays there. Lint rollers pick up the top
              layer, vacuums pass over the rest, and every ride adds more. Most dog owners simply
              stop noticing — or stop bringing the dog.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Eyebrow>The kit</Eyebrow>
        <h2 className="display mt-3 text-3xl sm:text-4xl">Four pieces. One job.</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {KIT_COMPONENTS.map((part) => (
            <div key={part.code} className="border-t border-border pt-4">
              <div className="numeral text-xs text-muted-foreground">{part.code}</div>
              <h3 className="mt-2 text-base font-medium">{part.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{part.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            to="/product/$slug"
            params={{ slug: "fur-rescue-kit" }}
            onClick={() => trackStoreEvent("CTA_CLICK", { location: "kit" })}
            className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View the Fur Rescue Kit
          </Link>
        </div>
      </Section>

      <Section>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="display mt-3 text-3xl sm:text-4xl">Four steps, after the ride.</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.code} className="border-t border-border pt-4">
              <div className="numeral text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="label-xs mt-2">{step.code}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="pt-0">
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface">
          <div className="px-6 text-center">
            <p className="label-xs">Demonstration</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The demonstration video is being filmed with the real kit. It will appear here — we
              would rather show nothing than stock footage.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Why it matters</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-4xl">
              The car stops being the reason to leave the dog at home.
            </h2>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.title}>
                  <dt className="text-base font-medium">{b.title}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{b.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src={lifestyleImage}
            alt="A dog standing on a blanket in an open car boot at a quiet trailhead"
            width={1408}
            height={1008}
            loading="lazy"
            className="w-full rounded-lg object-cover"
          />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Straight answers.</h2>
            <PendingNote>
              Where we do not have confirmed information yet, we say so instead of guessing.
            </PendingNote>
          </div>
          <dl className="divide-y divide-border border-y border-border">
            {FAQS.slice(0, 4).map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="text-base font-medium">{faq.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-8">
          <Link to="/faq" className="text-sm underline underline-offset-4 hover:opacity-70">
            Read all questions
          </Link>
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <h2 className="display mx-auto max-w-2xl text-3xl sm:text-5xl">{BRAND.tagline}</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">{BRAND.purpose}</p>
        <div className="mt-8">
          <Link
            to="/product/$slug"
            params={{ slug: "fur-rescue-kit" }}
            onClick={() => trackStoreEvent("CTA_CLICK", { location: "footer_cta" })}
            className="inline-block rounded-md bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            See the Fur Rescue Kit
          </Link>
        </div>
      </Section>
    </>
  );
}
