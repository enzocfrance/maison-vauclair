import type { Metadata } from "next";
import Image from "next/image";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import { catalogRepository } from "@/backend/container";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { photoCredits } from "@/shared/catalog/images";
import { categories } from "@/shared/catalog/product";
import { alternatePaths } from "@/shared/i18n/routes";

type PhotoCreditsPageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: PhotoCreditsPageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.credits.title,
    alternates: { languages: alternatePaths("photoCredits") },
  };
}

/** Required by the CC BY and CC BY-SA licences of the photos. */
export default async function PhotoCreditsPage({
  params,
  searchParams,
}: PhotoCreditsPageProps) {
  const { locale, demoDate } = await getPageContext(params, searchParams);
  const dictionary = getDictionary(locale);
  const t = dictionary.credits;
  const products = await catalogRepository.listProducts();

  const subjectOf = (image: string): string => {
    const name = image
      .replace(/^(products|categories)\//, "")
      .replace(/\.webp$/, "");
    const category = categories.find((candidate) => candidate === name);
    if (category) return dictionary.fill.categories[category];
    return (
      products.find((product) => product.id === name)?.name[locale] ?? name
    );
  };

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternatePaths("photoCredits")}
        demoDate={demoDate}
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
          <p className="max-w-xl leading-relaxed text-muted">{t.intro}</p>
        </section>
        <ul className="flex flex-col border-t border-ink">
          {photoCredits.map((credit) => (
            <li
              key={credit.image}
              className="flex gap-4 border-b border-line py-4"
            >
              <Image
                src={`/images/${credit.image}`}
                alt=""
                width={128}
                height={128}
                className="size-16 shrink-0 bg-surface object-cover"
              />
              <div className="flex min-w-0 flex-col gap-1 text-sm">
                <p className="font-medium">{subjectOf(credit.image)}</p>
                <p className="text-muted">
                  {t.author} {credit.author} · {t.license}{" "}
                  {credit.licenseUrl ? (
                    <a
                      href={credit.licenseUrl}
                      className="underline underline-offset-4 hover:no-underline"
                    >
                      {credit.license}
                    </a>
                  ) : (
                    credit.license
                  )}
                </p>
                <a
                  href={credit.source}
                  className="self-start underline underline-offset-4 hover:no-underline"
                >
                  {t.source}
                  <span className="sr-only"> – {credit.title}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
