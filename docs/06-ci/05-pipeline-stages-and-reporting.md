# Pipeline Jobs And Reporting

**[← Back to Main Documentation](../../../README.md)**

This page explains the GitHub Actions jobs after variable resolution, and how results are
merged, published, and archived.

> There is **no Teams / Slack notification step**. Results are surfaced through three
> channels: a GitHub Checks run (JUnit), the merged report published to GitHub Pages, and
> per-run reports plus a rolling history archived to Cloudflare R2.

The main pieces involved are:

- `.github/workflows/playwright-ci.yml` — all jobs
- `scripts/ci/r2/r2.ts` + `scripts/ci/shared/r2.constants.ts` — R2 operations
- `scripts/ci/update-test-history/` — the rolling test-results history pipeline

## Table of Contents

- [`validate`](#validate)
- [`validate-environment-branch`](#validate-environment-branch)
- [`resolve-tag` and `build-matrix`](#resolve-tag-and-build-matrix)
- [`test`](#test)
- [`merge`](#merge)
- [`publish`](#publish)
- [`r2`](#r2)
  - [Test-results history](#test-results-history)
  - [Build report upload](#build-report-upload)
- [Job Gating Summary](#job-gating-summary)
- [Practical Outcome](#practical-outcome)

## `validate`

The quality gate. Runs on every trigger: checkout, Node 22 with npm cache, `npm ci`, then
`npm run check` (prettier `--check` + `tsc --noEmit` + eslint). This fails CI early, before
any expensive Playwright execution.

## `validate-environment-branch`

The branch ↔ ENV pairing guard (see
[03-environment-resolution.md](./03-environment-resolution.md)). Also runs
on every trigger, but skips the check for `schedule` and `pull_request` events.

Pushes and pull requests run only these two validation jobs and stop — the remaining jobs
are gated to schedule/manual runs.

## `resolve-tag` and `build-matrix`

Both depend on `[validate, validate-environment-branch]` and run only for `schedule` or
`workflow_dispatch`:

- **`resolve-tag`** validates `TEST_TYPE` against `.github/config/test-tags.json` and
  outputs the Playwright grep tag (`@<type>`).
- **`build-matrix`** expands `SHARD_COUNT` into a `{ shard: [1..N] }` matrix.

## `test`

Depends on `[resolve-tag, build-matrix]` and runs the sharded Playwright matrix
(`timeout-minutes: 45`, `fail-fast: false`). Each matrix job:

- checks out `CHECKOUT_REF` and sets up Node 22
- restores the Playwright browser cache (keyed on `package-lock.json`); installs Chromium with deps on a cache miss, or just the system deps on a cache hit
- runs `scripts/execution/test-executor.ts` for its shard
- captures the executor exit code, collects the shard's blob report into `all-blob-reports/`, then re-exits with that code
- uploads the blob report as an artifact (`always()`), even on failure

See [04-execution-and-sharding.md](./04-execution-and-sharding.md) for the command detail.

## `merge`

Depends on `test` and runs with `if: always() && (schedule || workflow_dispatch)`, so the
report is still produced even when some shards failed.

It downloads every `blob-report-shard-*` artifact (`merge-multiple: true`), verifies at
least one blob exists (failing otherwise), and merges them:

```bash
PLAYWRIGHT_HTML_REPORT=playwright-report \
PLAYWRIGHT_JUNIT_OUTPUT_NAME=playwright-report/results.xml \
PLAYWRIGHT_JSON_OUTPUT_NAME=playwright-report/results.json \
npx playwright merge-reports --config playwright.config.ts ./all-blob-reports
```

The merge reuses `playwright.config.ts` directly — there is no separate merge-only config
file. The job uploads two artifacts (14-day retention):

- `playwright-report-<env>-<type>` — merged HTML + `results.xml` + `results.json`
- `ortoni-report-<env>-<type>` — the Ortoni report (produced via `REPORTER_MERGE: "true"`)

## `publish`

Depends on `merge` and runs for `schedule`/`workflow_dispatch` (no `always()`: a failed
merge means there is nothing to publish). It:

1. downloads the merged Playwright and Ortoni report artifacts
2. publishes the JUnit results as a GitHub Checks run via `dorny/test-reporter@v1.9.1` (`fail-on-error: false`)
3. publishes the report to **GitHub Pages**: it adds a `gh-pages` worktree, copies the report into `reports/<run_number>/` (Ortoni under `…/ortoni/`), writes a root `index.html` that redirects to the latest run, commits, and pushes to the `gh-pages` branch
4. writes a job summary with direct links to the Playwright and Ortoni reports

## `r2`

Depends on `merge` and runs for `schedule`/`workflow_dispatch`. It is serialised with a
non-cancelling concurrency group (`test-history-${{ github.workflow }}`) so overlapping
runs cannot corrupt the shared history through a racing read-modify-write.

All R2 operations go through `scripts/ci/r2/r2.ts`, which pulls the endpoint, bucket, and
key layout from `scripts/ci/shared/r2.constants.ts` (nothing is hardcoded in the YAML). The
AWS CLI authenticates with `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` secrets.

### Test-results history

The job maintains a rolling `test-history.json` in the R2 bucket:

1. `r2.ts download-history` — pull the current history (a missing file is fine; a fresh one is created)
2. `scripts/ci/update-test-history/index.ts` — parse `playwright-report/results.json`, build a `TestRun` record (counts, pass rate, duration, branch, commit, report URLs, failed/flaky tests), and update the history. The store keeps a capped index (200 runs), a per branch→testType bucket (50 runs), and full failure detail only for the most recent 20 runs.
3. `r2.ts upload-history` — write the updated history back

### Build report upload

`r2.ts upload-reports` copies the merged `playwright-report/` and `ortoni-report/`
directories to a per-run prefix in R2
(`build-reports/build-<run>-<env>-<type>/{playwright,ortoni}/`). A final
`r2.ts report-urls` step writes the public `r2.dev` report links into the job summary.

## Job Gating Summary

| Job                           | Runs when                                            |
| ----------------------------- | ---------------------------------------------------- |
| `validate`                    | every trigger                                        |
| `validate-environment-branch` | every trigger (check skipped for schedule / PR)      |
| `resolve-tag`, `build-matrix` | schedule or workflow_dispatch                        |
| `test`                        | after resolve-tag + build-matrix                     |
| `merge`                       | `always()` + (schedule or workflow_dispatch)         |
| `publish`, `r2`               | schedule or workflow_dispatch, after `merge` success |

## Practical Outcome

This pipeline design gives the framework:

- early, cheap validation on every push and PR
- controlled, branch-paired environment selection
- scalable matrix-based Playwright sharding
- merged reporting that survives partial shard failures
- a GitHub Pages report, a JUnit Checks run, and a durable R2 history + report archive
