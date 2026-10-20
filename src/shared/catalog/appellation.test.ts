import { describe, expect, it } from "vitest";
import { withoutAppellation } from "./appellation";

describe("withoutAppellation", () => {
  it("removes the appellation wherever it sits in the name", () => {
    expect(withoutAppellation("Gruyère AOP 18 mois", "AOP")).toBe(
      "Gruyère 18 mois",
    );
    expect(withoutAppellation("Vacherin Mont-d'Or AOP", "AOP")).toBe(
      "Vacherin Mont-d'Or",
    );
    expect(withoutAppellation("Waadtländer Saucisson IGP", "IGP")).toBe(
      "Waadtländer Saucisson",
    );
  });

  it("leaves words that only contain the letters alone", () => {
    expect(withoutAppellation("AOPX Gruyère AOP", "AOP")).toBe("AOPX Gruyère");
  });
});
