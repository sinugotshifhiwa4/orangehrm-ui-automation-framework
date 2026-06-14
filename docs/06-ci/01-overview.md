# CI Overview

**[← Back to Main Documentation](../../../README.md)**

This section explains how CI is set up for the framework.

The CI flow is driven by GitHub Actions and a small set of supporting files:

- `.github/workflows/playwright-ci.yml` — the single pipeline definition
- `.github/config/test-tags.json` — the allow-list of valid Playwright tags
- `scripts/execution/test-executor.ts` — builds the final Playwright command
- `scripts/ci/` — R2 history + report upload helpers
- `src/configuration/resolution/detector/environmentDetector.ts` — runtime CI/env detection
- `src/configuration/runtime/workers/workerAllocator.ts` — per-shard worker allocation

These files work together rather than acting as separate pieces.

## Table of Contents

- [What CI Is Responsible For](#what-ci-is-responsible-for)
- [Pipeline Jobs](#pipeline-jobs)
- [Pipeline Trigger Strategy](#pipeline-trigger-strategy)
- [High-Level CI Flow](#high-level-ci-flow)
- [Document Order](#document-order)

## What CI Is Responsible For

The CI pipeline is responsible for:

- validating framework quality before execution (format, lint, types)
- enforcing branch ↔ environment pairing
- resolving the environment and test tag
- preparing Playwright browser dependencies
- running the test workload in parallel shards
- merging Playwright blob reports into HTML / JUnit / JSON
- publishing the merged report to GitHub Pages
- uploading per-run reports and a rolling test-results history to Cloudflare R2

## Pipeline Jobs

The workflow is a set of jobs (not GitLab-style named stages). They run in this dependency order:

1. `validate` — `npm run check` (prettier + tsc + eslint)
2. `validate-environment-branch` — branch ↔ ENV pairing guard
3. `resolve-tag` — maps `TEST_TYPE` to a Playwright `--grep` tag
4. `build-matrix` — turns `SHARD_COUNT` into a shard matrix
5. `test` — the sharded Playwright matrix jobs
6. `merge` — merges blob reports into the merged Playwright + Ortoni reports
7. `publish` — JUnit check, GitHub Pages publish, job summary
8. `r2` — updates the test-results history and uploads build reports to R2

This job structure is defined in `.github/workflows/playwright-ci.yml`.

## Pipeline Trigger Strategy

Not all pipeline triggers run tests. The framework separates validation from test
execution deliberately to keep CI lightweight and environment testing controlled.

| Trigger             | Branch / ref                         | Outcome         |
| ------------------- | ------------------------------------ | --------------- |
| `push`              | `develop` or any `environment/*`     | Validation only |
| `pull_request`      | → `develop`                          | Validation only |
| `workflow_dispatch` | any (manual)                         | Full test run   |
| `schedule`          | paired environment branch (per cron) | Full test run   |

`push` and `pull_request` runs execute the `validate` and `validate-environment-branch`
jobs and stop there: `resolve-tag`, `build-matrix`, `test`, `merge`, `publish`, and `r2`
are all gated on `github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'`.

This prevents unnecessary test runs on every code push and keeps environment testing
under deliberate control.

## High-Level CI Flow

At a high level, the flow is:

1. GitHub Actions starts the workflow on a push, pull request, schedule, or manual dispatch.
2. `validate` runs the quality gate; `validate-environment-branch` enforces branch/ENV pairing.
3. The job-level `if` conditions decide whether the run is validation-only or a full test run.
4. Workflow `env:` expressions resolve `ENV`, `TEST_TYPE`, `TEST_LAYER`, `SHARD_COUNT`, and `CHECKOUT_REF` from the trigger.
5. `resolve-tag` validates `TEST_TYPE` against `.github/config/test-tags.json` and emits `@<tag>`.
6. `build-matrix` expands `SHARD_COUNT` into a `{ shard: [1..N] }` matrix.
7. Each `test` matrix job runs `scripts/execution/test-executor.ts`, which builds the Playwright command for its shard.
8. `workerAllocator.ts` distributes workers within each shard based on `SHARD_INDEX` / `SHARD_TOTAL`.
9. Shards upload blob report artifacts; `merge` combines them; `publish` and `r2` distribute the results.

## Document Order

This CI section is split into ordered pages:

- 01-overview.md (this page)
- [02-manual-runs-and-variables.md](./02-manual-runs-and-variables.md)
- [03-environment-resolution.md](./03-environment-resolution.md)
- [04-execution-and-sharding.md](./04-execution-and-sharding.md)
- [05-pipeline-stages-and-reporting.md](./05-pipeline-stages-and-reporting.md)
- [06-scheduled-execution.md](./06-scheduled-execution.md)

Each page covers one part of the CI flow in order.
