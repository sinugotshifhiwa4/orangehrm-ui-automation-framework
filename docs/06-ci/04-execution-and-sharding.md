# Execution And Sharding

**[← Back to Main Documentation](../../../README.md)**

This page explains how CI turns the resolved variables into actual Playwright execution.

The main pieces involved are:

- `.github/workflows/playwright-ci.yml` — the `build-matrix` and `test` jobs
- `scripts/execution/test-executor.ts` — builds the Playwright command
- `src/configuration/runtime/workers/workerAllocator.ts` — per-shard workers

## Table of Contents

- [The Shard Matrix](#the-shard-matrix)
- [CI Command Construction](#ci-command-construction)
- [What `test-executor.ts` Does](#what-test-executorts-does)
- [Tag Handling In CI](#tag-handling-in-ci)
- [`SKIP_BROWSER_INIT` In CI](#skip_browser_init-in-ci)
- [Per-Shard Artifacts](#per-shard-artifacts)
- [Worker Allocation In CI](#worker-allocation-in-ci)
- [Why This Matters](#why-this-matters)

## The Shard Matrix

Sharding is driven by a GitHub Actions matrix, not by separate fixed shard jobs.

The `build-matrix` job turns `SHARD_COUNT` into a JSON index list:

```bash
COUNT=${{ env.SHARD_COUNT }}
INDICES=$(python3 -c "import json; print(json.dumps(list(range(1, $COUNT + 1))))")
echo "matrix={\"shard\":$INDICES}" >> "$GITHUB_OUTPUT"
```

The `test` job then fans out over that matrix:

```yaml
strategy:
  fail-fast: false
  matrix: ${{ fromJson(needs.build-matrix.outputs.matrix) }}
```

So `SHARD_COUNT=4` produces four parallel `test` jobs, one per `matrix.shard` value
`1..4`. `fail-fast: false` ensures one failing shard does not cancel the others.

## CI Command Construction

Each shard job does not call Playwright with a fixed command. It passes runtime variables
into `scripts/execution/test-executor.ts`, which builds the final command:

```bash
npx cross-env \
  TEST_LAYER=${{ env.TEST_LAYER }} \
  SHARD_INDEX=${{ matrix.shard }} \
  SHARD_TOTAL=${{ env.SHARD_COUNT }} \
  TEST_TAGS="${{ needs.resolve-tag.outputs.test_tag }}" \
  ENV=${{ env.ENV }} \
  BROWSER=${{ env.BROWSER }} \
  SKIP_BROWSER_INIT=${{ env.SKIP_BROWSER_INIT }} \
  tsx scripts/execution/test-executor.ts
```

The shard step runs under `set +e` so the executor's exit code is captured (and re-raised
at the end of the step) rather than aborting the report-collection logic.

## What `test-executor.ts` Does

`scripts/execution/test-executor.ts` is the bridge between CI variables and Playwright. It
reads `TEST_LAYER`, `SHARD_INDEX`, `SHARD_TOTAL`, `TEST_TAGS`, `BROWSER`, and
`SKIP_BROWSER_INIT`, then maps the layer to its test directory:

- `ui` → `tests/layers/ui`
- `api` → `tests/layers/api`
- `db` → `tests/layers/db`

It also resolves the Playwright `--project`:

- browser layers (`ui`) → `BROWSER` (the manual `browser` input), defaulting to `chromium`
- non-browser layers (`api` / `db`, or when browser init is skipped) → a project named after the layer

> For UI runs the project comes from `BROWSER` — scheduled/push runs default to `chromium`,
> manual runs pick it from the `browser` dispatch input. The executor exports the resolved
> project as `TEST_PROJECT`, which the test-history pipeline records so dashboards can filter
> by browser.

It then assembles and runs:

```text
npx playwright test <path> --project=<project> --shard=<index>/<total> --grep="<tag>" <extraArgs>
```

## Tag Handling In CI

The `resolve-tag` job maps the clean `TEST_TYPE` (e.g. `sanity`) to a Playwright grep tag
(`@sanity`) after validating it against `.github/config/test-tags.json`. The `test` job
receives the already-prefixed tag through `needs.resolve-tag.outputs.test_tag` and passes
it as `TEST_TAGS`, which the executor turns into `--grep`.

## `SKIP_BROWSER_INIT` In CI

`test-executor.ts` resolves `SKIP_BROWSER_INIT` with this priority:

1. explicit environment override (`SKIP_BROWSER_INIT`)
2. layer-based default

So:

- if CI passes `SKIP_BROWSER_INIT`, that value wins
- otherwise `api` and `db` default to skipping browser init
- `ui` defaults to browser init enabled

## Per-Shard Artifacts

After Playwright finishes, the shard step collects the shard's blob report
(`blob-report-<shard>/*.zip`) into `all-blob-reports/`, renaming each file with a
`-shard-<index>` suffix, then uploads it as an artifact:

```yaml
name: blob-report-shard-${{ matrix.shard }}-${{ env.ENV }}-${{ env.TEST_TYPE }}
```

If a shard executed no tests, it logs that and uploads nothing (`if-no-files-found: warn`).
The merge job later combines whatever blob artifacts exist.

## Worker Allocation In CI

`workerAllocator.ts` chooses the worker count inside each shard. When `SHARD_INDEX` and
`SHARD_TOTAL` are both present, it switches into shard mode:

- validates the shard index and total
- divides the available CPU cores across shards (`floor(cores / total)`, distributing the remainder to the lowest-indexed shards)
- guarantees at least one worker per shard

This differs from local execution, which uses `WORKER_PERCENTAGE`. So in CI:

- shard count comes from the GitHub matrix
- worker count inside each shard comes from `WorkerAllocator`

## Why This Matters

This design keeps CI flexible and controlled because:

- GitHub decides the high-level execution shape (which shards exist)
- `test-executor.ts` decides the exact Playwright command per shard
- `workerAllocator.ts` decides how many workers each shard should use
