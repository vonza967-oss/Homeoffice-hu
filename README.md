# Homeoffice

A Hungarian visual storefront concept with a curated set of distinct real product references. It is not an operating retailer.

## Product-led architecture
- `index.html`: compact global navigation, three full-width product campaigns, paired product panels, a restrained footer. The homepage intentionally contains no full catalog grid.
- `shop.html`: a separate store, photo category navigation, descriptive Hungarian product names, category/creative filters, favorites and search.
- `storefront.css`: shared responsive design system, monochrome controls and natural wood photography. The old `styles.css`/`refinements.css` are historical and are not loaded.
- `app.js`: shared accessible product dialogs, demo bag, local favorites, search and mobile navigation.
- `scripts/catalog.cjs`: canonical loader for catalog.json and catalog-expansion.json.
- `scripts/campaign.cjs`: high-resolution original manufacturer photographs for campaign areas, including the manufacturer's actual transparent mouse PNG. No AI product art or reconstructed products.

Node 22+: npm install, npm test, npm run build, npm start. Browser checks: npx playwright install chromium; npm run qa. The existing single Pages deployment workflow runs source checks, image validation, desktop/mobile browser checks, publication and exact-commit public-URL verification. Review workflows do not publish.

The layout references the product-first architecture of Apple's homepage and separate store, not its branding or product imagery. Homeoffice is independent. Original manufacturer/model/source identities remain in every detail dialog. Rights to original photographs remain with their owners and must be cleared before commercial reuse. No prices, ratings, inventory, supplier agreements, independent quality tests, payments or real orders are claimed. The cart and favorites use browser localStorage only.


The Fitnesz category presents a WalkingPad C2 walking pad and a DeskCycle 2 seated pedal exerciser. The former Aktív munka category and the Oakywood Classic desk are retired from published pages, search, favorites and the demo bag. Product references are not confirmed supplier agreements.

The Docking category includes Satechi Thunderbolt 4 and CalDigit TS4 references; its category image and home panel use a standalone Satechi product photo. The Tools category thumbnail uses the Satechi SM1 keyboard, and the Satechi M1 mouse is included. Stands now include a VIVO dual monitor arm; the BALOLO tablet, Stream Deck Plus and rotating accessory holders, plus the Oakywood dual laptop holder, the Oakywood modular desktop drawer and the walnut organizer tray are retired.

Audio contains Mikrofonok, Fejhallgatók and Fülhallgatók, with two sourced references in each type. Product-type filters retain their state in the URL and work with search and favorites.
