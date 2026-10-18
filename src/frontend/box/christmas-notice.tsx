import { getDictionary } from "@/frontend/i18n";
import { formatLongDate } from "@/frontend/i18n/format";
import { formatRich } from "@/frontend/i18n/rich-text";
import type { IsoDate } from "@/shared/delivery/calendar";
import { christmasOutlook, estimateDelivery } from "@/shared/delivery/delivery";
import type { Locale } from "@/shared/i18n/locales";

type ChristmasNoticeProps = {
  locale: Locale;
  today: IsoDate;
};

/** The deadline for a fresh box before Christmas; after it, the honest delivery date. */
export function ChristmasNotice({ locale, today }: ChristmasNoticeProps) {
  const outlook = christmasOutlook(today, "fresh");
  if (!outlook) return null;

  const { christmas } = getDictionary(locale);
  const date = outlook.passed
    ? estimateDelivery(today, "fresh").deliveryDate
    : outlook.deadline;

  return (
    <p className="flex items-center gap-3 border-y border-ink py-3.5 text-sm leading-snug">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-accent"
      />
      <span>
        {formatRich(outlook.passed ? christmas.passed : christmas.before, {
          date: (
            <strong className="font-semibold">
              {formatLongDate(date, locale)}
            </strong>
          ),
        })}
      </span>
    </p>
  );
}
