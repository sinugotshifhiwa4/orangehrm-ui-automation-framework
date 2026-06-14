# Manual Runs And Variables

**[← Back to Main Documentation](../../../README.md)**

This page explains how manual CI runs are configured in GitHub Actions.

Manual runs are controlled through:

- `.github/workflows/playwright-ci.yml` — the `workflow_dispatch` inputs
- `.github/config/test-tags.json` — the allow-list of valid tags

## Table of Contents

- [Manual Pipeline Trigger](#manual-pipeline-trigger)
- [Manual Inputs In GitHub](#manual-inputs-in-github)
- [Main Manual Options](#main-manual-options)
  - [`env`](#env)
  - [`test_type`](#test_type)
  - [`test_layer`](#test_layer)
  - [`shard_count`](#shard_count)
  - [`skip_browser_init`](#skip_browser_init)
- [Tag Allow-List](#tag-allow-list)
- [Manual Run Example](#manual-run-example)
- [Why Inputs Are Defined In CI](#why-inputs-are-defined-in-ci)

## Manual Pipeline Trigger

In `.github/workflows/playwright-ci.yml`, manual runs are enabled through the
`workflow_dispatch` trigger:

```yaml
on:
  workflow_dispatch:
    inputs:
      env: { ... }
      test_type: { ... }
      test_layer: { ... }
      shard_count: { ... }
      skip_browser_init: { ... }
```

That means a user can open the workflow under **Actions → Orange HRM UI Automation CI →
Run workflow**, pick the branch, and choose the inputs shown in the dispatch form.

A manual run executes the full pipeline (tests included), because the test jobs are gated
on `github.event_name == 'workflow_dispatch'` (or `schedule`).

## Manual Inputs In GitHub

The dispatch form is driven by the `inputs:` block. Each input is a `choice` with a fixed
list of options, so the GitHub UI renders dropdowns rather than free-text fields. The
resolved values are exposed to all jobs through the workflow-level `env:` block.

## Main Manual Options

### `env`

The target environment. Options:

- `qa` (default)
- `uat`
- `preprod`

This sets the `ENV` / `ENV_SLUG` workflow variables and selects which environment the
tests target.

### `test_type`

The Playwright tag to run. Dispatch options:

- `regression` (default)
- `sanity`
- `authenticate`
- `dashboard`
- `skip-auth`

In CI this becomes the `TEST_TYPE` variable, and the `resolve-tag` job converts it into a
Playwright grep tag by prefixing `@`. So:

- input `sanity` → runtime `@sanity`

> The dispatch dropdown is a curated subset. The authoritative list of valid tags is
> `.github/config/test-tags.json`; `resolve-tag` fails the run if `TEST_TYPE` is not in
> that file. Keep the two in sync.

### `test_layer`

The test layer to run. Options:

- `ui` (default)
- `api`
- `db`

Only the UI layer is implemented today; `api`/`db` are scaffolded. The value sets
`TEST_LAYER`, which `scripts/execution/test-executor.ts` maps to `tests/layers/<layer>`.

### `shard_count`

How many parallel Playwright shard jobs to run. Options:

- `1`, `2`, `3`, `4` (default), `6`, `8`, `10`

The `build-matrix` job expands this into a `{ shard: [1..N] }` matrix, and each matrix job
runs one shard.

### `skip_browser_init`

Whether to skip browser install and auth setup. Options:

- `false` (default)
- `true`

This is intended for non-browser `api`/`db` layers. It sets `SKIP_BROWSER_INIT`, which
`test-executor.ts` honours as an explicit override over the layer-based default.

## Tag Allow-List

`.github/config/test-tags.json` is a flat JSON array of accepted tag names:

```json
["authenticate", "sanity", "regression", "skip-auth", "login", "dashboard"]
```

`resolve-tag` checks `TEST_TYPE` against this array with `jq`. An unknown value fails the
job and prints the valid tags, so a typo never reaches Playwright as an empty or invalid
grep.

## Manual Run Example

A typical manual run might use:

- `env=qa`
- `test_type=sanity`
- `test_layer=ui`
- `shard_count=4`
- `skip_browser_init=false`

That tells the pipeline to:

- run the UI layer
- against QA
- filtered to `@sanity`
- across 4 shards
- with browser/auth setup enabled

## Why Inputs Are Defined In CI

Defining these options as `workflow_dispatch` choices gives the framework:

- controlled manual execution from the GitHub UI
- predictable, validated allowed values
- a single shared resolution path for manual and scheduled runs
- no need to edit the workflow file for common execution cases
