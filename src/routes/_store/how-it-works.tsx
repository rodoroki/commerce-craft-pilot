import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { KIT_COMPONENTS, STEPS } from "@/lib/store-content";
import lifestyleImage from "@/assets/store-lifestyle.jpg";

const TITLE = "How the Fur Rescue Kit works — DOG CAR LIFE";
const DESCRIPTION =
  "Scrape, detail, collect, store. The four-step routine for getting dog hair out of your car after every ride.";

export const Route = createFileRoute("/_store/how-it-works")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <>
      <Section className="pb-8">
        <Eyebrow>How it works</Eyebrow>
        <h1 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">
          A two-minute routine, not a weekend job.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          The kit is built around one sequence. Do it after the ride, while the hair is still loose,
          and it never gets the chance to build up.
        </p>
      </Section>

      <Section className="pt-0">
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.code} className="bg-background p-8">
              <div className="numeral text-xs text-muted-foreground">0{i + 1}</div>
              <h2 className="display mt-2 text-2xl">{step.code}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Eyebrow>What each piece does</Eyebrow>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {KIT_COMPONENTS.map((part) => (
            <div key={part.code} className="grid gap-2 py-5 sm:grid-cols-[120px_1fr]">
              <dt className="text-base font-medium">
                <span className="numeral mr-2 text-xs text-muted-foreground">{part.code}</span>
                {part.name}
              </dt>
              <dd className="text-sm text-muted-foreground">{part.role}</dd>
            </div>
          ))}
        </dl>
        <PendingNote>
          Materials, dimensions and care instructions are being confirmed with the manufacturer and
          will be published here.
        </PendingNote>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <img
            src={lifestyleImage}
            alt="A dog looking out of an open car boot at sunrise"
            width={1408}
            height={1008}
            loading="lazy"
            className="w-full rounded-lg object-cover"
          />
          <div>
            <h2 className="display text-3xl sm:text-4xl">Made to stay in the car.</h2>
            <p className="mt-4 text-muted-foreground">
              The pouch keeps the four pieces together in a door pocket or boot, so the kit is there
              when the hair is — not in a cupboard at home.
            </p>
            <Link
              to="/product/$slug"
              params={{ slug: "fur-rescue-kit" }}
              className="mt-8 inline-block rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              See the kit
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
