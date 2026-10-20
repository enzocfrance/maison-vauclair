import { describe, expect, it } from "vitest";
import { boxSizes } from "@/shared/catalog/box-sizes";
import { categories } from "@/shared/catalog/product";
import { startingPriceCents } from "@/shared/pricing";
import { JsonCatalogRepository } from "./json-catalog-repository";

const products = await new JsonCatalogRepository().listProducts();

describe("JSON catalog", () => {
  it("offers six products in each of the four categories", () => {
    expect(products).toHaveLength(24);
    for (const category of categories) {
      expect(
        products.filter((product) => product.category === category),
      ).toHaveLength(6);
    }
  });

  it("keeps the products and prices of the mock-ups", () => {
    const priceOf = (id: string) =>
      products.find((product) => product.id === id)?.priceCents;
    expect(priceOf("gruyere-aop-18-months")).toBe(1450);
    expect(priceOf("vacherin-mont-d-or-aop")).toBe(2400);
    expect(priceOf("vaud-tomme")).toBe(680);
    expect(priceOf("etivaz-aop")).toBe(1390);
    expect(priceOf("tete-de-moine-aop")).toBe(1120);
  });

  it("marks every cheese as fresh and only wines as alcohol", () => {
    for (const product of products) {
      if (product.category === "cheese") expect(product.fresh).toBe(true);
      expect(product.alcohol).toBe(product.category === "wine");
    }
  });

  it("gives an appellation exactly to the products whose name carries one", () => {
    for (const product of products) {
      const inName = /\b(AOP|IGP)\b/.exec(product.name.fr)?.[1];
      expect(product.appellation, product.id).toBe(inName);
    }
  });

  it("tells where every product comes from, in French and German", () => {
    for (const product of products) {
      expect(product.origin?.fr, product.id).toMatch(/ · /);
      expect(product.origin?.de, product.id).toMatch(/ · /);
    }
  });

  it("can fill the largest box", () => {
    expect(products.length).toBeGreaterThanOrEqual(boxSizes.large.itemCount);
    expect(() => startingPriceCents("large", products)).not.toThrow();
  });
});
