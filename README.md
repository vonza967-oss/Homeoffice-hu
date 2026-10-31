# Homeoffice.hu — prémium home office webshop (demó)

Ez a repository egy **önálló, egyfájlos, azonnal megnyitható interaktív prototípus**. A Lovable-kódtól független vizuális kiindulás a későbbi Codex-fejlesztéshez.

## Indítás
Nyisd meg az `index.html`-t böngészőben, vagy Node.js 18+ esetén:

```bash
npm run dev
# http://127.0.0.1:3000
```

A demó **45 terméket, 9 kategóriát és 3 stíluskollekciót** tartalmaz. Működik a keresés, rendezés, kategória- és termékoldal, kedvencek, demókosár és a mobilnavigáció. A képek beágyazott SVG koncepcióillusztrációk.

**Nem éles webshop.** A 9 Alibaba-link csupán beszállítói lead, a többi 36 termék koncepció. Az árak nem végleges ajánlatok. Rendelés, fizetés, hírlevél-adatgyűjtés, és valódi vásárlói adatok kezelése nincs bekapcsolva.

## Következő lépés Codexszel
A `docs/CODEX_START.md` részletezi a következő feladatot. A `AGENTS.md` tartalmazza a kötelező projektkorlátokat. A mostani `index.html` a referencia-implementáció: **ne töröld vagy írd át egyetlen lépésben**, amíg az új Next.js/TypeScript app funkcionális és vizuális paritása nincs ellenőrizve.

## Tesztek

```bash
npm test
```

A tesztek a beágyazott katalógus és a demó-funkciók invariánsait ellenőrzik. A teljes böngészős E2E tesztelés továbbra is ajánlott.

A Homeoffice.hu domain nincs csatlakoztatva.