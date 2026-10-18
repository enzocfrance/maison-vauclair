import type { IsoDate } from "./delivery/calendar";

/** Query parameter that carries the simulated date through the whole journey. */
export const demoDateParam = "date";

export function withDemoDate(path: string, demoDate: IsoDate | null): string {
  if (!demoDate) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${demoDateParam}=${demoDate}`;
}
