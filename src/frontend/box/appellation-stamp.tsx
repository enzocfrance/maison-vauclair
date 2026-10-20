import type { Product } from "@/shared/catalog/product";

type AppellationStampProps = {
  appellation: NonNullable<Product["appellation"]>;
};

/**
 * A round hallmark, like a mark struck into metal. Decorative: the
 * appellation is already part of the product name read aloud.
 */
export function AppellationStamp({ appellation }: AppellationStampProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-ink text-[0.5rem] leading-none font-semibold tracking-[0.06em] text-ink uppercase"
    >
      {appellation}
    </span>
  );
}
