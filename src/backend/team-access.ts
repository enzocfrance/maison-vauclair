import { createHash, timingSafeEqual } from "node:crypto";

export type TeamAccess = "granted" | "denied" | "closed";

/**
 * HTTP Basic authentication with one shared password, `TEAM_PASSWORD`.
 * Without it, the space stays closed in production and open in development.
 */
export function checkTeamAccess(authorization: string | null): TeamAccess {
  const password = process.env.TEAM_PASSWORD;
  if (!password) {
    return process.env.NODE_ENV === "production" ? "closed" : "granted";
  }
  if (!authorization?.startsWith("Basic ")) return "denied";

  const credentials = Buffer.from(authorization.slice(6), "base64").toString(
    "utf8",
  );
  const given = credentials.slice(credentials.indexOf(":") + 1);
  return sameSecret(given, password) ? "granted" : "denied";
}

/** Compares digests, so neither the length nor the content leaks through timing. */
function sameSecret(given: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}
