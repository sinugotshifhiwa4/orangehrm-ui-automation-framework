# Test Tags Workflow

**[← Back to Main Documentation](../../../README.md)**

This page explains the practical workflow for adding tags to a new test or feature.

The full tag rules are documented in [Test Tags](../05-testing/03-test-tags.md).

This page focuses on the contribution workflow.

## Table of Contents

- [Step 1: Add Tags In The Test](#step-1-add-tags-in-the-test)
- [Step 2: Keep Parent And Feature Tags Sensible](#step-2-keep-parent-and-feature-tags-sensible)
- [Step 3: Add Matching Tags To Authentication Setup](#step-3-add-matching-tags-to-authentication-setup)
- [Step 4: Add Matching Tags To Cleanup When Data Risk Exists](#step-4-add-matching-tags-to-cleanup-when-data-risk-exists)
- [Step 5: Add The CI Tag Option](#step-5-add-the-ci-tag-option)
- [Final Checklist](#final-checklist)

## Step 1: Add Tags In The Test

Add the required tags in the test file.

Use the framework tag style:

- single string for one focused tag
- array for multiple tags

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

## Step 2: Keep Parent And Feature Tags Sensible

Module or feature groups should carry their broad tags at the parent level where appropriate.

Examples:

- `@sanity`
- `@regression`
- feature tags like `@login` or `@dashboard`

This keeps filtering practical and predictable.

## Step 3: Add Matching Tags To Authentication Setup

If the tagged tests need authenticated execution, the same tag must be added to:

- `tests/layers/ui/authentication/Authentication.setup.ts`

This matters because tagged runs still need the setup project to match the selected tag group.

## Step 4: Add Matching Tags To Cleanup When Data Risk Exists

There is no cleanup layer yet. If one is added under `tests/layers/ui/cleanup` and the tagged feature creates or mutates data that can affect later runs, the cleanup path should carry the relevant tag so the same feature group can be cleaned consistently.

## Step 5: Add The CI Tag Option

Add the tag to:

- `.github/config/test-tags.json`

Important rule:

- in tests, use `@tag-name`
- in `.github/config/test-tags.json`, use `tag-name` without `@`

Example:

- test: `@sanity`
- CI tag option: `sanity`

## Final Checklist

When adding a new tag, confirm all related places were updated:

- test spec
- authentication setup spec
- cleanup specs when a cleanup layer exists
- `.github/config/test-tags.json`
