/**
 * helpers.ts
 * Pure utility functions for the update-test-history pipeline.
 * No side-effects, no I/O — safe to unit-test in isolation.
 */

import { r2PublicReportsBase } from "../../shared/r2.constants.js";
import type { TestRun, RunSummary } from "../types/types.js";

// ─── String / formatting ──────────────────────────────────────────────────────

/**
 * Reads an environment variable, returning `fallback` when absent or empty.
 */
export function env(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

/**
 * Formats a millisecond duration as a human-readable string.
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
 * Truncates a string to `maxLen` characters, appending "…" when trimmed.
 */
export function truncate(s: string, maxLen: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1) + "…";
}

// ─── URL builders ─────────────────────────────────────────────────────────────

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

// ─── History helpers ──────────────────────────────────────────────────────────

/**
 * Strips `failedTests` and `flakyTests` from runs outside the detail window
 * (in-place). Runs are expected to be sorted newest-first.
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
 */
export function toSummary(run: TestRun): RunSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { failedTests, flakyTests, failedTestsStripped, ...summary } = run;
  return summary;
}
