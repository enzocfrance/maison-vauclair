import type { Product } from "@/shared/catalog/product";

/** Where the products come from: a JSON file in v1, WooCommerce later. */
export interface CatalogRepository {
  listProducts(): Promise<readonly Product[]>;
}
