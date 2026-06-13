# UI Context Layer

**[← Back to Main Documentation](../../../README.md)**

This page explains the UI context layer under `src/layers/ui/context/`.

The context layer supports shared runtime state and browser-context control for UI execution. It helps tests and page objects share state safely without pushing temporary runtime data into page classes, test files, or global variables.

## Table of Contents

- [Why This Layer Exists](#why-this-layer-exists)
- [Main Files](#main-files)
- [Context Layer Structure](#context-layer-structure)
- [`TestContext`](#testcontext)
  - [Main Operations](#main-operations)
- [Why `TestContext` Is Useful](#why-testcontext-is-useful)
- [How `TestContext` Is Used In The Framework](#how-testcontext-is-used-in-the-framework)
- [`BrowserContextManager`](#browsercontextmanager)
  - [Main Operations](#main-operations-1)
- [Why `BrowserContextManager` Is Useful](#why-browsercontextmanager-is-useful)
- [Shared Type](#shared-type)
- [How The Context Layer Connects To Fixtures](#how-the-context-layer-connects-to-fixtures)
- [How The Context Layer Connects To Pages](#how-the-context-layer-connects-to-pages)
- [How It Connects To Other UI Layers](#how-it-connects-to-other-ui-layers)
- [Practical Outcome](#practical-outcome)

## Why This Layer Exists

The UI context layer exists to:

- share test-specific runtime data across steps
- support state handoff between test code and page objects
- manage isolated browser contexts when needed
- standardize browser popup and new-page handling

## Main Files

- `src/layers/ui/context/testContext.ts`
- `src/layers/ui/context/browserContextManager.ts`
- `src/layers/ui/context/types/browserContext.type.ts`

## Context Layer Structure

The context layer currently has two main responsibilities:

1. shared in-test data storage
2. browser context lifecycle support

## `TestContext`

`testContext.ts` is the shared in-memory store used during test execution.

It provides a simple key-value store for test runtime data.

### Main Operations

- `set(key, value)`
  Store a value for later use.
- `get<T>(key)`
  Read a stored value with typing.
- `has(key)`
  Check whether a key exists.
- `remove(key)`
  Remove a stored value.
- `clear()`
  Reset the context store.
- `keys()`
  Inspect the currently stored keys.

## Why `TestContext` Is Useful

This layer is useful when a test or page flow needs to:

- remember original values before editing data
- store generated runtime values for later validation
- reuse values across multiple steps or helper calls
- coordinate data between pages and tests

## How `TestContext` Is Used In The Framework

`TestContext` is registered as a fixture in `fixtures/test.ui.fixtures.ts`.

That means it can be injected into tests and page objects through the fixture layer.

It is already used across UI flows such as:

- approvals
- basket
- stock
- maintenance

In these flows, pages can store values in the context and later retrieve them for assertions, restore actions, or comparison logic.

## `BrowserContextManager`

`browserContextManager.ts` manages Playwright browser contexts and page creation helpers.

It is not the same as `TestContext`.

Its responsibility is browser isolation and page-level context control.

### Main Operations

- `createDefaultContext()`
  Creates a new browser context and page using default settings.
- `createIsolatedContext()`
  Creates a new browser context with `storageState: undefined` for isolated execution.
- `close(context)`
  Closes a browser context safely.
- `clickAndWaitForNewPage(page, clickFn)`
  Waits for a click action to open a new page and returns the loaded page.

## Why `BrowserContextManager` Is Useful

This layer is useful when UI flows need:

- a clean context
- explicit isolation from existing auth state
- popup or new-tab handling
- controlled context lifecycle management

## Shared Type

`types/browserContext.type.ts` defines:

- `BrowserContextWithPage`

This keeps the browser context and created page bundled in one clear return type for context-creation helpers.

## How The Context Layer Connects To Fixtures

Both context tools connect through `fixtures/test.ui.fixtures.ts`.

The fixture layer creates:

- a `TestContext` instance
- a `BrowserContextManager` instance

This makes them available across the UI framework without forcing manual construction in every test.

## How The Context Layer Connects To Pages

The context layer is consumed by page objects that need shared runtime state.

Examples include pages that:

- store calculated values
- store selected rows or edited values
- compare pre-change and post-change state
- coordinate multi-step data flows

This keeps temporary test data outside the page object's permanent structure while still making it available where needed.

## How It Connects To Other UI Layers

- `01-base`
  The base layer provides the shared interaction mechanics.
- context layer
  Adds runtime state and browser-context coordination on top of that base interaction layer.
- page objects
  Consume both the base helpers and the context helpers to implement feature flows.

## Practical Outcome

Keeping context behavior centralized in `src/layers/ui/context/` gives the framework:

- reusable runtime state handling
- safer cross-step data sharing
- cleaner page objects
- cleaner tests
- reusable browser isolation helpers
