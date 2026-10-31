# Homeoffice Studio

Hungarian, non-commercial product-reference storefront. The authorized collection contains 76 distinct real products across ten categories, including active work and focus tools. Never imply secured suppliers, independent quality tests, stock, brand affiliation or availability to purchase.

- Independent Homeoffice identity. Black, white and gray UI with natural wood photography. No Apple logos, invented reviews, prices, warranty or health promises.
- Cards contain only an original photograph and a clear Hungarian descriptive name. Do not reinstate invented aliases such as Aero, Rise or Link. Preserve original maker/model/source and factual descriptions in the accessible detail dialog.
- The canonical loader is scripts/catalog.cjs. It merges catalog.json and catalog-expansion.json and applies the descriptive names. Build, source tests and browser QA must use this same loader.
- The creative flag powers the cross-category Ötletes megoldások filter. Highlight actual distinctive functions, not unsupported marketing claims. Keep every source URL unique; do not inflate the product count with color variants.
- Build retrieves exact sourced photographs and creates self-hosted WebP images with neutral padding. Never alter product geometry or substitute invented illustrations. Rights remain with the owners; commercial reuse requires authorization.
- No payments, actual orders, accounts, analytics or personal-data collection. Favorites and demo cart use localStorage only.
- Run npm test, npm run build and npm run qa. Inspect screenshots, not just green tests. Only the existing Pages workflow publishes; it validates photos and desktop/mobile interactions, then tests the exact deployed commit at the public URL.
- Keep responsive layouts at 1440/768/390/320px, readable long product names, keyboard focus restoration, native dialog Escape, visible mobile close control, reduced motion, accent-insensitive search, truthful attribution and no horizontal overflow.
- Review workflows may build and export screenshots without deploying. Do not commit temporary QA screenshots or debug output.
