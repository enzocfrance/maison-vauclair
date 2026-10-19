import { describe, expect, it } from "vitest";
import { welcomeCodePattern, welcomeLink } from "./welcome";

describe("welcomeLink", () => {
  it("leads to the welcome page in the card's language, with the code and the campaign", () => {
    expect(welcomeLink("de", "K7Q3PZ", "2026")).toBe(
      "/de/willkommen?code=K7Q3PZ&utm_source=coffret&utm_medium=carte&utm_campaign=carte-bienvenue-2026",
    );
    expect(welcomeLink("fr", "K7Q3PZ", "2026")).toMatch(
      /^\/fr\/bienvenue\?code=K7Q3PZ&/,
    );
  });
});

describe("welcomeCodePattern", () => {
  it("accepts only codes that cannot be misread", () => {
    expect(welcomeCodePattern.test("K7Q3PZ")).toBe(true);
    expect(welcomeCodePattern.test("K7Q3P0")).toBe(false);
    expect(welcomeCodePattern.test("K7Q3PI")).toBe(false);
    expect(welcomeCodePattern.test("k7q3pz")).toBe(false);
    expect(welcomeCodePattern.test("K7Q3PZ9")).toBe(false);
  });
});
