import type { Product } from "./product";

export type Appellation = NonNullable<Product["appellation"]>;

/** « Gruyère AOP 18 mois » becomes « Gruyère 18 mois », to sit next to its hallmark. */
export function withoutAppellation(
  name: string,
  appellation: Appellation,
): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== appellation)
    .join(" ");
}
