import type { Product } from "@/shared/catalog/product";
import type { IsoDate } from "@/shared/delivery/calendar";
import type { Locale } from "@/shared/i18n/locales";
import type { Dictionary } from "./dictionaries/fr";

const intlLocales: Record<Locale, string> = { fr: "fr-CH", de: "de-CH" };

/** Replaces `{name}` placeholders. */
export function format(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}

/** « mardi 22 décembre », « Dienstag, 22. Dezember », optionally followed by the year. */
export function formatLongDate(
  date: IsoDate,
  locale: Locale,
  options: { year?: boolean } = {},
): string {
  const dayAndMonth = new Intl.DateTimeFormat(intlLocales[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  // Intl adds a comma after the French weekday when the year is included.
  return options.year ? `${dayAndMonth} ${date.slice(0, 4)}` : dayAndMonth;
}

/** « lundi 14 déc. », for the preparation sheet. */
export function formatShortDate(date: IsoDate, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** « 250 g », « 75 cl », « 1 pièce ». */
export function formatSize(
  size: Product["size"],
  dictionary: Dictionary,
): string {
  const unit = size.unit === "piece" ? dictionary.units.piece : size.unit;
  return `${size.amount} ${unit}`;
}
