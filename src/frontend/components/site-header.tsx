import Link from "next/link";
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
    <>
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
            className="flex min-h-11 items-center gap-2.5"
          >
            <span aria-hidden="true" className="size-3 rounded-full bg-ink" />
            <span className="text-[0.8125rem] font-semibold tracking-brand uppercase">
              {dictionary.site.brand}
            </span>
          </Link>
          <LanguageSwitch
            locale={locale}
            label={dictionary.site.languageNav}
            alternates={languageLinks}
          />
        </div>
      </header>
    </>
  );
}
