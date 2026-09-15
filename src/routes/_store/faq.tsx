import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, Eyebrow, PendingNote } from "@/components/store/chrome";
import { FAQS, PENDING_LABEL } from "@/lib/store-content";
import { trackStoreEvent } from "@/lib/store-events";

const TITLE = "Frequently asked questions — DOG CAR LIFE";
const DESCRIPTION =
  "What comes in the Fur Rescue Kit, how to use it, and what we are still confirming before launch.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const Route = createFileRoute("/_store/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd) }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <Section className="pb-8">
        <Eyebrow>FAQ</Eyebrow>
        <h1 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">Questions, answered plainly.</h1>
        <PendingNote>
          Items marked “{PENDING_LABEL}” are not finalised yet. We publish them as soon as they are.
        </PendingNote>
      </Section>

      <Section className="pt-0">
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group py-5"
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) {
                  trackStoreEvent("FAQ_OPEN", { question: faq.q });
                }
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium">
                <span>{faq.q}</span>
                <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{faq.a}</p>
              {faq.pending ? (
                <p className="label-xs mt-3">{PENDING_LABEL}</p>
              ) : null}
            </details>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <p className="text-sm text-muted-foreground">
          Still unsure?{" "}
          <Link to="/how-it-works" className="underline underline-offset-4 hover:opacity-70">
            See how the kit works
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
