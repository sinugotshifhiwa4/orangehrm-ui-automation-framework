# Browser Initialisation

**[← Back to Main Documentation](../../README.md)**

This page explains how browser initialisation is controlled in the MOYO framework and how to skip it entirely for non-UI test runs such as API and database tests.

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [Files and Responsibilities](#files-and-responsibilities)
  - [browser.flags.ts](#browserflagsts)
  - [projects.config.ts](#projectsconfigts)
  - [playwright.config.ts](#playwrightconfigts)
- [How the Chain Works](#how-the-chain-works)
- [Skipping Browser Initialisation](#skipping-browser-initialisation)
  - [When to Use SKIP_BROWSER_INIT](#when-to-use-skip_browser_init)
  - [What Gets Skipped](#what-gets-skipped)
  - [What Stays Active](#what-stays-active)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

The browser initialisation flag and project configuration live under:

```text
src/configuration/playwright/flags/browser.flags.ts
src/configuration/playwright/projects/projects.config.ts
playwright.config.ts
```

## Files and Responsibilities

### browser.flags.ts

```text
src/configuration/playwright/flags/browser.flags.ts
```

This file exposes a single function that reads the `SKIP_BROWSER_INIT` environment variable:

```ts
export function shouldSkipBrowserInit(): boolean {
  return process.env.SKIP_BROWSER_INIT?.toLowerCase() === "true";
}
```

It is the single source of truth for whether browser initialisation should be skipped. No other file reads `SKIP_BROWSER_INIT` directly.

---

### projects.config.ts

```text
src/configuration/playwright/projects/projects.config.ts
```

This file calls `shouldSkipBrowserInit()` once at module load time and uses the result to conditionally build two exported arrays:

- `setupProjects` — contains the `setup-auth-state` project when browser init is enabled; empty when skipped
- `browserProjects` — contains the `chromium`, `firefox`, and `webkit` projects when browser init is enabled; empty when skipped

It also exports `resolvedViewport`, the shared `1366 × 768` viewport applied to all browser projects.

When `SKIP_BROWSER_INIT=true`, both `setupProjects` and `browserProjects` are empty arrays. Authentication setup and all browser projects are excluded from the run.

---

### playwright.config.ts

```text
playwright.config.ts
```

This file imports `setupProjects` and `browserProjects` from `projects.config.ts` and spreads them into the `projects` array:

```ts
projects: [
  ...setupProjects,
  { name: "api", testMatch: /tests\/layers\/api\/.*/ },
  { name: "db", testMatch: /tests\/layers\/db\/.*/ },
  ...browserProjects,
];
```

The `api` and `db` projects are always present and are not controlled by `SKIP_BROWSER_INIT`. Only the spread arrays change based on the flag.

## How the Chain Works

The full chain from environment variable to active projects:

1. `SKIP_BROWSER_INIT` is set in the environment before the run
2. `browser.flags.ts` reads it via `shouldSkipBrowserInit()`
3. `projects.config.ts` calls that function and conditionally sets `setupProjects` and `browserProjects` to empty arrays
4. `playwright.config.ts` spreads those arrays into `projects`
5. Playwright runs only the projects that remain in the final array

If `SKIP_BROWSER_INIT` is not set or is set to any value other than `"true"`, browser initialisation proceeds normally.

## Skipping Browser Initialisation

### When to Use SKIP_BROWSER_INIT

Set `SKIP_BROWSER_INIT=true` when running tests that do not require a browser at all:

- API layer tests (`tests/layers/api/`)
- Database layer tests (`tests/layers/db/`)
- Any run where launching a browser would waste resources or add unnecessary setup time

Do not set this flag when running UI tests. UI tests depend on browser projects and the auth setup project to function correctly.

### What Gets Skipped

When `SKIP_BROWSER_INIT=true`:

- `setup-auth-state` project is excluded — no authentication setup runs
- `chromium`, `firefox`, and `webkit` projects are excluded — no browsers are launched
- The auth state file is not written

### What Stays Active

Regardless of `SKIP_BROWSER_INIT`:

- `api` project remains active and matches `tests/layers/api/**`
- `db` project remains active and matches `tests/layers/db/**`
- Global setup still runs
- All timeouts, workers, tags, and reporter settings remain unchanged

## Practical Outcome

This flag lets the framework share a single `playwright.config.ts` across UI, API, and database test runs without maintaining separate config files per layer.

- UI runs use the full project set including auth setup and browser projects
- API and DB runs use only the layer-specific projects with no browser overhead
- The decision is made in one place (`browser.flags.ts`) and flows through the config automatically
