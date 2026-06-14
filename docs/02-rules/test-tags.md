---
alwaysApply: true
paths:
  - "tests/layers/ui/**"
  - ".github/config/test-tags.json"
---

# Test Tags

**[← Back to Main Documentation](../../../README.md)**

This page defines how test tags must be used in this framework.

Tags are not just labels for filtering. In this framework they connect:

- local test execution
- Playwright tag filtering
- authentication setup coverage
- cleanup coverage
- CI pipeline tag selection

## Table of Contents

- [Core Rule](#core-rule)
- [Where Tags Are Used](#where-tags-are-used)
- [Parent And Module Tags](#parent-and-module-tags)
- [Single Test Tags](#single-test-tags)
- [Authentication Tag Rule](#authentication-tag-rule)
- [CI Tag Registration Rule](#ci-tag-registration-rule)
- [Example Tag Workflow](#example-tag-workflow)
- [Existing Tag Design Pattern](#existing-tag-design-pattern)
- [Practical Outcome](#practical-outcome)

## Core Rule

Every meaningful tag added to a UI test must be handled in all related tag locations.

That means when a new tag is introduced, it must be considered in:

- the test file itself
- authentication setup under `tests/layers/ui/authentication`
- CI tag registration in `.github/config/test-tags.json`

## Where Tags Are Used

Tags are currently used in:

- parent `test.describe(...)` blocks
- individual `test(...)` cases
- authentication setup files
- the GitHub Actions CI tag allow-list

## Parent And Module Tags

Each module should carry its module-level or feature-level tags at the parent `describe` level.

The tags currently registered in this framework are:

- `@sanity`
- `@regression`
- `@login`
- `@dashboard`
- `@authenticate`
- `@skip-auth`

`@sanity` and `@regression` are suite tags; `@login` and `@dashboard` are feature tags; `@authenticate` and `@skip-auth` are behavior tags. As more of the application is automated, new feature tags follow the same pattern (for example `@admin` or `@pim`). This gives the suite a stable parent tag structure that individual tests can inherit conceptually.

## Single Test Tags

A test can use either:

- a single string tag
- an array of tags

Both patterns are already used in the framework.

Examples:

```ts
{
  tag: "@sanity";
}
```

```ts
{
  tag: ["@regression", "@sanity", "@dashboard"];
}
```

This means contributors should follow the existing framework style:

- use arrays when multiple tags are needed
- use a single string when only one focused tag is needed

## Authentication Tag Rule

All tags added in tests that require authenticated execution must also be represented in the authentication setup:

- `tests/layers/ui/authentication/Authentication.setup.ts`

The setup spec is tagged so that tagged test runs still resolve the auth setup path. If a new tag is added to tests and it is meant to run through authenticated execution, add that same tag to the setup spec.

The tags currently carried by `Authentication.setup.ts` are:

- `@authenticate`
- `@sanity`
- `@regression`
- `@login`
- `@dashboard`

## Cleanup Tag Rule

There is no cleanup layer in the framework yet. When one is added (under `tests/layers/ui/cleanup`), the same rule applies: if a tagged test introduces test data risk, a matching cleanup path should carry the relevant tags so the cleanup stage resolves for the same tag group.

Cleanup is relevant when a tagged flow creates, mutates, or leaves behind data that can affect later runs. The current UI suite (login and dashboard checks) does not create persistent data, so no cleanup specs exist.

## CI Tag Registration Rule

When a new tag is added for test execution, it must also be added to:

- `.github/config/test-tags.json`

Important CI rule:

- in test code, add the tag with the `@` prefix
- in `.github/config/test-tags.json`, add the same tag value without `@`

Example:

- test code: `@sanity`
- CI tag option: `sanity`

The pipeline workflow handles adding the `@` form during CI execution. The current allow-list is `authenticate`, `sanity`, `regression`, `skip-auth`, `login`, `dashboard`.

## Example Tag Workflow

If you introduce a new tag such as `@admin`, update the framework in this order:

1. Add `@admin` to the relevant UI tests.
2. Add `@admin` to the authentication setup spec if the tagged tests require auth state.
3. Add `admin` to `.github/config/test-tags.json`.

If one of these steps is skipped, local and CI tag execution can become incomplete or inconsistent.

## Existing Tag Design Pattern

The current framework already follows a layered tag pattern:

- broad suite tags at parent/module level
- focused tags at individual test level
- authentication setup tags for auth-state support
- CI tag options for pipeline execution

That pattern should continue for all new tags. Cleanup tags for data-risk flows join this pattern once a cleanup layer exists.

## Practical Outcome

Following these rules keeps tag usage:

- consistent across test suites
- compatible with authentication setup
- compatible with cleanup resolution
- usable in local filtered execution
- usable in CI pipeline execution
