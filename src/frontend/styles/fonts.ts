import localFont from "next/font/local";

/**
 * Archivo, variable weight, latin subset (accents, umlauts, Swiss punctuation).
 * Kept in the repository (SIL Open Font License, see fonts/OFL.txt) so that no
 * build, test or visitor ever depends on Google Fonts being reachable.
 */
export const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
});
