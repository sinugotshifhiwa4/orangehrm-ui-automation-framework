import unusedImports from "eslint-plugin-unused-imports";
import { FILE_GROUPS } from "./constants.mjs";

export default [
  {
    files: FILE_GROUPS.allTs,
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
];
