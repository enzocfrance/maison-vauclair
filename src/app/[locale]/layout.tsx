import type { ReactNode } from "react";
import { SiteFooter } from "@/frontend/components/site-footer";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { localizedPath } from "@/shared/i18n/routes";

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
      <SiteFooter
        demoNotice={dictionary.site.demoNotice}
        links={[
          {
            href: localizedPath(locale, "privacy"),
            label: dictionary.privacy.link,
          },
          {
            href: localizedPath(locale, "photoCredits"),
            label: dictionary.credits.link,
          },
        ]}
      />
    </div>
  );
}
