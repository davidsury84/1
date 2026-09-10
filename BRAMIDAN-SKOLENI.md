# BRAMIDAN — školení: stacionární (vertikální) lisy

Interaktivní školicí materiál pro obchodníky ELKOPLAST CZ, postavený **1:1 na programové
šabloně** školení `zentex-skoleni.html` (repozitář `davidsury84/mobilnirozhlas`).

## Soubory

| Soubor | Obsah |
|---|---|
| `bramidan-skoleni.html` | Kompletní školení — jeden samostatný HTML soubor (~230 kB), bez externích závislostí |
| `assets/bramidan/*.webp` | Produktové fotografie všech 14 modelů |

Otevírá se přímo v prohlížeči, nebo se nasadí stejně jako ostatní školení
(`/api/bramidan-skoleni` pro ukládání výsledků testu — viz níže).

## Co šablona umí (převzato 1:1 ze Zentexu)

- **27 lekcí + závěrečný test**, kapitoly se procházejí po jedné a další se odemkne
  až po splnění té aktuální (označení „mám prostudováno" + vyřešená rychlá kontrola)
- **Gamifikace** — body, úrovně (Nováček → Mistr lisů Bramidan), 7 odznaků, konfety,
  plovoucí widget s postupem; ukládá se do `localStorage` per uživatel
- **10 rychlých kontrol** (mini-kvízy) rozmístěných v kapitolách, se zamíchanými odpověďmi
- **Kalkulačka úspor** (lekce 1) — produkce, materiál, model, objem kontejneru, cena odvozu
  → počet balíků, odvozy dnes / s lisem, roční úspora
- **Interaktivní průvodce výběrem lisu** (lekce 13) — rozhodovací strom pěti filtrů
  včetně dvou „neprodávat" výsledků (mokrý odpad → řada SW, sklo/suť/kov → žádný lis)
- **Hra „Patří to do lisu?"** (lekce 24) — 16 materiálů, tři koše
- **Hra „Poraď zákazníkovi"** (lekce 27) — 15 náhodných zákazníků, série, odznak
- **Otočné argumentační kartičky** (lekce 25) — 12 argumentů
- **Závěrečný test** — 20 náhodně losovaných otázek z banku 50, zamíchané odpovědi,
  hranice 80 %, max 3 pokusy, vysvětlení u každé odpovědi

### Napojení na intranet

Stejné jako u Zentexu, jen na jiném endpointu:

- identita se čte z hashe URL: `#kdo=<email>&jmeno=<jméno>`
- `GET /api/bramidan-skoleni?email=…` → `{ attemptsUsed, best }`
- `POST /api/bramidan-skoleni` → `{ email, name, correct, total, pct, passed }`

Bez přihlášení test funguje, jen se výsledek neukládá.

## Obsah školení

1. Proč vertikální lis — ekonomika balíkování · 2. Bramidan a mapa sortimentu ·
3. Značení a klíčové parametry · 4. Napájení 230 V vs. 400 V · 5.–7. Řada B
(B3, B4, B5 wide / B20, B30, B30 wide / B50, B50 XL SD) · 8.–9. Řada X
(X10, X25 / X30, X30 LP, X40 wide, X50) · 10. Balík: rozměry, hmotnost, vázání ·
11. Strop, hluk a prostor · 12. Materiály · 13. Výběr lisu — pět filtrů ·
14. Dimenzování · 15. Instalace, provoz, bezpečnost, servis · 16. FAQ ·
17. Argumentář a námitky · 18. Checklist + modelové situace · 19. Tahák všech
modelů + slovníček · 20. Jak vertikální lis pracuje · 21. Cenotvorba ·
22. Prodejní proces · 23. Vzorové dialogy · 24. Materiálová encyklopedie ·
25. Argumentační kartičky · 26. Dvanáct častých chyb · 27. Rychlé opakování — 40 faktů ·
28. Závěrečný test

## Zdroj dat

Technické a obchodní parametry všech 14 modelů (síla, plnicí otvor, rozměr a hmotnost
balíku, doba cyklu, hlučnost, motor, napájení, zdvih, počet vázání, olej, rozměry
a hmotnost stroje, doporučené množství, pořizovací cena, sazby a servisní programy)
pocházejí z produktové datové sady ELKOPLAST pro Bramidan — ze stejné sady, na které
stojí **Kalkulátor lisů ELKOPLAST** (`davidsury84/lisy`, pole `PRESSES`, `MATERIAL_TYPES`
a `GP`, sestavená z typových listů bramidan.com). Odtud jsou i produktové fotografie.

> **Poznámka k zadání:** přímé stažení dat z `https://www.bramidan.com/` v této relaci
> nebylo možné — doména je blokovaná politikou odchozí sítě prostředí (CONNECT → 403;
> blokovaný je veškerý externí web, nejen bramidan.com). Materiál je proto postavený na
> výše uvedené ověřené lokální datové sadě, která z typových listů bramidan.com vychází.
> Před další aktualizací doporučujeme projít parametry proti aktuálním typovým listům
> výrobce; ceny a sazby jsou v materiálu označené jako orientační s odkazem na
> Kalkulátor lisů.
