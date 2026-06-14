---
alwaysApply: true
---

# Test Conventions

**[← Back to Main Documentation](../../README.md)**

This page defines the naming and structural conventions for all test files in the framework.

## Table of Contents

- [Standard Test Specs](#standard-test-specs)
- [Authentication Setup Specs](#authentication-setup-specs)
- [Test Folder Structure](#test-folder-structure)
- [Grouping With Describe](#grouping-with-describe)
- [Test Tags](#test-tags)
- [Shared Navigation Before Each Test](#shared-navigation-before-each-test)
- [Test Title Rules](#test-title-rules)
- [Title Template](#title-template)
- [Assertion Logging](#assertion-logging)
- [AI Prompt Pattern](#ai-prompt-pattern)

## Standard Test Specs

- Test spec files must use PascalCase with the `.spec.ts` suffix.
- Use this format:

```text
FeatureName.spec.ts
```

- Example:

```text
tests/layers/ui/supplyChain/approvals/ClothingApprovals.spec.ts
```

## Authentication Setup Specs

- Authentication setup files must use Authentication.setup.ts.
- Use this format:

```text
Authentication.setup.ts
```

- Examples:

```text
tests/layers/ui/authentication/Authentication.setup.ts
```

- These setup files are linked to user role setup projects in the Playwright config.

## Test Folder Structure

- UI tests should follow the layer, module, and feature structure:

```text
tests/layers/ui/<module>/<feature>/<FeatureName>.spec.ts
```

- Cleanup tests should mirror the related feature path under `cleanup`:

```text
tests/layers/ui/cleanup/<module>/<feature>/<FeatureName>.data-cleanup.spec.ts
```

## Grouping With Describe

- Every spec must group its tests inside `test.describe`.
- Related tests for one feature or scenario stay in the same describe block.
- Tags and shared setup live on the describe block, not on loose top-level tests.

This keeps each feature's tests, tags, and setup together and consistent.

## Test Tags

- Every describe must carry at least `@regression`.
- `@sanity` is optional and added per team decision for fast, high-value checks.
- Feature tags (for example `@dashboard`) describe the area under test.

Example:

```ts
test.describe(
  "Login | Valid Credentials",
  { tag: ["@regression", "@sanity", "@dashboard"] },
  () => {
    // tests here inherit the group tags
  },
);
```

The full tag reference is in [Test Tags](../05-testing/03-test-tags.md).

## Shared Navigation Before Each Test

The framework uses a shared authenticated state, so tests do not log in individually.

Every describe must navigate to the portal before each test:

```ts
test.beforeEach(async ({ loginOrchestrator }) => {
  await loginOrchestrator.navigateToPortal();
});
```

This guarantees each test starts from the portal entry point on top of the shared auth state.

## Test Title Rules

- Every test title must start with the prefix `Should`. No exceptions.
- Describe titles must start with a capital letter.
- Test titles already start with a capital letter through the `Should` prefix.

Capitalization keeps reports and logs consistent. Test file names are also required to start with a capital letter, and that part is enforced by the pre-commit and pre-push hooks.

## Title Template

Use these templates for consistent, readable titles:

- Describe block: `"<Feature> | <Scenario>"`
- Test: `"Should <expected outcome>"`

Examples:

```text
describe: "Login | Valid Credentials"
test:     "Should navigate to Dashboard on successful login"
```

## Assertion Logging

- Each test must log a success line using the `Assertion Passed:` prefix.
- Use one assertion log per test, describing what was verified.

```ts
logger.info("Assertion Passed: User successfully logged in and Dashboard is Visible");
```

This keeps a consistent, searchable success signal in the logs for every test.

## AI Prompt Pattern

When asking Claude to review or write tests against these conventions, always attach this file and the file being worked on before asking:

```text
<filepath>docs/framework/02-rules/test-conventions.md</filepath> does this test file follow the naming and folder structure rules? <filepath>tests/layers/ui/moduleName/Name.spec.ts</filepath>
```

Attaching this file guarantees Claude reads the actual framework conventions before responding instead of using general assumptions.
