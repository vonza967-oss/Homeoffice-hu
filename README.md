# Homeoffice Studio

A complete monochrome reconstruction of the Hungarian Homeoffice concept: 28 distinct manufacturer product references across eight categories, original photography, short display aliases, original maker/model and factual details on click. Includes accent-insensitive search, category/wood filters, favorites, direct product links and a persistent local demo cart.

Live concept: https://vonza967-oss.github.io/Homeoffice-hu/

## Run
Node 22+: `npm install`, `npm test`, `npm run build`, `npm start`. The build needs internet to retrieve the explicitly sourced photographs. Install Chromium with `npx playwright install chromium`, then `npm run qa`.

`catalog.json` contains every original manufacturer, model, description, product URL and image URL. `styles.css` and `refinements.css` define the neutral visual system. The build optimizes original photos into self-hosted WebP assets; visitors do not depend on external image hotlinks.

## Verification
The single Pages workflow gates publication on source tests, successful image downloads and browser checks. QA covers all 28 detail dialogs, all eight categories, search, empty states, favorites, cart quantity/removal/persistence, focus restoration, Escape and direct product URLs. Viewports: 1440, 768, 390 and 320 pixels. The workflow saves screenshots and JSON evidence in `homeoffice-visual-qa`. After deployment it verifies the exact commit through the public `version.json`, repeats browser checks on the public URL and saves `homeoffice-live-qa`.

## Demo scope
This is a non-commercial visual concept, not a live store. No retail price, stock, shipping, warranty, independent quality guarantee, supplier agreement or brand affiliation is implied. Aliases are presentation names only. Original manufacturer identities remain visible in the details. Rights to photography remain with the original owners; commercial reuse requires permission. No checkout, payment, customer data collection or analytics is enabled. Favorites and cart stay in this browser's localStorage.
