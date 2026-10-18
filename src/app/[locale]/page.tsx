import type { Metadata } from "next";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { alternatePaths } from "@/shared/i18n/routes";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.home.title,
    description: dictionary.meta.description,
    alternates: { languages: alternatePaths("home") },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = await resolvePageLocale(params);
  const dictionary = getDictionary(locale);

  return (
    <>
      <SiteHeader
        locale={locale}
        dictionary={dictionary}
        alternates={alternatePaths("home")}
      />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-5">
        <section className="flex flex-col gap-3.5 pt-9 pb-7">
          <p className="label-caps text-muted">{dictionary.home.eyebrow}</p>
          <h1 className="max-w-[10ch] text-[2.75rem] leading-none font-light tracking-[-0.035em]">
            {dictionary.home.heading}
          </h1>
          <p className="max-w-md text-[0.9375rem] leading-normal text-muted">
            {dictionary.home.lead}
          </p>
        </section>
      </main>
    </>
  );
}
