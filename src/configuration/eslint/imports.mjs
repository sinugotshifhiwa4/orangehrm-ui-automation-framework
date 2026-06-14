import importPlugin from "eslint-plugin-import";
import { FILE_GROUPS } from "./constants.mjs";

export default [
  {
    files: FILE_GROUPS.allTs,
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
    rules: {
      "import/no-duplicates": ["error", { "prefer-inline": true }],
    },
  },
];
