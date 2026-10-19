import credits from "./photo-credits.json";
import type { Category } from "./product";

/** Photos live in `public/images`, named after the product id or the category. */
export function productImage(productId: string): string {
  return `/images/products/${productId}.webp`;
}

export function categoryImage(category: Category): string {
  return `/images/categories/${category}.webp`;
}

/** Wikimedia Commons photos: CC BY and CC BY-SA require crediting the author on the site. */
export type PhotoCredit = {
  /** Path under `public/images`. */
  image: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};

export const photoCredits: readonly PhotoCredit[] = credits;
