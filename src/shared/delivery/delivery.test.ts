import { describe, expect, it } from "vitest";
import {
  christmasDeadline,
  christmasOutlook,
  estimateDelivery,
  shippingProfile,
} from "./delivery";

const dates = (orderDate: string, profile: "fresh" | "ambient") => {
  const { shipDate, deliveryDate } = estimateDelivery(orderDate, profile);
  return { shipDate, deliveryDate };
};

describe("shippingProfile", () => {
  it("is fresh as soon as one product is fresh", () => {
    expect(shippingProfile([{ fresh: false }, { fresh: true }])).toBe("fresh");
    expect(shippingProfile([{ fresh: false }, { fresh: false }])).toBe(
      "ambient",
    );
    expect(shippingProfile([])).toBe("ambient");
  });
});

describe("estimateDelivery, fresh box", () => {
  it("matches the preparation sheet: ordered Thursday 10, shipped Monday 14, delivered Tuesday 15", () => {
    expect(dates("2026-12-10", "fresh")).toEqual({
      shipDate: "2026-12-14",
      deliveryDate: "2026-12-15",
    });
  });

  it("never ships on the day of the order", () => {
    expect(dates("2026-12-14", "fresh")).toEqual({
      shipDate: "2026-12-15",
      deliveryDate: "2026-12-16",
    });
  });

  it("waits for Monday after a weekend order", () => {
    expect(dates("2026-12-12", "fresh").shipDate).toBe("2026-12-14");
    expect(dates("2026-12-13", "fresh").shipDate).toBe("2026-12-14");
  });

  it("delivers on 24 December when ordered on Tuesday 22", () => {
    expect(dates("2026-12-22", "fresh")).toEqual({
      shipDate: "2026-12-23",
      deliveryDate: "2026-12-24",
    });
  });

  it("delivers on Tuesday 29 when ordered on Wednesday 23", () => {
    expect(dates("2026-12-23", "fresh")).toEqual({
      shipDate: "2026-12-28",
      deliveryDate: "2026-12-29",
    });
  });

  it("does not ship on Wednesday 13 May 2026, the eve of Ascension", () => {
    expect(dates("2026-05-12", "fresh")).toEqual({
      shipDate: "2026-05-18",
      deliveryDate: "2026-05-19",
    });
    expect(dates("2026-05-13", "fresh").shipDate).toBe("2026-05-18");
  });

  it("skips Easter Monday, Whit Monday and the Federal Fast Monday", () => {
    expect(dates("2026-04-01", "fresh")).toEqual({
      shipDate: "2026-04-07",
      deliveryDate: "2026-04-08",
    });
    expect(dates("2026-05-22", "fresh").shipDate).toBe("2026-05-26");
    expect(dates("2026-09-18", "fresh").shipDate).toBe("2026-09-22");
  });

  it("crosses New Year's holidays", () => {
    expect(dates("2026-12-30", "fresh")).toEqual({
      shipDate: "2027-01-04",
      deliveryDate: "2027-01-05",
    });
  });
});

describe("estimateDelivery, box without fresh products", () => {
  it("also ships on Thursday and Friday", () => {
    expect(dates("2026-12-09", "ambient")).toEqual({
      shipDate: "2026-12-10",
      deliveryDate: "2026-12-11",
    });
  });

  it("delivers on the next working day after a Friday shipment", () => {
    expect(dates("2026-12-10", "ambient")).toEqual({
      shipDate: "2026-12-11",
      deliveryDate: "2026-12-14",
    });
  });

  it("does not deliver on Christmas Day", () => {
    expect(dates("2026-12-23", "ambient")).toEqual({
      shipDate: "2026-12-24",
      deliveryDate: "2026-12-28",
    });
  });
});

describe("christmasDeadline", () => {
  it("is Tuesday 22 December in 2026, whatever the box", () => {
    expect(christmasDeadline(2026, "fresh")).toBe("2026-12-22");
    expect(christmasDeadline(2026, "ambient")).toBe("2026-12-22");
  });

  it("is Tuesday 21 December in 2027 for fresh boxes, when the 24th is a Friday", () => {
    expect(christmasDeadline(2027, "fresh")).toBe("2027-12-21");
    expect(christmasDeadline(2027, "ambient")).toBe("2027-12-22");
  });
});

describe("christmasOutlook", () => {
  it("announces the deadline ahead of Christmas", () => {
    expect(christmasOutlook("2026-10-21", "fresh")).toEqual({
      deadline: "2026-12-22",
      passed: false,
    });
  });

  it("still accepts orders on the deadline itself", () => {
    expect(christmasOutlook("2026-12-22", "fresh")?.passed).toBe(false);
  });

  it("says it is too late between the deadline and Christmas Eve", () => {
    expect(christmasOutlook("2026-12-23", "fresh")).toEqual({
      deadline: "2026-12-22",
      passed: true,
    });
    expect(christmasOutlook("2026-12-24", "fresh")?.passed).toBe(true);
  });

  it("says nothing once Christmas has gone", () => {
    expect(christmasOutlook("2026-12-25", "fresh")).toBeNull();
  });
});
