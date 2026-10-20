import type { Metadata } from "next";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { alternatePaths } from "@/shared/i18n/routes";

type PrivacyPageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.privacy.title,
    alternates: { languages: alternatePaths("privacy") },
  };
}

export default async function PrivacyPage({
  params,
  searchParams,
}: PrivacyPageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const t = getDictionary(locale).privacy;

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternatePaths("privacy")}
        demoDate={demoDate}
        today={today}
      />
      <main
        id="content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-5 pt-12 pb-16 lg:pt-16"
      >
        <section className="flex flex-col gap-3.5">
          <p className="label-caps text-muted">{t.eyebrow}</p>
          <h1 className="text-[2.5rem] leading-[1.05] font-light tracking-[-0.03em] lg:text-6xl">
            {t.heading}
          </h1>
        </section>
        <p className="flex gap-3 border-y border-ink py-4 text-sm leading-relaxed">
          <span
            aria-hidden="true"
            className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
          />
          {t.demo}
        </p>
        <div className="flex flex-col gap-8">
          {t.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-2">
              <h2 className="text-xl font-light">{section.heading}</h2>
              <p className="leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
