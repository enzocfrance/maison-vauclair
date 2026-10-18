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
    ignores: [".next/**", "out/**", "coverage/**", "next-env.d.ts", "docs/**"],
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
        message: "shared est pur : il n'importe aucune autre couche.",
      },
      {
        group: ["react", "react-dom", "next", "next/**"],
        message: "shared est pur : ni React ni Next.",
      },
    ),
  },
  {
    files: ["src/frontend/**"],
    ...restrictImports({
      group: [...layer("app"), ...layer("backend")],
      message: "frontend ne parle au backend que par l'API HTTP.",
    }),
  },
  {
    files: ["src/backend/**"],
    ...restrictImports({
      group: [...layer("app"), ...layer("frontend")],
      message: "backend n'importe jamais l'interface.",
    }),
  },
];

export default eslintConfig;
