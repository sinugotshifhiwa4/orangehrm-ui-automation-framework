---
alwaysApply: true
---

# Test Data Structure

**[← Back to Main Documentation](../../README.md)**

This page explains how test data is organised under `src/layers/ui/test-data/` and beyond.

The folder layout mirrors the application's navigation and feature boundaries. When test data organisation matches the application's modules, sub-modules, and concerns a user interacts with, finding and maintaining test data builders is as simple as following the same path in the codebase.

## Table of Contents

- [Why Structure Matters](#why-structure-matters)
- [The Organising Principle: Mirror the Application](#the-organising-principle-mirror-the-application)
- [Folder Layout](#folder-layout)
- [Grouping Test Data by Module → Sub-Module](#grouping-test-data-by-module--sub-module)
- [The `shared/` Folder](#the-shared-folder)
  - [`builders/`](#builders)
  - [`fixtures/`](#fixtures)
- [When to Add a Folder](#when-to-add-a-folder)
- [Naming Conventions](#naming-conventions)
- [Practical Outcome](#practical-outcome)

## Why Structure Matters

As the test suite grows, so does the amount of test data: user objects, payloads, seed data, and factory builders. Without a convention, data lives scattered across the codebase, and understanding "what test data exists for this feature" becomes a search problem.

A structure that follows the application's boundaries removes that guesswork:

- test data for a module lives in one place, organised by the app's own structure
- related builders sit together, so changes to one feature stay contained
- generic, cross-module data is separated from feature-specific builders
- new contributors can predict where test data lives before searching

## The Organising Principle: Mirror the Application

Group test data the same way the application groups its features:

> **module (menu) → sub-module**

Each logical boundary of the app becomes a folder level on disk. A top-level menu or feature is a folder; a sub-feature or concern within that feature is a nested folder.

This is about **where test data lives and how it is organised**, not about what any individual builder does. The job of each class — its properties, methods, and constraints — is documented in the class itself.

## Folder Layout

The structure under `src/layers/ui/test-data/`:

```text
src/layers/ui/test-data/
├── authentication/          # login, password reset, session data
│   └── builders/
│       ├── userBuilder.ts
│       └── credentialsBuilder.ts
├── orangeHrm/               # application-specific test data
│   ├── login/
│   │   └── builders/
│   │       └── invalidCredentialsBuilder.ts
│   ├── dashboard/
│   │   └── builders/
│   │       └── dashboardStateBuilder.ts
│   └── ...
└── shared/                  # cross-cutting, reusable test data
    ├── builders/
    │   ├── baseBuilder.ts
    │   └── dateBuilder.ts
    └── fixtures/
        └── defaultUsers.ts
```

- `authentication/` holds login and session-related test data
- `orangeHrm/` mirrors the application's modules: each top-level feature gets a folder, and sub-features nest inside
- `shared/` holds generic builders and fixtures used across multiple modules

## Grouping Test Data by Module → Sub-Module

Within a module folder, nest subfolders until the organisation matches the application's feature structure:

```text
module1/
├── builders/                # builders for module1 screens
│   ├── module1DataBuilder.ts
│   └── module1StateBuilder.ts
└── subModule1/              # a sub-feature within module1
    └── builders/
        ├── subModule1DataBuilder.ts
        └── subModule1FixtureBuilder.ts
```

Guidelines:

- a **module** with its own test data concerns gets a folder
- a **sub-module** or sub-feature gets a nested folder under its module
- **builders/** holds factory functions and builder classes for that module
- **fixtures/** holds static or pre-built test data specific to that module (if it warrants its own folder)
- avoid creating empty folders — add a folder only when there is content to place in it

The goal is that the on-disk path reads like a breadcrumb: `module1/subModule1/builders/subModule1DataBuilder.ts`.

## The `shared/` Folder

`shared/` holds anything generic enough to be used across more than one module. It exists so that reusable builders and fixtures are not duplicated inside individual module folders. Add it only when there is something to share — do not create `shared/` ahead of need.

It is split by the _kind_ of reusable thing, not by feature.

### `builders/`

Reusable **builder functions and classes** — factories and data generators that work across multiple modules. Each builder owns the logic for creating one kind of object, so any module can use it instead of re-declaring the same construction:

- `baseBuilder.ts` — base class or mixin for common builder patterns (random ID generation, timestamp defaults, etc.)
- `userBuilder.ts` — create user objects in various states (authenticated, unauthenticated, with roles)
- `dateBuilder.ts` — helper for consistent date and time generation
- `payloadBuilder.ts` — construct API payloads with sensible defaults

Module builders in the module folders use these shared builders; the shared builders never depend on a specific module.

### `fixtures/`

Static or pre-built **test data** used across modules — constants, lookup tables, common test values:

- `defaultUsers.ts` — a standard user for re-use across tests
- `commonRoles.ts` — role definitions and permissions
- `standardPayloads.ts` — reusable API request templates
- `statuses.ts` — system status codes and labels

## When to Add a Folder

- **A new app module appears** → add a top-level module folder under `orangeHrm/` (or `authentication/` if it is cross-cutting).
- **A module gains sub-features with distinct test data** → nest sub-module folders inside it.
- **The same builder logic is used in a second module** → promote it to `shared/builders/`.
- **Repeated fixture data shows up across modules** → move it into `shared/fixtures/`.

If you are unsure whether something is shared, leave it in the module folder. Promote it to `shared/` only once a second consumer actually needs it.

## Naming Conventions

- folders: `camelCase` matching the app's menu/module/sub-module label (use the real feature name, e.g. a "Staff Management" module becomes `staffManagement/`)
- builder files: `<entity>Builder.ts` or `<entity>DataBuilder.ts` (`userBuilder.ts`, `loginBuilder.ts`, `dashboardStateBuilder.ts`)
- fixture files: `<thing>s.ts` (plural, for collections) or `<thing>Fixtures.ts` (`defaultUsers.ts`, `commonRoles.ts`)
- keep the file name aligned with the primary export it contains

## Practical Outcome

Organising test data around the application's modules gives the framework:

- a predictable path to every builder and fixture that mirrors the app's feature structure
- module-scoped test data changes that stay contained within one folder
- a clear home for reusable builders (`shared/builders/`) and common fixtures (`shared/fixtures/`)
- a layout new contributors can navigate without a map
- easier maintenance and discovery as the test suite grows
