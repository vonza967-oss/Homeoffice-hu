# Homeoffice.hu — Codex fejlesztői utasítások

- Magyar nyelvű prémium, minimalista home office webshop. Referencia: a gyökér `index.html` működő, egydokumentumos demó.
- **Az új alkalmazást ne hozd létre éles kereskedelmi rendszerként.** Fizetést, rendelést, valódi ügyféladat-gyűjtést és éles deployt ne aktiválj külön felhasználói jóváhagyás nélkül.
- 45 termék: 9 Alibaba-beszállítói referencia (nem ellenőrzött dropshipping ajánlat), 36 fiktív koncepció. 9 kategória, 3 kollekció: Minimal Setup, Warm Wood, Dark Workspace.
- A képek mind koncepcióillusztrációk, nem ellenőrzött gyártói termékfotók. Árak demonstrációs összegek, nem valódi ajánlatok. Valós `price` mező maradjon null a tényleges beszállítói/adó/logisztikai ellenőrzésig.
- Ne találj ki szállítási időt, készletet, garanciát, termékértékelést, céges adatokat vagy végleges jogi dokumentumokat.
- Preferált cél stack: Next.js App Router + TypeScript + Tailwind. Migrálj inkrementálisan, ellenőrizd a régi és új UI-t funkciónként.
- A meglévő `index.html` változatot tartsd meg `reference/legacy-demo.html` néven az áttérés során. Új kód mellett automatizált teszteket adj hozzá.
- Funkciók: reszponzív kezdőlap, keresés/rendezés, 9 kategória, 3 kollekció, 45 termékoldal, kedvencek, böngészőben tárolt demókosár, 404, akadálymentes mobilmenü.
- Ne csatlakoztass Supabase/Shopify/Stripe rendszert előzetes igény nélkül.
- Az `npm test` parancsnak sikeresnek kell lennie; ellenőrizd desktop és mobil böngészőben is a felületet, ha a futtatókörnyezet támogatja.

## Első Codex feladat

"Olvasd el az AGENTS.md-t és a README-t. Futtasd az npm test-et. Vizsgáld meg a működő index.html webshopot. Készíts fokozatos migrációt Next.js + TypeScript + Tailwind alapokra, az eredeti design és minden katalógusfunkció megőrzésével. Ne kapcsolj be valódi checkoutot. Tesztelj, majd nyiss pull requestet."
