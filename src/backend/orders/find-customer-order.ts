import { timingSafeEqual } from "node:crypto";
import type { Order } from "@/shared/order/order";
import type { OrderRepository } from "./order-repository";

/**
 * Order numbers follow each other, so the confirmation page also requires the
 * order's secret key: nobody can read someone else's address by guessing a number.
 */
export async function findCustomerOrder(
  orders: OrderRepository,
  id: string,
  accessToken: string | undefined,
): Promise<Order | null> {
  if (!accessToken) return null;
  const order = await orders.findById(id);
  if (!order) return null;

  const expected = Buffer.from(order.accessToken);
  const given = Buffer.from(accessToken);
  return expected.length === given.length && timingSafeEqual(expected, given)
    ? order
    : null;
}
