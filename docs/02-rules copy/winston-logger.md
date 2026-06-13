---
paths:
  - "src/configuration/logger**"
alwaysApply: true
---

# Winston Logger

**[← Back to Main Documentation](../../README.md)**

This page explains how the Winston logger is configured and used in the framework.

The logger is the shared output channel for all runtime events — framework flow, test progress, and error details. It is not interchangeable with `console.log`.

## Table of Contents

- [Main Framework Paths](#main-framework-paths)
- [Using The Shared Logger](#using-the-shared-logger)
- [Log Levels](#log-levels)
- [Logger Configuration Files](#logger-configuration-files)
  - [`loggerManager.ts`](#loggermanagerts)
  - [`loggerFactory.ts`](#loggerfactoryts)
  - [`logger.config.ts`](#loggerconfigts)
- [Environment-Aware Logging](#environment-aware-logging)
- [Test Logging Rule](#test-logging-rule)
- [Promise Handling Rule](#promise-handling-rule)
- [How This Connects To Error Handling](#how-this-connects-to-error-handling)
- [Practical Outcome](#practical-outcome)

## Main Framework Paths

```text
src/configuration/logger/loggerManager.ts
src/configuration/logger/internal/loggerFactory.ts
src/configuration/logger/internal/logger.config.ts
src/configuration/logger/types/logger.type.ts
```

## Using The Shared Logger

Framework logging should go through:

```ts
import logger from "../../configuration/logger/loggerManager.js";
```

Do not create local logger instances or use `console.log` for normal framework or test logging.

## Log Levels

Use log levels intentionally:

- `logger.debug(...)`
  For low-level diagnostic flow details.
- `logger.info(...)`
  For normal progress, assertions, and meaningful runtime events.
- `logger.warn(...)`
  For recoverable or unexpected states that do not stop execution.
- `logger.error(...)`
  For error output — usually called through `ErrorHandler`, not directly.

## Logger Configuration Files

Logger behavior is centralized under `src/configuration/logger/`. Do not create separate logger configuration patterns when these files already define the shared framework behavior.

### `loggerManager.ts`

- provides the shared singleton logger instance
- prevents duplicate logger initialization
- is the standard import point for logger usage across the framework

### `loggerFactory.ts`

- builds the Winston logger
- configures file and console transports
- configures exception and rejection handlers
- maps console log levels by environment

### `logger.config.ts`

- defines the log directory
- defines file size limits
- defines time zone and timestamp formatting
- defines available log levels and log file names

## Environment-Aware Logging

The logger is environment-aware.

The console log level changes based on environment:

- `qa` — most verbose (`debug`)
- `uat` — less verbose (`info`)
- `preprod` — more restricted (`warn`)

Keep logs useful and intentional instead of noisy. The verbosity difference between environments means debug-level logs that are helpful in QA will be silent in preprod by design.

## Test Logging Rule

In tests, use `logger.info(...)` for meaningful verification or progress messages.

Acceptable test logging includes:

- assertion progress
- important cleanup decisions
- notable state transitions

Do not add noisy logs for every minor step unless they materially help debugging or traceability.

## Promise Handling Rule

- Handle rejected promises explicitly.
- Do not leave floating async calls.
- If an awaited operation can fail, either let it fail naturally or wrap it in the standard `try/catch` pattern.

This matches the framework's strict TypeScript and ESLint setup and ensures errors surface through the shared logging pipeline rather than disappearing silently.

## How This Connects To Error Handling

The logger does not operate independently from `ErrorHandler`.

When `ErrorHandler` captures or logs an error, it uses the shared logger instance from `loggerManager.ts` to write structured output. The logger is the transport layer; `ErrorHandler` is the formatting and routing layer above it.

See [Error Handling](./error-handling.md) for the full error pipeline and `ErrorHandler` usage rules.

## Practical Outcome

Following these rules should lead to:

- consistent log output across all environments
- no duplicate logger instances
- intentional log levels that reduce noise in production environments
- test logs that help debugging without cluttering output
