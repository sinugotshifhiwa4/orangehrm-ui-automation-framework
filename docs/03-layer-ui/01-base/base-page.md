# UI Base Layer

**[← Back to Main Documentation](../../../README.md)**

This page explains the UI base layer under `src/layers/ui/base/`.

The base layer is the shared foundation used by UI page objects and UI helper components. It centralizes common Playwright interactions so feature pages do not need to reimplement navigation, element interaction, assertions, waits, frame handling, browser actions, or file operations.

## Table of Contents

- [Why This Layer Exists](#why-this-layer-exists)
- [Main Files](#main-files)
- [Base Layer Structure](#base-layer-structure)
- [`BasePage`](#basepage)
- [`PageActionsContainer`](#pageactionscontainer)
  - [Eagerly Created Actions](#eagerly-created-actions)
  - [Lazily Created Actions](#lazily-created-actions)
- [`ActionBase`](#actionbase)
- [Action Groups](#action-groups)
  - [`navigationActions.ts`](#navigationactionsts)
  - [`elementActions.ts`](#elementactionsts)
  - [`elementAssertions.ts`](#elementassertionsts)
  - [`elementWaits.ts`](#elementwaitsts)
  - [`browserActions.ts`](#browseractionsts)
  - [`frameActions.ts`](#frameactionsts)
  - [`fileActions.ts`](#fileactionsts)
- [Supporting Utilities](#supporting-utilities)
  - [`downloadPathBuilder.ts`](#downloadpathbuilderts)
- [Shared Types](#shared-types)
- [How Pages Use This Layer](#how-pages-use-this-layer)
- [How This Layer Connects To Other Framework Parts](#how-this-layer-connects-to-other-framework-parts)
- [Practical Outcome](#practical-outcome)

## Why This Layer Exists

The UI base layer exists to:

- keep page objects smaller
- standardize Playwright interactions
- reuse logging and error-handling patterns
- reduce duplicated action code
- keep page classes focused on feature behavior instead of low-level mechanics

## Main Files

- `src/layers/ui/base/basePage.ts`
- `src/layers/ui/base/internal/pageActionsContainer.ts`
- `src/layers/ui/base/internal/downloadPathBuilder.ts`
- `src/layers/ui/base/internal/actions/actionBase.ts`
- `src/layers/ui/base/internal/actions/navigationActions.ts`
- `src/layers/ui/base/internal/actions/elementActions.ts`
- `src/layers/ui/base/internal/actions/elementAssertions.ts`
- `src/layers/ui/base/internal/actions/elementWaits.ts`
- `src/layers/ui/base/internal/actions/browserActions.ts`
- `src/layers/ui/base/internal/actions/frameActions.ts`
- `src/layers/ui/base/internal/actions/fileActions.ts`
- `src/layers/ui/base/internal/types/pageActions.ts`
- `src/layers/ui/base/internal/types/actions.type.ts`
- `src/layers/ui/base/internal/types/downloadPathBuilder.type.ts`

## Base Layer Structure

The base layer works in three levels:

1. `BasePage`
2. `PageActionsContainer`
3. individual action classes

## `BasePage`

`basePage.ts` is the root class that most UI pages build on.

It holds:

- the active Playwright `page`
- a shared `actions` container

It exposes the common action groups through getters:

- `navigation`
- `elementActions`
- `elementAssertions`
- `elementWaits`
- `browser`
- `frame`
- `file`

This means page objects can call shared actions through a common interface instead of creating helper classes manually.

## `PageActionsContainer`

`pageActionsContainer.ts` is the composition layer for shared UI actions.

It binds all action helpers to a single Playwright page instance.

### Eagerly Created Actions

These are created immediately because they are used frequently:

- `navigation`
- `elementActions`
- `elementAssertions`
- `elementWaits`

### Lazily Created Actions

These are created only when needed:

- `browser`
- `frame`
- `file`

This keeps the action layer reusable without eagerly constructing every helper for every page.

## `ActionBase`

`internal/actions/actionBase.ts` is the shared execution wrapper used by the action classes.

Its main role is to standardize:

- success logging
- failure capture
- contextual error reporting

The common pattern is:

1. execute the Playwright action
2. optionally log success
3. if it fails, capture the error through `ErrorHandler`
4. rethrow the error

This keeps low-level UI actions aligned with the framework logging and error-handling rules.

## Action Groups

The action classes split UI mechanics by responsibility.

### `navigationActions.ts`

Handles page-level navigation actions such as:

- navigating to a URL
- reloading
- going back
- going forward
- reading current URL and page title

### `elementActions.ts`

Handles direct UI interactions such as:

- filling fields
- clicking elements
- typing sequential digits
- and other low-level element interactions

This action group also connects to:

- `DataSanitizer`
- `FieldValidator`
- shared UI timeout values
- structured error handling

### `elementAssertions.ts`

Handles reusable element verification and state checking such as:

- visibility
- hidden state
- enabled or disabled state
- property retrieval
- text collection

This is the shared assertion layer used by pages instead of repeating assertion logic everywhere.

### `elementWaits.ts`

Handles waiting for element state changes and UI stabilization such as:

- waiting for an element to reach a DOM state (`attached`, `detached`, `visible`, `hidden`)
- a non-throwing variant that returns `true` or `false` instead of rejecting
- polling until an input stabilizes to a known value across multiple consecutive checks
- racing multiple locators and returning the result of whichever becomes visible first
- polling until an attribute reaches an expected value
- polling until an element gains a specific CSS class

`elementAssertions` checks the current state of elements. `elementWaits` waits for state changes to happen over time.

### `browserActions.ts`

Handles browser-level behaviors such as:

- refreshing
- tab switching
- closing tabs
- dialog handling
- cookie access

This keeps browser-context behavior separate from normal element work.

### `frameActions.ts`

Handles frame-related work such as:

- frame lookup by name
- frame lookup by URL
- frame locator resolution
- waiting for frames

This action group reuses `elementActions`, `elementAssertions`, and `elementWaits` so frame interactions stay aligned with the normal element layer.

### `fileActions.ts`

Handles upload and download behavior such as:

- upload through file chooser or input
- download handling
- download verification
- download path preparation

This action group connects directly to the shared file manager utilities and to `downloadPathBuilder.ts`.

## Supporting Utilities

### `downloadPathBuilder.ts`

`src/layers/ui/base/internal/downloadPathBuilder.ts` provides shared download path creation logic used by file-related actions.

This keeps file path generation consistent across download flows.

## Shared Types

The base layer also defines shared types for:

- page action interfaces
- assertion and wait states
- file upload modes
- element property maps
- download path options

These types help keep action contracts consistent across pages and helpers.

## How Pages Use This Layer

Page objects usually extend `BasePage`.

That gives them:

- access to the Playwright `page`
- access to the common action groups
- consistent logging and error behavior through those action groups

This is why feature pages such as login pages, supply chain pages, navigation bars, and system administration pages can stay focused on business-specific operations instead of implementing raw Playwright mechanics repeatedly.

## How This Layer Connects To Other Framework Parts

The UI base layer does not work alone. It connects to:

- `src/configuration/timeouts/`
  Shared timeout values used by actions
- `src/utils/errorHandling/`
  Structured failure capture
- `src/configuration/logger/`
  Shared logging behavior
- `src/utils/fileManager/`
  File and directory support for downloads and uploads
- `src/utils/sanitization/`
  Sensitive value masking in interaction logs

## Practical Outcome

Keeping UI mechanics centralized in `src/layers/ui/base/` gives the framework:

- cleaner page objects
- more reusable Playwright actions
- consistent logging and error handling
- shared timeout behavior
- easier maintenance across the UI layer
