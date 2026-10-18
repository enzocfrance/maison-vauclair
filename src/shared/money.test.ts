import { describe, expect, it } from "vitest";
import { formatChf } from "./money";

describe("formatChf", () => {
  it("writes whole francs with a dash, like the mock-ups", () => {
    expect(formatChf(7900)).toBe("CHF 79.–");
    expect(formatChf(0)).toBe("CHF 0.–");
  });

  it("writes cents with two digits", () => {
    expect(formatChf(1450)).toBe("CHF 14.50");
    expect(formatChf(10420)).toBe("CHF 104.20");
    expect(formatChf(5)).toBe("CHF 0.05");
  });

  it("separates thousands with a Swiss apostrophe", () => {
    expect(formatChf(125000)).toBe("CHF 1’250.–");
    expect(formatChf(123456789)).toBe("CHF 1’234’567.89");
  });

  it("never breaks the line between CHF and the amount", () => {
    expect(formatChf(1450)).not.toContain(" ");
  });

  it("rejects amounts that are not whole cents", () => {
    expect(() => formatChf(14.5)).toThrow(RangeError);
    expect(() => formatChf(-100)).toThrow(RangeError);
  });
});
