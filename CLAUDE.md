# CLAUDE Agent Instructions and Memory

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A Playwright + TypeScript UI automation framework for OrangeHRM, built on a layered page-object model with stage-based environment resolution and CI-ready execution. The only active execution path is **UI** (`api`/`db` layers are scaffolded but not implemented).

## Project Rules

@docs/00-skills/always-apply.md

The binding behavioral rules are imported above and load with this file. They link the detailed rules in `docs/02-rules/`. If they are not present in context (e.g. subagents that don't receive CLAUDE.md), read `docs/00-skills/always-apply.md` before acting.

## Commands

Tests are not run with `npx playwright test` directly — they go through a wrapper (`scripts/execution/test-executor.ts`) that resolves the layer, browser project, sharding, tag grep, and browser-init flag, then invokes Playwright.

```bash
# Quality gates
npm run lint:check        # tsc --noEmit + eslint (the gate run before every commit)
npm run check             # prettier --check + lint:check (read-only)
npm run fix               # prettier --write + eslint --fix
npm run type-check        # tsc --noEmit only

# Run tests (TEST_LAYER is set by the script; prefix with cross-env to pick the stage)
cross-env ENV=qa npm run test:ui
npm run test:failed       # re-run only last-run failures (npx playwright test --last-failed)
npm run ui                # Playwright UI mode
npm run debug             # Playwright inspector

# Run a single spec / filter (extra args after -- are forwarded to playwright)
cross-env ENV=qa npm run test:ui -- tests/layers/ui/login/ValidLogin.spec.ts
cross-env ENV=qa TEST_TAGS=@sanity npm run test:ui      # filter by tag

# Authentication setup (logs in once, saves shared storage state — see Architecture)
cross-env ENV=qa TEST_TAGS=@authenticate npm run test:ui

# Reports
npm run report            # Playwright HTML report
npm run ortoni-report     # Ortoni report
```

Runtime env vars (passed via `cross-env`): `ENV` (`qa`|`uat`|`preprod`, default `qa`), `HEADED`, `TEST_TAGS`, `WORKER_PERCENTAGE` (`10`–`100`, default `10`), `SKIP_BROWSER_INIT`.

Full command reference (all flags, execution templates): `docs/01-setup/execution-commands.md`.

## Architecture

### Execution flow

`npm run test:*` → `scripts/execution/test-executor.ts` sets `TEST_LAYER`, maps the layer to its test dir (`tests/layers/<layer>`), resolves the browser project and `SKIP_BROWSER_INIT` (skipped for `api`/`db`), and builds the final `npx playwright test` command (with `--shard`, `--grep`, and forwarded extra args).

`playwright.config.ts` assembles its `projects` array dynamically from `src/configuration/playwright/projects/projects.config.ts`. When browser init is disabled (api/db), the auth-setup and browser projects are dropped entirely. `globalSetup` (`src/configuration/runtime/globalSetup.ts`) writes an empty auth-state file and — locally only, not in CI — loads the env files.

### Authentication (shared storage state)

The `setup-auth-state` project matches `*.setup.ts` and runs `Authentication.setup.ts`, which logs in once on Chromium and saves browser storage state to a shared file via `AuthenticationFileManager`. All browser projects declare it as a dependency, so specs start already authenticated. The `storageState` fixture in `fixtures/test.ui.fixtures.ts` injects that file unless a test is tagged `@skip-auth`, which starts it unauthenticated.

### Fixtures (two layers)

Import `test`/`expect` from these fixtures, **never** from `@playwright/test`:

- `fixtures/config.fixtures.ts` — base layer: `environmentResolver`, `testInfo`.
- `fixtures/test.ui.fixtures.ts` — extends the base with context, authentication, and all page-object fixtures, plus the `storageState` override.

New reusable classes are wired in by: add a fixture → register in `fixtures/test.ui.fixtures.ts` → request it in the test. Page objects compose shared helpers via constructor injection rather than constructing them inline. See `docs/07-workflows/`.

### Page objects (`src/layers/ui/`)

Page objects extend `BasePage` (which exposes `page`, `navigation`, `element`, `elementAssertions`, `browser`, `frame`, `file`). They are organized under `pages/` to **mirror the app's navigation** — module → sub-module → tab as nested folders. A `shared/` folder holds generic building blocks: `components/` (reusable widget objects: table, dialog, pagination, dropdown, etc.) and `network/` (request/response helpers). See `docs/03-layer-ui/04-pages/pages-structure.md`.

### Configuration (`src/configuration/`)

`environment` (stage constants + file managers), `resolution` (`EnvironmentResolver`, `EnvironmentDetector`), `runtime` (workers, globalSetup), `playwright` (projects, auth, flags), `logger` (Winston), `reports` (Ortoni), `timeouts`.

Environment stages have a single source of truth: `src/configuration/environment/constants/environment.const.ts` (`ENVIRONMENT_STAGES` / `EnvironmentStage`). To add/remove/rename a stage, edit only that array. Per-stage `.env` files live in `envs/` (gitignored); locally they are loaded by `globalSetup`, in CI the pipeline injects the variables.

### Utilities (`src/utils/`)

`errorHandling`, `fileManager`, `pathResolver`, `sanitization`, `shared`. Use `ErrorHandler.captureError(error, source, message)` for structured failure capture and the shared Winston logger for progress — never `console.log`.

## Documentation Map

`docs/` is the canonical reference, organized by area:

- `00-skills/` — always-apply rules (see Project Rules above)
- `01-setup/` — environment, fixtures, execution commands, timeouts
- `02-rules/` — binding conventions (commits, branching, code quality, logging, tests)
- `03-layer-ui/` — base page, context, authentication, page structure
- `04-utils/` — shared utilities
- `05-testing/` — test overview, structure, tags
- `06-ci/` — CI overview
- `07-workflows/` — add a class → register in fixtures → use in tests
