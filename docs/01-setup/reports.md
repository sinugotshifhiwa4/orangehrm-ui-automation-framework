# Reporting

**[← Back to Main Documentation](../../README.md)**

This page explains how test reports are configured and produced in the framework, and how to view them locally.

The framework produces two human-readable reports — the built-in Playwright HTML report and an Ortoni report — plus machine-readable output (JUnit and JSON) used by CI. Which reporters run depends on whether the run is local, a CI shard, or the CI merge phase.

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [Reporters and When Each Runs](#reporters-and-when-each-runs)
  - [Local Runs](#local-runs)
  - [CI Shard Runs](#ci-shard-runs)
  - [CI Merge Phase](#ci-merge-phase)
- [Capture Settings](#capture-settings)
- [Ortoni Report Configuration](#ortoni-report-configuration)
- [Viewing Reports Locally](#viewing-reports-locally)
  - [Playwright HTML Report](#playwright-html-report)
  - [Ortoni Report](#ortoni-report)
- [How Reporting Connects to CI](#how-reporting-connects-to-ci)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

Reporting is configured and served from:

```text
playwright.config.ts                              # reporter selection + capture settings
src/configuration/reports/ortoniReport.config.ts  # the Ortoni report options
scripts/reports/show-ortoni-report.ts             # local Ortoni report server
scripts/reports/stop-ortoni-report.ts             # stops a running Ortoni server
scripts/reports/ortoniReport.constants.ts         # shared host/port/dir constants
```

## Reporters and When Each Runs

`playwright.config.ts` chooses the reporter set at runtime. There is no single fixed reporter — the array changes for three cases, decided by two environment signals:

- `REPORTER_MERGE` — set to `true` by the CI merge job to regenerate reports from combined blob reports.
- `CI` — detected through `EnvironmentDetector.isCI()`.

### Local Runs

When not in CI, the reporters are:

```ts
[["html"], ["line"], ["ortoni-report", reportConfig]];
```

- `html` — the Playwright HTML report (default output folder `playwright-report/`)
- `line` — concise terminal progress output
- `ortoni-report` — the Ortoni report, using `reportConfig` (see below)

### CI Shard Runs

In CI, each shard produces only a blob report:

```ts
[["blob", { outputDir: `blob-report-${shardIndex}`, alwaysReport: true }]];
```

Blob reports are not meant to be read directly. Each shard writes its own `blob-report-<shardIndex>/` folder, and the CI `merge` job combines them. `alwaysReport: true` ensures a blob is written even when a shard runs no matching tests.

### CI Merge Phase

When `REPORTER_MERGE=true` (the CI merge job), the human-readable and machine-readable reports are generated from the combined blobs:

```ts
[["html"], ["junit"], ["json"], ["ortoni-report", reportConfig]];
```

This is the only run that produces JUnit (`results.xml`) and JSON (`results.json`) — they are consumed by the CI publish and history jobs. See [How Reporting Connects to CI](#how-reporting-connects-to-ci).

## Capture Settings

The `use` block in `playwright.config.ts` controls what artifacts each test captures:

- `trace: "retain-on-failure"` — a Playwright trace is kept only for tests that fail
- `video: { mode: "retain-on-failure", size: resolvedViewport }` — video is kept only for failures, recorded at the resolved viewport size
- `screenshot: "on"` — screenshots are captured for every test run, not just failures

Traces and videos are attached to the report entry for the failing test, so they are opened from the HTML or Ortoni report rather than browsed on disk.

## Ortoni Report Configuration

`src/configuration/reports/ortoniReport.config.ts` exports `reportConfig`, the options passed to the `ortoni-report` reporter. The Ortoni report is generated once per run — locally during the run, or in CI during the merge phase from the combined blobs — so it always uses a single, non-sharded output location.

Key options:

- `open` — `"never"` in CI, `"always"` locally (the report opens automatically after a local run)
- `folderPath: "ortoni-report"` / `filename: "index.html"` — output location and entry file
- `title: "Orange HRM Automation Report"` / `projectName: "OrangeHRM"`
- `testType` — the active `TEST_TAGS` value, falling back to `"Functional"`
- `authorName` — the current OS username
- `meta` — `Test Cycle` (the current month and year via `DateFormatter.formatMonthYear()`), `version`, and `platform`

## Viewing Reports Locally

All local report commands start a server bound to `127.0.0.1` (loopback only) and open the report in the browser.

### Playwright HTML Report

Open the most recent Playwright HTML report:

```powershell
npm run report
```

This runs `npx playwright show-report` on a random free port.

### Ortoni Report

Open the Ortoni report:

```powershell
npm run ortoni-report
```

`scripts/reports/show-ortoni-report.ts` resolves a free port before starting the server, because the `ortoni-report` CLI does not retry when its port is taken. It tries the candidate ports `2004`, `2006`, `2008`, `2009` in order and falls back to a random free port if all are in use, then serves `ortoni-report/index.html` from that port.

The report server is a foreground process meant to be ended with `Ctrl+C`. Closing the terminal can leave it holding a port, so a stop command is provided:

```powershell
npm run ortoni-report:stop
```

`scripts/reports/stop-ortoni-report.ts` finds and terminates any report server still listening on the candidate ports.

## How Reporting Connects to CI

In CI, reporting is split across jobs rather than produced in one step:

- each `test` shard uploads its blob report
- the `merge` job combines the blobs and regenerates the HTML, Ortoni, JUnit, and JSON reports (with `REPORTER_MERGE=true`)
- the `publish` job posts the JUnit results as a GitHub Checks run and publishes the HTML report to GitHub Pages
- the `r2` job archives the reports and a rolling test-results history to Cloudflare R2

The full pipeline behavior is documented in [Pipeline Jobs And Reporting](../06-ci/05-pipeline-stages-and-reporting.md).

## Practical Outcome

Centralizing reporting configuration gives the framework:

- a clear separation between local reports (HTML + Ortoni) and CI output (blob → merged HTML / JUnit / JSON / Ortoni)
- failure-only traces and videos that keep artifacts small without losing debugging detail
- a consistent Ortoni report identity (title, project, test cycle) across runs
- local report servers that resolve their own ports and can be cleanly stopped
