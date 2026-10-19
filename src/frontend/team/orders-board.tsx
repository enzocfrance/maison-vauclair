import Link from "next/link";
import { getDictionary } from "@/frontend/i18n";
import { format, formatLongDate } from "@/frontend/i18n/format";
import { teamPath } from "@/shared/i18n/routes";
import { formatChf } from "@/shared/money";
import type { Order } from "@/shared/order/order";
import { teamTexts as t } from "./team-texts";

const cell = "px-3 py-3 align-top";
const headerCell =
  "px-3 py-2.5 text-[0.625rem] font-semibold tracking-label text-muted uppercase";

/** Grouped by shipping day: the logistics team prepares one day at a time. */
export function OrdersBoard({ orders }: { orders: readonly Order[] }) {
  const { sizes } = getDictionary("fr");
  const byShipDate = new Map<string, Order[]>();
  for (const order of [...orders].sort((a, b) => a.id.localeCompare(b.id))) {
    const group = byShipDate.get(order.delivery.shipDate) ?? [];
    group.push(order);
    byShipDate.set(order.delivery.shipDate, group);
  }
  const groups = [...byShipDate].sort(([a], [b]) => a.localeCompare(b));

  const stats = [
    { label: t.stats.orders, value: String(orders.length) },
    {
      label: t.stats.fresh,
      value: String(
        orders.filter((order) => order.delivery.profile === "fresh").length,
      ),
    },
    {
      label: t.stats.revenue,
      value: formatChf(
        orders.reduce((sum, order) => sum + order.price.totalCents, 0),
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p className="label-caps text-muted">{t.space}</p>
        <h1 className="text-4xl font-light tracking-[-0.03em]">
          {t.ordersTitle}
        </h1>
      </div>

      <dl className="grid grid-cols-3 border border-ink bg-white">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1.5 border-r border-ink px-4 py-3 last:border-r-0"
          >
            <dt className="text-[0.625rem] font-semibold tracking-label text-muted uppercase">
              {stat.label}
            </dt>
            <dd className="text-xl font-light tabular-nums sm:text-2xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {groups.length === 0 && <p>{t.empty}</p>}

      {groups.map(([shipDate, group]) => (
        <section key={shipDate} className="flex flex-col gap-3">
          <h2 className="text-xl font-light">
            {format(t.shipOn, { date: formatLongDate(shipDate, "fr") })}
          </h2>
          <div className="overflow-x-auto border border-ink bg-white">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink text-left">
                  <th scope="col" className={headerCell}>
                    {t.columns.order}
                  </th>
                  <th scope="col" className={headerCell}>
                    {t.columns.box}
                  </th>
                  <th scope="col" className={headerCell}>
                    {t.columns.recipient}
                  </th>
                  <th scope="col" className={headerCell}>
                    {t.columns.transport}
                  </th>
                  <th scope="col" className={headerCell}>
                    {t.columns.delivery}
                  </th>
                  <th scope="col" className={headerCell}>
                    {t.columns.card}
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <th scope="row" className={`${cell} text-left font-medium`}>
                      <Link
                        href={teamPath("order", { orderId: order.id })}
                        className="tabular-nums underline underline-offset-4 hover:no-underline"
                      >
                        {order.id}
                      </Link>
                    </th>
                    <td className={cell}>
                      {sizes[order.sizeId]} · {order.items.length}
                    </td>
                    <td className={cell}>
                      {order.recipient.name}
                      <span className="block text-xs text-muted">
                        {order.recipient.postalCode} {order.recipient.city}
                      </span>
                    </td>
                    <td className={cell}>
                      <span className="inline-flex items-center gap-2">
                        {order.delivery.profile === "fresh" && (
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-accent"
                          />
                        )}
                        {t.transport[order.delivery.profile]}
                      </span>
                    </td>
                    <td className={cell}>
                      {formatLongDate(order.delivery.deliveryDate, "fr")}
                    </td>
                    <td className={cell}>
                      {order.welcomeCode
                        ? t.languageCodes[order.cardLanguage]
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
