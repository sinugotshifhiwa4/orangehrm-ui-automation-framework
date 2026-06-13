# Authentication Setup

**[← Back to Main Documentation](../../../README.md)**

This page explains how authentication is configured, stored, and reused across browser test runs in the framework.

It covers the files responsible for auth state storage, skip-auth tag evaluation, path resolution, and credentials typing. It also explains the end-to-end flow — from global setup through the auth setup project through browser test execution — and shows how all of it is wired into the fixture layer.

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [How Auth State Works End-to-End](#how-auth-state-works-end-to-end)
  - [Step 1 — Global Setup Initializes the Auth File](#step-1--global-setup-initializes-the-auth-file)
  - [Step 2 — The Auth Setup Project Runs Login](#step-2--the-auth-setup-project-runs-login)
  - [Step 3 — Browser Projects Depend on the Auth Setup](#step-3--browser-projects-depend-on-the-auth-setup)
- [Files and Responsibilities](#files-and-responsibilities)
  - [authSkipEvaluator.ts](#authskipevaluatorts)
  - [authenticationFileManager.ts](#authenticationfilemanagerts)
  - [authentication.constants.ts](#authenticationconstantsts)
  - [credentials.types.ts](#credentialstypests)
  - [test.ui.fixtures.ts — storageState](#testuifixturests--storagestate)
- [Auth State File Location](#auth-state-file-location)
- [Sharded Runs](#sharded-runs)
- [Skip Auth — Source of Truth](#skip-auth--source-of-truth)
  - [How to Exclude a Test from Auth Setup](#how-to-exclude-a-test-from-auth-setup)
  - [How to Add a New Skip Tag](#how-to-add-a-new-skip-tag)
- [API and DB Tests](#api-and-db-tests)
- [Running Auth Setup in Isolation](#running-auth-setup-in-isolation)
- [How the Files Connect](#how-the-files-connect)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

The core authentication configuration lives under:

```text
src/configuration/playwright/authentication/
```

The fixture that wires the evaluator into test execution lives at:

```text
fixtures/test.ui.fixtures.ts
```

The authentication setup test lives at:

```text
tests/layers/ui/authentication/Authentication.setup.ts
```

This folder is part of the broader Playwright configuration layer and is not a test-layer concern. Tests do not manage auth state directly.

## How Auth State Works End-to-End

Authentication state flows through three stages in order:

1. Global setup writes an empty auth state file before any test runs.
2. The `setup-auth-state` project logs in and overwrites that file with a real session.
3. Browser projects read the saved session so tests start already authenticated.

### Step 1 — Global Setup Initializes the Auth File

Before any test runs, `playwright.config.ts` triggers `globalSetup.ts`:

```ts
globalSetup: "src/configuration/runtime/globalSetup.ts",
```

`globalSetup` calls `AuthenticationFileManager.initialize()`, which writes an empty `{}` to the auth state file. This ensures Playwright always has a valid storage path to reference, even before the real login has run.

On local environments it also loads `.env` files. In CI, environment variables are injected by the pipeline so that step is skipped.

### Step 2 — The Auth Setup Project Runs Login

`projects.config.ts` defines a dedicated `setup-auth-state` project:

```ts
{
  name: "setup-auth-state",
  use: { ...devices["Desktop Chrome"] },
  testMatch: /.*\.setup\.ts/,
}
```

This project matches any file ending in `.setup.ts`. The only file that matches currently is `tests/layers/ui/authentication/Authentication.setup.ts`.

The setup test uses the `authenticationExecutor` fixture to log in with credentials from the environment resolver. After a successful login, Playwright saves the browser's storage state (cookies, local storage) to the auth state file, overwriting the empty placeholder written in step 1.

See [Login Orchestration](./login-orchestration.md) for how `authenticationExecutor` drives the login flow.

### Step 3 — Browser Projects Depend on the Auth Setup

All browser projects declare `setup-auth-state` as a dependency:

```ts
const setupDeps = ["setup-auth-state"];

{
  name: "chromium",
  use: { ...devices["Desktop Chrome"], viewport: resolvedViewport },
  dependencies: setupDeps,
}
```

Playwright runs `setup-auth-state` first and only starts `chromium`, `firefox`, and `webkit` after it completes. Each browser project then reads the saved storage state so every test begins with an active session.

## Files and Responsibilities

### authSkipEvaluator.ts

```text
src/configuration/playwright/authentication/evaluators/authSkipEvaluator.ts
```

This file evaluates whether a test should bypass authentication setup.

It exports `AuthenticationSkipEvaluator`, a static class with two responsibilities:

- extracting tags from a test's `TestInfo` (from explicit tags and title text)
- checking whether any extracted tag matches the defined skip-auth tags

This is the **source of truth for skip-auth behavior**. See [Skip Auth — Source of Truth](#skip-auth--source-of-truth).

---

### authenticationFileManager.ts

```text
src/configuration/playwright/authentication/storage/authenticationFileManager.ts
```

This file manages reading and writing the authentication state file (`.auth/ci-login.json` or a shard-specific variant).

It provides:

- `getFilePath()` — resolves the absolute path to the auth state file
- `initialize()` — writes an empty auth state file once per session (async)
- `resetSync()` — overwrites the auth state file synchronously, used in global setup
- `reset()` — clears the in-memory initialized flag so the next `initialize()` call re-creates the file

---

### authentication.constants.ts

```text
src/configuration/playwright/authentication/constants/authentication.constants.ts
```

This file defines shared constants used by the auth storage layer:

- `ROOT_DIRECTORY` — the `.auth` folder name
- `CI_AUTH_FILE` — the auth state filename used in non-sharded CI runs
- `EMPTY_STATE` — the empty JSON string written to reset auth state
- `CI_SHARD_PREFIX` — the filename prefix used in sharded CI runs

---

### credentials.types.ts

```text
src/configuration/playwright/authentication/types/credentials.types.ts
```

This file defines the `Credentials` interface used when passing username and password through the auth setup flow.

---

### test.ui.fixtures.ts — storageState

```text
fixtures/test.ui.fixtures.ts
```

This is where `AuthenticationSkipEvaluator` is called at test runtime. The fixture overrides Playwright's built-in `storageState` fixture to make the skip-auth decision per test:

```ts
storageState: async ({}, use, testInfo) => {
  const shouldSkipAuth =
    AuthenticationSkipEvaluator.shouldSkipAuthenticationIfNeeded(testInfo);

  if (shouldSkipAuth) {
    await use(undefined);
    return;
  }

  await use(AuthenticationFileManager.getFilePath());
},
```

Playwright loads `storageState` before each test to restore browser storage (cookies, session data). By overriding this fixture, the framework intercepts that step:

- if the test carries `@skip-auth`, `undefined` is passed — no storage state is loaded and the test runs without an authenticated session
- otherwise, `AuthenticationFileManager.getFilePath()` is passed — the saved auth state file is loaded and the test starts already authenticated

This means skip-auth is enforced automatically for any test using the UI fixture. No per-test setup code is needed.

## Auth State File Location

The auth state file lives under `.auth/` at the project root:

```text
.auth/ci-login.json
```

This directory is git-ignored. Only `.env.example` is committed — never the auth file or any real credentials.

## Sharded Runs

When running with CI sharding (`SHARD_INDEX` and `SHARD_TOTAL` environment variables are set), each shard writes to its own file to avoid race conditions:

```text
.auth/ci-login-shard-1.json
.auth/ci-login-shard-2.json
```

`AuthenticationPathResolver.getFilePath()` detects the shard variables and resolves the correct path automatically. No manual configuration is needed per shard.

## Skip Auth — Source of Truth

The `AUTH_SKIP_TAGS` constant in `authSkipEvaluator.ts` is the single place that controls which tags cause a test to bypass authentication setup.

```ts
const AUTH_SKIP_TAGS = ["@skip-auth"];
```

This constant is intentionally file-scoped. It is not passed in from tests or from external config. Every test that carries a matching tag is automatically excluded from auth setup without any per-test configuration.

### How to Exclude a Test from Auth Setup

Add the `@skip-auth` tag to the test title or to the test's explicit tags array:

```ts
test("@skip-auth navigates to the public landing page", async ({ page }) => {
  // auth setup is skipped for this test
});
```

Or using the tags option:

```ts
test(
  "navigates to the public landing page",
  { tag: ["@skip-auth"] },
  async ({ page }) => {
    // auth setup is skipped for this test
  },
);
```

Both forms are detected. The evaluator normalizes all tags to lowercase before comparison.

### How to Add a New Skip Tag

Open `authSkipEvaluator.ts` and add the new tag to the `AUTH_SKIP_TAGS` array:

```ts
const AUTH_SKIP_TAGS = ["@skip-auth", "@your-new-tag"];
```

Do not define skip tags in tests, fixtures, or config files. All skip-auth logic is owned by this file.

## API and DB Tests

API and DB test projects do not depend on `setup-auth-state` and do not use browser storage state.

When `SKIP_BROWSER_INIT=true` is set, `projects.config.ts` omits the `setup-auth-state` project and all browser projects entirely:

```ts
const skipBrowserInit = shouldSkipBrowserInit(); // reads SKIP_BROWSER_INIT env var

export const setupProjects = skipBrowserInit ? [] : [{ name: "setup-auth-state", ... }];
export const browserProjects = skipBrowserInit ? [] : [{ name: "chromium", ... }, ...];
```

This is used for API-only or DB-only runs where no browser is needed.

## Running Auth Setup in Isolation

To run the auth setup without running any feature tests:

```powershell
cross-env ENV=<env> COUNTRY=<country> TEST_TAGS=@authenticate npm run test:ui
```

This runs `Authentication.setup.ts` through the `setup-auth-state` project and populates `.auth/ci-login.json`. This is useful when:

- verifying that credentials in the environment are valid
- pre-populating the auth state before running a subset of tests manually

## How the Files Connect

The authentication layer works together like this:

1. `authentication.constants.ts` defines path and file name constants
2. `authenticationFileManager.ts` uses those constants to locate and write the auth state file
3. `globalSetup.ts` calls `AuthenticationFileManager.initialize()` before any test runs
4. The `setup-auth-state` project runs `Authentication.setup.ts`, which calls `authenticationExecutor.run(credentials)` to log in and save the session
5. Before each UI test, the `storageState` fixture in `test.ui.fixtures.ts` calls `AuthenticationSkipEvaluator.shouldSkipAuthenticationIfNeeded(testInfo)`
6. If the test carries `@skip-auth`, `undefined` is passed — no auth state is loaded
7. Otherwise, `AuthenticationFileManager.getFilePath()` is passed — Playwright loads the saved session
8. `credentials.types.ts` provides the `Credentials` type used when logging in during the setup step

Tests interact with auth only through the fixture and setup files. They do not call any of these files directly.

## Practical Outcome

This setup gives the framework:

- one login per test run instead of one login per test
- consistent session reuse across `chromium`, `firefox`, and `webkit`
- isolated shard auth files that prevent CI race conditions
- a controlled opt-out path for tests that need an unauthenticated state
- skip-auth logic owned by one file and controlled by one constant
- auth state storage isolated from test logic
