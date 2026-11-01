# Homeoffice development rules

The user wants an Apple-like page structure, not a generic monochrome gallery. Preserve the new product-led architecture: compact navigation, full-width centered campaigns, paired photographic feature panels and a separate shop.html catalog. Do not put the 76-product grid back on the homepage. Keep original Homeoffice identity and no Apple branding.

- There are 76 real references in the canonical scripts/catalog.cjs loader. Preserve all ten categories and creative flags. Cards have only original photos and clear descriptive Hungarian names, never invented aliases.
- Current UI files: index.html, shop.html, storefront.css, app.js. Historical styles.css and refinements.css are not loaded. No framework migration needed.
- scripts/build.cjs downloads and optimizes original photos; scripts/campaign.cjs prepares six original high-resolution campaign assets. Do not synthesize product images, remove logos or change product geometry.
- Keep real manufacturer, model, source URL and descriptions in the accessible dialog. Do not invent stock, prices, reviews, verified quality, brand affiliation or supplier contracts.
- This is a non-commercial visual demo. No orders, payment, personal data, tracking or analytics. Cart and favorites stay in localStorage.
- Run npm test, npm run build, npm run qa. Check the actual home, store and product-detail screenshots on desktop and mobile. Preserve 1440/1024/768/390/320px behavior, no overflow, reduced motion, keyboard focus, Escape, mobile menu and cross-page persistence.
- The existing single deploy-pages workflow is the only publisher. It validates source, images and browser behavior, then verifies the exact published commit. Review workflows may export screenshots but do not publish.
- Do not commit temporary QA files or reference screenshots. Commercial photo reuse still requires authorization.
