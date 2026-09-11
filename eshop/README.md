# Drátový model e-shopu ELKOPLAST

Interaktivní model logiky nového e-shopu (modernizace shop.elkoplast.cz). Stejná technologie
jako **digitální dvojče třídicí linky**: jednosouborová HTML aplikace (paleta bloků → plátno
s vazbami → inspektor vlastností) + volitelný Express server pro nasazení na Railway.

Aplikace: `public/eshop_model.html` — otevři přímo v prohlížeči, nic se neinstaluje.

## Co model obsahuje

| Záložka | Obsah |
|---|---|
| 🧩 **Logika e-shopu** | systémy a procesy jako bloky, vazby = co mezi nimi teče (data / zboží / peníze / událost) a kdy (spouštěč). Oblasti: datová vrstva → cesta zákazníka → doklady/servis → tři zdroje zboží |
| 🖥 **Obrazovky** | stránky e-shopu s mini-drátěnkou rozvržení, vazby = akce uživatele (navigace) |
| ⚙ **Procesy & automatizace** | tabulka kroků: kdo je dělá dnes (ručně / polo / auto), cílový stav, nástroj, spouštěč; % automatizace dnes vs. cíl |
| ❔ **Jak číst model** | legenda a doporučená architektura |

Tři zdroje zboží a jejich automatizace jsou srdcem modelu (blok **Směrovač objednávky**):

1. **Vlastní výrobky** — objednávka automaticky založí výrobní zakázku, termín z kapacity výroby, dokončení → příjem na sklad → expedice.
2. **Zboží na sklad** — WMS hlídá minima, nákup objednává sám (auto-PO), pick-list, štítky přes API dopravců.
3. **Dropshipping** — objednávka odchází dodavateli API/EDI, dodavatel posílá přímo zákazníkovi, tracking a faktura se vrací automaticky.

Bloky mají tři stavy automatizace: `⚙ AUTO` · `◐ POLO` · `✋ RUČNĚ` — ruční bloky svítí červeně a počítají se v hlavičce.
Cíl: člověk řeší jen výjimky.

## Ovládání

- klik v paletě přidá blok, tažením za hlavičku ho přesuneš
- táhni z pravého portu na levý port jiného bloku = vazba; klik na vazbu → popisek, typ, spouštěč
- klik na blok → inspektor (název, systém, integrace, automatizace, poznámka)
- `Delete` maže, kolečko = zoom, tažení prázdné plochy = posun, **Zarovnat pohled** = vše na obrazovku
- vše se ukládá automaticky do prohlížeče (`localStorage`); **Uložit JSON** / **Načíst JSON** pro přenos; **Výchozí model** obnoví návrh
- **Zkontrolovat model** najde nezapojené bloky, ruční kroky a vazby bez popisku
- v Procesech: **Export CSV**

## Lokální spuštění se serverem (sdílení odkazem)

```bash
cd eshop
npm install
npm start          # http://localhost:3000
```

Server servíruje HTML a poskytuje `POST /api/share`, `GET /api/share/:id`, `GET /api/shared-list`,
`DELETE /api/share/:id`, `GET /health` (stejné jako u třídicí linky). Tlačítko **Sdílet odkaz** uloží model
a vrátí URL `?shared=<id>`. S Railway Volume (`RAILWAY_VOLUME_MOUNT_PATH`) jsou sdílené modely trvalé.

## Nasazení na Railway

Stejný postup jako `tridici-linka-dvojce`: New Project → Deploy from GitHub repo → Root directory `eshop`
→ Nixpacks (Node 20) → Generate Domain. Healthcheck `/health`.

## Struktura

```
eshop/
├── public/eshop_model.html   # aplikace (vše v jednom souboru)
├── server.js                 # Express + share endpointy
├── package.json
├── railway.json
├── nixpacks.toml
└── README.md
```
