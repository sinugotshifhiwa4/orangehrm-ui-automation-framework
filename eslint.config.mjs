import typescript from "./src/configuration/eslint/typescript.mjs";
import imports from "./src/configuration/eslint/imports.mjs";
import unused from "./src/configuration/eslint/unused.mjs";
import playwright from "./src/configuration/eslint/playwright.mjs";
import ignores from "./src/configuration/eslint/ignores.mjs";
import prettierConfig from "eslint-config-prettier";

export default [
  ...typescript,
  ...imports,
  ...unused,
  ...playwright,
  ...ignores,
  prettierConfig,
];
