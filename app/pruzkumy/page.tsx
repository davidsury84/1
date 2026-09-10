import Link from "next/link";
import type { Metadata } from "next";
import styles from "./pruzkumy.module.css";

export const metadata: Metadata = {
  title: "Průzkumy a testy",
  description:
    "Přehled dotazníků a testů – situační test obchodních dovedností pro uchazeče a veřejné průzkumy.",
};

export default function Pruzkumy() {
  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Přehled</p>
        <h1 className={styles.title}>Průzkumy a testy</h1>
        <p className={styles.lead}>
          Výběrová řízení i veřejné dotazníky na jednom místě. Každý test se vyplňuje
          přímo v prohlížeči, není potřeba nic instalovat ani se registrovat.
        </p>
      </header>

      <h2 className={styles.groupLabel}>Pro uchazeče</h2>

      <a className={styles.card} href="/pruzkumy/obchodni-test-elkoplast.html">
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Obchodní situační test ELKOPLAST</h3>
          <span className={styles.badge}>Pro uchazeče</span>
        </div>
        <p className={styles.desc}>
          Situační test úsudku (SJT) pro uchazeče o obchodní pozice. U deseti situací
          z praxe B2B prodeje technologií pro odpadové hospodářství uchazeč označí
          nejúčinnější a nejméně účinnou reakci. Měří zjišťování potřeb, argumentaci
          hodnotou, práci s námitkami a uzavírání, důvěru ve vztahu a řízení obchodu.
        </p>
        <div className={styles.meta}>
          <span>10 situací</span>
          <span>limit 10 minut</span>
          <span>obce, svozové firmy, průmysl</span>
          <span>skóre 0–50 bodů</span>
        </div>
        <span className={styles.cta}>Spustit test →</span>
      </a>
      <p className={styles.note}>
        Po odevzdání uchazeč obdrží kód výsledku, který předá hodnotiteli. Vyhodnocení,
        klíč a metodika jsou v testu dostupné zvlášť po zadání PINu hodnotitele – uchazeč
        se ke správným odpovědím v průběhu testu nedostane.
      </p>

      <h2 className={styles.groupLabel}>Veřejné průzkumy</h2>

      <Link className={styles.card} href="/">
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Green Deal: Souhlasíte?</h3>
          <span className={`${styles.badge} ${styles.badgeMuted}`}>Veřejný</span>
        </div>
        <p className={styles.desc}>
          Šestnáct otázek na jednotlivá opatření Zelené dohody pro Evropu – od zateplování
          a obnovitelných zdrojů po dopravu, průmysl a zemědělství. Na konci se zobrazí
          míra souhlasu v procentech, kterou je možné sdílet.
        </p>
        <div className={styles.meta}>
          <span>16 otázek</span>
          <span>bez limitu</span>
          <span>okamžitý výsledek</span>
        </div>
        <span className={styles.cta}>Otevřít průzkum →</span>
      </Link>

      <p className={styles.footnote}>
        Výsledky se ukládají pouze v prohlížeči, ve kterém byl test vyplněn. Situační test
        je screeningový nástroj – rozhodnutí o uchazeči je vždy vhodné doplnit pohovorem
        nebo hraním rolí.
      </p>
    </main>
  );
}
