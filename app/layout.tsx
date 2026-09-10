import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Průzkumy",
  description: "Dotazníky a testy – veřejné průzkumy i situační test pro uchazeče.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
