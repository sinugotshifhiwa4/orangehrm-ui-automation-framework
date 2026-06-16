# Test Results Dashboard

**[← Back to Main Documentation](../../../README.md)**

This page explains the analytics dashboard that visualises this framework's CI
test results.

The dashboard is a **separate frontend project** called `orangehrm-test-pulse`.
It does not live in this repository — it reads the rolling test-history data that
the CI pipeline publishes to the R2 bucket and renders it as charts, trends, and
failure breakdowns.

- Live dashboard: <https://orangehrm-test-pulse.sinugotshifhiwa4.workers.dev/>

## Table of Contents

- [What It Is](#what-it-is)
- [Data Source](#data-source)
- [How It Connects To This Framework](#how-it-connects-to-this-framework)
- [Practical Outcome](#practical-outcome)

## What It Is

`orangehrm-test-pulse` is a static analytics dashboard for OrangeHRM Playwright
test results. It surfaces:

- executive overview and last-run summary
- pass/fail trends over time
- visual explorer, breakdowns, top-failing tests, and risk views
- a run history table with comparison and CSV export
- a PDF report builder with per-section PNG export

It is built without a UI framework — just typed ES modules, HTML partials, and
modular CSS, compiled by Vite.

## Data Source

The dashboard fetches a single `test-history.json` file from the public R2
bucket configured in its `app/config.ts` (`DATA_URL`). That file is the same
rolling history this framework's CI pipeline maintains — see
[Pipeline Stages and Reporting](../06-ci/05-pipeline-stages-and-reporting.md).

If the fetch fails (for example, a CORS error), the dashboard falls back to a
generated mock dataset and shows a demo-mode banner, so it stays usable without
live data.

## How It Connects To This Framework

The dashboard is the read end of the history pipeline. The flow works like this:

1. CI runs the Playwright suite and merges results into `playwright-report/results.json`.
2. `scripts/ci/update-test-history/index.ts` parses that report into a `TestRun`
   record — counts, pass rate, duration, branch, commit, browser project, report
   URLs, and failed/flaky tests (each captured with its Playwright error message).
3. The CI `r2` job writes the updated `test-history.json` back to the R2 bucket.
4. `orangehrm-test-pulse` fetches that file from R2 and renders the dashboard.

This means the dashboard never talks to the framework directly. It only depends
on the shape of `test-history.json`, so any change to the history record (such as
adding a field to a failed test) is what the dashboard consumes.

## Practical Outcome

This dashboard turns the raw `test-history.json` the CI pipeline already produces
into a readable view of test health — trends, failures, and per-run detail —
without adding any runtime dependency to this framework.
