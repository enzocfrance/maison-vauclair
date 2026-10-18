/** A business date, `AAAA-MM-JJ`, with no time and no time zone. */
export type IsoDate = string;

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dayInMs = 86_400_000;

export function isIsoDate(value: unknown): value is IsoDate {
  return (
    typeof value === "string" &&
    isoDatePattern.test(value) &&
    toUtc(value).toISOString().slice(0, 10) === value
  );
}

/** Calendar arithmetic in UTC, so daylight saving never shifts a day. */
export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toUtc(date).getTime() + days * dayInMs)
    .toISOString()
    .slice(0, 10);
}

/** 0 for Sunday to 6 for Saturday. */
export function dayOfWeek(date: IsoDate): number {
  return toUtc(date).getUTCDay();
}

export function isoDate(year: number, month: number, day: number): IsoDate {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

/** Today's date in Zurich: the server runs in UTC, the shop does not. */
export function todayInZurich(now: Date): IsoDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function toUtc(date: IsoDate): Date {
  return new Date(`${date}T00:00:00Z`);
}
