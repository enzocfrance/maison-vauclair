import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonCatalogRepository } from "../catalog/json-catalog-repository";
import { demoOrders, seedDemoOrders } from "./demo-orders";
import { JsonFileOrderRepository } from "./json-file-order-repository";

describe("seedDemoOrders", () => {
  let directory: string;
  let orders: JsonFileOrderRepository;
  const catalog = new JsonCatalogRepository();

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "vauclair-demo-"));
    orders = new JsonFileOrderRepository(directory);
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("places every demo order through the real rules, numbered in order", async () => {
    expect(await seedDemoOrders({ catalog, orders })).toBe(demoOrders.length);

    const stored = (await orders.list()).reverse();
    expect(stored.map((order) => order.id)).toEqual(
      demoOrders.map(
        (_, index) => `VC-2026-${String(index + 1).padStart(4, "0")}`,
      ),
    );
    for (const order of stored) {
      expect(order.simulatedDate).toBe(false);
      expect(order.expectedDeliveryDate).toBe(order.delivery.deliveryDate);
    }
  });

  it("gives the presentation day boxes to ship that day, the next day and Monday", async () => {
    await seedDemoOrders({ catalog, orders });

    const perShipDate: Record<string, number> = {};
    for (const order of await orders.list()) {
      const date = order.delivery.shipDate;
      perShipDate[date] = (perShipDate[date] ?? 0) + 1;
    }
    expect(perShipDate).toEqual({
      "2026-10-21": 7,
      "2026-10-22": 2,
      "2026-10-26": 3,
    });
  });

  it("leaves a store that already holds orders untouched", async () => {
    await seedDemoOrders({ catalog, orders });

    expect(await seedDemoOrders({ catalog, orders })).toBe(0);
    expect(await orders.list()).toHaveLength(demoOrders.length);
  });
});
