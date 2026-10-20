import type { Metadata } from "next";
import Link from "next/link";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import {
  primaryAction,
  primaryArrow,
} from "@/frontend/components/action-styles";
import { ArrowRightIcon } from "@/frontend/components/icons";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { format } from "@/frontend/i18n/format";
import { withDemoDate } from "@/shared/demo";
import type { Locale } from "@/shared/i18n/locales";
import { alternatePaths, localizedPath } from "@/shared/i18n/routes";
import { welcomeCodePattern, welcomeDiscountPercent } from "@/shared/welcome";

type WelcomePageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: WelcomePageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.welcome.title,
    alternates: { languages: alternatePaths("welcome") },
  };
}

/** Where the QR code of the welcome card leads. No cookie: the utm_* stay in the URL. */
export default async function WelcomePage({
  params,
  searchParams,
}: WelcomePageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const { code } = await searchParams;
  const welcomeCode =
    typeof code === "string" && welcomeCodePattern.test(code) ? code : null;
  const t = getDictionary(locale).welcome;
  const alternates = Object.fromEntries(
    Object.entries(alternatePaths("welcome")).map(([language, path]) => [
      language,
      welcomeCode ? `${path}?code=${welcomeCode}` : path,
    ]),
  ) as Record<Locale, string>;

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternates}
        demoDate={demoDate}
        today={today}
      />
      <main
        id="content"
        className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-10 px-5 pt-12 pb-16 lg:grid-cols-2 lg:gap-20 lg:pt-20"
      >
        <section className="flex flex-col gap-3.5">
          <p className="label-caps text-muted">{t.eyebrow}</p>
          <h1 className="max-w-[12ch] text-[2.75rem] leading-none font-light tracking-[-0.035em] lg:text-7xl">
            {t.heading}
          </h1>
          <p className="max-w-md text-[0.9375rem] leading-normal text-muted lg:text-lg">
            {format(t.lead, { discount: welcomeDiscountPercent })}
          </p>
        </section>
        <div className="flex flex-col gap-6 lg:pt-6">
          {welcomeCode && (
            <div className="flex flex-col gap-2 border-y border-ink py-5">
              <p className="label-caps text-muted">{t.codeLabel}</p>
              <p className="text-4xl font-light tracking-[0.2em] tabular-nums">
                {welcomeCode}
              </p>
              <p className="text-sm text-muted">{t.codeHint}</p>
            </div>
          )}
          <Link
            href={withDemoDate(localizedPath(locale, "home"), demoDate)}
            className={primaryAction}
          >
            <span>{t.cta}</span>
            <ArrowRightIcon className={primaryArrow} />
          </Link>
        </div>
      </main>
    </>
  );
}
