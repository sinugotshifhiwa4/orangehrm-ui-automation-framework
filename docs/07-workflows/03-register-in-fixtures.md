# Register In Fixtures

**[← Back to Main Documentation](../../../README.md)**

This page explains how to register a new class in `fixtures/test.fixture.ts`.

In this framework, reusable classes are often exposed through fixtures so they can be injected into tests and other fixture-created classes.

## Table of Contents

- [When Registration Is Needed](#when-registration-is-needed)
- [Step 1: Import The Class](#step-1-import-the-class)
- [Step 2: Add The Fixture Type](#step-2-add-the-fixture-type)
- [Step 3: Register The Fixture Factory](#step-3-register-the-fixture-factory)
- [Step 4: Use Existing Fixtures As Dependencies](#step-4-use-existing-fixtures-as-dependencies)
- [Step 5: Keep Grouping Clean](#step-5-keep-grouping-clean)
- [When Not To Register In Fixtures](#when-not-to-register-in-fixtures)
- [Final Checklist](#final-checklist)

## When Registration Is Needed

Register the class in fixtures when it should be reusable through dependency injection.

Common examples:

- page objects
- shared UI helpers
- network helpers
- cleanup managers
- context-aware feature helpers

If a class is only a small private implementation detail, fixture registration is usually not needed.

## Step 1: Import The Class

Add the import in `fixtures/test.fixture.ts` in the correct grouped section.

Examples of existing groups include:

- configuration
- context
- shared
- pages
- cleanup

Keep the new import in the section that matches the class responsibility.

## Step 2: Add The Fixture Type

Add the new class type to the `TestFixtures` type in `fixtures/test.fixture.ts`.

This is what makes the fixture available with correct typing in tests and other fixtures.

Example pattern:

```ts
newHelper: NewHelper;
```

## Step 3: Register The Fixture Factory

Add the fixture implementation in the fixture object.

Simple pattern:

```ts
newHelper: async ({ page }, use) => {
  await use(new NewHelper(page));
},
```

Dependency pattern:

```ts
newFeaturePage: async (
  { page, tableManager, loadingIndicators, toggleManager },
  use,
) => {
  await use(
    new NewFeaturePage(page, tableManager, loadingIndicators, toggleManager),
  );
},
```

## Step 4: Use Existing Fixtures As Dependencies

If the new class depends on other reusable classes, request them from the fixture parameter list instead of manually rebuilding them.

This keeps the dependency graph centralized in one place.

Examples:

- a page object can depend on shared helpers such as `TableManager` and `LoadingIndicators`
- many module pages depend on shared helpers such as `DialogButtons`, `ToggleManager`, and `NetworkResponseCoordinator`

## Step 5: Keep Grouping Clean

Register the new fixture in the correct section of `test.fixture.ts`.

Good grouping matters because this file is already a central framework map.

Examples:

- shared helper -> shared section
- page object -> pages section
- cleanup helper -> cleanup section

## When Not To Register In Fixtures

Do not register the class if:

- it is only used privately inside one class
- it is just a small utility function
- it is an internal helper that should stay hidden

Not every class needs to become a first-class fixture.

## Final Checklist

Before moving on:

- the class import was added
- the `TestFixtures` type was updated
- the fixture factory was added
- dependencies come from existing fixtures where appropriate
- the new fixture is grouped correctly
