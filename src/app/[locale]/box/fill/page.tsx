import type { Metadata } from "next";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import { catalogRepository } from "@/backend/container";
import { BoxFiller } from "@/frontend/box/box-filler";
import { SiteHeader } from "@/frontend/components/site-header";
import { StepIndicator } from "@/frontend/components/step-indicator";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { withDemoDate } from "@/shared/demo";
import { alternatePaths, localizedPath } from "@/shared/i18n/routes";

type BoxFillPageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: BoxFillPageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.fill.title,
    alternates: { languages: alternatePaths("boxFill") },
  };
}

export default async function BoxFillPage({
  params,
  searchParams,
}: BoxFillPageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const { steps } = getDictionary(locale);
  const products = await catalogRepository.listProducts();

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternatePaths("boxFill")}
        demoDate={demoDate}
      />
      <StepIndicator
        current={2}
        labels={[steps.size, steps.fill, steps.delivery]}
        label={steps.label}
      />
      <main id="content" className="flex flex-1 flex-col">
        <BoxFiller
          locale={locale}
          products={products}
          today={today}
          backHref={withDemoDate(localizedPath(locale, "home"), demoDate)}
          nextHref={withDemoDate(
            localizedPath(locale, "boxDelivery"),
            demoDate,
          )}
        />
      </main>
    </>
  );
}
