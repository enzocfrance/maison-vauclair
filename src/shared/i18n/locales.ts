export const locales = ["fr", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Request header set by the middleware so the root layout can render `<html lang>`. */
export const localeHeader = "x-mv-locale";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}
