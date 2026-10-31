# Homeoffice Studio

Hungarian monochrome product-reference concept: 76 distinct real products across ten categories. Original product photographs, clear Hungarian descriptive names, and maker/model/source details on click. The collection adds 48 useful and creative workspace products to the previous 28, not color variants of the same item.

Live concept: https://vonza967-oss.github.io/Homeoffice-hu/

## Run
Node 22+: `npm install`, `npm test`, `npm run build`, `npm start`. The build requires internet access to retrieve the sourced photographs. Install Chromium with `npx playwright install chromium`, then `npm run qa`.

`scripts/catalog.cjs` is the canonical catalog loader. It merges `catalog.json` and `catalog-expansion.json`, replaces the legacy display aliases with meaningful names, checks uniqueness and balances the initial product order. All records preserve the original maker, model, description, product URL and exact image source. `image-sources.json` records explicit alternative manufacturer image URLs.

`styles.css` and `refinements.css` preserve the neutral visual system. Product cards contain only image and name. Descriptions remain in product dialogs. The new cross-category **Ötletes megoldások** filter highlights multifunctional and distinctive products. The ten product families include **Fókusz** and **Aktív munka**.

## Verification
The single Pages workflow gates publication on source tests, valid original photographs and browser checks. QA covers all 76 product dialogs, all ten categories, the creative filter, accented/unaccented search, empty states, favorites, cart quantity/removal/persistence, focus restoration, Escape and deep links. Long product names are checked for clipping. Viewports: 1440, 768, 390 and 320 pixels.

The workflow saves screenshots and JSON results in `homeoffice-visual-qa`, then verifies the exact deployed commit at the public URL and saves `homeoffice-live-qa`. An auxiliary review workflow can build and inspect a feature branch without publishing it. Original photographs are optimized into self-hosted WebP assets; visitors do not depend on external hotlinks.

## Demo scope
This is a non-commercial visual concept, not an operating store. No price, stock, delivery, warranty, independent quality guarantee, supplier agreement or brand affiliation is implied. Descriptive names identify the actual product rather than inventing a new brand. Manufacturer identities and sources remain visible. Where the source is a retailer, its role is identified.

Rights to photographs remain with the original owners; commercial reuse requires permission. No checkout, payment, accounts, personal-data capture or analytics is enabled. Favorites and demo cart use this browser's localStorage only.
