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
  tag: ["@regression", "@supply-chain", "@shipping"];
}
```

## Step 2: Keep Parent And Feature Tags Sensible

Module or feature groups should carry their broad tags at the parent level where appropriate.

Examples:

- `@sanity`
- `@regression`
- `@supply-chain`
- `@system-administration`
- feature tags like `@purchase-orders` or `@shipping`

This keeps filtering practical and predictable.

## Step 3: Add Matching Tags To Authentication Setup

If the tagged tests need authenticated execution, the same tag must be added to:

- `tests/layers/ui/authentication/Auth.admin-user.setup.ts`
- `tests/layers/ui/authentication/Auth.general-user.setup.ts`

This matters because tagged runs still need the setup projects to match the selected tag group.

## Step 4: Add Matching Tags To Cleanup When Data Risk Exists

If the tagged feature creates or mutates data that can affect later runs, add matching cleanup coverage under:

- `tests/layers/ui/cleanup`

The cleanup path should carry the relevant tag so the same feature group can be cleaned consistently.

## Step 5: Add The CI Tag Option

Add the tag to:

- `.gitlab/test-tags.yml`

Important rule:

- in tests, use `@tag-name`
- in `.gitlab/test-tags.yml`, use `tag-name` without `@`

Example:

- test: `@sanity`
- GitLab CI option: `sanity`

## Final Checklist

When adding a new tag, confirm all related places were updated:

- test spec
- authentication setup specs
- cleanup specs when needed
- `.gitlab/test-tags.yml`
