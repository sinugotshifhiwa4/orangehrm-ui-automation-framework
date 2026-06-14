# Scheduled Execution

**[← Back to Main Documentation](../../../README.md)**

This page explains how scheduled pipeline execution is configured for the framework.

Scheduled runs are the primary mechanism for exercising each environment without manual
intervention. Unlike GitLab, GitHub Actions schedules are defined **in the workflow file
itself** (`.github/workflows/playwright-ci.yml`), not in a separate UI.

## Table of Contents

- [Why Scheduled Execution Exists](#why-scheduled-execution-exists)
- [Schedule Configuration](#schedule-configuration)
- [Cron Expressions And Timezone](#cron-expressions-and-timezone)
- [How A Cron Maps To Env, Branch, And Test Type](#how-a-cron-maps-to-env-branch-and-test-type)
- [How Scheduled Runs Skip Branch Validation](#how-scheduled-runs-skip-branch-validation)
- [Scheduled Variables](#scheduled-variables)
- [Practical Outcome](#practical-outcome)

## Why Scheduled Execution Exists

Push and pull-request pipelines run validation only. Full test execution is intentionally
separated and triggered either manually (`workflow_dispatch`) or automatically by a cron
`schedule`.

This keeps CI lightweight on every code change and ensures full test runs against the
environments happen at predictable, controlled times.

## Schedule Configuration

The workflow defines three cron schedules, one per environment:

| Environment | Execution  | Schedule (SAST) | Cron (UTC)  | Branch                |
| ----------- | ---------- | --------------- | ----------- | --------------------- |
| QA          | Sanity     | Daily 06:00     | `0 4 * * *` | `environment/QA`      |
| UAT         | Sanity     | Daily 07:00     | `0 5 * * *` | `environment/UAT`     |
| PreProd     | Regression | Monday 04:00    | `0 2 * * 1` | `environment/PreProd` |

QA and UAT run a sanity suite every day. PreProd runs a full regression suite once a week
on Monday morning before the working day begins.

## Cron Expressions And Timezone

GitHub Actions cron uses standard five-field syntax and is **always evaluated in UTC** —
there is no per-schedule timezone setting:

```text
minute hour day-of-month month day-of-week
```

SAST is UTC+2, so each UTC cron is two hours behind the intended local time:

- `0 4 * * *` — 04:00 UTC = **06:00 SAST**, every day
- `0 5 * * *` — 05:00 UTC = **07:00 SAST**, every day
- `0 2 * * 1` — 02:00 UTC Monday = **04:00 SAST** Monday

## How A Cron Maps To Env, Branch, And Test Type

There is no separate per-schedule variable block. The workflow's top-level `env:`
expressions inspect `github.event.schedule` (the cron string that fired) and derive the run
parameters:

- **`ENV`** — `0 5 * * *` → `uat`, `0 2 * * 1` → `preprod`, otherwise `qa`
- **`CHECKOUT_REF`** — `0 5 * * *` → `environment/UAT`, `0 2 * * 1` → `environment/PreProd`, otherwise `environment/QA`
- **`TEST_TYPE`** — `0 2 * * 1` → `regression`, any other schedule → `sanity`

So the cron string is the single source of truth: it selects the environment, the branch to
check out, and the test suite together.

## How Scheduled Runs Skip Branch Validation

The `validate-environment-branch` job normally enforces branch/ENV pairing. Scheduled runs
are exempt, because the cron-to-branch mapping above is already the source of truth:

```bash
if [ "${EVENT_NAME}" = "schedule" ]; then
  echo "Scheduled run; skipping branch/env pairing check."
  exit 0
fi
```

## Scheduled Variables

Scheduled runs do not provide `workflow_dispatch` inputs, so the remaining variables fall
back to their workflow defaults:

| Variable            | Source on a scheduled run    |
| ------------------- | ---------------------------- |
| `ENV`               | derived from the cron string |
| `TEST_TYPE`         | derived from the cron string |
| `TEST_LAYER`        | default `ui`                 |
| `SHARD_COUNT`       | default `4`                  |
| `SKIP_BROWSER_INIT` | default `false`              |

## Practical Outcome

Defining schedules in the workflow gives the framework:

- code pushes and pull requests that stay fast and lightweight
- environment tests that run at predictable times each day
- a PreProd regression suite that runs before the working week begins
- schedule configuration that lives in version control alongside the pipeline
