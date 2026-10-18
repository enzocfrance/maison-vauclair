"use client";

import { useRouter } from "next/navigation";
import { primaryAction } from "@/frontend/components/action-styles";
import { ArrowRightIcon } from "@/frontend/components/icons";
import { getDictionary } from "@/frontend/i18n";
import { format } from "@/frontend/i18n/format";
import type { BoxSizeId } from "@/shared/catalog/box-sizes";
import type { Locale } from "@/shared/i18n/locales";
import { formatChf } from "@/shared/money";
import { boxActions, useBox } from "./box-store";

export type SizeOption = {
  id: BoxSizeId;
  itemCount: number;
  featured: boolean;
  startingPriceCents: number;
};

type SizePickerProps = {
  locale: Locale;
  sizes: readonly SizeOption[];
  nextHref: string;
};

/** The most offered size is preselected, as in the mock-up. */
const defaultSize: BoxSizeId = "classic";

export function SizePicker({ locale, sizes, nextHref }: SizePickerProps) {
  const { sizes: t } = getDictionary(locale);
  const router = useRouter();
  const selected = useBox().sizeId ?? defaultSize;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        boxActions.selectSize(selected);
        router.push(nextHref);
      }}
    >
      <fieldset>
        <legend className="sr-only">{t.legend}</legend>
        {sizes.map((size) => (
          <label
            key={size.id}
            className="flex cursor-pointer items-center gap-4 border-b border-line py-[1.125rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink"
          >
            <span
              aria-hidden="true"
              className="w-10 text-[2.5rem] leading-none font-light tracking-[-0.025em] tabular-nums"
            >
              {size.itemCount}
            </span>
            <span className="flex grow flex-col gap-1">
              {size.featured && (
                <span className="text-[0.625rem] font-semibold tracking-label text-accent uppercase">
                  {t.featured}
                </span>
              )}
              <span className="text-[1.0625rem] font-medium">{t[size.id]}</span>
              <span className="text-[0.8125rem] text-muted">
                {format(t.summary, {
                  count: size.itemCount,
                  price: formatChf(size.startingPriceCents),
                })}
              </span>
            </span>
            <input
              type="radio"
              name="size"
              value={size.id}
              checked={selected === size.id}
              onChange={() => boxActions.selectSize(size.id)}
              className="size-[1.375rem] shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-ink checked:bg-ink checked:shadow-[inset_0_0_0_4px_var(--color-white)] focus-visible:outline-none forced-colors:appearance-auto"
            />
          </label>
        ))}
      </fieldset>
      <button type="submit" className={primaryAction}>
        <span>{t.cta}</span>
        <ArrowRightIcon className="size-5" />
      </button>
    </form>
  );
}
