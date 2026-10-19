import type { Metadata } from "next";
import { orderRepository } from "@/backend/container";
import { OrdersBoard } from "@/frontend/team/orders-board";
import { teamTexts } from "@/frontend/team/team-texts";

export const metadata: Metadata = { title: teamTexts.ordersTitle };

export default async function TeamOrdersPage() {
  const orders = await orderRepository.list();

  return (
    <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <OrdersBoard orders={orders} />
    </main>
  );
}
