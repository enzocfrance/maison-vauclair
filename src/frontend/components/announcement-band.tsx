import { SwissFlag } from "@/frontend/components/brand";
import { getDictionary } from "@/frontend/i18n";
import { format, formatLongDate } from "@/frontend/i18n/format";
import type { IsoDate } from "@/shared/delivery/calendar";
import { christmasOutlook, estimateDelivery } from "@/shared/delivery/delivery";
import type { Locale } from "@/shared/i18n/locales";

type AnnouncementBandProps = {
  locale: Locale;
  today: IsoDate;
};

/** The thin black band at the very top. The Christmas date comes from the delivery rule. */
export function AnnouncementBand({ locale, today }: AnnouncementBandProps) {
  const { band } = getDictionary(locale);
  const outlook = christmasOutlook(today, "fresh");
  const christmas = !outlook
    ? null
    : outlook.passed
      ? format(band.passed, {
          date: formatLongDate(
            estimateDelivery(today, "fresh").deliveryDate,
            locale,
          ),
        })
      : format(band.christmas, {
          date: formatLongDate(outlook.deadline, locale),
        });

  return (
    <div className="full-bleed bg-ink text-white">
      <p className="mx-auto w-full max-w-6xl px-5 py-2.5 text-center text-[0.625rem] leading-relaxed font-medium tracking-[0.1em] text-balance uppercase sm:text-[0.6875rem] sm:tracking-label">
        {christmas ? (
          <>
            <span className="hidden sm:inline">
              <SwissFlag className="mr-2 inline-block size-2.5 align-[-0.05em]" />
              {band.fresh} ·{" "}
            </span>
            {christmas}
          </>
        ) : (
          <>
            <SwissFlag className="mr-2 inline-block size-2.5 align-[-0.05em]" />
            {band.fresh}
          </>
        )}
      </p>
    </div>
  );
}
