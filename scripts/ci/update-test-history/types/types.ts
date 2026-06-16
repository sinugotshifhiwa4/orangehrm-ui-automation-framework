/**
 * types.ts
 * Shared TypeScript interfaces for the update-test-history pipeline.
 *
 * ── History shape (3-tier) ────────────────────────────────────────────────────
 *
 *  {
 *    meta:     FileMeta          — tiny top-level stats, always loaded
 *    index:    RunSummary[]      — lightweight rows (no failedTests), newest-first
 *    byBranch: Record<branch, BranchHistory>  — full detail, scoped per bucket
 *  }
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** Stored inside each TestRun — full detail, available for recent runs only. */
export interface FailedTest {
  /** Full test title e.g. "Login > should reject invalid credentials" */
  name: string;
  /** Spec file path relative to project root. */
  classname: string;
  /** Duration of this individual test case in seconds. */
  durationSec: number;
  /** "failure" = assertion; "error" = unexpected exception; "flaky" = passed on retry. */
  kind: "failure" | "error" | "flaky";
  /**
   * First error message from the Playwright report (ANSI-stripped, truncated).
   * Carries the matcher line + "waiting for ..." detail so the dashboard can
   * classify failure type. Absent when the report had no error message.
   */
  failureMessage?: string;
}

/**
 * TIER 3 — full detail row, stored in byBranch buckets.
 * `failedTests` and `flakyTests` may be stripped (set to []) on older runs to
 * save space.
 */
export interface TestRun {
  runNumber: number;
  runId: string;
  date: string;
  timestamp: number;
  branch: string;
  commitSha: string;
  env: string;
  testType: string;
  project: string;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  total: number;
  passRate: number;
  status: "PASS" | "FAIL";
  durationMs: number;
  durationMin: string;
  reportUrl: string;
  ortoniUrl: string;
  failedTests: FailedTest[];
  flakyTests: FailedTest[];
  failedTestsStripped?: boolean;
}

/** TIER 2 — lightweight summary row, omits failedTests/flakyTests detail. */
export type RunSummary = Omit<
  TestRun,
  "failedTests" | "flakyTests" | "failedTestsStripped"
>;

// Detail bucket holding all stored runs for a single test type within a branch.
export interface TestTypeHistory {
  testType: string;
  runs: TestRun[];
}

// Per-branch container grouping its detail buckets by test type.
export interface BranchHistory {
  byTestType: Record<string, TestTypeHistory>;
}

/** TIER 1 — top-level file metadata. */
export interface FileMeta {
  lastUpdated: string;
  totalRunsEver: number;
  indexSize: number;
}

// Root shape of the persisted test-history file (the 3 tiers combined).
export interface HistoryFile {
  meta: FileMeta;
  index: RunSummary[];
  byBranch: Record<string, BranchHistory>;
}

// ─── Playwright JSON report types ─────────────────────────────────────────────

// Aggregate run counters from the Playwright JSON report `stats` block.
export interface PlaywrightJsonStats {
  expected: number;
  unexpected: number;
  skipped: number;
  flaky: number;
  duration: number;
}

// An error entry attached to a test result in the Playwright JSON report.
export interface PlaywrightJsonError {
  message?: string;
  stack?: string;
}

// A single execution (attempt) of a test in the Playwright JSON report. The
// error lives here — `error` for the primary failure, `errors` for the full set.
export interface PlaywrightJsonTestResult {
  error?: PlaywrightJsonError;
  errors?: PlaywrightJsonError[];
}

// A single test result within a spec in the Playwright JSON report.
export interface PlaywrightJsonTest {
  title: string;
  /** "expected" | "unexpected" | "skipped" | "flaky" */
  status: string;
  duration: number;
  /** Per-attempt results; the error message is read from here. */
  results?: PlaywrightJsonTestResult[];
}

// A spec entry (one test case) in the Playwright JSON report.
export interface PlaywrightJsonSpec {
  title: string;
  /** Relative file path e.g. "layers/ui/login/InvalidLogin.spec.ts" */
  file: string;
  ok: boolean;
  tests: PlaywrightJsonTest[];
}

// A suite node in the Playwright JSON report; suites nest and contain specs.
export interface PlaywrightJsonSuite {
  title: string;
  file?: string;
  specs: PlaywrightJsonSpec[];
  suites?: PlaywrightJsonSuite[];
}

// Root shape of the merged Playwright JSON report consumed by ResultsParser.
export interface PlaywrightJsonReport {
  stats: PlaywrightJsonStats;
  suites: PlaywrightJsonSuite[];
}

/** Normalised result returned by ResultsParser.parse(). */
export interface ParseResult {
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  durationMs: number;
  failedTests: FailedTest[];
  flakyTests: FailedTest[];
}
