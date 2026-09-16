import { createFileRoute } from "@tanstack/react-router";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { BRAND } from "@/lib/store-content";

const TITLE = "Shipping, returns and policies — DOG CAR LIFE";
const DESCRIPTION =
  "Our shipping, returns, privacy and terms information for DOG CAR LIFE, published as each is confirmed.";

export const Route = createFileRoute("/_store/policies")({
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
  component: Policies,
});

const SECTIONS = [
  {
    title: "Shipping",
    body: "Delivery options, carriers and estimated times will be published once the fulfilment partner is confirmed. Nothing is shipped until then.",
  },
  {
    title: "Returns",
    body: "The return window and the process for starting a return will be published before the first order is accepted.",
  },
  {
    title: "Guarantee",
    body: "Any guarantee we offer will be stated in full here, with its conditions, rather than as a badge on a product page.",
  },
  {
    title: "Privacy",
    body: "We will publish exactly what we collect, why, and how to have it removed. No marketing data is collected on this site today.",
  },
  {
    title: "Terms",
    body: "Terms of sale will be published alongside the first live price.",
  },
];

function Policies() {
  return (
    <Section>
      <Eyebrow>Policies</Eyebrow>
      <h1 className="display mt-3 text-4xl sm:text-5xl">Shipping, returns and the fine print.</h1>
      <PendingNote>
        {BRAND.mark} is preparing for launch. These policies are being finalised and will be
        published in full before any order can be placed.
      </PendingNote>

      <dl className="mt-10 divide-y divide-border border-y border-border">
        {SECTIONS.map((s) => (
          <div key={s.title} className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
            <dt className="text-base font-medium">{s.title}</dt>
            <dd className="max-w-2xl text-sm text-muted-foreground">{s.body}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
