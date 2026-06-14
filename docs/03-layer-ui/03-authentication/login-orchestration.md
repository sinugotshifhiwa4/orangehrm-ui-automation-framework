# Login Orchestration

**[← Back to Main Documentation](../../../README.md)**

This page explains the login orchestration layer under `src/layers/ui/pages/authentication/`.

The orchestration layer is responsible for navigating to the portal, executing the login flow, validating the outcome, and saving the authenticated browser state. It coordinates the page objects and the auth state manager so tests do not need to manage any of that directly. It also exposes a session-aware entry point that re-authenticates only when an injected session has gone stale.

## Table of Contents

- [Why This Layer Exists](#why-this-layer-exists)
- [Main Files](#main-files)
- [Layer Structure](#layer-structure)
- [`LoginOrchestrator`](#loginorchestrator)
  - [Public Methods](#public-methods)
  - [Private Methods](#private-methods)
- [`AuthenticationExecutor`](#authenticationexecutor)
  - [Operations](#operations)
- [How the Two Classes Work Together](#how-the-two-classes-work-together)
- [How This Layer Connects to Fixtures](#how-this-layer-connects-to-fixtures)
- [How This Layer Connects to the Auth Setup Test](#how-this-layer-connects-to-the-auth-setup-test)
- [Practical Outcome](#practical-outcome)

## Why This Layer Exists

Authentication setup is a prerequisite for most UI tests. Rather than duplicating navigation, form interaction, and state-saving logic across test files, the orchestration layer centralises the full flow in two coordinated classes.

`LoginOrchestrator` owns the generic login execution pattern — navigate, login, validate, save state. `AuthenticationExecutor` owns the OrangeHRM-specific steps that fill in that pattern: how to fill the login form and how to confirm success.

## Main Files

- `src/layers/ui/pages/authentication/loginOrchestrator.ts`
- `src/layers/ui/pages/authentication/authenticationExecutor.ts`

## Layer Structure

The layer splits responsibilities across two classes:

1. `LoginOrchestrator` — the generic orchestration layer (navigation, flow execution, state saving)
2. `AuthenticationExecutor` — the OrangeHRM-specific execution layer (page interactions, credential use)

`LoginOrchestrator` accepts callbacks from `AuthenticationExecutor`. This keeps the orchestration logic clean and reusable without tying it to any specific page structure.

## `LoginOrchestrator`

`loginOrchestrator.ts` extends `BasePage` and manages the login execution pattern.

It extends `BasePage` (for the page and navigation helpers) and depends on:

- `EnvironmentResolver` — to resolve the portal base URL for the active environment
- `AuthenticationStateManager` — to save authenticated browser state after a successful login

### Public Methods

- `navigateToPortal()` — resolves the portal base URL and navigates to it
- `isAuthenticatedSessionActive()` — navigates to the portal and reports whether the injected session is still authenticated; the portal redirects an expired session to `/auth/login`, so a redirect means the session is stale
- `loginWithValidCredentials(loginFn, validateLoginFn)` — runs the full login flow using the provided callbacks; saves auth state on success

### Private Methods

- `executeLoginFlow(loginFn, validateFn, source, context, afterFn?)` — the shared execution wrapper behind `loginWithValidCredentials`; navigates, executes login, validates, and optionally runs a post-validation callback (used to save auth state)

## `AuthenticationExecutor`

`authenticationExecutor.ts` is the OrangeHRM-specific layer that uses `LoginOrchestrator` to run the full login flow with real credentials.

It depends on:

- `LoginOrchestrator` — for navigation and flow execution
- `LoginPage` — to fill in credentials, submit the login form, and confirm no invalid-credentials alert is shown

### Operations

- `run(credentials)` — performs a full login. Calls `loginOrchestrator.loginWithValidCredentials`, providing two callbacks:
  - `loginFn` — calls `LoginPage.login` with the supplied credentials
  - `validateLoginFn` — calls `LoginPage.verifyInvalidCredentialsAlertIsHidden` to confirm no error alert appeared, indicating login succeeded
- `ensureAuthenticated(credentials)` — the session-aware entry point. It asks `loginOrchestrator.isAuthenticatedSessionActive()` first; if the injected session is still valid it returns without logging in again, and it only calls `run(credentials)` — a full re-login that refreshes the saved storage state — when the session has gone stale.

Invalid-credential scenarios are not handled here. Login-failure tests drive `LoginPage` directly (`login` then `verifyInvalidCredentialsAlertIsVisible`); see `tests/layers/ui/login/InvalidLogin.spec.ts`.

## How the Two Classes Work Together

The flow for a successful login looks like this:

1. `AuthenticationExecutor.run(credentials)` calls `loginOrchestrator.loginWithValidCredentials`
2. `LoginOrchestrator` calls `navigateToPortal()` — navigates to the portal base URL
3. `LoginOrchestrator` calls the `loginFn` callback — `LoginPage.login`
4. `LoginOrchestrator` calls the `validateLoginFn` callback — `LoginPage.verifyInvalidCredentialsAlertIsHidden`
5. `LoginOrchestrator` calls `AuthenticationStateManager.saveAuthenticationState()` to persist the session

When a spec only needs to _be_ authenticated rather than force a fresh login, it calls `ensureAuthenticated(credentials)` instead. The re-authentication flow is:

1. `AuthenticationExecutor.ensureAuthenticated(credentials)` calls `loginOrchestrator.isAuthenticatedSessionActive()`
2. `LoginOrchestrator` navigates to the portal and checks whether the URL was redirected to `/auth/login`
3. if the session is still active, `ensureAuthenticated` returns immediately — no second login
4. if the session is stale, `ensureAuthenticated` calls `run(credentials)`, which performs the full login flow above and re-saves the storage state

This is used by feature specs that start from the shared authenticated state but must tolerate that state having expired between the auth-setup step and the test. The pattern is used in `tests/layers/ui/login/ValidLogin.spec.ts`.

## How This Layer Connects to Fixtures

Both classes are registered as fixtures in `fixtures/test.ui.fixtures.ts`.

The fixture chain builds them in dependency order:

1. `loginPage` is created first
2. `loginOrchestrator` receives the page, `environmentResolver`, and `authenticationStateManager` as constructor arguments
3. `authenticationExecutor` receives `loginOrchestrator` and `loginPage`

Tests that need the full authentication flow receive `authenticationExecutor` as an injected fixture.

## How This Layer Connects to the Auth Setup Test

The authentication setup test lives at:

```text
tests/layers/ui/authentication/Authentication.setup.ts
```

It is tagged with `@authenticate`, `@sanity`, `@regression`, and `@dashboard`.

The test calls `authenticationExecutor.run(credentials)` with the credentials resolved by `environmentResolver.getPortalCredentials()`. This runs the full login flow and saves the authenticated browser state, then verifies the dashboard loaded via `topBar.verifyTopBarMenusAreVisible()`.

See [Authentication Setup](./authentication-setup.md) for how that saved state is wired into the full project setup flow.

## Practical Outcome

The orchestration layer means that:

- the auth setup test stays small and focused on intent, not on navigation or form mechanics
- feature specs can guarantee an authenticated session with one call (`ensureAuthenticated`) and only pay for a re-login when the session has actually expired
- adding a new login variant only requires a new callback pair passed to `loginOrchestrator` — the navigation and state-saving behavior is already handled
