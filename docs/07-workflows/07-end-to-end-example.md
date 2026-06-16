# End-To-End Example

**[← Back to Main Documentation](../../../README.md)**

This page shows the normal end-to-end contribution flow for a new feature helper.

## Table of Contents

- [Example Scenario](#example-scenario)
- [End-To-End Flow](#end-to-end-flow)
- [Example Change Areas](#example-change-areas)
- [Why This Flow Matters](#why-this-flow-matters)

## Example Scenario

You add a new page or helper class for a UI feature and want it to be fully usable in the framework.

## End-To-End Flow

1. Add the class in the correct framework area.
2. Follow naming rules and keep the responsibility focused.
3. Extend `BasePage` if it is a Playwright-driven UI class.
4. Inject any shared dependencies through the constructor.
5. Import and register the class in `fixtures/test.ui.fixtures.ts`.
6. Add the new fixture type in `TestFixtures`.
7. Use the fixture in the test spec.
8. Add the required test tags.
9. Add the same tags to authentication setup specs if the feature needs auth.
10. Add cleanup coverage if the flow creates or mutates risky data.
11. Add the CI tag option in `.github/config/test-tags.json` without the `@`.

## Example Change Areas

A real contribution may touch files such as:

- `src/layers/ui/pages/...`
- `src/layers/ui/pages/shared/...`
- `fixtures/test.ui.fixtures.ts`
- `tests/layers/ui/...`
- `tests/layers/ui/authentication/...`
- `.github/config/test-tags.json`

## Why This Flow Matters

A framework change is considered complete only when the full execution chain is covered.

That means:

- the class exists
- the fixture exists
- the test can use it
- tags work locally and in CI
- cleanup exists when the feature creates test data risk

This is the difference between adding a class and adding a usable framework feature.
