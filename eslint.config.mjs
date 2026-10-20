import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const layer = (name) => [`@/${name}`, `@/${name}/**`];

/** Each layer may only import the layers listed in CLAUDE.md. */
const restrictImports = (...patterns) => ({
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next-*/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      "docs/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/shared/**"],
    ...restrictImports(
      {
        group: [...layer("app"), ...layer("frontend"), ...layer("backend")],
        message: "shared is pure: it imports no other layer.",
      },
      {
        group: ["react", "react-dom", "next", "next/**"],
        message: "shared is pure: no React, no Next.",
      },
    ),
  },
  {
    files: ["src/frontend/**"],
    ...restrictImports({
      group: [...layer("app"), ...layer("backend")],
      message: "frontend reaches the backend through the HTTP API only.",
    }),
  },
  {
    files: ["src/backend/**"],
    ...restrictImports({
      group: [...layer("app"), ...layer("frontend")],
      message: "backend never imports the interface.",
    }),
  },
];

export default eslintConfig;
