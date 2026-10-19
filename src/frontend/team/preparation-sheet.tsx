import { getDictionary } from "@/frontend/i18n";
import {
  capitalize,
  format,
  formatLongDate,
  formatShortDate,
  formatSize,
} from "@/frontend/i18n/format";
import type { Order } from "@/shared/order/order";
import { teamTexts } from "./team-texts";

const label =
  "text-[0.625rem] font-semibold tracking-label text-muted uppercase";

/** The A4 sheet of mock-up 4: printed, ticked by hand, nothing new to learn. */
export function PreparationSheet({ order }: { order: Order }) {
  const t = teamTexts.sheet;
  const fr = getDictionary("fr");
  const isFresh = order.delivery.profile === "fresh";
  // Cold products first: they are picked together, last out of the fridge.
  const items = [...order.items].sort(
    (a, b) => Number(b.fresh) - Number(a.fresh),
  );

  return (
    <article
      aria-labelledby="sheet-title"
      className="mx-auto flex w-full max-w-[210mm] flex-col gap-6 bg-white p-6 sm:min-h-[297mm] sm:p-12 print:min-h-[273mm] print:max-w-none print:p-0"
    >
      <header className="flex items-end justify-between gap-4 border-b border-ink pb-3.5">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-3 rounded-full bg-ink" />
            <span className="text-[0.8125rem] font-semibold tracking-brand uppercase">
              {fr.site.brand}
            </span>
          </p>
          <h1
            id="sheet-title"
            className="text-[1.625rem] font-light tracking-[-0.02em]"
          >
            {t.title}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className={label}>{t.order}</p>
          <p className="text-lg tabular-nums">{order.id}</p>
        </div>
      </header>

      <dl className="grid grid-cols-3 border border-ink">
        <div className="flex flex-col gap-1.5 border-r border-ink px-3.5 py-3">
          <dt className={label}>{t.shipOn}</dt>
          <dd className="text-[1.0625rem] font-medium">
            {capitalize(formatShortDate(order.delivery.shipDate, "fr"))}
          </dd>
        </div>
        <div className="flex flex-col gap-1.5 border-r border-ink px-3.5 py-3">
          <dt className={label}>{t.box}</dt>
          <dd className="text-[1.0625rem] font-medium">
            {fr.sizes[order.sizeId]} · {order.items.length}
          </dd>
        </div>
        <div className="flex flex-col gap-1.5 px-3.5 py-3">
          <dt className={label}>{t.transport}</dt>
          <dd className="flex items-center gap-2 text-[1.0625rem] font-medium">
            {isFresh && (
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-accent"
              />
            )}
            {teamTexts.transport[order.delivery.profile]}
          </dd>
        </div>
      </dl>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th scope="col" className="w-7 px-1 py-2">
              <span className="sr-only">{t.prepared}</span>
            </th>
            <th scope="col" className={`${label} px-1 py-2`}>
              {t.product}
            </th>
            <th scope="col" className={`${label} px-1 py-2`}>
              {t.quantity}
            </th>
            <th scope="col" className={`${label} px-1 py-2`}>
              {t.zone}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-line">
              <td className="px-1 py-2.5">
                <span
                  aria-hidden="true"
                  className="block size-4 border-[1.5px] border-ink"
                />
              </td>
              <td className="px-1 py-2.5 font-medium">{item.name.fr}</td>
              <td className="px-1 py-2.5">{formatSize(item.size, fr)}</td>
              <td className="px-1 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 rounded-full border-[1.5px] border-ink ${item.fresh ? "bg-ink" : ""}`}
                  />
                  {item.fresh ? teamTexts.zone.cold : teamTexts.zone.dry}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid gap-5 sm:grid-cols-2 print:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h2 className={label}>{t.message}</h2>
          <p className="border border-ink px-3.5 py-3 text-[0.9375rem] leading-normal font-light">
            {order.message ? `« ${order.message} »` : t.noMessage}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className={label}>{t.recipient}</h2>
          <address className="text-sm leading-relaxed not-italic">
            {order.recipient.name}
            <br />
            {order.recipient.street}
            <br />
            {order.recipient.postalCode} {order.recipient.city}
          </address>
          <p className="flex items-center gap-2 border-t border-line pt-2 text-[0.8125rem] font-medium">
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 border-[1.5px] border-ink"
            />
            {order.welcomeCode
              ? format(teamTexts.card, {
                  language: teamTexts.languageCodes[order.cardLanguage],
                })
              : teamTexts.noCard}
          </p>
        </section>
      </div>

      <footer className="mt-auto flex flex-col gap-2 border-t border-ink pt-2.5 text-xs text-muted">
        <div className="flex flex-wrap justify-between gap-2">
          <span>
            {format(t.received, {
              date: formatLongDate(order.orderDate, "fr"),
            })}
            {order.simulatedDate && ` · ${t.simulated}`}
          </span>
          <span>{t.preparedBy}</span>
        </div>
        <p>{fr.site.demoNotice}</p>
      </footer>
    </article>
  );
}
