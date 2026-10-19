import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { OrderDraft } from "@/shared/order/order";
import { JsonFileOrderRepository } from "./json-file-order-repository";

const draft = (
  orderDate = "2026-12-10",
  createdAt = "2026-12-10T09:00:00.000Z",
): OrderDraft => ({
  accessToken: "0123456789abcdef0123456789abcdef",
  createdAt,
  orderDate,
  simulatedDate: false,
  locale: "fr",
  sizeId: "small",
  items: [
    {
      id: "mountain-honey",
      category: "grocery",
      name: { fr: "Miel de montagne", de: "Berghonig" },
      size: { amount: 250, unit: "g" },
      priceCents: 1350,
      fresh: false,
      alcohol: false,
    },
  ],
  price: { productsCents: 1350, packagingCents: 900, totalCents: 2250 },
  delivery: {
    shipDate: "2026-12-11",
    deliveryDate: "2026-12-14",
    profile: "ambient",
  },
  expectedDeliveryDate: "2026-12-14",
  recipient: {
    name: "Ursula Meier",
    street: "Seefeldstrasse 12",
    postalCode: "8008",
    city: "Zürich",
  },
  cardLanguage: "de",
  message: "Joyeux Noël !",
  welcomeCode: "K7Q3PZ",
  buyer: { name: "Thomas Meier", email: "thomas@example.ch" },
});

describe("JsonFileOrderRepository", () => {
  let directory: string;
  let repository: JsonFileOrderRepository;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "mv-orders-"));
    repository = new JsonFileOrderRepository(path.join(directory, "orders"));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("numbers orders in one sequence per year", async () => {
    expect((await repository.create(draft())).id).toBe("VC-2026-0001");
    expect((await repository.create(draft())).id).toBe("VC-2026-0002");
    expect((await repository.create(draft("2027-01-04"))).id).toBe(
      "VC-2027-0001",
    );
  });

  it("never gives the same number twice, even to simultaneous orders", async () => {
    const orders = await Promise.all(
      Array.from({ length: 10 }, () => repository.create(draft())),
    );
    const ids = orders.map((order) => order.id).sort();
    expect(ids).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `VC-2026-${String(index + 1).padStart(4, "0")}`,
      ),
    );
  });

  it("reads back what it stored and leaves no temporary file", async () => {
    const order = await repository.create(draft());
    expect(await repository.findById(order.id)).toEqual(order);
    expect(await readdir(path.join(directory, "orders"))).toEqual([
      "VC-2026-0001.json",
    ]);
  });

  it("refuses anything that is not an order number", async () => {
    await repository.create(draft());
    expect(await repository.findById("../../etc/passwd")).toBeNull();
    expect(await repository.findById("VC-2026-0001.json")).toBeNull();
    expect(await repository.findById("VC-2026-9999")).toBeNull();
  });

  it("lists the most recent orders first", async () => {
    await repository.create(draft("2026-12-10", "2026-12-10T09:00:00.000Z"));
    await repository.create(draft("2026-12-11", "2026-12-11T09:00:00.000Z"));
    expect((await repository.list()).map((order) => order.id)).toEqual([
      "VC-2026-0002",
      "VC-2026-0001",
    ]);
  });

  it("lists nothing before the first order", async () => {
    expect(await repository.list()).toEqual([]);
  });
});
