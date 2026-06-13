# Use In Tests

**[← Back to Main Documentation](../../../README.md)**

This page explains how to use a newly added class after it has been registered in fixtures.

It focuses on the **workflow** of wiring a fixture into a test. It does not restate the test conventions themselves — for how specs are named, structured, and tagged, follow:

- [test-conventions.md](../02-rules/test-conventions.md) — naming, folder structure, titles, tags, assertion logging
- [Testing](../05-testing/01-overview.md) — how the test layer fits together end to end

## Table of Contents

- [Step 1: Request The Fixture In The Test](#step-1-request-the-fixture-in-the-test)
- [Step 2: Keep Test Files Focused On Intent](#step-2-keep-test-files-focused-on-intent)
- [Step 3: Reuse Registered Dependencies Indirectly](#step-3-reuse-registered-dependencies-indirectly)
- [Step 4: Keep Assertions At The Right Level](#step-4-keep-assertions-at-the-right-level)
- [Step 5: Use `TestContext` When Cross-Step Runtime Data Is Needed](#step-5-use-testcontext-when-cross-step-runtime-data-is-needed)
- [Related References](#related-references)
- [Final Checklist](#final-checklist)

## Step 1: Request The Fixture In The Test

Once the class is registered in `fixtures/test.fixture.ts`, request it from the test callback.

Example pattern:

```ts
test("example flow", async ({ newFeaturePage }) => {
  await newFeaturePage.runSomething();
});
```

This is the main benefit of fixture registration: tests do not need to construct the class manually.

## Step 2: Keep Test Files Focused On Intent

Tests should call reusable page and helper methods rather than rebuilding feature logic inline.

Good pattern:

- test describes the scenario
- page/helper class performs the feature behavior
- shared helpers and fixtures support the page internally

This keeps tests readable and maintainable.

For how a spec should be laid out — file naming, `describe` grouping, titles, and tags — follow [test-conventions.md](../02-rules/test-conventions.md) and [Test Structure](../05-testing/02-test-structure.md).

## Step 3: Reuse Registered Dependencies Indirectly

Most tests should not request every shared helper directly.

If the page object already composes:

- `TableManager`
- `LoadingIndicators`
- `DialogButtons`
- `ToggleManager`

then the test should usually call the page object, not all those helpers separately.

Request lower-level helpers directly only when the test truly needs them.

## Step 4: Keep Assertions At The Right Level

Use the class methods that match the feature behavior.

Examples:

- page object methods for business flow assertions
- shared component methods for reusable UI control assertions
- network helpers when the scenario depends on response coordination

Do not move large chunks of feature logic back into the spec after creating the class.

Follow the framework's assertion logging rules from [test-conventions.md](../02-rules/test-conventions.md#assertion-logging).

## Step 5: Use `TestContext` When Cross-Step Runtime Data Is Needed

If the test captures a runtime value in one step and needs it later:

- store it through the existing context pattern
- use the related key generator where the framework already does that

Do not rely on fragile ad hoc variable naming when a context key pattern already exists.

## Related References

This workflow assumes the test conventions are already understood. For the full rules behind the steps above:

- [test-conventions.md](../02-rules/test-conventions.md) — spec naming, folder structure, `describe` grouping, title rules, tags, and assertion logging
- [Testing Overview](../05-testing/01-overview.md) — where tests live and the test lifecycle
- [Test Structure](../05-testing/02-test-structure.md) — anatomy of a spec and how page objects reach the test
- [Test Tags](../05-testing/03-test-tags.md) — tag categories, placement, and how they drive execution

## Final Checklist

Before moving on:

- the new fixture is injected into the test
- the test calls the class instead of recreating the flow inline
- lower-level helpers are only used directly when necessary
- any shared runtime data follows the existing context pattern
