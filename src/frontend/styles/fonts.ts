import localFont from "next/font/local";

/**
 * Archivo, variable weight, roman and italic, latin subset (accents, umlauts,
 * Swiss punctuation). Kept in the repository (SIL Open Font License, see
 * fonts/OFL.txt) so that no build, test or visitor ever depends on Google Fonts.
 */
export const archivo = localFont({
  src: [
    { path: "./fonts/archivo-latin.woff2", weight: "100 900", style: "normal" },
    {
      path: "./fonts/archivo-latin-italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
});
