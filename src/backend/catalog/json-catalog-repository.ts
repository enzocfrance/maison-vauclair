import { catalogSchema, type Product } from "@/shared/catalog/product";
import type { CatalogRepository } from "./catalog-repository";
import catalogData from "./catalog.json";

export class JsonCatalogRepository implements CatalogRepository {
  /** Validated once: an invalid catalog stops the server at startup, not mid-order. */
  private readonly products: readonly Product[] =
    catalogSchema.parse(catalogData);

  async listProducts(): Promise<readonly Product[]> {
    return this.products;
  }
}
