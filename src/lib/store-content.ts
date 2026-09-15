/**
 * Buyer-facing copy for DOG CAR LIFE™.
 *
 * Only claims that follow from information we actually hold are stated as
 * fact. Anything not yet confirmed (materials, dimensions, shipping times,
 * return window, guarantee) is marked as pending, never invented.
 */

export const BRAND = {
  name: "DOG CAR LIFE",
  mark: "DOG CAR LIFE™",
  tagline: "Better rides. Happier dogs.",
  purpose:
    "Thoughtful gear for people who drive with their dogs — made so the journey stays as good as the destination.",
  market: "United States",
} as const;

export const KIT_COMPONENTS = [
  { code: "01", name: "Scraper", role: "Lifts hair that is woven into fabric seats and mats." },
  { code: "02", name: "Detail brush", role: "Reaches seams, edges, door panels and tight corners." },
  { code: "03", name: "Collector / roller", role: "Gathers the loosened hair so it leaves the car with you." },
  { code: "04", name: "Carry pouch", role: "Keeps the kit together and stored in the car." },
] as const;

export const STEPS = [
  { code: "SCRAPE", text: "Work the scraper over the seat or mat to release embedded hair." },
  { code: "DETAIL", text: "Run the brush along seams and edges where hair collects." },
  { code: "COLLECT", text: "Pick the loosened hair up with the collector." },
  { code: "DONE", text: "Pouch it, keep it in the car, repeat after the next ride." },
] as const;

export const BENEFITS = [
  { title: "Less mess", text: "Hair stays off the seats instead of spreading through the car." },
  { title: "Quick cleanup", text: "A short pass after the ride instead of a weekend job." },
  { title: "Made for dog owners", text: "Built around the real routine of driving with a dog." },
  { title: "Easy to carry", text: "Small enough to live in the car, not in the garage." },
] as const;

export type Faq = { q: string; a: string; pending?: boolean };

export const FAQS: Faq[] = [
  {
    q: "What comes in the kit?",
    a: "Four pieces: a scraper, a detail brush, a collector/roller and a carry pouch.",
  },
  {
    q: "How do I use it?",
    a: "Scrape, detail the edges, collect the loosened hair, then store the kit in the pouch. No instructions needed beyond that.",
  },
  {
    q: "Where does it work?",
    a: "It is made for car interiors — fabric seats, floor mats and carpeted areas. Exact surface guidance is being confirmed with the manufacturer before we publish it.",
    pending: true,
  },
  {
    q: "Is it reusable?",
    a: "The kit is designed to stay in the car and be used ride after ride. Care and cleaning instructions will be published once confirmed.",
    pending: true,
  },
  {
    q: "What does it cost?",
    a: "Pricing is being finalised. It will be published here before the kit goes on sale — no placeholder price is shown in the meantime.",
    pending: true,
  },
  {
    q: "How does shipping work?",
    a: "Shipping options and delivery times will be published when the fulfilment partner is confirmed.",
    pending: true,
  },
  {
    q: "What is the return policy?",
    a: "The return window and process will be published before the first order is taken.",
    pending: true,
  },
];

export const PENDING_LABEL = "Being confirmed";
