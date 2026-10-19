import { describe, expect, it } from "vitest";
import type { Product } from "@/shared/catalog/product";
import {
  checkBoxContents,
  collectErrors,
  orderRequestSchema,
  type OrderRequest,
} from "./order-request";

const validRequest: OrderRequest = {
  locale: "fr",
  sizeId: "small",
  productIds: ["a", "b", "c", "d"],
  recipient: {
    name: "Ursula Meier",
    street: "Seefeldstrasse 12",
    postalCode: "8008",
    city: "Zürich",
  },
  cardLanguage: "de",
  message: "Joyeux Noël, maman !",
  welcomeCard: true,
  buyer: { name: "Thomas Meier", email: "thomas@example.ch" },
  ageConfirmed: false,
  expectedDeliveryDate: "2026-12-15",
};

const errorsOf = (input: unknown) => {
  const result = orderRequestSchema.safeParse(input);
  return result.success ? {} : collectErrors(result.error);
};

const product = (id: string, alcohol = false): Product => ({
  id,
  category: alcohol ? "wine" : "grocery",
  name: { fr: id, de: id },
  size: { amount: 1, unit: "piece" },
  priceCents: 1000,
  fresh: false,
  alcohol,
});

const catalog = [
  product("a"),
  product("b"),
  product("c"),
  product("d"),
  product("wine", true),
];

describe("orderRequestSchema", () => {
  it("accepts a complete order", () => {
    expect(orderRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("accepts Swiss postal codes only", () => {
    const withPostalCode = (postalCode: string) => ({
      ...validRequest,
      recipient: { ...validRequest.recipient, postalCode },
    });
    expect(errorsOf(withPostalCode("1003"))).toEqual({});
    expect(errorsOf(withPostalCode("800"))).toEqual({
      "recipient.postalCode": true,
    });
    expect(errorsOf(withPostalCode("0800"))).toEqual({
      "recipient.postalCode": true,
    });
    expect(errorsOf(withPostalCode("75008"))).toEqual({
      "recipient.postalCode": true,
    });
  });

  it("reports each invalid field", () => {
    expect(
      errorsOf({
        ...validRequest,
        buyer: { name: "T", email: "pas-un-email" },
        message: "x".repeat(301),
      }),
    ).toEqual({ "buyer.name": true, "buyer.email": true, message: true });
  });

  it("refuses prices sent by the browser", () => {
    expect(errorsOf({ ...validRequest, totalCents: 100 })).toEqual({
      box: true,
    });
  });
});

describe("checkBoxContents", () => {
  it("returns the catalog products of a full box", () => {
    const contents = checkBoxContents(validRequest, catalog);
    expect(contents.ok && contents.items.map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("refuses a box that is not exactly full", () => {
    expect(
      checkBoxContents(
        { ...validRequest, productIds: ["a", "b", "c"] },
        catalog,
      ).ok,
    ).toBe(false);
    expect(
      checkBoxContents(
        { ...validRequest, productIds: ["a", "a", "b", "c"] },
        catalog,
      ).ok,
    ).toBe(false);
    expect(
      checkBoxContents(
        { ...validRequest, productIds: ["a", "b", "c", "zz"] },
        catalog,
      ).ok,
    ).toBe(false);
  });

  it("requires the 16+ confirmation when the box holds wine", () => {
    const withWine = { ...validRequest, productIds: ["a", "b", "c", "wine"] };
    expect(checkBoxContents(withWine, catalog)).toEqual({
      ok: false,
      errors: { ageConfirmed: true },
    });
    expect(
      checkBoxContents({ ...withWine, ageConfirmed: true }, catalog).ok,
    ).toBe(true);
  });
});
