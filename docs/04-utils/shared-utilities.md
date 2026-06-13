# Shared Utilities

**[← Back to Main Documentation](../../README.md)**

This page explains the shared utility group under `src/utils/shared/`.

These utilities support many different framework areas, especially the UI layer, by keeping common formatting, parsing, and validation logic out of test specs and page objects.

## Table of Contents

- [Why This Utility Group Exists](#why-this-utility-group-exists)
- [Main Files](#main-files)
- [Main Shared Utility Patterns](#main-shared-utility-patterns)
  - [Date Utilities](#date-utilities)
  - [Parsing Utilities](#parsing-utilities)
  - [Validation Utilities](#validation-utilities)
- [How `src/utils/shared/` Connects To The Framework](#how-srcutilsshared-connects-to-the-framework)
- [Related Utility Groups](#related-utility-groups)
- [Practical Outcome](#practical-outcome)

## Why This Utility Group Exists

The shared utility group exists to keep common logic out of:

- test specs
- page objects
- shared UI components
- feature-specific helpers

It provides generic reusable helpers that can be used across multiple framework areas.

## Main Files

- `src/utils/shared/dateFormatter.ts` — date and identifier formatting
- `src/utils/shared/credentialValidator.ts` — unresolved credential placeholder guard
- `src/utils/shared/fieldValidator.ts` — input value validation
- `src/utils/shared/parsingFacade.ts` — single entry point for parsing operations
- `src/utils/shared/parsing/currencyUtils.ts` — currency parsing
- `src/utils/shared/parsing/dateParsingUtils.ts` — date string validation
- `src/utils/shared/parsing/numberUtils.ts` — number, percentage, and CBM parsing
- `src/utils/shared/parsing/internal/parsingHelpers.ts` — shared string normalization used by the parsers
- `src/utils/shared/types/fieldValidator.type.ts` — validation option types

## Main Shared Utility Patterns

### Date Utilities

Example:

- `dateFormatter.ts`

This helper standardizes how dates and identifiers are produced, such as:

- compact timestamps in `YYYYMMDDHHMMSS` form (`formatLocalTime`, `formatDate`)
- UI-friendly month and year strings such as `Jun, 2026` (`formatMonthYear`)
- reading the current year (`getCurrentYear`)
- timestamp-based identifiers such as `IT-20220722143000` (`generateId`)

Note that `dateFormatter.ts` only produces date strings. Reading a UI date string
back and checking it is valid is handled by `parsing/dateParsingUtils.ts`, exposed
through `ParsingFacade.isValidDate`.

### Parsing Utilities

Examples:

- `parsingFacade.ts`
- `parsing/currencyUtils.ts`
- `parsing/dateParsingUtils.ts`
- `parsing/numberUtils.ts`

This is the normalization and parsing layer for UI-visible values.

It handles tasks such as:

- string normalization (`normaliseString`, `parseString`)
- number parsing, including leading-number extraction (`parseNumber`, `parseLeadingNumber`, `parseToNumbers`)
- currency parsing (`parseCurrency`, `parseCurrencyArray`)
- percentage parsing (`parsePercentage`)
- CBM parsing and summation (`parseCbm`, `calculateCbmSum`)
- summation and rounding (`sumNumbers`, `roundToTwoDecimals`)
- number assertion (`assertValidNumber`)
- date validation (`isValidDate`)

`ParsingFacade` is especially important because it provides one entry point for common parsing operations instead of making feature pages import many smaller parsing helpers directly. The underlying work lives in `parsing/numberUtils.ts`, `parsing/currencyUtils.ts`, and `parsing/dateParsingUtils.ts`; pages should depend on the facade rather than those files.

### Validation Utilities

Examples:

- `fieldValidator.ts`
- `credentialValidator.ts`

These helpers standardize input validation and fail-fast behavior for reusable framework operations.

- `FieldValidator.validate` trims a text input value and, unless `allowEmpty` is set, fails fast when the result is empty. It returns the trimmed value so callers use the cleaned input directly.
- `CredentialValidator.validateNotPlaceholder` guards against unresolved env placeholders such as `portal.username` or `portal.password` (the defaults in `envs/.env.example`) reaching a real login flow, prompting the user to update their credentials instead.

Both validators report failures through `ErrorHandler.logAndThrow`, so validation
failures follow the same structured, sanitized error pipeline as the rest of the
framework. See [Error Handling](../02-rules/error-handling.md).

## How `src/utils/shared/` Connects To The Framework

This group is used widely across the framework:

- tests use helpers such as `DateFormatter`
- UI pages use helpers such as `ParsingFacade`
- base-layer actions use validation helpers such as `FieldValidator`

This makes `src/utils/shared/` one of the broadest cross-cutting utility groups in the framework.

## Related Utility Groups

`src/utils/shared/` is only one part of `src/utils/`. The other utility groups are
documented where their role fits best, not on this page:

- `src/utils/errorHandling/` and `src/utils/sanitization/` — see [Error Handling](../02-rules/error-handling.md)
- `src/utils/fileManager/` and `src/utils/pathResolver/` — see [File Manager](../01-setup/file-manager.md)

This page intentionally stays scoped to the shared formatting, parsing, and
validation helpers.

## Practical Outcome

Keeping shared utilities centralized in `src/utils/shared/` gives the framework:

- cleaner page objects
- cleaner tests
- fewer duplicated parsing and formatting helpers
- more consistent validation behavior
