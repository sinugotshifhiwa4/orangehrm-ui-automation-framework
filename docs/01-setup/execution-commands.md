# Execution Commands

**[← Back to Main Documentation](../../README.md)**

This page is the complete command reference for the framework. It covers all npm scripts, local execution templates, parameters, and runtime flags.

## Table of Contents

- [Quality Commands](#quality-commands)
- [Test Commands](#test-commands)
- [Local Execution Templates](#local-execution-templates)
  - [Authentication Setup](#authentication-setup)
  - [UI Test Execution](#ui-test-execution)
- [Parameters](#parameters)
- [Runtime Flags](#runtime-flags)
  - [`HEADED=true`](#headedtrue)
  - [`TEST_TAGS=@tag-name`](#test_tagstag-name)
  - [`WORKER_PERCENTAGE`](#worker_percentage)
  - [`SKIP_BROWSER_INIT=true`](#skip_browser_inittrue)

## Quality Commands

Verify formatting and lint rules without making any changes:

```powershell
npm run check
```

Auto-fix all formatting and lint violations:

```powershell
npm run fix
```

Run type checking and lint rules together — read-only, no changes applied:

```powershell
npm run lint:check
```

Auto-fix lint violations only (skips type checking):

```powershell
npm run lint:fix
```

Run TypeScript type checking only:

```powershell
npm run type-check
```

## Test Commands

Run UI tests:

```powershell
npm run test:ui
```

Run API tests:

```powershell
npm run test:api
```

Run DB tests:

```powershell
npm run test:db
```

Re-run only the tests that failed in the last run:

```powershell
npm run test:failed
```

Open Playwright UI mode for interactive test exploration:

```powershell
npm run ui
```

Run tests in debug mode with the Playwright inspector:

```powershell
npm run debug
```

Open the last HTML test report in the browser:

```powershell
npm run report
```

Generate a test with Playwright Codegen:

```powershell
npm run codegen
```

## Local Execution Templates

Local runs combine `cross-env` with the existing npm scripts so a developer can choose the environment, browser, headed mode, and tag filtering without changing framework code.

## Parameters

- `<env>`: `qa` | `uat` | `preprod` (defaults to `qa` when omitted)
- `<tag>`: see [Test Tags](../05-testing/03-test-tags.md) for tag usage and available framework tag patterns
- `<percentage>`: `10` | `25` | `50` | `75` | `100` (defaults to `10` when omitted)

## Runtime Flags

- `ENV=qa|uat|preprod` (defaults to `qa` when omitted)
- `HEADED=true|false` (defaults to `false` when omitted)
- `TEST_TAGS=@tag-name`
- `WORKER_PERCENTAGE=10|25|50|75|100` (defaults to `10` when omitted)
- `SKIP_BROWSER_INIT=true|false` (defaults to `false` when omitted, but runtime layer conditions may override it)

### Authentication Setup

Run auth setup:

```powershell
cross-env ENV=<env> TEST_TAGS=@authenticate npm run test:ui
```

Example with optional flags:

```powershell
npx cross-env ENV=qa HEADED=true TEST_TAGS=@authenticate npm run test:ui
```

Authentication runs the `Authentication.setup.ts` test file via the UI layer. It always runs on Chromium.

### UI Test Execution

Execute UI tests:

```powershell
cross-env ENV=<env> npm run test:ui
```

Execute UI tests with tag filtering:

```powershell
cross-env ENV=<env> TEST_TAGS=@<tag> npm run test:ui
```

Execute UI tests with custom worker allocation:

```powershell
cross-env ENV=<env> WORKER_PERCENTAGE=<percentage> npm run test:ui
```

### `HEADED=true`

This runs the browser in headed mode.

This is mainly used locally when the developer wants to observe the run directly.

### `TEST_TAGS=@tag-name`

This allows running a filtered subset of tests by tag.

This is useful when a developer wants to focus only on one feature area instead of running the full UI layer.

### `WORKER_PERCENTAGE`

This allows the local run to control how many workers are used.

This is useful when a developer wants to:

- reduce machine load
- increase local parallelism
- tune execution speed for their machine

Available values are `10`, `25`, `50`, `75`, `100`. These values are controlled by the worker allocator.

### `SKIP_BROWSER_INIT=true`

This allows browser initialization to be explicitly skipped.

The rule is:

1. if `SKIP_BROWSER_INIT` is explicitly passed, that value is used
2. otherwise `scripts/execution/test-executor.ts` applies the layer default

Layer defaults:

- `ui` — browser init enabled
- `api` — browser init skipped
- `db` — browser init skipped

The script then forwards the resolved value into the Playwright execution environment. See [Browser Initialisation](./browser-init.md) for how this flows into `playwright.config.ts`.
