---
alwaysApply: true
---

# Pages Structure

**[← Back to Main Documentation](../../../README.md)**

This page explains how page objects are organised under `src/layers/ui/pages/`.

The folder layout is not arbitrary — it mirrors the application's own navigation. When the structure on disk matches the menus, sub-modules, and tabs a user clicks through, finding the right page object is as simple as retracing the path you took in the browser.

## Table of Contents

- [Why Structure Matters](#why-structure-matters)
- [The Organising Principle: Mirror the Navigation](#the-organising-principle-mirror-the-navigation)
- [Folder Layout](#folder-layout)
- [Grouping Pages by Module → Sub-Module → Tab](#grouping-pages-by-module--sub-module--tab)
- [The `shared/` Folder](#the-shared-folder)
  - [`components/`](#components)
  - [`network/`](#network)
- [When to Add a Folder](#when-to-add-a-folder)
- [Naming Conventions](#naming-conventions)
- [Practical Outcome](#practical-outcome)

## Why Structure Matters

As the suite grows, the number of page objects grows with it. Without a convention, files land wherever the author happened to put them, and locating "the page for a particular tab under a particular module" becomes a search problem.

A structure that follows the application's navigation removes that guesswork:

- the path to a page object matches the path a user clicks through in the app
- related pages sit together, so changes to one module stay in one folder
- generic, cross-module behaviour is separated from page-specific behaviour
- new contributors can predict where a file lives before opening the tree

## The Organising Principle: Mirror the Navigation

Group page objects the same way the applAication groups its screens:

> **module (menu) → sub-module → tab**

Each level of the app's navigation becomes a folder level on disk. A top-level menu is a folder; a sub-module within that menu is a nested folder; a tab within that sub-module is a further nested folder (or a single file when the tab is simple enough not to need one).

This is about **where files live**, not about what any individual page object does. The job of each class — its locators, public actions, and private helpers — is documented in the page object itself, not here.

## Folder Layout

A representative layout for the UI pages folder:

```
src/layers/ui/pages/
├── authentication/          # cross-cutting: login orchestration / executor
├── login/                   # the login module
├── navigationBars/          # sidebar, topbar — shell navigation
├── module1/                 # a module → its sub-modules / tabs nested inside
├── module2/                 # a module
├── module3/                 # a module
└── shared/                  # generic, reusable building blocks
    ├── components/          # reusable UI component objects
    │   ├── calendar/
    │   ├── dialog/
    │   ├── dropdown/
    │   ├── filters/
    │   ├── loading/
    │   ├── pagination/
    │   ├── sort/
    │   ├── table/
    │   ├── toast/
    │   ├── toggle/
    │   └── validators/
    └── network/             # request/response helpers, API-on-the-side calls
```

Top-level folders such as `module1/`, `module2/`, and `module3/` correspond to the application's main menus — replace these placeholder names with the actual menu names. Inside each, sub-modules and tabs are nested to match the navigation underneath that menu.

## Grouping Pages by Module → Sub-Module → Tab

Within a module folder, keep nesting until the layout matches what the user sees:

```
module1/
├── module1Page.ts               # the module landing page (if it has one)
├── subModule1/                  # a sub-module under module1
│   ├── subModule1Page.ts
│   └── tabs/                     # tabs within the sub-module
│       ├── tab1.ts
│       └── tab2.ts
└── subModule2/                  # another sub-module
    └── subModule2Page.ts
```

Guidelines:

- a **module** with its own sub-screens gets a folder
- a **sub-module** gets a nested folder under its module
- **tabs** get their own files (and a `tabs/` folder once there is more than one)
- a leaf screen with no children is just a single file — do not create a folder for a folder's sake

The goal is that the on-disk path reads like a breadcrumb: `module1/subModule1/tabs/tab1.ts`.

## The `shared/` Folder

`shared/` holds anything generic enough to be used across more than one module. It exists so that reusable behaviour is not duplicated inside individual page folders. Add it only when there is something to share — do not create an empty `shared/` ahead of need.

It is split by the _kind_ of reusable thing, not by feature.

### `components/`

Reusable UI **component objects** — the widgets that appear on many pages regardless of module. Each component owns the locators and actions for one widget so any page can compose it instead of re-declaring the same selectors:

- `table/` — row/column access, cell reads, row actions
- `pagination/` — next/previous, page size, go-to-page
- `dialog/` — open/confirm/cancel, read dialog content
- `dropdown/` — open, select option, read selected value
- `filters/`, `sort/`, `calendar/`, `toggle/`, `toast/`, `loading/`, `validators/` — the same pattern for each widget

Page objects in the module folders use these components; the components themselves never reach back into a specific module.

### `network/`

Helpers for request/response work that supports UI flows — waiting on a specific API call, asserting a response, or seeding/reading data over the network rather than through the screen. Kept separate from `components/` because it is about traffic, not widgets.

## When to Add a Folder

- **A new app menu appears** → add a top-level module folder.
- **A module gains sub-screens** → nest sub-module folders inside it.
- **A screen grows tabs** → add a `tabs/` folder and one file per tab.
- **The same widget logic is copied into a second page** → promote it to `shared/components/`.
- **Repeated request/response handling shows up** → move it into `shared/network/`.

If you are unsure whether something is shared, leave it in the module folder. Promote it to `shared/` only once a second consumer actually needs it.

## Naming Conventions

- folders: `camelCase` matching the app's menu/sub-module/tab label (use the real menu name, e.g. a "Stock Checking" menu becomes `stockChecking/`)
- page object files: `<screen>Page.ts` (`loginPage.ts`, `dashboardPage.ts`)
- component files: `<widget>.ts` inside their component folder (`table.ts`, `pagination.ts`)
- keep the file name aligned with the class it exports

## Practical Outcome

Organising the pages folder around the application's navigation gives the framework:

- a predictable path to every page object that mirrors the UI
- module-scoped changes that stay contained within one folder
- a clear home for generic widgets (`shared/components/`) and traffic helpers (`shared/network/`)
- a layout new contributors can navigate without a map
