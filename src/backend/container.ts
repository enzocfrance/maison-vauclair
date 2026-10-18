import type { CatalogRepository } from "./catalog/catalog-repository";
import { JsonCatalogRepository } from "./catalog/json-catalog-repository";

/** The one place where implementations are chosen: swap these for WooCommerce. */
export const catalogRepository: CatalogRepository = new JsonCatalogRepository();
