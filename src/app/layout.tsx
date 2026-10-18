import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { archivo } from "@/frontend/styles/fonts";
import { defaultLocale, isLocale, localeHeader } from "@/shared/i18n/locales";
import "@/frontend/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Maison Vauclair", template: "%s · Maison Vauclair" },
  // Fictitious company: the demo must not be indexed as a real shop.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const requested = (await headers()).get(localeHeader);
  const lang = isLocale(requested) ? requested : defaultLocale;

  return (
    <html lang={lang} className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
