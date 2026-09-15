# Public Storefront — DOG CAR LIFE™ v1.0

Build the buyer-facing store as a separate, public experience in front of the existing internal engine. Nothing internal (scores, suppliers, evidence, experiments, decisions) is ever visible to a shopper.

## Structure

The internal Commerce Intelligence Engine moves behind `/admin` and keeps every current screen and behaviour untouched. The public store takes over the front door:

- `/` — home: hero, the problem, the kit, how it works, demonstration slot, benefits, trust, short FAQ, final call to action
- `/product/fur-rescue-kit` — full product page: media, name, core benefit, price, add to cart, demonstration, problem, how it works, benefits, what's in the kit, specifications, shipping, returns, FAQ, closing call to action
- `/how-it-works`, `/about`, `/faq` — short supporting pages
- `/cart` — simple bag: item, quantity, price, subtotal, then a single continue button that hands off to the real commercial checkout once it exists

Navigation is just the brand mark, Shop, How it works, About, FAQ and the bag. Mobile shows brand, menu, bag, and keeps the buy action always reachable.

## Content and data honesty

Product name, description and price come from the real record already in the system. Anything not yet filled in (final price, dimensions, materials, kit contents, shipping times, return window) is shown as a quiet "details coming" line, never as `$0`, never invented, and never fake reviews, ratings, counters or badges. The FAQ only answers what real product data supports; unanswered objections are listed in the roadmap as data to collect.

Brand and lifestyle imagery (dog in a clean car, editorial outdoor tone) is generated for the hero and mood sections. Real product photography and the demonstration video get properly sized, clearly labelled empty slots until the real assets arrive.

## Look

Editorial, premium, outdoor/automotive. Strong type, generous space, photography-led, quiet confidence. No neon, gradients, glassmorphism, heavy shadows, endless cards or emoji. Mobile is designed first.

## Technical notes

- Storefront layout lives in its own route group with its own header/footer, separate from the admin shell; the current `_authenticated` tree is re-parented under `/admin` and its internal links updated.
- Product read is a public, read-only query limited to shopper-safe columns, with a narrow anonymous read policy for that one product; no internal tables are exposed.
- A small client-side bag (local storage) holds the item until checkout handoff; no parallel stock or order system is created.
- An event layer (`PAGE_VIEW`, `PRODUCT_VIEW`, `CTA_CLICK`, `ADD_TO_CART`, `FAQ_OPEN`, `SCROLL_DEPTH`, `VIDEO_PLAY`, `BEGIN_CHECKOUT`) is written as one module with a no-op sink until a real destination is configured — nothing is faked.
- Per-page titles, descriptions, canonical and Open Graph tags, plus Organization, Product/Offer and FAQ structured data; lazy images, semantic markup, alt text, visible focus, keyboard support.
- Friendly error and empty states; no technical strings ever reach the shopper.
