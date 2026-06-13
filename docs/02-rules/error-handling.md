---
paths:
  - "src/utils/errorHandling**"
  - "src/utils/sanitization**"
alwaysApply: true
---

# Error Handling

**[← Back to Main Documentation](../../README.md)**

This page explains how errors are captured, formatted, and reported in the framework.

All framework error handling flows through `ErrorHandler`. It standardizes how errors are logged, what context is attached to them, and how sensitive data is protected before anything reaches the log output.

## Table of Contents

- [Main Framework Paths](#main-framework-paths)
- [Using `ErrorHandler`](#using-errorhandler)
  - [Available Methods](#available-methods)
- [Standard Catch Pattern](#standard-catch-pattern)
- [Guard And Validation Failures](#guard-and-validation-failures)
- [Source And Context Naming](#source-and-context-naming)
  - [Source](#source)
  - [Context](#context)
- [Structured Error Details](#structured-error-details)
- [Sanitization Rule](#sanitization-rule)
- [Do Not Swallow Errors](#do-not-swallow-errors)
- [How This Connects To The Logger](#how-this-connects-to-the-logger)
- [Practical Outcome](#practical-outcome)

## Main Framework Paths

```text
src/utils/errorHandling/errorHandler.ts
src/utils/errorHandling/internals/errorAnalyzer.ts
src/utils/errorHandling/internals/errorCacheManager.ts
src/utils/errorHandling/internals/regexPatterns.ts
src/utils/errorHandling/internals/types/error-handler.types.ts
src/utils/sanitization/dataSanitizer.ts
src/utils/sanitization/internals/sanitization.config.ts
```

## Using `ErrorHandler`

Framework error handling should go through:

```ts
import ErrorHandler from "../../utils/errorHandling/errorHandler.js";
```

Do not introduce ad-hoc error logging or custom error patterns when the shared framework utilities already cover the use case.

### Available Methods

- `ErrorHandler.captureError(error, source, context?)`
  Use when an error was caught and must be logged with context before being rethrown or handled.

- `ErrorHandler.logAndThrow(source, message)`
  Use when the framework needs to fail immediately with a new contextual error.

- `ErrorHandler.log(source, message)`
  Use when an error-shaped log entry is needed without throwing.

## Standard Catch Pattern

Use this pattern when wrapping operations:

```ts
try {
  // operation
} catch (error) {
  ErrorHandler.captureError(error, "methodName", "Failed to perform the operation");
  throw error;
}
```

This keeps error logging structured, consistent, and reusable across the framework.

## Guard And Validation Failures

When a method reaches an invalid state and must stop immediately, prefer:

```ts
ErrorHandler.logAndThrow("methodName", "Descriptive failure message");
```

Use this for:

- missing required data
- invalid environment configuration
- invalid runtime state
- impossible branch conditions that should fail fast

## Source And Context Naming

When using `ErrorHandler`, the `source` and `context` should be meaningful.

### Source

The `source` should be:

- the current method name
- the current component or helper name
- the logical operation name

Examples:

- `getPortalBaseUrl`
- `initializeEnvironmentConfig`
- `WorkerAllocator`

### Context

The optional `context` should explain what failed at a higher level.

Examples:

- `Failed to get portal base URL`
- `Failed to reset authentication state`
- `Failed while verifying incoming stock content`

## Structured Error Details

`ErrorHandler` does not log a raw message.

Through `ErrorAnalyzer`, it builds structured error details that can include:

- `source`
- `context`
- sanitized `message`
- `timestamp`
- `environment`
- `stack`
- `errorType`
- Playwright matcher metadata such as `expected`, `received`, and matcher logs when available

Do not bypass the shared error pipeline unless there is a documented reason.

## Sanitization Rule

Error and log data may contain sensitive values.

The framework already protects this through:

- `src/utils/sanitization/dataSanitizer.ts`
- error sanitization inside `ErrorAnalyzer`
- cached sanitized messages through `ErrorCacheManager`

Because of that:

- do not manually dump raw secrets into logs
- do not log raw credential values
- do not stringify sensitive runtime objects unless they are known to be safe
- prefer passing the original error into `ErrorHandler.captureError(...)` and let the framework sanitize it

If a new field needs to be sanitized, add it in:

```text
src/utils/sanitization/internals/sanitization.config.ts
```

Once registered there, the framework sanitization flow will mask it in all logged output.

## Do Not Swallow Errors

Never catch an error and do nothing with it.

If an error is caught, either:

- log it with `ErrorHandler.captureError(...)` and rethrow it
- convert it into a contextual failure with `ErrorHandler.logAndThrow(...)`
- handle it intentionally with a documented fallback path

Silent failure makes debugging much harder and breaks the consistency of the shared logging model.

## How This Connects To The Logger

`ErrorHandler` does not write to the console or files directly.

When it captures or logs an error, it delegates output to the shared Winston logger provided by `loggerManager.ts`. The error pipeline is:

1. `ErrorHandler` receives the raw error
2. `ErrorAnalyzer` builds structured, sanitized error details
3. `ErrorCacheManager` deduplicates repeated error messages
4. The shared logger writes the final output to the configured transports

This means `ErrorHandler` depends on the logger, but the logger has no knowledge of `ErrorHandler`. The logger is the transport layer; `ErrorHandler` is the pipeline above it.

See [Winston Logger](./winston-logger.md) for logger configuration and transport rules.

## Practical Outcome

Following these rules should lead to:

- consistent error reporting across the framework
- reusable failure patterns
- sanitized logs that do not leak sensitive data
- easier debugging across environments
- less duplicated error logging logic
- tighter alignment between framework utilities and test code
