# Drátový model e-shopu ELKOPLAST

Interaktivní model logiky nového e-shopu (modernizace shop.elkoplast.cz). Stejná technologie
jako **digitální dvojče třídicí linky**: jednosouborová HTML aplikace (paleta bloků → plátno
s vazbami → inspektor vlastností) + volitelný Express server pro nasazení na Railway.

Aplikace: `public/eshop_model.html` — otevři přímo v prohlížeči, nic se neinstaluje.

## Co model obsahuje

| Záložka | Obsah |
|---|---|
| 🧩 **Logika e-shopu** | systémy a procesy jako bloky, vazby = co mezi nimi teče (data / zboží / peníze / událost) a kdy (spouštěč). Uprostřed stojí **Helios (ERP)** jako jádro, kolem něj vrstvy: data pro web → cesta zákazníka → doklady/servis → tři zdroje zboží |
| 🖥 **Obrazovky** | stránky e-shopu s mini-drátěnkou rozvržení, vazby = akce uživatele (navigace) |
| ⚙ **Procesy & automatizace** | tabulka kroků: kdo je dělá dnes (ručně / polo / auto), cílový stav, nástroj, spouštěč; % automatizace dnes vs. cíl |
| 🔌 **Rozhraní** | katalog vazeb odvozený z plátna: odkud → co teče → spouštěč → formát → kam, s vrstvou a systémem na obou stranách; filtry, skok na plátno, export CSV, podklad pro dodavatele |
| ❔ **Jak číst model** | legenda a doporučená architektura |

**Helios je jádro modelu.** Ven z něj jde kmen produktů do PIM, nákupní ceny do cenotvorby, stav zásob a plán
výroby do dostupnostního enginu, výrobní zakázka do výroby, výdejka na sklad, faktura do dokladů a data do BI.
Zpět se vrací objednávka a stavy z OMS, úhrada z platební brány, pohyby skladu, hlášení z výroby, vratky
a dobropisy i doklady dodavatelů. E-shop není druhá evidence — je to výkladní skříň Heliosu. Vrstva
**0 · Helios (ERP)** v přepínači ukáže celé jeho rozhraní na jednom místě.

Vrstva **5 · Intranet a SMI** přidává interní nástroje: **intranet.elkoplast.cz** jako bránu zaměstnanců
(prodeje z OMS, exporty dokladů z Heliosu, reklamace z veřejného formuláře) a **SMI**, které nad výdejkami
Heliosu, feedem Shop.CZ a daty o prodejích počítá min/max, návrhy objednávek a přecenění.

Tři zdroje zboží a jejich automatizace jsou srdcem toku (blok **Směrovač objednávky**):

1. **Vlastní výrobky** — objednávka automaticky založí výrobní zakázku, termín z kapacity výroby, dokončení → příjem na sklad → expedice.
2. **Zboží na sklad** — WMS hlídá minima, nákup objednává sám (auto-PO), pick-list, štítky přes API dopravců.
3. **Dropshipping** — objednávka odchází dodavateli API/EDI, dodavatel posílá přímo zákazníkovi, tracking a faktura se vrací automaticky.

Bloky mají tři stavy automatizace: `⚙ AUTO` · `◐ POLO` · `✋ RUČNĚ` — ruční bloky svítí červeně a počítají se v hlavičce.
Cíl: člověk řeší jen výjimky.

## Ovládání

- **přepínač vrstev** nad plátnem (Vše · 1 Datová vrstva · 2 Cesta zákazníka · …) ukáže jen jednu oblast;
  vazby ven z vrstvy zůstanou jako čárkované pahýly s názvem protějšku, takže je vidět rozhraní vrstvy
- **☀ Světlá** přepne model do světlého režimu, **🖨 Tisk** zmenší právě zobrazený pohled (i jen jednu vrstvu)
  na jednu stránku A4 na šířku, přidá hlavičku s názvem a datem a po tisku vrátí pohled zpět
- **⛶ Celá plocha** schová boční panely a model využije celou šířku; paletu vrátí tlačítko ＋ Bloky,
  inspektor se vysune sám, když něco vybereš (volba se pamatuje v prohlížeči)
- **proklik**: klik na popisek vazby přejde na navazující blok, klik na název u pahýlu i do jeho vrstvy,
  klik na název oblasti otevře jen tu vrstvu; Vstupy/Výstupy v inspektoru jsou taky proklikávací
- klik v paletě přidá blok, tažením za hlavičku ho přesuneš
- táhni z pravého portu na levý port jiného bloku = vazba; klik na vazbu → popisek, typ, spouštěč
- klik na blok → inspektor (název, systém, integrace, automatizace, poznámka)
- bloku jdou přidat **vlastní vstupy a výstupy** (inspektor → Vlastní vstupy a výstupy); porty z typu bloku zůstávají,
  vlastní jsou čárkované a smazání portu odstraní i vazby na něm
- `Delete` maže, kolečko = zoom, tažení prázdné plochy = posun, **Zarovnat pohled** = vše na obrazovku
- vše se ukládá automaticky do prohlížeče (`localStorage`); **☁ Sdílené modely** ukládá na server pro kolegy; **Uložit JSON** / **Načíst JSON** pro přenos souborem; **Výchozí model** obnoví návrh
- **Zkontrolovat model** najde nezapojené bloky, ruční kroky a vazby bez popisku
- v Procesech: **Export CSV**

## Spolupráce více lidí (sdílené modely)

Tlačítko **☁ Sdílené modely** v hlavičce (nebo `Ctrl+S`) ukládá plátno na server. Model uložený na
server vidí a může upravovat každý kolega s přístupem: otevře ho ze seznamu, upraví, uloží změny.
Kdo uloží později, přepíše dřívější verzi; pokud mezitím uložil někdo jiný, aplikace to pozná
(server vrátí 409) a nabídne přepsat, nebo načíst jejich verzi. Čip v hlavičce ukazuje přihlášeného
uživatele, napojený model a stav „uloženo / neuloženo“.

Endpointy: `POST /api/share` (nový), `PUT /api/share/:id` (přepis, s `baseUpdatedAt` pro detekci
konfliktu), `GET /api/share/:id`, `GET /api/shared-list`, `DELETE /api/share/:id`, `GET /api/me`, `GET /health`.

## Lokální spuštění se serverem

```bash
cd eshop
npm install
npm start          # http://localhost:3000  (bez INTRANET_SSO_SECRET běží otevřeně)
```

## Nasazení na Railway + napojení do intranetu

Stejný vzor jako `tridici-linka-dvojce` (modul „Design třídicí linky“):

1. **Railway**: New Project → Deploy from GitHub repo `davidsury84/1` → Settings → **Root Directory** `eshop`
   → Nixpacks (Node 20) → Generate Domain (např. `eshop-model-production.up.railway.app`). Healthcheck `/health`.
2. **Volume** (aby sdílené modely přežily redeploy): Settings → Volume → mount `/data`, 1 GB stačí.
   Railway nastaví `RAILWAY_VOLUME_MOUNT_PATH`, server ho použije automaticky.
3. **SSO z intranetu**: v této službě nastav `INTRANET_SSO_SECRET` = stejná hodnota jako `SSO_SHARED_SECRET`
   v intranetu (volitelně `INTRANET_URL`, výchozí `https://intranet.elkoplast.cz`). Od té chvíle pustí aplikace
   jen zaměstnance přihlášené přes intranet a u sdílených modelů se ukládá jejich jméno.
4. **Intranet** (repo `mobilnirozhlas`): modul `eshopmodel` v sekci „Vývoj projektů → E-shop“ (menu, dlaždice,
   matice přístupů) a trasa `/eshop-model-app`, která přesměruje sem s krátkodobým `?sso=` tokenem.
   V intranetové službě nastav `ESHOP_MODEL_APP_URL` = adresa z kroku 1. Správce pak v matici přístupů
   zapne modul „Vývoj projektů — E-shop“ kolegům, kteří mají spolupracovat.

Bez `INTRANET_SSO_SECRET` běží aplikace otevřeně (lokální vývoj) — kdo má odkaz, vidí a upravuje.

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
