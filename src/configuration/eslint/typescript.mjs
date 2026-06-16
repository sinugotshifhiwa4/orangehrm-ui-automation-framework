import tseslint from "typescript-eslint";
import path from "path";
import { fileURLToPath } from "url";
import { FILE_GROUPS } from "./constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../..");

export default [
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: FILE_GROUPS.project,
  })),

  {
    files: FILE_GROUPS.project,

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: rootDir,
      },
    },

    rules: {
      "no-duplicate-imports": "off",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: false,
        },
      ],

      "no-fallthrough": "error",
      "no-console": ["error", { allow: ["error"] }],

      "@typescript-eslint/no-explicit-any": "error",

      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: { arguments: false },
          checksConditionals: true,
          checksSpreads: true,
        },
      ],

      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
];
