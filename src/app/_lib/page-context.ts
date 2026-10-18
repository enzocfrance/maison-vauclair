import { resolveToday } from "@/backend/clock";
import { resolvePageLocale } from "@/frontend/i18n";
import type { IsoDate } from "@/shared/delivery/calendar";
import { demoDateParam } from "@/shared/demo";
import type { Locale } from "@/shared/i18n/locales";

export type PageParams = Promise<{ locale: string }>;
export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export type PageContext = {
  locale: Locale;
  /** Business date used for every delivery calculation on the page. */
  today: IsoDate;
  /** Set only in demo mode, to keep the simulated date in every link. */
  demoDate: IsoDate | null;
};

export async function getPageContext(
  params: PageParams,
  searchParams: PageSearchParams,
): Promise<PageContext> {
  const locale = await resolvePageLocale(params);
  const requested = (await searchParams)[demoDateParam];
  const today = resolveToday(
    typeof requested === "string" ? requested : undefined,
  );
  return {
    locale,
    today: today.date,
    demoDate: today.simulated ? today.date : null,
  };
}
