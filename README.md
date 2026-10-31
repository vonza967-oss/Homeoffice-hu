# Homeoffice.hu · valós termékes prémium koncepció

Magyar nyelvű, egyfájlos, reszponzív bemutatókatalógus. Publikus előnézet: https://vonza967-oss.github.io/Homeoffice-hu/

## Mi található benne?
- 11 konkrét Alibaba-termék, mindegyik saját forráslinkkel és a beszállítói terméklaphoz kötött eredeti képpel.
- Magyar, a beszállítói adatok alapján szerkesztett leírások; az Alibaba USD nagykereskedelmi kiindulóára és MOQ szerepel.
- Apple-hangulatú, de önálló arculat: tipográfia, nagy légies terek, fókuszált termékkártyák, sötét hero.
- Kategóriaszűrés, keresés, termékrészletek, kedvencek, böngészőben tárolt demókosár.
- Nem lehet rendelni vagy fizetni; ügyféladatokat nem gyűjt.

## Futtatás
```bash
npm run dev
# http://127.0.0.1:3000
npm test
```

## Források és képek
A fotók az Alibaba CDN-ről jönnek, tehát külső kapcsolat szükséges; ha egy beszállító eltávolítja vagy tiltja a képet, az oldalon forráslinkes helyettesítés jelenik meg. A képek nyilvános elérhetősége **nem jelent automatikus újrafelhasználási engedélyt**. Éles kereskedelmi használathoz képhasználati jog és beszállítói megállapodás kell.

Az árak nagykereskedelmi referenciák (nem hazai fogyasztói eladási árak). Készletet, árfrissességet, jótállást, EU-megfelelőséget, áfát és szállítást még ellenőrizni kell.

## Publikálás
A `.github/workflows/deploy-pages.yml` statikus GitHub Pages telepítést végez a `main` ágról. A saját homeoffice.hu domaint még nem kötöttük ide. A kód forrása az `index.html`. Lásd `AGENTS.md` és `docs/CODEX_START.md`.
