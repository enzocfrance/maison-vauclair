import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  categoryImage,
  photoCredits,
  productImage,
} from "@/shared/catalog/images";
import { categories } from "@/shared/catalog/product";
import catalog from "./catalog.json";

const publicFile = (url: string) => path.join(process.cwd(), "public", url);
const credited = new Set(
  photoCredits.map((credit) => `/images/${credit.image}`),
);

describe("photos", () => {
  it("exist for every product and every category, each with its credit", () => {
    const images = [
      ...catalog.map((product) => productImage(product.id)),
      ...categories.map(categoryImage),
    ];
    for (const image of images) {
      expect(existsSync(publicFile(image)), image).toBe(true);
      expect(credited.has(image), image).toBe(true);
    }
  });

  it("only use licences that allow commercial use", () => {
    for (const credit of photoCredits) {
      expect(credit.license).toMatch(
        /^(CC0|Public domain|CC BY(-SA)? [0-9.]+)$/,
      );
      expect(credit.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });
});
