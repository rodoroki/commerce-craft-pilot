import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow } from "@/components/store/chrome";
import { BRAND } from "@/lib/store-content";
import heroImage from "@/assets/store-hero.jpg";

const TITLE = "About DOG CAR LIFE — gear for driving with dogs";
const DESCRIPTION =
  "DOG CAR LIFE makes gear for people who take their dogs along. We start with the car, because that is where most trips begin.";

export const Route = createFileRoute("/_store/about")({
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
  component: About,
});

function About() {
  return (
    <>
      <Section className="pb-8">
        <Eyebrow>About</Eyebrow>
        <h1 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">
          The dog should come along.
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">{BRAND.positioningLine}</p>
      </Section>

      <Section className="pt-0">
        <img
          src={heroImage}
          alt="A dog riding in a clean car with open landscape outside the window"
          width={1920}
          height={1200}
          loading="lazy"
          className="h-[380px] w-full rounded-lg object-cover sm:h-[520px]"
        />
      </Section>

      <Section className="border-y border-border bg-surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="display text-3xl">What we make</h2>
            <p className="mt-4 text-muted-foreground">
              Small, specific pieces of gear for the parts of dog ownership that are genuinely
              annoying. Each one has to earn its place in the car. The Fur Rescue Kit is the first.
            </p>
          </div>
          <div>
            <h2 className="display text-3xl">How we work</h2>
            <p className="mt-4 text-muted-foreground">
              We publish what we know and mark what we do not. No invented reviews, no countdown
              timers, no numbers we cannot stand behind. When a detail is still being confirmed with
              the manufacturer, it says so on the page.
            </p>
          </div>
        </div>
      </Section>

      <Section className="text-center">
        <h2 className="display text-3xl sm:text-4xl">{BRAND.tagline}</h2>
        <Link
          to="/product/$slug"
          params={{ slug: "fur-rescue-kit" }}
          className="mt-8 inline-block rounded-md bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          See the Fur Rescue Kit
        </Link>
      </Section>
    </>
  );
}
