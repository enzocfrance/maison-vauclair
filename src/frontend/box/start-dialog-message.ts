import { getDictionary } from "@/frontend/i18n";
import { format, formatLongDate } from "@/frontend/i18n/format";
import type { IsoDate } from "@/shared/delivery/calendar";
import { christmasOutlook, estimateDelivery } from "@/shared/delivery/delivery";
import type { Locale } from "@/shared/i18n/locales";

/** Written on the server, so the dialog shows the same date as the rest of the page. */
export function startDialogMessage(locale: Locale, today: IsoDate): string {
  const t = getDictionary(locale).startDialog;
  const outlook = christmasOutlook(today, "fresh");
  if (!outlook) return t.always;
  if (outlook.passed) {
    return format(t.passed, {
      date: formatLongDate(
        estimateDelivery(today, "fresh").deliveryDate,
        locale,
      ),
    });
  }
  return format(t.before, { date: formatLongDate(outlook.deadline, locale) });
}
