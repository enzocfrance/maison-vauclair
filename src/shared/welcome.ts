import type { Locale } from "./i18n/locales";
import { localizedPath } from "./i18n/routes";

/** No 0/O, 1/I/L: the code is typed by hand from a printed card. */
export const welcomeCodeAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const welcomeCodeLength = 6;
export const welcomeCodePattern = new RegExp(
  `^[${welcomeCodeAlphabet}]{${welcomeCodeLength}}$`,
);

/** Fictitious advantage on the recipient's first order. */
export const welcomeDiscountPercent = 10;

/** What the printed welcome card needs. */
export type WelcomeCard = {
  code: string;
  locale: Locale;
  /** Full link encoded in the QR code. */
  url: string;
  /** Short form printed under the QR code, for those who do not scan. */
  displayUrl: string;
  /** QR modules as one SVG path, `size` modules wide. */
  qr: { size: number; path: string };
};

/**
 * Link of the QR code: the recipient's code, and the origin of the visit in
 * `utm_*` parameters, so welcomes can be counted without any cookie.
 */
export function welcomeLink(
  locale: Locale,
  code: string,
  year: string,
): string {
  const query = new URLSearchParams({
    code,
    utm_source: "coffret",
    utm_medium: "carte",
    utm_campaign: `carte-bienvenue-${year}`,
  });
  return `${localizedPath(locale, "welcome")}?${query.toString()}`;
}
