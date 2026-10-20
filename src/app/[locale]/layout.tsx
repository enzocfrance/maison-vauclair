import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrl } from "@/backend/config";
import { HouseFooter } from "@/frontend/components/house-footer";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/** Sharing image per language; absolute URLs built from SITE_URL at runtime. */
export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
  const { home } = getDictionary(locale);
  const image = {
    url: `/og/${locale}.png`,
    width: 1200,
    height: 630,
    alt: home.title,
  };
  return {
    metadataBase: new URL(siteUrl()),
    openGraph: {
      type: "website",
      siteName: "Maison Vauclair",
      locale: locale === "fr" ? "fr_CH" : "de_CH",
      images: [image],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const locale = await resolvePageLocale(params);
  const dictionary = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:text-white"
      >
        {dictionary.site.skipToContent}
      </a>
      {children}
      <HouseFooter locale={locale} />
    </div>
  );
}
