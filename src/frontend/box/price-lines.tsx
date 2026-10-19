import type { Dictionary } from "@/frontend/i18n";
import { formatChf } from "@/shared/money";
import type { BoxPrice } from "@/shared/pricing";

type PriceLinesProps = {
  price: BoxPrice;
  texts: Dictionary["fill"];
};

/** Products, packaging fee on its own line, total: the price is complete and honest. */
export function PriceLines({ price, texts: t }: PriceLinesProps) {
  return (
    <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
      <div className="flex justify-between gap-3">
        <dt>{t.products}</dt>
        <dd className="tabular-nums">{formatChf(price.productsCents)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt>
          {t.packaging}
          <span className="block text-xs text-muted">{t.packagingDetail}</span>
        </dt>
        <dd className="tabular-nums">{formatChf(price.packagingCents)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-ink pt-3">
        <dt className="label-caps">{t.total}</dt>
        <dd className="text-[1.375rem] tabular-nums">
          {formatChf(price.totalCents)}
        </dd>
      </div>
    </dl>
  );
}
