import Link from "next/link";
import { LogoHorizontal, SwissFlag } from "@/frontend/components/brand";
import { getDictionary } from "@/frontend/i18n";
import type { IsoDate } from "@/shared/delivery/calendar";
import { withDemoDate } from "@/shared/demo";
import { locales, type Locale } from "@/shared/i18n/locales";
import { localizedPath } from "@/shared/i18n/routes";
import { AnnouncementBand } from "./announcement-band";
import { DemoBanner } from "./demo-banner";
import { LanguageSwitch } from "./language-switch";

type SiteHeaderProps = {
  locale: Locale;
  /** The current page in every language. */
  alternates: Record<Locale, string>;
  /** Kept in every link so the simulation lasts the whole journey. */
  demoDate: IsoDate | null;
  /** Business date: drives the Christmas line of the announcement band. */
  today: IsoDate;
};

export function SiteHeader({
  locale,
  alternates,
  demoDate,
  today,
}: SiteHeaderProps) {
  const dictionary = getDictionary(locale);
  const languageLinks = Object.fromEntries(
    locales.map((candidate) => [
      candidate,
      withDemoDate(alternates[candidate], demoDate),
    ]),
  ) as Record<Locale, string>;

  return (
    // Named for the page transitions: the header stays still while the page changes.
    <div className="[view-transition-name:site-header]">
      <AnnouncementBand locale={locale} today={today} />
      {demoDate && (
        <DemoBanner
          locale={locale}
          date={demoDate}
          exitHref={alternates[locale]}
        />
      )}
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
          <Link
            href={withDemoDate(localizedPath(locale, "home"), demoDate)}
            className="flex min-h-11 items-center py-2.5"
          >
            <LogoHorizontal className="h-10 w-auto lg:h-12" />
            <SwissFlag className="ml-3 size-3.5 shrink-0" />
          </Link>
          <LanguageSwitch
            locale={locale}
            label={dictionary.site.languageNav}
            alternates={languageLinks}
          />
        </div>
      </header>
    </div>
  );
}
