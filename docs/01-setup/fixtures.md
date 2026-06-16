# Fixtures

**[← Back to Main Documentation](../../README.md)**

This page explains how the test fixture system is structured and why it is split into a base layer and per-layer files.

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [Why the Split Exists](#why-the-split-exists)
- [Files and Responsibilities](#files-and-responsibilities)
  - [config.fixtures.ts](#configfixturests)
  - [test.ui.fixtures.ts](#testuifixturests)
- [How the Chain Works](#how-the-chain-works)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

All fixture files live directly under:

```text
fixtures/
```

The two files are:

```text
fixtures/config.fixtures.ts
fixtures/test.ui.fixtures.ts
```

## Why the Split Exists

Not every test layer needs the same fixtures.

UI tests need browser context, authentication state, and page objects. API and DB tests do not. If a single fixture file provided everything to every test, non-UI tests would carry browser setup overhead they never use.

The split separates shared concerns from layer-specific ones:

- `config.fixtures.ts` provides what every test needs regardless of layer
- `test.ui.fixtures.ts` extends it with what only UI tests need

The API and DB layers are scaffolded but not yet implemented. When built, each adds its own `test.<layer>.fixtures.ts` that extends `config.fixtures.ts` the same way. Each test file imports from the fixture that matches its layer. Nothing more, nothing less.

## Files and Responsibilities

### config.fixtures.ts

```text
fixtures/config.fixtures.ts
```

This is the base fixture. It extends Playwright's `baseTest` directly and provides the shared foundation for all test layers.

It exposes:

- `testInfo` — the Playwright `TestInfo` object for the current test
- `environmentResolver` — an `EnvironmentResolver` instance used to retrieve URLs and credentials at runtime

Every fixture in `test.ui.fixtures.ts` builds on top of this, as will any future per-layer fixture. Such files never re-import from `@playwright/test` directly — they extend `config.fixtures.ts` instead.

---

### test.ui.fixtures.ts

```text
fixtures/test.ui.fixtures.ts
```

This is the UI layer fixture. It extends `config.fixtures.ts` and adds browser context, authentication, and page-level fixtures.

It exposes:

- `testContext` — a `TestContext` instance holding shared runtime state for the current test
- `browserContextManager` — a `BrowserContextManager` for managing the browser context lifecycle
- `authenticationStateManager` — an `AuthenticationStateManager` for reading and applying auth state to the page
- `loginOrchestrator` — a `LoginOrchestrator` built from the page, environment resolver, and auth state manager; drives the login flow and verifies the portal loaded correctly after navigation
- `authenticationExecutor` — an `AuthenticationExecutor` that composes `loginOrchestrator` and `loginPage` to run the full end-to-end authentication flow used by the auth setup test
- `loginPage` — a `LoginPage` page object for the OrangeHRM login form
- `forgotPasswordPage` — a `ForgotPasswordPage` page object for the OrangeHRM password-reset form
- `dashboardPage` — a `DashboardPage` page object for the OrangeHRM dashboard
- `topBar` — a `TopBar` page object for the dashboard top navigation bar
- `sideBar` — a `SideBar` page object for the side navigation menu

It also overrides `storageState`:

- if the test is tagged with `@skip-auth`, `storageState` resolves to `undefined` — no auth file is loaded
- otherwise it resolves to the shared auth state file path from `AuthenticationFileManager`

UI tests import `test` and `expect` from this file, not from `@playwright/test`.

## How the Chain Works

The fixture chain flows like this:

1. `config.fixtures.ts` extends Playwright's `baseTest` and adds `testInfo` and `environmentResolver`
2. `test.ui.fixtures.ts` extends `config.fixtures.ts` and adds UI-specific fixtures — it inherits `testInfo` and `environmentResolver` automatically
3. Test files import only from the fixture that matches their layer

`environmentResolver` being in the base fixture means any future layer can resolve URLs and credentials without duplicating that setup.

## Practical Outcome

Splitting fixtures by layer means:

- UI tests carry only what they need; future API or DB layers stay free of browser overhead
- shared fixtures are defined once and inherited automatically
- adding a new fixture to a layer does not affect other layers
- the base fixture is the single place to change when all layers need something new
