import { randomInt } from "node:crypto";
import { welcomeCodeAlphabet, welcomeCodeLength } from "@/shared/welcome";

export function generateWelcomeCode(): string {
  return Array.from(
    { length: welcomeCodeLength },
    () => welcomeCodeAlphabet[randomInt(welcomeCodeAlphabet.length)] ?? "",
  ).join("");
}
