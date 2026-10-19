import type { Metadata } from "next";
import {
  getPageContext,
  type PageParams,
  type PageSearchParams,
} from "@/app/_lib/page-context";
import { catalogRepository } from "@/backend/container";
import { DeliveryForm } from "@/frontend/box/delivery-form";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { alternatePaths } from "@/shared/i18n/routes";

type BoxDeliveryPageProps = {
  params: PageParams;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: BoxDeliveryPageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return {
    title: dictionary.delivery.title,
    alternates: { languages: alternatePaths("boxDelivery") },
  };
}

export default async function BoxDeliveryPage({
  params,
  searchParams,
}: BoxDeliveryPageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const products = await catalogRepository.listProducts();

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={alternatePaths("boxDelivery")}
        demoDate={demoDate}
      />
      <main id="content" className="flex flex-1 flex-col">
        <DeliveryForm
          locale={locale}
          products={products}
          today={today}
          demoDate={demoDate}
        />
      </main>
    </>
  );
}
