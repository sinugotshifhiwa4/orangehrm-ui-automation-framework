# Execution Commands

**[← Back to Main Documentation](../../README.md)**

This page is the complete command reference for the framework. It covers all parameters, npm scripts, local execution templates, and reporting commands.

## Table of Contents

- [Parameters](#parameters)
  - [`WORKER_PERCENTAGE`](#worker_percentage)
  - [`SKIP_BROWSER_INIT=true`](#skip_browser_inittrue)
- [Quality Commands](#quality-commands)
- [Test Commands](#test-commands)
- [Local Execution Templates](#local-execution-templates)
  - [Authentication Setup](#authentication-setup)
  - [UI Test Execution](#ui-test-execution)
- [Local Reports](#local-reports)

## Parameters

All runtime configuration is passed via `cross-env` as environment variables. The local execution templates below use the placeholders `<env>`, `<tag>`, and `<percentage>`, which map to `ENV`, `TEST_TAGS`, and `WORKER_PERCENTAGE` respectively. See [Test Tags](../05-testing/03-test-tags.md) for the available `<tag>` patterns.

| Variable            | Values                                | Default   | Purpose                        |
| ------------------- | ------------------------------------- | --------- | ------------------------------ |
| `ENV`               | `qa` \| `uat` \| `preprod`            | `qa`      | Target environment stage       |
| `HEADED`            | `true` \| `false`                     | `false`   | Run the browser in headed mode |
| `TEST_TAGS`         | `@tag-name`                           | —         | Filter tests by tag            |
| `WORKER_PERCENTAGE` | `10` \| `25` \| `50` \| `75` \| `100` | `10`      | Worker allocation percentage   |
| `SKIP_BROWSER_INIT` | `true` \| `false`                     | `false`\* | Skip browser initialization    |

\* The runtime layer may override the default — see [`SKIP_BROWSER_INIT=true`](#skip_browser_inittrue).

### `WORKER_PERCENTAGE`

Controls how many workers a local run uses — handled by the worker allocator. Useful when a developer wants to:

- reduce machine load
- increase local parallelism
- tune execution speed for their machine

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

These run with default parameters. See [Local Execution Templates](#local-execution-templates) to pass `ENV`, tags, or worker allocation.

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

Generate a test with Playwright Codegen:

```powershell
npm run codegen
```

## Local Execution Templates

Local runs combine `cross-env` with the existing npm scripts so a developer can choose the environment, browser, headed mode, and tag filtering without changing framework code. See [Parameters](#parameters) for the available variables.

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

Prefix any test command with `cross-env` and the variables from [Parameters](#parameters), combining as many as needed:

```powershell
cross-env ENV=<env> TEST_TAGS=@<tag> WORKER_PERCENTAGE=<percentage> npm run test:ui
```

## Local Reports

All report commands start a **local** server (bound to `127.0.0.1`) and open the report in the browser.

Open the last Playwright HTML report in the browser:

```powershell
npm run report
```

Open the Ortoni report:

```powershell
npm run ortoni-report
```

Stop the running Ortoni report server:

```powershell
npm run ortoni-report:stop
```
