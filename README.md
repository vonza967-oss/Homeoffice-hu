# Homeoffice

A Hungarian visual storefront concept with 76 distinct real product references. It is not an operating retailer.

## Product-led architecture
- `index.html`: compact global navigation, three full-width product campaigns, six paired product panels, a horizontal discovery rail and a restrained footer. The homepage intentionally contains no full catalog grid.
- `shop.html`: a separate store, photo category navigation, all 76 descriptive Hungarian product names, category/creative filters, favorites and search.
- `storefront.css`: shared responsive design system, monochrome controls and natural wood photography. The old `styles.css`/`refinements.css` are historical and are not loaded.
- `app.js`: shared accessible product dialogs, demo bag, local favorites, search and mobile navigation.
- `scripts/catalog.cjs`: canonical loader for catalog.json and catalog-expansion.json.
- `scripts/campaign.cjs`: high-resolution original manufacturer photographs for campaign areas, including the manufacturer's actual transparent mouse PNG. No AI product art or reconstructed products.

Node 22+: npm install, npm test, npm run build, npm start. Browser checks: npx playwright install chromium; npm run qa. The existing single Pages deployment workflow runs source checks, image validation, desktop/mobile browser checks, publication and exact-commit public-URL verification. Review workflows do not publish.

The layout references the product-first architecture of Apple's homepage and separate store, not its branding or product imagery. Homeoffice is independent. Original manufacturer/model/source identities remain in every detail dialog. Rights to original photographs remain with their owners and must be cleared before commercial reuse. No prices, ratings, inventory, supplier agreements, independent quality tests, payments or real orders are claimed. The cart and favorites use browser localStorage only.
