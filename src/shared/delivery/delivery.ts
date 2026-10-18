import type { Product } from "@/shared/catalog/product";
import { addDays, dayOfWeek, type IsoDate } from "./calendar";
import { isWorkingDay } from "./holidays";

/** A box travels refrigerated as soon as it holds one fresh product. */
export type ShippingProfile = "fresh" | "ambient";

export type DeliveryEstimate = {
  orderDate: IsoDate;
  shipDate: IsoDate;
  deliveryDate: IsoDate;
  profile: ShippingProfile;
};

export type ChristmasOutlook = {
  /** Last order date delivered by 24 December. */
  deadline: IsoDate;
  /** True between the deadline and Christmas Eve. */
  passed: boolean;
};

/** Far more than any real gap between two shipping days: guards against endless loops. */
const searchLimitInDays = 60;

export function shippingProfile(
  products: readonly Pick<Product, "fresh">[],
): ShippingProfile {
  return products.some((product) => product.fresh) ? "fresh" : "ambient";
}

/**
 * Shipping and delivery dates of an order.
 * - The box leaves at the earliest the day after the order.
 * - Fresh: Monday to Wednesday only, and only if the next day is a working day.
 * - Ambient: any working day.
 * - Delivery: the next working day after shipping.
 */
export function estimateDelivery(
  orderDate: IsoDate,
  profile: ShippingProfile,
): DeliveryEstimate {
  const shipDate = findDate(addDays(orderDate, 1), 1, (date) =>
    canShip(date, profile),
  );
  const deliveryDate = findDate(addDays(shipDate, 1), 1, isWorkingDay);
  return { orderDate, shipDate, deliveryDate, profile };
}

/** The last order date delivered by 24 December of that year. */
export function christmasDeadline(
  year: number,
  profile: ShippingProfile,
): IsoDate {
  const christmasEve = `${year}-12-24`;
  return findDate(
    addDays(christmasEve, -1),
    -1,
    (date) => estimateDelivery(date, profile).deliveryDate <= christmasEve,
  );
}

/** What to tell a customer about Christmas today; nothing once it has gone. */
export function christmasOutlook(
  today: IsoDate,
  profile: ShippingProfile,
): ChristmasOutlook | null {
  const year = Number(today.slice(0, 4));
  if (today > `${year}-12-24`) return null;
  const deadline = christmasDeadline(year, profile);
  return { deadline, passed: today > deadline };
}

function canShip(date: IsoDate, profile: ShippingProfile): boolean {
  if (!isWorkingDay(date)) return false;
  if (profile === "ambient") return true;
  const weekday = dayOfWeek(date);
  return weekday >= 1 && weekday <= 3 && isWorkingDay(addDays(date, 1));
}

function findDate(
  start: IsoDate,
  step: 1 | -1,
  matches: (date: IsoDate) => boolean,
): IsoDate {
  let date = start;
  for (let attempt = 0; attempt < searchLimitInDays; attempt += 1) {
    if (matches(date)) return date;
    date = addDays(date, step);
  }
  throw new Error(
    `No matching date within ${searchLimitInDays} days of ${start}`,
  );
}
