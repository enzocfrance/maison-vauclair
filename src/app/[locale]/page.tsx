import type { Metadata } from "next";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import { catalogRepository } from "@/backend/container";
import { ChristmasNotice } from "@/frontend/box/christmas-notice";
import { SizePicker, type SizeOption } from "@/frontend/box/size-picker";
import { StartDialog } from "@/frontend/box/start-dialog";
import { startDialogMessage } from "@/frontend/box/start-dialog-message";
import { SiteHeader } from "@/frontend/components/site-header";
import { StepIndicator } from "@/frontend/components/step-indicator";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { boxSizeIds, boxSizes } from "@/shared/catalog/box-sizes";
import { withDemoDate } from "@/shared/demo";
import { alternatePaths, localizedPath } from "@/shared/i18n/routes";
import { startingPriceCents } from "@/shared/pricing";

type HomePageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
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

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const { home, steps } = getDictionary(locale);
  const products = await catalogRepository.listProducts();
  const sizes: SizeOption[] = boxSizeIds.map((id) => ({
    id,
    itemCount: boxSizes[id].itemCount,
    featured: boxSizes[id].featured,
    startingPriceCents: startingPriceCents(id, products),
  }));

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternatePaths("home")}
        demoDate={demoDate}
        today={today}
      />
      <StepIndicator
        current={1}
        labels={[steps.size, steps.fill, steps.delivery]}
        label={steps.label}
      />
      <main
        id="content"
        className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-8 px-5 pt-9 pb-12 lg:grid-cols-2 lg:gap-20 lg:pt-20"
      >
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3.5">
            <p className="label-caps text-muted">{home.eyebrow}</p>
            <h1 className="max-w-[10ch] text-[2.75rem] leading-none font-light tracking-[-0.035em] lg:text-7xl">
              {home.heading}
            </h1>
            <p className="max-w-md text-[0.9375rem] leading-normal text-muted lg:text-lg">
              {home.lead}
            </p>
          </section>
          <ChristmasNotice locale={locale} today={today} />
        </div>
        <SizePicker
          locale={locale}
          sizes={sizes}
          nextHref={withDemoDate(localizedPath(locale, "boxFill"), demoDate)}
        />
      </main>
      <StartDialog
        locale={locale}
        sizes={sizes}
        message={startDialogMessage(locale, today)}
        fillHref={withDemoDate(localizedPath(locale, "boxFill"), demoDate)}
      />
    </>
  );
}
