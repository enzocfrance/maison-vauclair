import { afterEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/shared/order/order";
import { qrMatrix, welcomeCardFor } from "./welcome-card";

const order = {
  welcomeCode: "K7Q3PZ",
  cardLanguage: "de",
  orderDate: "2026-12-10",
} as const;

describe("welcomeCardFor", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("points the QR code to the welcome page of the live site", () => {
    vi.stubEnv("SITE_URL", "https://maison-vauclair.enzo-chamanier.fr");
    const card = welcomeCardFor(order as unknown as Order);

    expect(card).toMatchObject({
      code: "K7Q3PZ",
      locale: "de",
      url: "https://maison-vauclair.enzo-chamanier.fr/de/willkommen?code=K7Q3PZ&utm_source=coffret&utm_medium=carte&utm_campaign=carte-bienvenue-2026",
      displayUrl: "maison-vauclair.enzo-chamanier.fr/de/willkommen",
    });
    expect(card?.qr.size).toBeGreaterThanOrEqual(21);
  });

  it("prints no card when the buyer declined it", () => {
    expect(
      welcomeCardFor({ ...order, welcomeCode: null } as unknown as Order),
    ).toBeNull();
  });
});

describe("qrMatrix", () => {
  it("draws the same code for the same link", () => {
    const first = qrMatrix("https://example.ch/fr/bienvenue?code=K7Q3PZ");
    expect(first.path).toMatch(/^M\d+ \d+h1v1h-1z/);
    expect(qrMatrix("https://example.ch/fr/bienvenue?code=K7Q3PZ")).toEqual(
      first,
    );
  });
});
