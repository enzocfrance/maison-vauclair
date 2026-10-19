import { randomBytes } from "node:crypto";
import { estimateDelivery, shippingProfile } from "@/shared/delivery/delivery";
import type { Order } from "@/shared/order/order";
import {
  checkBoxContents,
  collectErrors,
  orderRequestSchema,
  type OrderErrors,
} from "@/shared/order/order-request";
import { priceBox } from "@/shared/pricing";
import type { CatalogRepository } from "../catalog/catalog-repository";
import { resolveToday } from "../clock";
import type { OrderRepository } from "./order-repository";
import { generateWelcomeCode } from "./welcome-code";

export type CreateOrderResult =
  { ok: true; order: Order } | { ok: false; errors: OrderErrors };

export type CreateOrderDependencies = {
  catalog: CatalogRepository;
  orders: OrderRepository;
  now: () => Date;
};

/**
 * Validates the request, then recomputes everything that matters from the
 * catalog and today's date: the browser's prices and dates are never trusted.
 */
export async function createOrder(
  input: unknown,
  { catalog, orders, now }: CreateOrderDependencies,
): Promise<CreateOrderResult> {
  const parsed = orderRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: collectErrors(parsed.error) };
  }
  const request = parsed.data;

  const contents = checkBoxContents(request, await catalog.listProducts());
  if (!contents.ok) return contents;

  const moment = now();
  const today = resolveToday(request.demoDate, moment);
  const delivery = estimateDelivery(
    today.date,
    shippingProfile(contents.items),
  );

  const order = await orders.create({
    accessToken: randomBytes(16).toString("hex"),
    createdAt: moment.toISOString(),
    orderDate: today.date,
    simulatedDate: today.simulated,
    locale: request.locale,
    sizeId: request.sizeId,
    items: contents.items,
    price: priceBox(request.sizeId, contents.items),
    delivery: {
      shipDate: delivery.shipDate,
      deliveryDate: delivery.deliveryDate,
      profile: delivery.profile,
    },
    expectedDeliveryDate: request.expectedDeliveryDate,
    recipient: request.recipient,
    cardLanguage: request.cardLanguage,
    message: request.message,
    welcomeCode: request.welcomeCard ? generateWelcomeCode() : null,
    buyer: request.buyer,
  });

  return { ok: true, order };
}
