import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./negotiate-locale";

describe("negotiateLocale", () => {
  it("falls back to French without a header", () => {
    expect(negotiateLocale(null)).toBe("fr");
    expect(negotiateLocale("")).toBe("fr");
  });

  it("recognises regional variants", () => {
    expect(negotiateLocale("de-CH,de;q=0.9,fr;q=0.8")).toBe("de");
    expect(negotiateLocale("fr-CH")).toBe("fr");
  });

  it("follows the quality order, not the header order", () => {
    expect(negotiateLocale("en;q=0.9,de;q=0.7,fr;q=0.8")).toBe("fr");
  });

  it("skips unsupported and refused languages", () => {
    expect(negotiateLocale("en-US,en;q=0.9,de;q=0.5")).toBe("de");
    expect(negotiateLocale("de;q=0,it")).toBe("fr");
  });

  it("treats Swiss German as German", () => {
    expect(negotiateLocale("gsw-CH")).toBe("de");
  });
});
