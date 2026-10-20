import { getDictionary } from "@/frontend/i18n";
import { format, formatLongDate } from "@/frontend/i18n/format";
import type { IsoDate } from "@/shared/delivery/calendar";
import type { Locale } from "@/shared/i18n/locales";

type DemoBannerProps = {
  locale: Locale;
  date: IsoDate;
  exitHref: string;
};

/** Always visible during a simulation, so nobody mistakes it for today's date. */
export function DemoBanner({ locale, date, exitHref }: DemoBannerProps) {
  const { demo } = getDictionary(locale);

  return (
    <div className="border-b border-line bg-white text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2.5 text-[0.8125rem]">
        <p className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full bg-accent"
          />
          {format(demo.banner, {
            date: formatLongDate(date, locale, { year: true }),
          })}
        </p>
        <a
          href={exitHref}
          className="underline underline-offset-4 hover:no-underline"
        >
          {demo.exit}
        </a>
      </div>
    </div>
  );
}
