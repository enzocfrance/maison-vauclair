import type { ReactNode } from "react";
import { HouseFooter } from "@/frontend/components/house-footer";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

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
