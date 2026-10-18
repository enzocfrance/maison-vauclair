import { boxSizes, type BoxSizeId } from "./catalog/box-sizes";
import type { Product } from "./catalog/product";

export type BoxPrice = {
  productsCents: number;
  packagingCents: number;
  totalCents: number;
};

/** Total of a box: its products plus the packaging fee of its size. */
export function priceBox(
  sizeId: BoxSizeId,
  products: readonly Pick<Product, "priceCents">[],
): BoxPrice {
  const productsCents = products.reduce(
    (sum, product) => sum + product.priceCents,
    0,
  );
  const { packagingCents } = boxSizes[sizeId];
  return {
    productsCents,
    packagingCents,
    totalCents: productsCents + packagingCents,
  };
}

/** « dès CHF … »: the cheapest box of this size the catalog allows, fee included. */
export function startingPriceCents(
  sizeId: BoxSizeId,
  catalog: readonly Pick<Product, "priceCents">[],
): number {
  const { itemCount } = boxSizes[sizeId];
  if (catalog.length < itemCount) {
    throw new Error(`The catalog cannot fill a box of ${itemCount} products`);
  }
  const cheapest = [...catalog]
    .sort((a, b) => a.priceCents - b.priceCents)
    .slice(0, itemCount);
  return priceBox(sizeId, cheapest).totalCents;
}
