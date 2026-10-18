import { addDays, dayOfWeek, isoDate, type IsoDate } from "./calendar";

/** Easter Sunday in the Gregorian calendar (anonymous algorithm, Meeus). */
export function easterSunday(year: number): IsoDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return isoDate(year, month, day);
}

/** Monday after the third Sunday of September. */
function federalFastMonday(year: number): IsoDate {
  const firstOfSeptember = isoDate(year, 9, 1);
  const firstSunday = addDays(
    firstOfSeptember,
    (7 - dayOfWeek(firstOfSeptember)) % 7,
  );
  return addDays(firstSunday, 15);
}

const cache = new Map<number, readonly IsoDate[]>();

/**
 * Public holidays of the canton of Vaud, computed for any year.
 * v1 limit: the holidays of the recipient's canton are not taken into account.
 */
export function vaudHolidays(year: number): readonly IsoDate[] {
  const cached = cache.get(year);
  if (cached) return cached;

  const easter = easterSunday(year);
  const holidays = [
    isoDate(year, 1, 1),
    isoDate(year, 1, 2),
    addDays(easter, -2), // Vendredi saint
    addDays(easter, 1), // Lundi de Pâques
    addDays(easter, 39), // Ascension
    addDays(easter, 50), // Lundi de Pentecôte
    isoDate(year, 8, 1),
    federalFastMonday(year),
    isoDate(year, 12, 25),
  ].sort();

  cache.set(year, holidays);
  return holidays;
}

export function isHoliday(date: IsoDate): boolean {
  return vaudHolidays(Number(date.slice(0, 4))).includes(date);
}

/** Monday to Friday, outside public holidays. */
export function isWorkingDay(date: IsoDate): boolean {
  const weekday = dayOfWeek(date);
  return weekday >= 1 && weekday <= 5 && !isHoliday(date);
}
