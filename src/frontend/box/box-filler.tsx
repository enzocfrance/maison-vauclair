"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { primaryAction } from "@/frontend/components/action-styles";
import {
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
} from "@/frontend/components/icons";
import { StepHeader } from "@/frontend/components/step-header";
import { getDictionary, type Dictionary } from "@/frontend/i18n";
import {
  capitalize,
  format,
  formatLongDate,
  formatSize,
} from "@/frontend/i18n/format";
import { boxSizes } from "@/shared/catalog/box-sizes";
import { categoryImage, productImage } from "@/shared/catalog/images";
import {
  categories,
  type Category,
  type Product,
} from "@/shared/catalog/product";
import type { IsoDate } from "@/shared/delivery/calendar";
import { estimateDelivery, shippingProfile } from "@/shared/delivery/delivery";
import type { Locale } from "@/shared/i18n/locales";
import { formatChf } from "@/shared/money";
import { priceBox } from "@/shared/pricing";
import { AppellationStamp } from "./appellation-stamp";
import { BoxDial } from "./box-dial";
import { boxActions, useBox, useHydrated } from "./box-store";
import { PriceLines } from "./price-lines";

type FillTexts = Dictionary["fill"];

type BoxFillerProps = {
  locale: Locale;
  products: readonly Product[];
  today: IsoDate;
  backHref: string;
  nextHref: string;
};

export function BoxFiller({
  locale,
  products,
  today,
  backHref,
  nextHref,
}: BoxFillerProps) {
  const dictionary = getDictionary(locale);
  const t = dictionary.fill;
  const box = useBox();
  const hydrated = useHydrated();
  const [category, setCategory] = useState<Category>("cheese");
  const [notice, setNotice] = useState("");

  const size = box.sizeId ? boxSizes[box.sizeId] : null;
  const chosen = box.productIds.flatMap(
    (id) => products.find((product) => product.id === id) ?? [],
  );

  const header = (
    <StepHeader
      backHref={backHref}
      backLabel={t.back}
      eyebrow={
        size
          ? format(t.eyebrow, { size: dictionary.sizes[size.id] })
          : t.eyebrowPending
      }
      title={t.heading}
    />
  );

  if (hydrated && !size) {
    return (
      <>
        {header}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-12">
          <p>{t.noSize}</p>
          <Link href={backHref} className={primaryAction}>
            <span>{t.chooseSize}</span>
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </>
    );
  }

  const capacity = size?.itemCount ?? 0;
  const isFull = chosen.length >= capacity;
  const price = size ? priceBox(size.id, chosen) : null;
  const blockedReason = size
    ? describeBlocker(chosen.length, capacity, t)
    : t.noSize;
  const estimate =
    chosen.length > 0 ? estimateDelivery(today, shippingProfile(chosen)) : null;

  function toggle(product: Product) {
    setNotice(boxActions.toggleProduct(product.id) ? "" : t.full);
  }

  const continueAction = (
    <ContinueAction
      href={nextHref}
      label={t.continue}
      blockedReason={blockedReason}
      onBlocked={setNotice}
    />
  );

  return (
    <>
      {header}
      <div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:px-5 lg:py-8">
        <div className="px-4 lg:px-0">
          <Progress count={chosen.length} capacity={capacity} texts={t} />

          <div
            role="group"
            aria-label={t.categoriesLabel}
            className="-mx-4 flex gap-6 overflow-x-auto border-b border-line px-4 lg:mx-0 lg:px-0"
          >
            {categories.map((candidate) => {
              const isActive = candidate === category;
              return (
                <button
                  key={candidate}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(candidate)}
                  className={`min-h-11 shrink-0 border-b-[1.5px] text-[0.6875rem] tracking-label uppercase ${
                    isActive
                      ? "border-ink font-semibold text-ink"
                      : "border-transparent font-medium text-muted hover:text-ink"
                  }`}
                >
                  {t.categories[candidate]}
                </button>
              );
            })}
          </div>

          <figure className="relative mt-5 overflow-hidden bg-surface">
            <Image
              src={categoryImage(category)}
              alt=""
              width={1200}
              height={480}
              priority
              className="aspect-[5/2] w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 to-transparent px-4 pt-12 pb-3.5 text-white">
              <p className="text-lg font-light">{t.categories[category]}</p>
              <p className="text-[0.8125rem]">{t.categoryIntro[category]}</p>
            </figcaption>
          </figure>

          <ul>
            {products
              .filter((product) => product.category === category)
              .map((product) => {
                const selected = box.productIds.includes(product.id);
                return (
                  <ProductRow
                    key={product.id}
                    product={product}
                    locale={locale}
                    dictionary={dictionary}
                    selected={selected}
                    blocked={!selected && isFull}
                    onToggle={() => toggle(product)}
                  />
                );
              })}
          </ul>
        </div>

        <aside aria-label={t.yourBox} className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-5 border border-ink p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="label-caps text-muted">
                {t.yourBox}
                {size && ` · ${dictionary.sizes[size.id]}`}
              </h2>
              {size && (
                <BoxDial
                  count={chosen.length}
                  capacity={capacity}
                  className="size-14 shrink-0 text-ink"
                />
              )}
            </div>
            {chosen.length === 0 ? (
              <p className="text-sm text-muted">{t.empty}</p>
            ) : (
              <ul className="flex flex-col">
                {chosen.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-b-0"
                  >
                    <span className="min-w-0">{product.name[locale]}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatChf(product.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {price && <PriceLines price={price} texts={t} />}
            {estimate && (
              <div className="flex flex-col gap-1.5 border-t border-line pt-4">
                <p className="label-caps text-muted">{t.delivery}</p>
                <p className="flex items-center gap-2.5 text-xl font-light">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full bg-accent"
                  />
                  {capitalize(formatLongDate(estimate.deliveryDate, locale))}
                </p>
              </div>
            )}
            <Notice text={notice} />
            {continueAction}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 mt-auto border-t border-ink bg-white lg:hidden">
        <div className="flex flex-col gap-2 px-4 pt-3.5 pb-5">
          <Notice text={notice} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.625rem] font-semibold tracking-label text-muted uppercase">
                {t.total}
              </span>
              <span className="text-[1.375rem] tabular-nums">
                {formatChf(price?.totalCents ?? 0)}
              </span>
              {price && (
                <span className="text-[0.6875rem] text-muted">
                  {format(t.packagingIncluded, {
                    price: formatChf(price.packagingCents),
                  })}
                </span>
              )}
            </div>
            {continueAction}
          </div>
        </div>
      </div>
    </>
  );
}

function describeBlocker(
  count: number,
  capacity: number,
  t: FillTexts,
): string | null {
  const gap = capacity - count;
  if (gap === 0) return null;
  if (gap < 0) return t.tooMany;
  return gap === 1 ? t.missingOne : format(t.missingOther, { count: gap });
}

function Progress({
  count,
  capacity,
  texts: t,
}: {
  count: number;
  capacity: number;
  texts: FillTexts;
}) {
  const { detail, label } = describeProgress(count, capacity, t);
  const isOver = count > capacity;
  // Announce changes only: on arrival, the dial's own label is enough.
  const [announcement, setAnnouncement] = useState("");
  const announcedCount = useRef(count);
  useEffect(() => {
    if (announcedCount.current === count) return;
    announcedCount.current = count;
    setAnnouncement(label);
  }, [count, label]);

  return (
    <div className="flex min-h-[7.5rem] items-center gap-5 py-5">
      {capacity > 0 && (
        <>
          <BoxDial
            count={count}
            capacity={capacity}
            label={label}
            className="size-20 shrink-0 text-ink"
          />
          <p
            aria-hidden="true"
            className={`text-sm ${isOver ? "text-accent" : "text-muted"}`}
          >
            {detail}
          </p>
        </>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

function describeProgress(count: number, capacity: number, t: FillTexts) {
  const gap = capacity - count;
  const detail =
    gap === 0
      ? t.complete
      : gap > 0
        ? gap === 1
          ? t.remainingOne
          : format(t.remainingOther, { count: gap })
        : gap === -1
          ? t.overflowOne
          : format(t.overflowOther, { count: -gap });
  const progress = format(t.progress, { count, total: capacity });
  return { detail, label: format(t.dialLabel, { progress, detail }) };
}

function ProductRow({
  product,
  locale,
  dictionary,
  selected,
  blocked,
  onToggle,
}: {
  product: Product;
  locale: Locale;
  dictionary: Dictionary;
  selected: boolean;
  blocked: boolean;
  onToggle: () => void;
}) {
  const name = product.name[locale];
  const t = dictionary.fill;

  return (
    <li className="flex items-center gap-3.5 border-b border-line py-3.5">
      {/* The name is right next to it: the photo adds an idea, not information. */}
      <Image
        src={productImage(product.id)}
        alt=""
        width={160}
        height={160}
        className="size-20 shrink-0 bg-surface object-cover"
      />
      <div className="flex min-w-0 grow flex-col gap-1">
        {product.fresh && (
          <p className="text-[0.625rem] font-semibold tracking-label text-muted uppercase">
            {t.fresh}
          </p>
        )}
        <p className="flex items-center gap-2.5 text-[0.9375rem] font-medium">
          {name}
          {product.appellation && (
            <AppellationStamp appellation={product.appellation} />
          )}
        </p>
        <p className="text-[0.8125rem] text-muted tabular-nums">
          {formatSize(product.size, dictionary)} ·{" "}
          {formatChf(product.priceCents)}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-disabled={blocked || undefined}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
          selected
            ? "border-ink bg-ink text-white"
            : blocked
              ? "cursor-not-allowed border-line text-muted"
              : "border-ink bg-white text-ink hover:bg-surface"
        }`}
      >
        {selected ? (
          <CheckIcon className="size-4" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        <span className="sr-only">
          {format(selected ? t.remove : t.add, { name })}
        </span>
      </button>
    </li>
  );
}

/** Always in the page, so screen readers announce it as soon as it changes. */
function Notice({ text }: { text: string }) {
  return (
    <p
      role="status"
      className={text ? "text-[0.8125rem] text-accent" : "sr-only"}
    >
      {text}
    </p>
  );
}

function ContinueAction({
  href,
  label,
  blockedReason,
  onBlocked,
}: {
  href: string;
  label: string;
  blockedReason: string | null;
  onBlocked: (reason: string) => void;
}) {
  const content = (
    <>
      <span>{label}</span>
      <ArrowRightIcon className="size-5" />
    </>
  );

  if (blockedReason === null) {
    return (
      <Link href={href} className={primaryAction}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onBlocked(blockedReason)}
      className={primaryAction}
    >
      {content}
    </button>
  );
}
