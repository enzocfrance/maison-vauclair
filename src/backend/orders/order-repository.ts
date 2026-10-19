import type { Order, OrderDraft } from "@/shared/order/order";

/** Where orders are kept: JSON files in v1, WooCommerce later. */
export interface OrderRepository {
  /** Stores the order under the next number of its year. */
  create(draft: OrderDraft): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  /** Most recent first. */
  list(): Promise<Order[]>;
}
