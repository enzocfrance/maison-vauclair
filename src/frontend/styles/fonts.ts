import { Archivo } from "next/font/google";

/** Self-hosted at build time: visitors never request Google Fonts. */
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
