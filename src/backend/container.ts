import type { CatalogRepository } from "./catalog/catalog-repository";
import { JsonCatalogRepository } from "./catalog/json-catalog-repository";
import { ordersDirectory } from "./config";
import { createOrder } from "./orders/create-order";
import { findCustomerOrder } from "./orders/find-customer-order";
import { JsonFileOrderRepository } from "./orders/json-file-order-repository";
import type { OrderRepository } from "./orders/order-repository";

/** The one place where implementations are chosen: swap these for WooCommerce. */
export const catalogRepository: CatalogRepository = new JsonCatalogRepository();

export const orderRepository: OrderRepository = new JsonFileOrderRepository(
  ordersDirectory(),
);

export function placeOrder(input: unknown) {
  return createOrder(input, {
    catalog: catalogRepository,
    orders: orderRepository,
    now: () => new Date(),
  });
}

export function getCustomerOrder(id: string, accessToken: string | undefined) {
  return findCustomerOrder(orderRepository, id, accessToken);
}
