# Environment And Credential Resolution

**[← Back to Main Documentation](../../../README.md)**

This page explains how CI resolves the environment and verifies credentials before
tests run.

> Authentication uses a single shared credential pair
> (`CI_PORTAL_USERNAME` / `CI_PORTAL_PASSWORD`). There is no per-user selection anywhere in
> the pipeline.

The main pieces involved are:

- `.github/workflows/playwright-ci.yml` — `ENV` resolution + branch pairing guard
- `src/configuration/resolution/detector/environmentDetector.ts` — runtime detection
- `scripts/execution/test-executor.ts` — execution bridge

## Table of Contents

- [How CI Is Detected](#how-ci-is-detected)
- [How The Environment Is Resolved In The Workflow](#how-the-environment-is-resolved-in-the-workflow)
- [How The Framework Reads The Environment](#how-the-framework-reads-the-environment)
- [Branch And Environment Validation](#branch-and-environment-validation)
- [Base URL And Credentials](#base-url-and-credentials)
- [Why This Matters](#why-this-matters)

## How CI Is Detected

`environmentDetector.ts` is the central runtime detector. `EnvironmentDetector.isCI()`
checks common CI markers, including:

- `CI`
- `GITHUB_ACTIONS`
- `GITLAB_CI`, `TRAVIS`, `CIRCLECI`, `JENKINS_URL`, `BITBUCKET_BUILD_NUMBER`

In GitHub Actions this resolves to `true` (the `test` job sets `CI: "true"` and the runner
sets `GITHUB_ACTIONS`). CI mode changes framework behaviour — for example, local `.env`
loading in `globalSetup` is skipped because the pipeline injects variables directly.

## How The Environment Is Resolved In The Workflow

The workflow computes `ENV` once, at the workflow level, from the trigger. The expression
falls through in this priority:

1. manual input (`github.event.inputs.env`)
2. scheduled cron → its paired environment (`0 5 * * *` → `uat`, `0 2 * * 1` → `preprod`)
3. push branch → its paired environment (`environment/UAT` → `uat`, `environment/PreProd` → `preprod`)
4. fallback to `qa`

The resolved value is exported as the `ENV` / `ENV_SLUG` workflow variables and passed into
every test shard.

## How The Framework Reads The Environment

`EnvironmentDetector.getCurrentEnvironmentStage()` resolves the stage at runtime in this
order:

1. `ENV`
2. `NODE_ENV`
3. fallback to `qa`

The value is validated against the stage list (`StagesFilePathResolver.isValidStage`); an
invalid value falls back to `qa`. In CI the `ENV` it reads is the one the workflow already
resolved, so the two layers agree.

## Branch And Environment Validation

The `validate-environment-branch` job enforces that each branch only runs with its paired
environment:

| Branch                | Allowed ENV |
| --------------------- | ----------- |
| `develop`             | `qa`        |
| `environment/QA`      | `qa`        |
| `environment/UAT`     | `uat`       |
| `environment/PreProd` | `preprod`   |

`feature/*` branches are explicitly rejected, and any other branch/ENV combination fails.

Two event types skip the check:

- **`schedule`** — the cron's paired branch/ENV is trusted as the source of truth.
- **`pull_request`** — PRs are validation-only and never run tests.

## Base URL And Credentials

The portal base URL is **not** derived from `ENV`. The `test` job sets it explicitly:

```yaml
CI_PORTAL_BASE_URL: "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
```

Credentials come from repository secrets, injected into the `test` job environment:

- `CI_PORTAL_USERNAME` ← `secrets.CI_PORTAL_USERNAME`
- `CI_PORTAL_PASSWORD` ← `secrets.CI_PORTAL_PASSWORD`

There is no separate credential-verification job; the shared auth-setup project consumes
these values when it logs in once and saves storage state.

## Why This Matters

This resolution step keeps CI deterministic because:

- the environment is resolved once, in one place, from the trigger
- branch/ENV pairing is enforced before any test job starts
- the base URL and credentials are explicit and shared across all runs
