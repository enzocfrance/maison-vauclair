import { describe, expect, it } from "vitest";
import { addDays, dayOfWeek, isIsoDate, todayInZurich } from "./calendar";

describe("isIsoDate", () => {
  it("accepts real calendar dates only", () => {
    expect(isIsoDate("2026-12-24")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-12-24T10:00")).toBe(false);
    expect(isIsoDate("24.12.2026")).toBe(false);
  });
});

describe("addDays", () => {
  it("crosses months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("ignores daylight saving changes", () => {
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("dayOfWeek", () => {
  it("numbers days from Sunday (0) to Saturday (6)", () => {
    expect(dayOfWeek("2026-12-24")).toBe(4);
    expect(dayOfWeek("2026-12-27")).toBe(0);
  });
});

describe("todayInZurich", () => {
  it("switches day at midnight in Zurich, not in UTC (winter, UTC+1)", () => {
    expect(todayInZurich(new Date("2026-12-22T22:59:59Z"))).toBe("2026-12-22");
    expect(todayInZurich(new Date("2026-12-22T23:00:00Z"))).toBe("2026-12-23");
  });

  it("switches day at midnight in Zurich, not in UTC (summer, UTC+2)", () => {
    expect(todayInZurich(new Date("2026-07-01T21:59:59Z"))).toBe("2026-07-01");
    expect(todayInZurich(new Date("2026-07-01T22:00:00Z"))).toBe("2026-07-02");
  });
});
