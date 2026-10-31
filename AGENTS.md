# Homeoffice.hu · fejlesztői szabályok (Codex)

- A gyökér `index.html` a jelenlegi működő, magyar nyelvű prémium statikus koncepció. Őrizd meg a visszafogott tipográfiát, nagy vizuális felületeket, reszponzív elrendezést és a független Homeoffice márkaidentitást. Ne másold az Apple logóját vagy oldalát.
- A katalógus jelenleg **11 valódi Alibaba-hivatkozásból** áll, eredeti, külső CDN-ről hivatkozott beszállítói termékképekkel és magyar szerkesztett leírásokkal. Ne állíts valótlan adatot vagy tartozékot egy termékhez; minden adatot a forráslinken ellenőrizz.
- Eredeti termékfotók: használatuk jogszerűségét éles kereskedelem előtt tisztázni kell. Külső kép nem garantáltan tartós.
- A feltüntetett USD ár Alibaba B2B referencia, nem hazai fogyasztói ajánlat. Ne találj ki végleges HUF árat, ÁFÁ-t, logisztikát, jótállást, értékelést vagy készletet.
- **Tilos élesíteni rendelést, fizetést, személyesadat-gyűjtést a felhasználó kifejezett jóváhagyása nélkül.** A demókosár csak localStorage.
- Funkciók: reszponzív kezdőlap, kategóriaszűrés, keresés, termékmodál, kedvencek, demókosár, eredeti termékforrások megnyitása. Mindet ellenőrizd változtatás után.
- A `main` ágról a `.github/workflows/deploy-pages.yml` teszi közzé az oldalt; ne hozz létre versengő Pages-telepítéseket.
- Futtasd az `npm test`-et. Érdemi UI-módosítás után desktop- és mobilböngészős teszt ajánlott.
- Lehetséges későbbi stack: Next.js + TypeScript + Tailwind, de migráció csak tervvel, az aktuális arculat és viselkedés megőrzésével.
