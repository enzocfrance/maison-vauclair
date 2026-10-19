import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatOrderId,
  type Order,
  type OrderDraft,
} from "@/shared/order/order";
import type { OrderRequest } from "@/shared/order/order-request";
import { JsonCatalogRepository } from "../catalog/json-catalog-repository";
import { createOrder } from "./create-order";
import { findCustomerOrder } from "./find-customer-order";
import type { OrderRepository } from "./order-repository";

class MemoryOrderRepository implements OrderRepository {
  readonly orders: Order[] = [];

  async create(draft: OrderDraft): Promise<Order> {
    const order = {
      ...draft,
      id: formatOrderId(draft.orderDate.slice(0, 4), this.orders.length + 1),
    };
    this.orders.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) ?? null;
  }

  async list(): Promise<Order[]> {
    return [...this.orders].reverse();
  }
}

/** The Classique box of the mock-ups. */
const request: OrderRequest = {
  locale: "fr",
  sizeId: "classic",
  productIds: [
    "gruyere-aop-18-months",
    "vacherin-mont-d-or-aop",
    "vaud-tomme",
    "vaud-sausage-igp",
    "mountain-honey",
    "chasselas-lavaux-aoc",
  ],
  recipient: {
    name: "Ursula Meier",
    street: "Seefeldstrasse 12",
    postalCode: "8008",
    city: "Zürich",
  },
  cardLanguage: "de",
  message:
    "Joyeux Noël, maman ! Des fromages de chez nous pour les fêtes. Thomas",
  welcomeCard: true,
  buyer: { name: "Thomas Meier", email: "thomas@example.ch" },
  ageConfirmed: true,
  expectedDeliveryDate: "2026-12-15",
};

const setup = (now: string) => {
  const orders = new MemoryOrderRepository();
  const dependencies = {
    catalog: new JsonCatalogRepository(),
    orders,
    now: () => new Date(now),
  };
  return {
    orders,
    place: (input: unknown) => createOrder(input, dependencies),
  };
};

describe("createOrder", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stores the order with the server's prices and dates", async () => {
    const { place } = setup("2026-12-10T09:00:00Z");
    const result = await place(request);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order).toMatchObject({
      id: "VC-2026-0001",
      orderDate: "2026-12-10",
      simulatedDate: false,
      price: { productsCents: 10420, packagingCents: 1200, totalCents: 11620 },
      delivery: {
        shipDate: "2026-12-14",
        deliveryDate: "2026-12-15",
        profile: "fresh",
      },
    });
    expect(result.order.accessToken).toMatch(/^[a-f0-9]{32}$/);
    expect(result.order.welcomeCode).toMatch(/^[A-Z2-9]{6}$/);
  });

  it("decides the delivery date itself, past midnight in Zurich", async () => {
    // 23:30 UTC on 22 December is already Wednesday 23 in Zurich.
    const { place } = setup("2026-12-22T23:30:00Z");
    const result = await place({
      ...request,
      expectedDeliveryDate: "2026-12-24",
    });

    expect(result.ok && result.order.delivery.deliveryDate).toBe("2026-12-29");
    expect(result.ok && result.order.expectedDeliveryDate).toBe("2026-12-24");
  });

  it("stores nothing when the request is refused", async () => {
    const { orders, place } = setup("2026-12-10T09:00:00Z");
    expect(await place({ ...request, ageConfirmed: false })).toEqual({
      ok: false,
      errors: { ageConfirmed: true },
    });
    expect(
      await place({ ...request, productIds: request.productIds.slice(1) }),
    ).toEqual({
      ok: false,
      errors: { box: true },
    });
    expect(orders.orders).toHaveLength(0);
  });

  it("uses a simulated date only in demo mode", async () => {
    const { place } = setup("2026-10-21T09:00:00Z");
    const demo = { ...request, demoDate: "2026-12-23" };

    const withoutDemoMode = await place(demo);
    expect(withoutDemoMode.ok && withoutDemoMode.order.orderDate).toBe(
      "2026-10-21",
    );

    vi.stubEnv("DEMO_MODE", "true");
    const result = await place(demo);
    expect(result.ok && result.order.orderDate).toBe("2026-12-23");
    expect(result.ok && result.order.simulatedDate).toBe(true);
  });

  it("creates no welcome code without a welcome card", async () => {
    const { place } = setup("2026-12-10T09:00:00Z");
    const result = await place({ ...request, welcomeCard: false });
    expect(result.ok && result.order.welcomeCode).toBeNull();
  });
});

describe("findCustomerOrder", () => {
  it("opens an order only with its secret key", async () => {
    const { orders, place } = setup("2026-12-10T09:00:00Z");
    const result = await place(request);
    if (!result.ok) throw new Error("order refused");
    const { id, accessToken } = result.order;

    expect(await findCustomerOrder(orders, id, accessToken)).toEqual(
      result.order,
    );
    expect(await findCustomerOrder(orders, id, "0".repeat(32))).toBeNull();
    expect(await findCustomerOrder(orders, id, undefined)).toBeNull();
  });
});
