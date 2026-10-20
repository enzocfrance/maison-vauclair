import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageContext, type PageSearchParams } from "@/app/_lib/page-context";
import { getCustomerOrder } from "@/backend/container";
import { BoxReset } from "@/frontend/box/box-reset";
import { MessageCard } from "@/frontend/box/message-card";
import { primaryAction } from "@/frontend/components/action-styles";
import { ArrowRightIcon } from "@/frontend/components/icons";
import { SiteHeader } from "@/frontend/components/site-header";
import { getDictionary, resolvePageLocale } from "@/frontend/i18n";
import { capitalize, format, formatLongDate } from "@/frontend/i18n/format";
import { boxSizes } from "@/shared/catalog/box-sizes";
import { withDemoDate } from "@/shared/demo";
import type { Locale } from "@/shared/i18n/locales";
import { alternatePaths, localizedPath } from "@/shared/i18n/routes";
import { formatChf } from "@/shared/money";

type ConfirmationPageProps = {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: PageSearchParams;
};

export async function generateMetadata({
  params,
}: ConfirmationPageProps): Promise<Metadata> {
  const dictionary = getDictionary(await resolvePageLocale(params));
  return { title: dictionary.confirmation.title };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { locale, today, demoDate } = await getPageContext(
    params,
    searchParams,
  );
  const { orderId } = await params;
  const { key } = await searchParams;
  const order = await getCustomerOrder(
    orderId,
    typeof key === "string" ? key : undefined,
  );
  if (!order) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.confirmation;
  const deliveryDate = formatLongDate(order.delivery.deliveryDate, locale);
  const keyedPaths = Object.fromEntries(
    Object.entries(alternatePaths("boxConfirmation", { orderId })).map(
      ([language, path]) => [language, `${path}?key=${order.accessToken}`],
    ),
  ) as Record<Locale, string>;

  return (
    <>
      <SiteHeader
        locale={locale}
        alternates={keyedPaths}
        demoDate={demoDate}
        today={today}
      />
      <main
        id="content"
        className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-12 px-5 pt-10 pb-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20 lg:pt-16"
      >
        <BoxReset />
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3.5">
            <p className="label-caps text-muted tabular-nums">
              {format(t.eyebrow, { id: order.id })}
            </p>
            <h1 className="text-[2.5rem] leading-[1.05] font-light tracking-[-0.03em] lg:text-6xl">
              {t.heading}
            </h1>
          </section>

          {order.delivery.deliveryDate !== order.expectedDeliveryDate && (
            <p className="border border-accent p-4 text-sm text-accent">
              {format(t.dateChanged, { date: deliveryDate })}
            </p>
          )}

          <section
            aria-labelledby="confirmation-delivery"
            className="flex flex-col gap-2.5 border-y border-ink py-6"
          >
            <h2 id="confirmation-delivery" className="label-caps text-muted">
              {t.expected}
            </h2>
            <p className="flex items-center gap-3 text-[2.125rem] leading-[1.05] font-light tracking-[-0.03em]">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full bg-accent"
              />
              {capitalize(deliveryDate)}
            </p>
            <p className="text-sm leading-normal text-muted">
              {format(t.shipped, {
                date: formatLongDate(order.delivery.shipDate, locale),
              })}{" "}
              {format(t.to, {
                name: order.recipient.name,
                postalCode: order.recipient.postalCode,
                city: order.recipient.city,
              })}
            </p>
          </section>

          <ul className="flex flex-col gap-2 text-[0.9375rem]">
            <li className="tabular-nums">
              {format(t.box, {
                size: dictionary.sizes[order.sizeId],
                count: boxSizes[order.sizeId].itemCount,
                total: formatChf(order.price.totalCents),
              })}
            </li>
            <li>
              {order.welcomeCode
                ? format(t.welcomeCard, {
                    language: dictionary.languageIn[order.cardLanguage],
                  })
                : t.noWelcomeCard}
            </li>
          </ul>

          <Link
            href={withDemoDate(localizedPath(locale, "home"), demoDate)}
            className={`${primaryAction} self-start`}
          >
            <span>{t.another}</span>
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>

        <figure className="flex flex-col gap-3">
          <figcaption className="label-caps text-muted">
            {t.cardTitle}
          </figcaption>
          <MessageCard
            message={order.message}
            emptyLabel={t.noMessage}
            lang={order.locale}
          />
        </figure>
      </main>
    </>
  );
}
