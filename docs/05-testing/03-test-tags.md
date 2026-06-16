# Test Tags

**[← Back to Main Documentation](../../README.md)**

This page is the reference for the test tag system: what tags are, the categories used in the framework, and how a tag controls execution.

For the step-by-step contributor flow of adding a new tag, see [Test Tags Workflow](../07-workflows/05-test-tags-workflow.md).

## Table of Contents

- [What Tags Are](#what-tags-are)
- [Tag Categories](#tag-categories)
- [Where Tags Are Placed](#where-tags-are-placed)
- [How Tags Drive Execution](#how-tags-drive-execution)
- [The Authentication Tags](#the-authentication-tags)
- [Practical Outcome](#practical-outcome)

## What Tags Are

A tag is a label on a test or test group, written with a leading `@`.

Tags let a run target a subset of tests instead of the whole layer. A test can carry one tag or several.

```ts
// one tag
{
  tag: "@sanity";
}

// several tags
{
  tag: ["@regression", "@sanity", "@dashboard"];
}
```

## Tag Categories

The framework uses three broad kinds of tags.

- **Suite tags** — describe how widely the test runs.
  - `@sanity` — fast, high-value checks.
  - `@regression` — the broader regression set.
- **Feature tags** — describe the area under test. These map to the module or feature.
  - `@dashboard` is the feature tag in current use.
  - Patterns for other areas look like `@admin` or `@pim`.
- **Behavior tags** — control framework behavior rather than scope.
  - `@authenticate` — marks the authentication setup spec.
  - `@skip-auth` — opts a test out of the shared authenticated state.

Keep broad tags (`@sanity`, `@regression`, feature tags) at the `describe` level where it makes sense, so the whole group filters together.

## Where Tags Are Placed

Tags are passed in the options object of `test.describe` or an individual `test`.

Group-level tags apply to every test in the group:

```ts
test.describe(
  "Login | Valid Credentials",
  { tag: ["@regression", "@sanity", "@dashboard"] },
  () => {
    // tests here inherit the group tags
  },
);
```

This is the pattern used in `tests/layers/ui/login/ValidLogin.spec.ts`.

## How Tags Drive Execution

Tag filtering is driven by the `TEST_TAGS` environment variable.

- `playwright.config.ts` reads `TEST_TAGS` and turns it into a `grep` expression.
- Only tests whose tags match the expression run.

Run a single tag group:

```powershell
cross-env ENV=qa TEST_TAGS=@sanity npm run test:ui
```

When `TEST_TAGS` is not set, the config falls back to matching everything, so the full layer runs. The full command reference is in [Execution Commands](../01-setup/execution-commands.md).

## The Authentication Tags

Two behavior tags coordinate authentication.

- **`@authenticate`** — carried by `tests/layers/ui/authentication/Authentication.setup.ts`. Running with this tag executes the authentication setup, which establishes the stored login state other tests reuse.
- **`@skip-auth`** — listed in `src/configuration/playwright/authentication/evaluators/authSkipEvaluator.ts`. A test tagged with `@skip-auth` resolves no stored state, so it starts unauthenticated. This is handled by the `storageState` fixture in `fixtures/test.ui.fixtures.ts`.

Because tagged runs still need authentication, the same scope tags used by feature tests should also appear on the authentication setup. The [Test Tags Workflow](../07-workflows/05-test-tags-workflow.md) covers keeping these in sync, along with declaring the matching CI tag option.

## Practical Outcome

This page gives one place to understand what each tag means and how a tag turns into a filtered run, so contributors tag tests consistently and can target exactly the set they want.
