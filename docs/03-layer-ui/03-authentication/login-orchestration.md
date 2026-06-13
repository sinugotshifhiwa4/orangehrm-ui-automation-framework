# Login Orchestration

**[← Back to Main Documentation](../../../README.md)**

This page explains the login orchestration layer under `src/layers/ui/pages/authentication/`.

The orchestration layer is responsible for navigating to the portal, executing the login flow, validating the outcome, and saving the authenticated browser state. It coordinates the page objects and the auth state manager so tests do not need to manage any of that directly.

## Table of Contents

- [Why This Layer Exists](#why-this-layer-exists)
- [Main Files](#main-files)
- [Layer Structure](#layer-structure)
- [`LoginOrchestrator`](#loginorchestrator)
  - [Public Methods](#public-methods)
  - [Private Methods](#private-methods)
- [`AuthenticationExecutor`](#authenticationexecutor)
  - [Main Operation](#main-operation)
- [How the Two Classes Work Together](#how-the-two-classes-work-together)
- [How This Layer Connects to Fixtures](#how-this-layer-connects-to-fixtures)
- [How This Layer Connects to the Auth Setup Test](#how-this-layer-connects-to-the-auth-setup-test)
- [Practical Outcome](#practical-outcome)

## Why This Layer Exists

Authentication setup is a prerequisite for most UI tests. Rather than duplicating navigation, form interaction, and state-saving logic across test files, the orchestration layer centralises the full flow in two coordinated classes.

`LoginOrchestrator` owns the generic login execution pattern — navigate, login, validate, save state. `AuthenticationExecutor` owns the Amrod-specific steps that fill in that pattern: which page to navigate to, what the login form looks like, and how to confirm success.

## Main Files

- `src/layers/ui/pages/authentication/loginOrchestrator.ts`
- `src/layers/ui/pages/authentication/authenticationExecutor.ts`

## Layer Structure

The layer splits responsibilities across two classes:

1. `LoginOrchestrator` — the generic orchestration layer (navigation, flow execution, state saving)
2. `AuthenticationExecutor` — the Amrod-specific execution layer (page interactions, credential use)

`LoginOrchestrator` accepts callbacks from `AuthenticationExecutor`. This keeps the orchestration logic clean and reusable without tying it to any specific page structure.

## `LoginOrchestrator`

`loginOrchestrator.ts` extends `BasePage` and manages the login execution pattern.

It depends on:

- `EnvironmentResolver` — to resolve the portal base URL for the active country
- `AuthenticationStateManager` — to save authenticated browser state after a successful login
- `HeroPage` — to verify the portal loaded correctly after navigation

### Public Methods

- `navigateToPortal()` — resolves the portal URL, navigates to it, then asserts that the Amrod logo is visible and the URL matches
- `loginWithValidCredentials(loginFn, validateLoginFn)` — runs the full login flow using the provided callbacks; saves auth state on success
- `loginWithInvalidCredentials(loginFn, validateInvalidLoginFn)` — runs the login flow expecting a failure; validates the failure response using the provided callback

### Private Methods

- `executeLoginFlow(loginFn, validateFn, source, context, afterFn?)` — the shared execution wrapper used by both public login methods; navigates, executes login, validates, and optionally runs a post-validation callback (used to save state)

## `AuthenticationExecutor`

`authenticationExecutor.ts` is the Amrod-specific layer that uses `LoginOrchestrator` to run the full login flow with real credentials.

It depends on:

- `LoginOrchestrator` — for navigation and flow execution
- `HeroPage` — to verify the portal header and click the login link
- `LoginPage` — to fill in credentials and submit the login form

### Main Operation

- `run(credentials)` — calls `loginOrchestrator.loginWithValidCredentials`, providing two callbacks:
  - `loginFn` — verifies the logo is visible, clicks the login link, then calls `LoginPage.login` with the supplied credentials
  - `validateLoginFn` — asserts the user profile button is visible, confirming login succeeded

## How the Two Classes Work Together

The flow for a successful login looks like this:

1. `AuthenticationExecutor.run(credentials)` calls `loginOrchestrator.loginWithValidCredentials`
2. `LoginOrchestrator` calls `navigateToPortal()` — navigates to the portal URL and verifies the page loaded correctly
3. `LoginOrchestrator` calls the `loginFn` callback — `HeroPage.clickLoginLink`, then `LoginPage.login`
4. `LoginOrchestrator` calls the `validateLoginFn` callback — `HeroPage.verifyclickUserProfileButtonIsVisible`
5. `LoginOrchestrator` calls `AuthenticationStateManager.saveAuthenticationState()` to persist the session

## How This Layer Connects to Fixtures

Both classes are registered as fixtures in `fixtures/test.ui.fixtures.ts`.

The fixture chain builds them in dependency order:

1. `heroPage` and `loginPage` are created first
2. `loginOrchestrator` receives `heroPage` as a constructor argument alongside `environmentResolver` and `authenticationStateManager`
3. `authenticationExecutor` receives `loginOrchestrator`, `heroPage`, and `loginPage`

Tests that need the full authentication flow receive `authenticationExecutor` as an injected fixture.

## How This Layer Connects to the Auth Setup Test

The authentication setup test lives at:

```text
tests/layers/ui/authentication/Authentication.setup.ts
```

It is tagged with `@authenticate` and the sanity and regression tags for all three countries.

The test calls `authenticationExecutor.run(credentials)` with the credentials resolved by `environmentResolver.getPortalCredentials()`. This runs the full login flow and saves the authenticated browser state.

See [Authentication Setup](./authentication-setup.md) for how that saved state is wired into the full project setup flow.

## Practical Outcome

The orchestration layer means that:

- the auth setup test stays small and focused on intent, not on navigation or form mechanics
- `LoginOrchestrator` can support both valid and invalid credential flows without duplicating navigation logic
- adding a new login variant only requires a new callback pair passed to `loginOrchestrator` — the navigation and state-saving behavior is already handled
