# Homeoffice Studio

A complete monochrome reconstruction of the Hungarian Homeoffice concept: 20 real product references, manufacturer photography, short display aliases, detailed original identity on click, categories, accent-insensitive search, favorites and a local demo cart.

Live concept: https://vonza967-oss.github.io/Homeoffice-hu/

## Run
Node 22+: `npm install`, `npm test`, `npm run build`, `npm start`. The build requires internet access to retrieve exactly sourced photographs. `npx playwright install chromium` then `npm run qa` checks images and interaction paths on desktop and mobile.

`catalog.json` records every maker, model, factual description, original product page and source image. No retail price, stock, delivery or product-quality guarantee is invented. Aliases are clearly identified as presentation names. Rights to photographs stay with their original owners; permission is needed before commercial reuse. This independent visual demo is not affiliated with the reference brands and cannot accept an order or payment.

The Pages workflow first validates and optimizes all photographs, tests the app, and records desktop/mobile screenshots plus a machine-readable report in its `homeoffice-visual-qa` artifact. Only successful runs deploy `_site`. No external product-image hotlinks are needed by visitors.
