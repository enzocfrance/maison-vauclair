import { randomInt } from "node:crypto";

/** No 0/O, 1/I/L: the code is typed by hand from a printed card. */
const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const length = 6;

export function generateWelcomeCode(): string {
  return Array.from(
    { length },
    () => alphabet[randomInt(alphabet.length)] ?? "",
  ).join("");
}
