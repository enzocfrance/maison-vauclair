import {
  isIsoDate,
  todayInZurich,
  type IsoDate,
} from "@/shared/delivery/calendar";
import { isDemoMode } from "./config";

export type BusinessToday = {
  date: IsoDate;
  /** True when a demonstration replaces today's date. */
  simulated: boolean;
};

/** Today in Zurich, or the simulated date of a demonstration when demo mode is on. */
export function resolveToday(
  requested: string | undefined,
  now: Date = new Date(),
): BusinessToday {
  if (requested !== undefined && isDemoMode() && isIsoDate(requested)) {
    return { date: requested, simulated: true };
  }
  return { date: todayInZurich(now), simulated: false };
}
