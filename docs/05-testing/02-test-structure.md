# Test Structure

**[← Back to Main Documentation](../../README.md)**

This page explains how UI tests are organized on disk and how a test file is shaped.

It uses the actual test files in the repo as examples. For the canonical naming and folder rules, see [Test Conventions](../02-rules/test-conventions.md).

## Table of Contents

- [Folder Layout](#folder-layout)
- [Two Kinds Of Test Files](#two-kinds-of-test-files)
- [Anatomy Of A Spec](#anatomy-of-a-spec)
- [Anatomy Of An Authentication Setup](#anatomy-of-an-authentication-setup)
- [How Page Objects Reach The Test](#how-page-objects-reach-the-test)
- [Practical Outcome](#practical-outcome)

## Folder Layout

UI tests follow a layer, module, and feature structure:

```text
tests/layers/ui/<module>/<feature>/<FeatureName>.spec.ts
```

The current repo has:

```text
tests/layers/ui/login/ValidLogin.spec.ts
tests/layers/ui/authentication/Authentication.setup.ts
```

## Two Kinds Of Test Files

The framework uses two file types under `tests/layers/ui/`:

- **Spec files** (`*.spec.ts`) — normal tests that assert application behavior.
- **Authentication setup files** (`Authentication.setup.ts`) — setup specs linked to user-role setup projects in `playwright.config.ts`. They establish the authenticated state other tests reuse.

The naming for both is fixed by [Test Conventions](../02-rules/test-conventions.md).

## Anatomy Of A Spec

A spec imports the UI fixtures, groups related tests in a `describe` block, and carries tags at the group level.

Example from `tests/layers/ui/login/ValidLogin.spec.ts`:

```ts
import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe(
  "Login | Valid Credentials",
  { tag: ["@regression", "@sanity", "@dashboard"] },
  () => {
    test.beforeEach(async ({ loginOrchestrator }) => {
      await loginOrchestrator.navigateToPortal();
    });

    test("Should navigate to Dashboard on successful login", async ({
      loginPage,
      sideBar,
    }) => {
      await loginPage.verifyInvalidCredentialsAlertIsHidden();
      await sideBar.verifyDashboardMenuLinkIsVisible();
      logger.info(
        "Assertion Passed: User successfully logged in and Dashboard is Visible",
      );
    });
  },
);
```

Key points:

- The `test` import comes from `fixtures/test.ui.fixtures`, not directly from Playwright.
- Tags live on the `describe` block so the whole group filters together.
- Shared navigation runs in `beforeEach`.
- The test body requests only the page objects it needs (`loginPage`, `sideBar`) and keeps assertions focused on intent.

## Anatomy Of An Authentication Setup

A setup file uses the same fixtures but is aliased as `authentication` for clarity, and it always carries the `@authenticate` tag.

Example from `tests/layers/ui/authentication/Authentication.setup.ts`:

```ts
import { test as authentication } from "../../../../fixtures/test.ui.fixtures.js";

authentication(
  "Authenticates the user with valid credentials",
  {
    tag: ["@authenticate", "@sanity", "@regression", "@dashboard"],
  },
  async ({ authenticationExecutor, environmentResolver, topBar }) => {
    const credentials = environmentResolver.getPortalCredentials();
    await authenticationExecutor.run(credentials);
    await topBar.verifyTopBarMenusAreVisible();
  },
);
```

The `@authenticate` tag is what ties this setup to the authentication run. See [Test Tags](./03-test-tags.md) for how that tag is used.

## How Page Objects Reach The Test

Tests never construct page objects directly. They request them as fixtures, and Playwright resolves the dependency graph:

- `loginPage`, `sideBar`, `topBar`, `dashboardPage`, `forgotPasswordPage` are all registered in `fixtures/test.ui.fixtures.ts`.
- A fixture can depend on another fixture (for example, `topBar` depends on `dashboardPage`).

For the full registration flow, see [Register In Fixtures](../07-workflows/03-register-in-fixtures.md).

## Practical Outcome

This page shows what a real test file looks like in this framework, so a contributor can copy the existing shape instead of inventing a new one. The formal naming rules stay in [Test Conventions](../02-rules/test-conventions.md).
