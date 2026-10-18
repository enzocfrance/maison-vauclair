import { describe, expect, it } from "vitest";
import { easterSunday, isWorkingDay, vaudHolidays } from "./holidays";

describe("easterSunday", () => {
  it("matches the published dates", () => {
    expect(easterSunday(2025)).toBe("2025-04-20");
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(easterSunday(2028)).toBe("2028-04-16");
  });
});

describe("vaudHolidays", () => {
  it("lists the public holidays of the canton of Vaud in 2026", () => {
    expect(vaudHolidays(2026)).toEqual([
      "2026-01-01", // Nouvel An
      "2026-01-02", // 2 janvier
      "2026-04-03", // Vendredi saint
      "2026-04-06", // Lundi de Pâques
      "2026-05-14", // Ascension
      "2026-05-25", // Lundi de Pentecôte
      "2026-08-01", // Fête nationale
      "2026-09-21", // Lundi du Jeûne fédéral
      "2026-12-25", // Noël
    ]);
  });

  it("lists the public holidays of the canton of Vaud in 2027", () => {
    expect(vaudHolidays(2027)).toEqual([
      "2027-01-01",
      "2027-01-02",
      "2027-03-26",
      "2027-03-29",
      "2027-05-06",
      "2027-05-17",
      "2027-08-01",
      "2027-09-20",
      "2027-12-25",
    ]);
  });
});

describe("isWorkingDay", () => {
  it("is Monday to Friday, outside public holidays", () => {
    expect(isWorkingDay("2026-12-24")).toBe(true); // Thursday
    expect(isWorkingDay("2026-12-25")).toBe(false); // Christmas
    expect(isWorkingDay("2026-12-26")).toBe(false); // Saturday
    expect(isWorkingDay("2026-12-27")).toBe(false); // Sunday
    expect(isWorkingDay("2026-05-14")).toBe(false); // Ascension
  });
});
