import { describe, expect, it } from "vitest";
import { priceBox, startingPriceCents } from "./pricing";

const prices = (...cents: number[]) =>
  cents.map((priceCents) => ({ priceCents }));

describe("priceBox", () => {
  it("adds the packaging fee to the products, on its own line", () => {
    // The Classique box of the mock-ups: Gruyère, Vacherin, Tomme, saucisson, honey, Chasselas.
    expect(
      priceBox("classic", prices(1450, 2400, 680, 2090, 1350, 2450)),
    ).toEqual({
      productsCents: 10420,
      packagingCents: 1200,
      totalCents: 11620,
    });
  });

  it("charges the fee of each size", () => {
    expect(priceBox("small", []).packagingCents).toBe(900);
    expect(priceBox("classic", []).packagingCents).toBe(1200);
    expect(priceBox("large", []).packagingCents).toBe(1500);
  });
});

describe("startingPriceCents", () => {
  it("takes the cheapest products for the size, fee included", () => {
    const catalog = prices(5000, 700, 900, 650, 4000, 800);
    expect(startingPriceCents("small", catalog)).toBe(
      650 + 700 + 800 + 900 + 900,
    );
  });

  it("refuses a catalog too small to fill the box", () => {
    expect(() => startingPriceCents("large", prices(100, 200))).toThrow();
  });
});
