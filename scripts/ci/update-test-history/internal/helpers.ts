/**
 * helpers.ts
 * Pure utility functions for the update-test-history pipeline.
 * No side-effects, no I/O â€” safe to unit-test in isolation.
 */

import { r2PublicReportsBase } from "../../shared/r2.constants.js";
import type { TestRun, RunSummary } from "../types/types.js";

// â”€â”€â”€ String / formatting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Reads an environment variable, returning `fallback` when absent or empty.
 * @param key - The environment variable name to read.
 * @param fallback - Value returned when the variable is unset.
 * @returns The variable value, or the fallback.
 */
export function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

/**
 * Formats a millisecond duration as a human-readable string.
 * @param ms - The duration in milliseconds.
 * @returns The formatted duration (e.g. "2m 5s" or "45s").
 * @example formatDuration(125_000) // "2m 5s"
 * @example formatDuration(45_000)  // "45s"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Truncates a string to `maxLen` characters, appending "â€¦" when trimmed.
 * @param s - The string to truncate.
 * @param maxLen - The maximum length of the returned string.
 * @returns The trimmed string, shortened with an ellipsis if it exceeded the limit.
 */
export function truncate(s: string, maxLen: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1) + "â€¦";
}

const ANSI_ESCAPE_PATTERN = /\x1b\[[0-9;]*m/g;

/**
 * Removes ANSI colour escape sequences from a string. Playwright wraps error
 * messages in colour codes; stripping them keeps the stored text clean and the
 * dashboard's keyword matching reliable.
 * @param s - The string to clean.
 * @returns The string with ANSI escape sequences removed.
 */
export function stripAnsi(s: string): string {
  return s.replace(ANSI_ESCAPE_PATTERN, "");
}

// â”€â”€â”€ URL builders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Builds the public Playwright and Ortoni report URLs for a given run. The base
 * mirrors the R2 upload prefix exactly (run number + env + test type), so the
 * stored links resolve to the objects the pipeline actually uploaded.
 * @param runNumber - The GitHub Actions run number.
 * @param environment - The environment slug (qa | uat | preprod).
 * @param testType - The test type for the run (e.g. regression | sanity).
 * @returns The public Playwright and Ortoni report URLs.
 */
export function buildReportUrls(
  runNumber: number,
  environment: string,
  testType: string,
): { reportUrl: string; ortoniUrl: string } {
  const base = r2PublicReportsBase(String(runNumber), environment, testType);
  return {
    reportUrl: `${base}/playwright/index.html`,
    ortoniUrl: `${base}/ortoni/index.html`,
  };
}

// â”€â”€â”€ History helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Strips `failedTests` and `flakyTests` from runs outside the detail window
 * (in-place). Runs are expected to be sorted newest-first.
 * @param runs - The runs to process, newest-first; mutated in place.
 * @param detailWindow - Number of leading runs that keep their full detail.
 */
export function applyDetailWindow(runs: TestRun[], detailWindow: number): void {
  for (let i = detailWindow; i < runs.length; i++) {
    const hasDetail =
      (runs[i].failedTests?.length ?? 0) > 0 || (runs[i].flakyTests?.length ?? 0) > 0;
    if (hasDetail || !runs[i].failedTestsStripped) {
      runs[i].failedTests = [];
      runs[i].flakyTests = [];
      runs[i].failedTestsStripped = true;
    }
  }
}

/**
 * Converts a full `TestRun` to a lightweight `RunSummary` by removing
 * the `failedTests`, `flakyTests`, and `failedTestsStripped` fields.
 * @param run - The full run to convert.
 * @returns The run without its detail fields.
 */
export function toSummary(run: TestRun): RunSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { failedTests, flakyTests, failedTestsStripped, ...summary } = run;
  return summary;
}
