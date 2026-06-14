---
alwaysApply: true
---

# Code Quality

**[← Back to Main Documentation](../../README.md)**

This page defines the coding rules used to keep the framework predictable, readable, and easy to maintain.

These rules are meant to prevent unnecessary complexity, reduce noisy changes, and keep implementation decisions aligned with the framework style.

## Table of Contents

- [Core Principles](#core-principles)
- [Lint Verification](#lint-verification)
- [Waiting and Timeouts](#waiting-and-timeouts)
- [Anti-Defaults](#anti-defaults)
- [TypeScript](#typescript)
- [Documentation Rules](#documentation-rules)
  - [JSDoc Format](#jsdoc-format)
- [Naming Conventions](#naming-conventions)
  - [Classes](#classes)
  - [Utilities and Directories](#utilities-and-directories)
  - [Specialized File Suffixes](#specialized-file-suffixes)
    - [Type Definitions](#type-definitions)
    - [Shared or Multiple Types](#shared-or-multiple-types)
    - [Constants](#constants)
    - [Config Files](#config-files)
    - [Feature Flags](#feature-flags)
    - [Fixtures](#fixtures)
    - [Enums](#enums)
- [File Organization](#file-organization)
  - [Imports](#imports)
  - [Exports](#exports)
  - [File Responsibility](#file-responsibility)
  - [Method Order](#method-order)
- [Practical Outcome](#practical-outcome)

## Core Principles

- Never read or access files inside the root `envs/` directory under any circumstances.
- The only permitted exception is `.env.example`, which may be used as a reference for expected environment variables and structure.
- Do not add features or improvements beyond what was requested.
- Do not refactor adjacent code while fixing an unrelated issue.
- Prefer simple code over premature abstraction.
- Remove dead code instead of leaving commented-out blocks.
- Write comments to explain why something exists or why a choice was made, not what the code is visibly doing.
- When creating or modifying code, do not try to complete a large change all at once.
- Break large changes into smaller parts that are manageable, reviewable, and testable until the full change is complete.
- Before committing, always ask for the Jira ticket number if one has not been provided. If the user confirms they do not have a ticket number, commit without it.

## Lint Verification

After every code change, run `npm run lint:check` before presenting the result to the user. See [Execution Commands](../01-setup/execution-commands.md) for the full quality command reference.

- If the lint check passes cleanly, proceed as normal.
- If lint errors are found, fix them before presenting the changes.
- If lint errors exist but were **not caused by the current change** (i.e. they are pre-existing issues in a different module or class), do not fix them. Instead, state clearly:

  > "All requested changes passed the lint check. The remaining issues are pre-existing in `<ClassName>` / `<module>` and were not introduced by this change."

- Never silently ignore lint output. Always report the outcome.

## Waiting and Timeouts

- **Never use `page.waitForTimeout()` or any fixed-duration delay.** No exceptions, even if explicitly requested.
- **Never use `page.waitForLoadState("networkidle")`.** It is unreliable in SPAs and produces flaky tests. No exceptions, even if explicitly requested.
- All timeout values **must** come from `src/configuration/timeouts/ui.timeouts.ts`. Raw millisecond literals are not allowed.
- If no existing timeout constant fits the use case, add a new named entry to `ui.timeouts.ts` rather than hardcoding a number.

## Anti-Defaults

These rules are intended to counter common over-engineering habits.

- No premature abstractions. Three similar lines are often better than a helper used once.
- Do not introduce extra layers, wrappers, or utilities unless there is a clear repeated need.
- Do not add "future-ready" structures without a real current use case.
- Do not leave placeholder code, unused branches, or speculative extension points.

## TypeScript

- Never use `any` under any circumstances.
- Do not use `as any`, `any[]`, `Record<string, any>`, or function parameters typed as `any`.
- If the type is unknown, use `unknown` and narrow it safely before use.
- Prefer explicit interfaces, types, generics, and Playwright-provided types.

This is enforced by `@typescript-eslint/no-explicit-any` (error) and the full `no-unsafe-*` rule family in [src/configuration/eslint/typescript.mjs](../../../src/configuration/eslint/typescript.mjs).

## Documentation Rules

- Every method **must** have a JSDoc comment — no exceptions, including private methods.
- Every type should include a short `//` comment explaining its purpose.
- Comments should stay concise and useful.
- If a comment only repeats what the code already says, improve the naming instead.

### JSDoc Format

All method comments must use the following format:

```ts
/**
 * Describes what the method does in one sentence.
 * @param paramName - Description of the parameter.
 * @returns A promise that resolves when <what happens>.
 */
```

Rules:

- The first line is a single sentence describing the method's purpose — not what the code does line by line, but what it achieves.
- Include one `@param` tag for every parameter. The description starts with a capital letter and ends without a period.
- Always include `@returns` for `async` methods. For `Promise<void>`, write: `A promise that resolves when <outcome>.`
- Omit `@returns` only for synchronous methods that return `void`.
- Do not add `@param` for methods with no parameters.

Example — method with parameters:

```ts
/**
 * Types the given email address into the email input field.
 * @param email - The email address to enter.
 * @returns A promise that resolves when the field has been filled.
 */
private async fillEmailInput(email: string): Promise<void> { ... }
```

Example — method with no parameters:

```ts
/**
 * Asserts that the login page welcome heading is visible.
 * @returns A promise that resolves when the visibility assertion passes.
 */
public async verifyLoginWelcomeTextIsVisible(): Promise<void> { ... }
```

## Naming Conventions

### Classes

- Class file names must start with a lowercase letter and use camelCase, for example `loginPage.ts`, `userManagementPage.ts`, `networkManager.ts`.
- Class names use PascalCase, for example `LoginPage`, `UserManagementPage`, `NetworkManager`.
- No file name should start with a capital letter except in test files.

### Utilities and Directories

- Utility file names use camelCase, for example `dateUtils.ts`, `errorHandler.ts`.
- Directory names use lowercase-starting camelCase, for example `errorHandling/`, `testData/`, `supplyChain/`, `pageObjects/`.
- Folder names should stay in small letters at the start, for example `supplyChain`, not `SupplyChain`.

### Specialized File Suffixes

#### Type Definitions

- Use `name.type.ts` for a single primary type definition.
- Examples:
  - `errorHandler.type.ts`
  - `paymentInvoice.type.ts`

#### Shared or Multiple Types

- Use `name.types.ts` for grouped or shared type definitions.
- Examples:
  - `errorHandler.types.ts`
  - `network.types.ts`

#### Constants

- Use `name.const.ts`.
- Examples:
  - `environment.const.ts`
  - `testId.const.ts`
- Constant files should be renamed to the `.const.ts` pattern.

#### Config Files

- Use `name.config.ts` for configuration files.
- Examples:
  - `logger.config.ts`
  - `userRole.config.ts`
  - `environment.config.ts`

#### Feature Flags

- Use `name.flags.ts`.
- Examples:
  - `authentication.flags.ts`
  - `browserInit.flags.ts`

#### Fixtures

- Use `name.fixture.ts`.
- Examples:
  - `test.fixture.ts`
  - `auth.fixture.ts`

#### Enums

- Use `name.enum.ts`.
- Example:
  - `userRole.enum.ts`

## File Organization

### Imports

- Use `.js` extensions for internal imports when working with ESM.
- Ignore the fixture import style as a naming exception where needed, because the fixture entry pattern is unique in this framework.

### Exports

- Prefer named exports by default.
- Default exports are allowed for standalone classes, page objects, helpers, or independent modules with a single clear responsibility.

### File Responsibility

- Keep one primary component, class, or responsibility per file.
- Keep file-specific constants near the top of the file before class or function definitions.
- Keep file-specific types close to the implementation.
- Move shared types into dedicated `.type.ts` or `.types.ts` files.

### Method Order

- Public methods first.
- Protected methods second, when applicable.
- Private helper methods last.
- Private helpers should follow the order in which they are called.

## Practical Outcome

Following these rules should lead to code that is:

- easier to review
- easier to extend safely
- consistent across the framework
- less noisy in pull requests
- easier for new contributors to understand
