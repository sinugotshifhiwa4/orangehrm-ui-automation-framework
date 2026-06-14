import playwright from "eslint-plugin-playwright";
import { FILE_GROUPS } from "./constants.mjs";

export default [
  {
    files: FILE_GROUPS.tests,
    plugins: {
      playwright,
    },

    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },

    rules: {
      ...playwright.configs["flat/recommended"].rules,

      // Hard-block focused/skipped runs. Rule names are singular (no-focused-test /
      // no-skipped-test). Recommended ships no-focused-test as "error" and no-skipped-test
      // as "warn"; both are pinned to "error" here so ESLint is a true gate.
      // Hooks enforce the same checks at commit/push time as a second layer.
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "error",

      "playwright/expect-expect": "off",
      // ESLint's no-console is off here to avoid conflicts with the Playwright plugin config,
      // but console.log is still blocked project-wide by the pre-commit hook. Use the
      // framework logger (scripts/logger/logger.ts) in test files as well.
      "no-console": "off",

      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
