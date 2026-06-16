# Add A Class

**[← Back to Main Documentation](../../../README.md)**

This page explains how to add a new class to the framework.

## Table of Contents

- [When You Add A Class](#when-you-add-a-class)
- [Step 1: Choose The Correct Folder](#step-1-choose-the-correct-folder)
- [Step 2: Follow Naming Rules](#step-2-follow-naming-rules)
- [Step 3: Extend The Right Base](#step-3-extend-the-right-base)
- [Step 4: Inject Dependencies Through The Constructor](#step-4-inject-dependencies-through-the-constructor)
- [Step 5: Keep Responsibility Focused](#step-5-keep-responsibility-focused)
- [Step 6: Add Supporting Types Near The Class](#step-6-add-supporting-types-near-the-class)
- [Step 7: Follow Existing Logging And Error Patterns](#step-7-follow-existing-logging-and-error-patterns)
- [Final Checklist](#final-checklist)

## When You Add A Class

Add a new class when the framework needs a new reusable responsibility such as:

- a page object
- a shared UI component
- a validator
- a network helper
- a cleanup manager
- a utility helper

Do not add a new class just to wrap a few lines that are only used once.

## Step 1: Choose The Correct Folder

Place the class according to its responsibility.

Examples:

- UI feature page -> `src/layers/ui/pages/...`
- shared reusable UI control -> `src/layers/ui/shared/components/...`
- shared network helper -> `src/layers/ui/shared/network/...`
- cleanup flow -> `src/layers/ui/cleanup/...`
- generic utility -> `src/utils/...`
- test data helper -> `src/testData/...`

Choose the folder based on what the class does, not where it is first used.

## Step 2: Follow Naming Rules

Follow the framework naming rules from [code-quality.md](../02-rules/code-quality.md).

Important rules include:

- non-test filenames start with lowercase
- config files use `.config.ts`
- constants use `.const.ts`
- flags use `.flag.ts`
- folder names start lowercase

Examples:

- `featurePage.ts`
- `tableManager.ts`
- `featureInterceptor.ts`
- `featureCleanupManager.ts`

## Step 3: Extend The Right Base

If the class is part of the UI layer and needs Playwright page actions, it should usually extend `BasePage`.

That gives the class:

- `page`
- `navigation`
- `element`
- `elementAssertions`
- `browser`
- `frame`
- `file`

Examples that usually extend `BasePage`:

- page objects
- shared UI components
- shared network helpers
- cleanup managers

If the class is not Playwright-driven, do not force it to extend `BasePage`.

## Step 4: Inject Dependencies Through The Constructor

Do not create framework dependencies ad hoc inside the class if they already exist elsewhere as reusable objects.

Prefer constructor injection for dependencies such as:

- `TableManager`
- `LoadingIndicators`
- `ToggleManager`
- `DialogButtons`
- `NetworkResponseCoordinator`
- other page or shared helper classes

This keeps dependencies explicit and makes fixture registration predictable.

## Step 5: Keep Responsibility Focused

Each class should have one clear responsibility.

Examples:

- page object -> feature behavior
- shared component -> reusable control behavior
- interceptor -> network response coordination and extraction
- cleanup manager -> cleanup flow only

If the class starts handling multiple unrelated concerns, split it.

## Step 6: Add Supporting Types Near The Class

If the class needs feature-specific types:

- keep local types close to the feature area
- use `.type.ts` or `.types.ts` according to the documented rules

That keeps the class readable without pushing every small type into a distant shared folder.

## Step 7: Follow Existing Logging And Error Patterns

If the class performs meaningful actions or validations, it should follow the framework pattern:

- log useful progress through the shared logger where needed
- use `ErrorHandler` for structured failure capture

Do not use ad hoc `console.log`.

## Final Checklist

Before moving on:

- the class is in the correct folder
- the filename follows framework naming rules
- the class extends `BasePage` only when appropriate
- constructor dependencies are explicit
- responsibility is focused
- any needed supporting types are added nearby
