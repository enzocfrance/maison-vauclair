import { defaultLocale, isLocale, type Locale } from "./locales";

/** Some browsers send Swiss German as "gsw". */
const aliases: Readonly<Record<string, Locale>> = { gsw: "de" };

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(
  acceptLanguage: string | null | undefined,
): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((entry, position) => {
      const [range = "", ...parameters] = entry.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      const q = quality === undefined ? 1 : Number(quality.slice(2));
      const language = range.trim().toLowerCase().split("-")[0] ?? "";
      return { language, q: Number.isFinite(q) ? q : 0, position };
    })
    .filter((candidate) => candidate.q > 0)
    .sort((a, b) => b.q - a.q || a.position - b.position);

  for (const { language } of candidates) {
    const locale = aliases[language] ?? language;
    if (isLocale(locale)) return locale;
  }
  return defaultLocale;
}
