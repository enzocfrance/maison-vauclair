import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/shared/i18n/locales";
import { de } from "./dictionaries/de";
import { fr, type Dictionary } from "./dictionaries/fr";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { fr, de };

/** Each language is named in its own language, whatever the interface language. */
export const languageNames: Record<Locale, string> = {
  fr: "Français",
  de: "Deutsch",
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Reads the `[locale]` segment of a page, or renders the 404 page. */
export async function resolvePageLocale(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
