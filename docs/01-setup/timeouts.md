# Timeouts

**[← Back to Main Documentation](../../README.md)**

This page explains how timeout values are defined and scaled across the framework.

## Table of Contents

- [Main Files](#main-files)
- [How Timeouts Work](#how-timeouts-work)
- [`timeoutCalculator.ts`](#timeoutcalculatorts)
- [`global.timeouts.ts`](#globaltimeoutsts)
- [`ui.timeouts.ts`](#uitimeoutsts)
- [The Rule](#the-rule)
- [Practical Outcome](#practical-outcome)

## Main Files

- `src/configuration/timeouts/global.timeouts.ts`
- `src/configuration/timeouts/ui.timeouts.ts`
- `src/configuration/timeouts/internal/timeoutCalculator.ts`
- `src/configuration/timeouts/types/TimeoutCalculator.type.ts`

## How Timeouts Work

All timeout values in the framework are calculated at startup using `calculateTimeout`.

Each timeout has a `baseMs` value that applies during local execution. When the `CI` environment variable is set, the value is multiplied by a configurable `multiplier` (default `2`) to absorb slower execution in CI environments.

This means no timeout constant is a raw number — each one is an environment-aware calculated value.

## `timeoutCalculator.ts`

`src/configuration/timeouts/internal/timeoutCalculator.ts` is the single function responsible for computing all timeout values.

It accepts a `TimeoutCalculatorOptions` object:

- `baseMs` — the base timeout in milliseconds for local execution
- `isCI` — whether the current run is in CI (defaults to `false`)
- `multiplier` — the CI scaling factor (defaults to `2`)

It returns `baseMs * multiplier` in CI and `baseMs` otherwise.

## `global.timeouts.ts`

`src/configuration/timeouts/global.timeouts.ts` defines the Playwright-level timeouts used in `playwright.config.ts`.

| Constant         | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `TEST_TIMEOUT`   | Maximum duration for a single test               |
| `EXPECT_TIMEOUT` | Maximum time Playwright assertions keep retrying |

## `ui.timeouts.ts`

`src/configuration/timeouts/ui.timeouts.ts` defines timeout values for UI interactions and element state checks.

| Constant                   | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `UI_DEFAULT_TIMEOUT`       | Default wait for UI validations and slow page-state checks |
| `UI_VALIDATION_TIMEOUT`    | Alias for validation-specific waits                        |
| `UI_SHORT_TIMEOUT`         | Quick DOM state changes like class and attribute updates   |
| `UI_SETTLE_TIMEOUT`        | Tiny settle delay after an element becomes interactive     |
| `UI_NOTIFICATION_TIMEOUT`  | Popup and toast-style feedback messages                    |
| `UI_CALENDAR_TIMEOUT`      | Calendar dialogs opening and settling                      |
| `UI_TOGGLE_TIMEOUT`        | Toggle controls settling after interaction                 |
| `UI_TABLE_TIMEOUT`         | Table polling and first-row visibility checks              |
| `UI_POLL_INTERVAL_TIMEOUT` | Polling interval between retry attempts                    |
| `UI_FRAME_TIMEOUT`         | Frame discovery waits                                      |

## The Rule

- **Never use raw millisecond literals.** All timeout values must come from one of the timeout files above.
- **Never use `page.waitForTimeout()` or `page.waitForLoadState("networkidle")`.** These are banned regardless of context.
- If no existing constant fits the use case, add a new named entry to the appropriate timeout file with a `calculateTimeout` call. Do not hardcode a number inline.

## Practical Outcome

Centralizing timeout values in `src/configuration/timeouts/` gives the framework:

- consistent CI scaling without touching individual tests or page objects
- a single place to tune wait times across the full suite
- named constants that communicate intent rather than magic numbers
