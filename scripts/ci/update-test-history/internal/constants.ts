/**
 * constants.ts
 * Shared constants for the update-test-history pipeline.
 */

import path from "path";

import { TEST_HISTORY_FILE } from "../../shared/r2.constants.js";

// ─── File paths ───────────────────────────────────────────────────────────────

// Same filename the R2 CLI downloads/uploads, so the read-modify-write round-trips.
export const HISTORY_FILE = path.resolve(`./${TEST_HISTORY_FILE}`);
export const RESULTS_JSON = path.resolve("./playwright-report/results.json");

// ─── History size limits ──────────────────────────────────────────────────────

/** Maximum number of lightweight summary rows kept in the index tier. */
export const MAX_INDEX_RUNS = 200;

/** Maximum number of full detail rows kept per branch → testType bucket. */
export const MAX_RUNS_PER_TYPE = 50;

/**
 * Number of most-recent runs (per bucket) that retain full failedTests detail.
 * Older runs have failedTests stripped to keep the file size predictable.
 */
export const DETAIL_WINDOW = 20;

/** Hard cap on the number of failed test entries stored per run. */
export const MAX_FAILED_TESTS_STORED = 50;

/** Hard cap on the number of flaky test entries stored per run. */
export const MAX_FLAKY_TESTS_STORED = 50;

/**
 * Maximum length of the captured failure message stored per failed/flaky test.
 * Long enough to retain the matcher line and "waiting for ..." detail the
 * dashboard classifier needs, short enough to keep the history file lean.
 */
export const MAX_FAILURE_MESSAGE_LENGTH = 1000;
